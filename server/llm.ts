// The LLM: writes the UI as JSON patch lines, streamed as they arrive.
// Every model comes through OpenRouter (openrouter.ai/models): one key
// for many models, paid and ":free".
const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// What the LLM is used for. Each job can have its own models:
// planning a page wants the strongest model and may think; building
// sections and edits want fast models that answer right away.
export type Job = 'plan' | 'build' | 'edit'
const THINKS: Record<Job, boolean> = { plan: true, build: false, edit: false }
// Planning should differ between runs; building should follow the plan
const TEMPERATURE: Record<Job, number> = { plan: 1, build: 0.7, edit: 0.4 }

// LLM_PLAN_MODELS / LLM_BUILD_MODELS / LLM_EDIT_MODELS, each falling back
// to LLM_MODELS: OpenRouter ids, e.g. "google/gemini-3.5-flash,
// nvidia/nemotron-3-super-120b-a12b:free". Tried in order: a busy model
// makes the next attempt use the next one.
function modelsFor(job: Job): string[] {
  const list =
    process.env[`LLM_${job.toUpperCase()}_MODELS`] || process.env.LLM_MODELS
  return (list ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

const MAX_ATTEMPTS = 3 // at least; every listed model gets one try
const RETRY_DELAY_MS = 2000 // doubles each attempt: 2s, then 4s
// When every model refused and a rate limit says it resets soon, wait
// that long and try that model once more. Longer waits aren't worth it.
const MAX_QUOTA_WAIT_MS = 30_000
// A model that sends nothing for this long is given up on: before its
// first line it counts as busy (try the next model), after it an error.
// Thinking (planning) takes longer before the first line.
const idleTimeout = (job: Job) =>
  Number(process.env[`LLM_${job.toUpperCase()}_IDLE_MS`]) ||
  Number(process.env.LLM_IDLE_MS) ||
  (THINKS[job] ? 90_000 : 30_000)

// The model is overloaded or rate-limited. Worth retrying later;
// not a bug in our code.
export class BusyError extends Error {
  constructor(
    message: string,
    readonly retryAfterMs?: number, // when a rate limit says it resets
  ) {
    super(message)
  }
}

type Result = { model: string }

// Yields one complete line of LLM output at a time.
// Returns which model answered.
//
// Retries when the model is busy, but only before the first line.
// After that, patches have already reached the preview, and a retry
// would build a second copy on top of them.
export async function* streamLines(
  job: Job,
  system: string,
  user: string,
  signal: AbortSignal,
): AsyncGenerator<string, Result> {
  const models = modelsFor(job)
  if (!models.length || !process.env.OPENROUTER_API_KEY) {
    throw new Error('Set OPENROUTER_API_KEY and LLM_MODELS in .env')
  }
  const attempts = Math.max(MAX_ATTEMPTS, models.length)
  const IDLE_TIMEOUT_MS = idleTimeout(job)
  let waitedForQuota = false

  for (let attempt = 1; ; attempt++) {
    const model = models[(attempt - 1) % models.length]
    const label = model
    // Aborts this request if the model goes quiet for too long.
    // The clock restarts every time a line arrives.
    const silence = new AbortController()
    let timer = setTimeout(() => silence.abort(), IDLE_TIMEOUT_MS)
    const restartClock = () => {
      clearTimeout(timer)
      timer = setTimeout(() => silence.abort(), IDLE_TIMEOUT_MS)
    }
    const both = AbortSignal.any([signal, silence.signal])

    const lines = streamOnce(model, job, system, user, both)
    let yieldedAny = false
    try {
      let next = await lines.next()
      while (!next.done) {
        yieldedAny = true
        clearTimeout(timer) // don't count time our own code spends
        yield next.value
        restartClock()
        next = await lines.next()
      }
      return { model: label }
    } catch (thrown) {
      const wentQuiet = silence.signal.aborted && !signal.aborted
      const error = !wentQuiet
        ? thrown
        : yieldedAny
          ? new Error('The AI stopped responding partway. Try again.')
          : new BusyError(`${label} sent nothing`)
      const canRetry = error instanceof BusyError && !yieldedAny
      if (!canRetry || signal.aborted) throw error
      if (attempt >= attempts) {
        const wait = error instanceof BusyError ? error.retryAfterMs : 0
        if (waitedForQuota || !wait || wait > MAX_QUOTA_WAIT_MS) throw error
        waitedForQuota = true
        console.warn(
          `${label} rate-limited → waiting ${Math.ceil(wait / 1000)}s, ` +
            'then trying it again',
        )
        await Bun.sleep(wait)
        attempt-- // the same model once more
        continue
      }
      const next = models[attempt % models.length]
      console.warn(
        `${label} busy → trying ${next} ` + `(attempt ${attempt + 1})`,
      )
      await Bun.sleep(RETRY_DELAY_MS * 2 ** (attempt - 1))
    } finally {
      clearTimeout(timer)
    }
  }
}

// One request to one model, no retries
async function* streamOnce(
  model: string,
  job: Job,
  system: string,
  user: string,
  signal: AbortSignal,
): AsyncGenerator<string, void> {
  const response = await fetch(API_URL, {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'X-Title': 'HyperDraft', // names the app on openrouter.ai
    },
    body: JSON.stringify({
      // Think before planning, not before writing UI; the thinking stays
      // out of the stream. `usage` adds the call's cost at the end.
      reasoning: THINKS[job]
        ? { effort: 'low', exclude: true }
        : { enabled: false },
      usage: { include: true },
      temperature: TEMPERATURE[job],
      model,
      stream: true,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!response.ok || !response.body) {
    throw toError(response.status, await response.text())
  }

  // The API sends Server-Sent Events: "data: {json}" per chunk.
  // Each chunk carries a few characters; we glue them into full lines.
  let text = '' // LLM output not yet yielded (an unfinished line)
  let sse = '' // raw event bytes not yet parsed
  const decoder = new TextDecoder()

  for await (const bytes of response.body) {
    sse += decoder.decode(bytes, { stream: true })
    const events = sse.split('\n')
    sse = events.pop() ?? '' // last piece may be incomplete

    for (const event of events) {
      if (!event.startsWith('data: ') || event === 'data: [DONE]') continue
      const chunk = JSON.parse(event.slice('data: '.length))
      // Providers can fail mid-stream and report it inside a chunk
      if (chunk.error) throw toError(chunk.error.code, chunk.error.message)
      text += chunk.choices?.[0]?.delta?.content ?? ''
      // OpenRouter reports what the call cost, in the last chunk
      if (chunk.usage?.cost != null) {
        const { prompt_tokens, completion_tokens, cost } = chunk.usage
        const cached = chunk.usage.prompt_tokens_details?.cached_tokens ?? 0
        console.log(
          `${job} ${model}: ${prompt_tokens} in (${cached} cached), ` +
            `${completion_tokens} out, $${Number(cost).toFixed(4)}`,
        )
      }

      const lines = text.split('\n')
      text = lines.pop() ?? ''
      for (const line of lines) yield line
    }
  }
  if (text) yield text
}

// 429 = rate limited, 500/502/503/529 = provider down or overloaded
function toError(status: unknown, body: string): Error {
  const busyStatus = [429, 500, 502, 503, 529].includes(Number(status))
  const busyText = /overloaded|rate.?limit|temporarily|quota/i.test(body)
  // APIs answer with a JSON body; its "message" is the readable part
  const message = /"message":\s*"([^"]*)"/.exec(body)?.[1] ?? body
  // "Please retry in 16.47s" / "retryDelay": "16s"
  const retry = /retry in ([\d.]+)s|"retryDelay":\s*"([\d.]+)s"/i.exec(body)
  const retryAfterMs = retry
    ? Math.ceil(Number(retry[1] ?? retry[2]) * 1000)
    : undefined
  return busyStatus || busyText
    ? new BusyError(`${status}: ${message.split('\\n')[0]}`, retryAfterMs)
    : new Error(`LLM error ${status}: ${message}`)
}
