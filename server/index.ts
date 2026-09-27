// The API server. Holds the API keys, so they never reach the browser.
// POST /api/chat → streams ChatEvents back, one JSON object per line.
import { includes, isArray, isPlainObject, isString, size } from 'lodash-es'
import type { ChatEvent, ChatRequest } from '../src/api'
import { generate } from './generate'
import { BusyError } from './llm'
import { createRateLimiter } from './rate-limit'
import { securityHeaders, serveStatic } from './static'

const PORT = Number(process.env.PORT) || 3001
const MAX_MESSAGE_LENGTH = 2000
const MAX_ELEMENTS = 1000 // a spec bigger than this isn't a real UI
// Behind a proxy (Fly, Render, nginx) every request comes from the
// proxy's IP; then the visitor's IP is in X-Forwarded-For.
const TRUST_PROXY = process.env.TRUST_PROXY === 'true'

const rateLimit = createRateLimiter(
  Number(process.env.RATE_LIMIT_PER_MINUTE) || 10,
)

const server = Bun.serve({
  port: PORT,
  maxRequestBodySize: 1024 * 1024, // 1 MB is plenty for a spec
  // Bun hangs up after 10s without data. A model can think longer than
  // that before its first line; llm.ts has its own stall timeout (30s).
  idleTimeout: 120,
  routes: {
    '/api/chat': { POST: chat },
  },
  fetch: serveStatic, // everything else: the built app, if there is one
})
console.log(`saywhat on http://localhost:${server.port}`)

async function chat(request: Request): Promise<Response> {
  const waitSeconds = rateLimit(visitorKey(request))
  if (waitSeconds) {
    return Response.json(
      { error: `Too many requests. Try again in ${waitSeconds}s.` },
      { status: 429, headers: { 'Retry-After': String(waitSeconds) } },
    )
  }

  const body = (await request.json().catch(() => null)) as ChatRequest | null
  const problem = checkRequest(body)
  if (problem) return Response.json({ error: problem }, { status: 400 })
  const { message, spec, selectedId, mode = 'auto' } = body!

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ChatEvent) =>
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
      try {
        await generate(message, spec, selectedId, mode, send, request.signal)
      } catch (error) {
        // The browser gave up (closed tab, new message): nothing to report
        if (request.signal.aborted) return
        send({ kind: 'error', message: explain(error) })
      }
      controller.close()
    },
  })
  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson', ...securityHeaders },
  })
}

function visitorKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (TRUST_PROXY && forwarded) return forwarded.split(',')[0].trim()
  return server.requestIP(request)?.address ?? 'unknown'
}

// A short message for the chat. Busy models are expected with free
// tiers, so they get one log line; anything else gets the full trace.
function explain(error: unknown): string {
  if (error instanceof BusyError) {
    console.warn(`LLM busy, gave up: ${error.message}`)
    return 'The AI model is busy right now. Try again in a minute.'
  }
  console.error(error)
  return error instanceof Error ? error.message : String(error)
}

// The browser can send anything, so check the shape before trusting it
function checkRequest(body: ChatRequest | null): string | null {
  if (!isString(body?.message)) return 'message is required'
  if (!body.message.trim()) return 'message is empty'
  if (body.message.length > MAX_MESSAGE_LENGTH) return 'message is too long'
  if (!isPlainObject(body.spec?.elements) || !isString(body.spec.root)) {
    return 'spec is invalid'
  }
  if (size(body.spec.elements) > MAX_ELEMENTS) return 'spec is too big'
  const bad = Object.values(body.spec.elements).some(
    (element) => !isPlainObject(element) || !isString(element?.type),
  )
  if (bad) return 'spec is invalid'
  if (body.selectedId !== null && !isString(body.selectedId)) {
    return 'selectedId is invalid'
  }
  if (!includes([undefined, 'auto', 'create', 'edit'], body.mode)) {
    return 'mode is invalid'
  }
  if (body.spec.state !== undefined && !isPlainObject(body.spec.state)) {
    return 'spec is invalid'
  }
  return isArray(body.spec.elements) ? 'spec is invalid' : null
}
