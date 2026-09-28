// The contract between the app (browser) and the server.
import type { JsonPatch, Spec } from '@json-render/core'

// app → server: POST /api/chat
export type ChatRequest = {
  message: string
  spec: Spec
  selectedId: string | null
  // A part of the selected element: "title", "plans.1"
  selectedProp?: string | null
  // "auto": Jev decides. "create"/"edit": the user chose it.
  mode?: RequestMode
  // The user's earlier messages, oldest first, so "the bridge" or "add
  // a timeline to it" can be understood
  history?: string[]
}

// How many earlier messages are sent along (and accepted)
export const MAX_HISTORY_MESSAGES = 6

export type RequestMode = 'auto' | 'create' | 'edit'

export type Intent = 'create' | 'edit' | 'unrelated'

export type EditKind = 'text' | 'style' | 'add' | 'remove' | 'restructure'

// server → app: a stream of these, one JSON object per line
export type ChatEvent =
  // Jev's decision, before any change is made
  | {
      kind: 'decision'
      intent: Intent
      pageType: string // landing, auth, dashboard, form, content, other
      components: string[]
      edit: { kind: EditKind; target: string } | null
      ms: number
    }
  // A progress line for the user ("Writing the layout…")
  | { kind: 'step'; text: string }
  // The LLM's own words about what it is building, as it writes them
  | { kind: 'narration'; text: string }
  // One change to apply to the spec (many of these while streaming)
  | { kind: 'patch'; patch: JsonPatch }
  // Finished: the checked, final spec, and what changed
  | {
      kind: 'done'
      spec: Spec
      changed: string[] // ids of elements that were added or edited
      skipped: number // patches that didn't fit and were ignored
      model: string // which model wrote it, or "jev" when no LLM was used
      ms: number
    }
  // Nothing to build (e.g. "hi"), a short reply instead
  | { kind: 'reply'; text: string }
  | { kind: 'error'; message: string }
