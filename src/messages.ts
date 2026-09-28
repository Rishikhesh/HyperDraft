import type { Spec } from '@json-render/core'

// Every message between the app and the preview iframe.
// Both sides import this, so TypeScript catches a typo in either one.

// edit: clicks select elements. preview: clicks behave like a real page.
export type Mode = 'edit' | 'preview'
export type Theme = 'light' | 'dark'

// app → preview: "draw this". Everything the preview needs, in one message.
export type Render = {
  type: 'render'
  spec: Spec
  designId: number // changes only when a different design is shown
  mode: Mode
  selectedId: string | null
  // A part of the selected element: "title", "plans.1" (a list item)
  selectedProp: string | null
  theme: Theme
  busy: boolean // the AI is working: show progress
}

// preview → app: "I'm loaded, send me something to draw"
export type PreviewReady = { type: 'ready' }

// preview → app: "the user clicked this element" (null = empty space)
export type ElementSelected = {
  type: 'select'
  id: string | null
  prop: string | null // the clicked part of it, if the block marks one
}

// Everything the preview can send, so the app can handle them in one place
export type PreviewMessage = PreviewReady | ElementSelected
