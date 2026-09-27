// The LLM: writes the UI as JSON patch lines, streamed as they arrive.
// Every provider here speaks the same OpenAI-compatible API.

// `extra` is added to every request body for that provider
const PROVIDERS: Record<string, { url: string; key?: string; extra?: object }> =
  {
    google: {
      url: 'https://generativelanguage.googleapis.com/v1beta/openai',
      key: process.env.GOOGLE_API_KEY,
    },
    nvidia: {
      url: 'https://integrate.api.nvidia.com/v1',
      key: process.env.NVIDIA_API_KEY,
      // Otherwise models "think" first: 90s+ before any UI appears
      extra: { chat_template_kwargs: { enable_thinking: false } },
    },
  }
type Model = { provider: string; name: string }

// LLM_MODELS="google:gemini-3.1-flash-lite,nvidia:nvidia/nemotron-…"
// Tried in order: a busy model makes the next attempt use the next one.
// Models whose provider has no key in .env are left out.
const MODELS: Model[] = (process.env.LLM_MODELS ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map((entry) => {
    const colon = entry.indexOf(':') // model names can contain "/" but not ":"
    const provider = entry.slice(0, colon)
    if (!(provider in PROVIDERS)) {
      throw new Error(`LLM_MODELS: unknown provider in "${entry}"`)
    }
    return { provider, name: entry.slice(colon + 1) }
  })
  .filter((model) => PROVIDERS[model.provider].key)

const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 2000 // doubles each attempt: 2s, then 4s
// A model that sends nothing for this long is given up on: before its
// first line it counts as busy (try the next model), after it an error
const IDLE_TIMEOUT_MS = Number(process.env.LLM_IDLE_MS) || 30_000

// The model is overloaded or rate-limited. Worth retrying later;
// not a bug in our code.
export class BusyError extends Error {}

type Result = { model: string }

// Yields one complete line of LLM output at a time.
// Returns which model answered, as "provider:model".
//
// Retries when the model is busy, but only before the first line.
// After that, patches have already reached the preview, and a retry
// would build a second copy on top of them.
export async function* streamLines(
  system: string,
  user: string,
  signal: AbortSignal,
): AsyncGenerator<string, Result> {
  if (!MODELS.length) {
    throw new Error('Set LLM_MODELS and a matching API key in .env')
  }

  for (let attempt = 1; ; attempt++) {
    const model = MODELS[(attempt - 1) % MODELS.length]
    const label = `${model.provider}:${model.name}`
    // Aborts this request if the model goes quiet for too long.
    // The clock restarts every time a line arrives.
    const silence = new AbortController()
    let timer = setTimeout(() => silence.abort(), IDLE_TIMEOUT_MS)
    const restartClock = () => {
      clearTimeout(timer)
      timer = setTimeout(() => silence.abort(), IDLE_TIMEOUT_MS)
    }
    const both = AbortSignal.any([signal, silence.signal])

    const lines = streamOnce(model, system, user, both)
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
      if (!canRetry || attempt === MAX_ATTEMPTS || signal.aborted) throw error
      console.warn(`${label} busy, retrying (attempt ${attempt + 1})`)
      await Bun.sleep(RETRY_DELAY_MS * 2 ** (attempt - 1))
    } finally {
      clearTimeout(timer)
    }
  }
}

// One request to one model, no retries
async function* streamOnce(
  model: Model,
  system: string,
  user: string,
  signal: AbortSignal,
): AsyncGenerator<string, void> {
  const provider = PROVIDERS[model.provider]
  const response = await fetch(`${provider.url}/chat/completions`, {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${provider.key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...provider.extra,
      model: model.name,
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

      const lines = text.split('\n')
      text = lines.pop() ?? ''
      for (const line of lines) yield line
    }
  }
  if (text) yield text
}

// 429 = rate limited, 500/502/503/529 = provider down or overloaded
function toError(status: unknown, message: string): Error {
  const busyStatus = [429, 500, 502, 503, 529].includes(Number(status))
  const busyText = /overloaded|rate.?limit|temporarily|quota/i.test(message)
  return busyStatus || busyText
    ? new BusyError(message)
    : new Error(`LLM error ${status}: ${message}`)
}
