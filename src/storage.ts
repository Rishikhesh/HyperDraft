// Keeps the session in this browser, so a reload doesn't lose work.
// Nothing leaves the browser.
import type { Spec } from '@json-render/core'
import {
  filter,
  get,
  isEmpty,
  isNumber,
  isPlainObject,
  isString,
} from 'lodash-es'
import type { ChatMessage } from '@/ChatPanel'
import type { Theme } from '@/messages'

// Change "v1" if the saved shape changes: old data is then ignored
const KEY = 'saywhat:session:v1'
export const MAX_HISTORY = 30 // undo steps kept
const MAX_MESSAGES = 100

export type Session = {
  history: Spec[]
  messages: ChatMessage[]
  theme: Theme
}

// Missing, broken, or blocked storage all mean "start fresh"
export function loadSession(): Partial<Session> {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    const history = filter(get(saved, 'history'), isSpec)
    if (isEmpty(history)) return {}
    const messages = filter(get(saved, 'messages'), isMessage)
    return {
      history,
      messages,
      theme: get(saved, 'theme') === 'dark' ? 'dark' : 'light',
    }
  } catch {
    return {}
  }
}

export function saveSession(session: Session) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ...session,
        history: session.history.slice(-MAX_HISTORY),
        messages: session.messages.slice(-MAX_MESSAGES),
      }),
    )
  } catch {
    // Storage full or blocked (e.g. private mode): keep working unsaved
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing to do
  }
}

function isSpec(value: unknown): value is Spec {
  return isString(get(value, 'root')) && isPlainObject(get(value, 'elements'))
}

function isMessage(value: unknown): value is ChatMessage {
  return isNumber(get(value, 'id')) && isString(get(value, 'text'))
}
