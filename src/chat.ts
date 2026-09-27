// Sends a chat request and calls onEvent for each streamed ChatEvent.
import { get, isString } from 'lodash-es'
import type { ChatEvent, ChatRequest } from '@/api'

// Aborting `signal` (the Stop button) cancels the request; the server
// notices and stops the AI too.
export async function streamChat(
  request: ChatRequest,
  onEvent: (event: ChatEvent) => void,
  signal: AbortSignal,
) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? `Server error ${response.status}`)
  }

  // The server sends one JSON object per line. Bytes arrive in random
  // chunks, so keep the unfinished last line until the rest arrives.
  const decoder = new TextDecoder()
  const reader = response.body.getReader()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const event = parseEvent(line)
      if (event) onEvent(event)
    }
  }
}

// One line from the server. A broken or unknown line is skipped rather
// than stopping the whole response.
function parseEvent(line: string): ChatEvent | null {
  try {
    const event = JSON.parse(line)
    return isString(get(event, 'kind')) ? event : null
  } catch {
    return null
  }
}
