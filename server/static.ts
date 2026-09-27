// Serves the built app (dist/, from `bun run build`), so production is
// one server for both the app and the API.
import { join, normalize } from 'node:path'

const DIST = join(import.meta.dir, '..', 'dist')

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff', // don't guess file types
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'SAMEORIGIN', // only we may frame our pages
}

export async function serveStatic(request: Request): Promise<Response> {
  let pathname: string
  try {
    pathname = decodeURIComponent(new URL(request.url).pathname)
  } catch {
    return new Response('Bad request', { status: 400 })
  }
  if (pathname === '/') pathname = '/index.html'

  // Block "/../../etc/passwd": the final path must stay inside dist/
  const path = normalize(join(DIST, pathname))
  const file = Bun.file(path)
  if (!path.startsWith(DIST + '/') || !(await file.exists())) {
    return new Response('Not found', { status: 404 })
  }

  // Files in /assets/ have a content hash in their name, so they never
  // change: browsers may cache them forever. HTML must always be fresh.
  const cache = pathname.startsWith('/assets/')
    ? 'public, max-age=31536000, immutable'
    : 'no-cache'
  return new Response(file, {
    headers: { 'Cache-Control': cache, ...securityHeaders },
  })
}
