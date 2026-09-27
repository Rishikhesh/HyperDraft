// The API server for local use and hosts that run Bun (bun dev/start).
// Holds the API keys, so they never reach the browser.
import { chat } from './chat'
import { serveStatic } from './static'

const PORT = Number(process.env.PORT) || 3001

const server = Bun.serve({
  port: PORT,
  maxRequestBodySize: 1024 * 1024, // 1 MB is plenty for a spec
  // Bun hangs up after 10s without data. A model can think longer than
  // that before its first line; llm.ts has its own stall timeout (30s).
  idleTimeout: 120,
  routes: {
    '/api/chat': {
      POST: (request, server) =>
        chat(request, server.requestIP(request)?.address),
    },
  },
  fetch: serveStatic, // everything else: the built app, if there is one
})
console.log(`saywhat on http://localhost:${server.port}`)
