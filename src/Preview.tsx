// The preview UI. Runs INSIDE the iframe.
import { useEffect, useState, type SyntheticEvent } from 'react'
import { markDevtoolsActive } from '@json-render/core'
import { get, isPlainObject } from 'lodash-es'
import { JSONUIProvider, Renderer } from '@json-render/react'
import { Toaster } from '@/components/ui/sonner'
import ErrorBoundary from '@/ErrorBoundary'
import type { ElementSelected, PreviewReady, Render } from '@/messages'
import { registry } from '@/registry'

export default function Preview() {
  // The last "render" message from the app. null until the first one.
  const [view, setView] = useState<Render | null>(null)
  const isEditing = view?.mode === 'edit'

  // Makes the Renderer wrap every element in <span data-jr-key="its-id">.
  // Returns an "off" function, which React calls when Preview unmounts.
  useEffect(() => markDevtoolsActive(), [])

  useEffect(() => {
    function onMessage(event: MessageEvent<Render>) {
      // Only accept messages from our own app, never another site
      if (event.origin !== location.origin) return
      const data = event.data
      if (get(data, 'type') === 'render' && isPlainObject(get(data, 'spec'))) {
        setView(data)
      }
    }
    window.addEventListener('message', onMessage)

    // Listening now, so tell the app we're ready
    const ready: PreviewReady = { type: 'ready' }
    window.parent.postMessage(ready, location.origin)

    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Same trick as the app: the "dark" class on <html> switches all colors
  useEffect(() => {
    document.documentElement.classList.toggle('dark', view?.theme === 'dark')
  }, [view?.theme])

  // "Capture" handlers run on the way DOWN, before the clicked component
  // sees the event. In edit mode we stop it there, so buttons don't fire.
  function blockInEditMode(event: SyntheticEvent) {
    if (!isEditing) return
    event.preventDefault()
    event.stopPropagation()
  }

  function selectOnClick(event: SyntheticEvent) {
    if (!isEditing) return
    blockInEditMode(event)

    // Innermost wrapper around the click = the element that was clicked
    const target = event.target as Element
    const wrapper = target.closest('[data-jr-key]')
    const id = wrapper?.getAttribute('data-jr-key') ?? null

    const message: ElementSelected = { type: 'select', id }
    window.parent.postMessage(message, location.origin)
  }

  return (
    // No padding or background: the generated page fills the frame,
    // like a real site would fill the browser window
    <div
      className="sw-preview min-h-dvh" // sw-preview: animate new elements
      onClickCapture={selectOnClick}
      // Menus and dialogs open on pointer-down, not click, so block it too
      onPointerDownCapture={blockInEditMode}
    >
      {isEditing && view.selectedId && (
        <SelectionOutline id={view.selectedId} />
      )}
      {view?.busy && view.spec.root && <ProgressBar />}
      <Toaster /> {/* for Buttons with a "toast" message */}
      {view?.spec.root ? (
        <ErrorBoundary resetKey={view.spec}>
          {/* The spec's starting data (e.g. which tab is active). Without
              it, anything shown/hidden by that data stays hidden. Changes
              to it within a design are merged in place.
              key: a different design gets a fresh store, so clicks in
              one design don't leak into the next. Keyed on the design,
              not its data: streamed updates must not remount the page. */}
          <JSONUIProvider
            key={view.designId}
            registry={registry}
            initialState={view.spec.state}
          >
            <Renderer spec={view.spec} registry={registry} />
          </JSONUIProvider>
        </ErrorBoundary>
      ) : view?.busy ? (
        <Skeleton />
      ) : (
        <p className="pt-24 text-center text-sm text-muted-foreground">
          Your UI will appear here.
        </p>
      )}
    </div>
  )
}

// Outlines the selected element. The wrapper span takes no space
// (display: contents), so we outline the element inside it.
function SelectionOutline({ id }: { id: string }) {
  const selector = `[data-jr-key="${CSS.escape(id)}"] > *`
  const css = `${selector} { outline: 2px solid #3b82f6; outline-offset: 2px; }`
  return <style>{css}</style>
}

// While the AI is editing: a thin bar sliding along the top
function ProgressBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
      <div className="sw-progress h-full w-1/3 bg-indigo-500" />
    </div>
  )
}

// Before the first element arrives: the rough shape of a page
function Skeleton() {
  const block = 'rounded-lg bg-muted motion-safe:animate-pulse'
  return (
    <div
      className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 pt-24"
      aria-label="Designing…"
    >
      <p className="text-sm text-muted-foreground motion-safe:animate-pulse">
        Designing your UI…
      </p>
      <div className={`${block} h-10 w-2/3`} />
      <div className={`${block} h-4 w-1/2`} />
      <div className="mt-6 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        <div className={`${block} h-32`} />
        <div className={`${block} h-32`} />
        <div className={`${block} h-32`} />
      </div>
    </div>
  )
}
