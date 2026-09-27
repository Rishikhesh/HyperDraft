// Self-check for streamLines' retry rules. Run: bun server/llm.check.ts
// Fakes the LLM APIs, so it needs no API key and costs nothing.
import { ok } from 'node:assert'
process.env.GOOGLE_API_KEY = 'fake-google'
process.env.NVIDIA_API_KEY = 'fake-nvidia'
process.env.LLM_MODELS = 'google:model-a, nvidia:org/model-b'
process.env.LLM_IDLE_MS = '200' // short, so the test is quick
const { BusyError, streamLines } = await import('./llm') // after env is set

const sse = (...chunks: object[]) =>
  new Response(chunks.map((c) => `data: ${JSON.stringify(c)}\n`).join(''))
const busy = { error: { code: 502, message: 'Service temporarily overloaded' } }
const text = (content: string) => ({ choices: [{ delta: { content } }] })

// A response can also be a function, to build it with the request's
// abort signal (real fetch stops a body when its request is aborted)
type Fake = Response | ((signal: AbortSignal) => Response)

async function run(responses: Fake[]) {
  const calls: string[] = [] // "host model key" for each request
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    const { model } = JSON.parse(String(init.body))
    const key = (init.headers as Record<string, string>).Authorization
    calls.push(`${new URL(url).host} ${model} ${key}`)
    const fake = responses[calls.length - 1]
    if (typeof fake === 'function') return fake(init.signal!)
    if (fake) return fake
    // No response given: a model that never answers (until aborted)
    return new Promise((_, reject) =>
      init.signal?.addEventListener('abort', () => reject(new Error('abort'))),
    )
  }) as unknown as typeof fetch

  const lines: string[] = []
  const stream = streamLines('', '', new AbortController().signal)
  try {
    let next = await stream.next()
    while (!next.done) {
      lines.push(next.value)
      next = await stream.next()
    }
    return { calls, lines, answeredBy: next.value.model, error: null }
  } catch (error) {
    return { calls, lines, answeredBy: null, error }
  }
}

const google = 'generativelanguage.googleapis.com model-a Bearer fake-google'
const nvidia = 'integrate.api.nvidia.com org/model-b Bearer fake-nvidia'

// 1. Busy before any output → next model, on ITS provider, with ITS key
let r = await run([sse(busy), sse(text('a\nb\n'))])
ok(r.calls.join('|') === `${google}|${nvidia}`, '1 calls')
ok(r.lines.join() === 'a,b', '1 lines')
ok(r.answeredBy === 'nvidia:org/model-b', '1 model')

// 2. Busy after output started → NOT retried (would duplicate the UI)
r = await run([sse(text('a\n'), busy), sse(text('x\n'))])
ok(r.calls.length === 1 && r.error instanceof BusyError, '2')

// 3. A real error (bad key) → NOT retried
r = await run([new Response('bad key', { status: 401 })])
ok(r.calls.length === 1 && !(r.error instanceof BusyError), '3')

// 4. Busy every time → gives up after 3 attempts, cycling the models
r = await run([sse(busy), sse(busy), sse(busy)])
ok(r.calls.join('|') === `${google}|${nvidia}|${google}`, '4')
ok(r.error instanceof BusyError, '4 error')

// 5. First model silent → given up after the time limit, next one works
const silent = undefined as unknown as Response
r = await run([silent, sse(text('ok\n'))])
ok(r.calls.join('|') === `${google}|${nvidia}`, '5 calls')
ok(r.lines.join() === 'ok' && !r.error, '5')

// 6. Model stalls after its first line → clear error, no retry
const stalls = (signal: AbortSignal) =>
  new Response(
    new ReadableStream({
      start(controller) {
        const line = `data: ${JSON.stringify(text('a\n'))}\n`
        controller.enqueue(new TextEncoder().encode(line)) // then nothing
        signal.addEventListener('abort', () => controller.error(signal.reason))
      },
    }),
  )
r = await run([stalls, sse(text('x\n'))])
ok(r.calls.length === 1 && r.lines.join() === 'a', '6')
ok(String(r.error).includes('stopped responding'), '6 msg')

console.log('llm retry checks done')
