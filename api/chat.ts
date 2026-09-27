// Vercel function for POST /api/chat (Vercel serves the built app).
// Same handler as the Bun server; see server/chat.ts.
import { chat } from '../server/chat'

export function POST(request: Request): Promise<Response> {
  return chat(request)
}
