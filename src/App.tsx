import { useEffect, useRef, useState } from 'react'
import {
  compact,
  findKey,
  get,
  includes,
  isString,
  last,
  startCase,
} from 'lodash-es'
import type { Spec } from '@json-render/core'
import {
  DownloadIcon,
  EyeIcon,
  MonitorIcon,
  MoonIcon,
  PencilIcon,
  RotateCcwIcon,
  SmartphoneIcon,
  SunIcon,
  Undo2Icon,
} from 'lucide-react'
import { MAX_HISTORY_MESSAGES, type ChatEvent, type RequestMode } from '@/api'
import { streamChat } from '@/chat'
import ChatPanel, { type ChatMessage } from '@/ChatPanel'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import type { Mode, PreviewMessage, Render, Theme } from '@/messages'
import { applyPatches } from '@/patch'
import { clearSession, loadSession, MAX_HISTORY, saveSession } from '@/storage'

type Device = 'mobile' | 'desktop'

// How wide the iframe is for each device
const deviceWidth: Record<Device, string> = {
  mobile: 'w-[375px]',
  desktop: 'w-full',
}

// Start with whatever the operating system is set to
const systemTheme: Theme = matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light'

const emptySpec: Spec = { root: '', elements: {} }

// Whatever was saved in this browser last time (empty on first visit)
const saved = loadSession()

export default function App() {
  const [device, setDevice] = useState<Device>('desktop')
  const [theme, setTheme] = useState<Theme>(saved.theme ?? systemTheme)

  // Every spec so far, oldest first. The last one is the current UI.
  const [history, setHistory] = useState<Spec[]>(saved.history ?? [emptySpec])
  const spec = history[history.length - 1]
  const canUndo = history.length > 1

  // While the AI is still writing, the preview shows this growing draft.
  // It only becomes part of history once the server says it's done.
  const [draft, setDraft] = useState<Spec | null>(null)
  const shownSpec = draft ?? spec

  // Which design each spec belongs to. A new UI is a new design; edits
  // and streamed patches stay in the same one. The preview keeps its
  // state store for as long as the design is the same, so updates
  // don't remount (and re-animate) the whole page.
  // Created once and never replaced, so render can read it
  const [designOf] = useState(() => new WeakMap<Spec, number>())
  const nextDesign = useRef(1)
  const [draftDesign, setDraftDesign] = useState(0)
  const shownDesign = draft ? draftDesign : (designOf.get(spec) ?? 0)

  // edit: clicks select. preview: clicks work like a real page.
  const [mode, setMode] = useState<Mode>('edit')

  // The clicked element. Ignored if it no longer exists (e.g. after undo).
  const [clicked, setClicked] = useState<{
    id: string
    prop: string | null // a part of it: "title", "plans.1"
  } | null>(null)
  const [prefill, setPrefill] = useState<{ text: string; key: number } | null>(
    null,
  )
  const select = (id: string | null, prop: string | null = null) =>
    setClicked(id ? { id, prop } : null)
  const selectedId = clicked && spec.elements[clicked.id] ? clicked.id : null
  const selectedProp = selectedId ? (clicked?.prop ?? null) : null
  // The element around the selection, for the "select parent" button
  const parentId = selectedId
    ? (findKey(spec.elements, (element) =>
        includes(element.children, selectedId),
      ) ?? null)
    : null

  // A message still "live" from before a reload can't finish any more
  // New UI / Modify / Auto (Jev decides), chosen above the message box
  const [requestMode, setRequestMode] = useState<RequestMode>('auto')

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    (saved.messages ?? []).map((message) => ({ ...message, live: false })),
  )
  const [busy, setBusy] = useState(false)
  // Continue numbering after any saved messages, so ids stay unique
  const nextMessageId = useRef(
    Math.max(0, ...(saved.messages ?? []).map((m) => m.id + 1)),
  )
  // Cancels the running request (Stop button, New button)
  const abortRef = useRef<AbortController | null>(null)

  // Save after every change, so a reload picks up where you left off
  useEffect(() => {
    saveSession({ history, messages, theme })
  }, [history, messages, theme])

  function addMessage(message: Omit<ChatMessage, 'id'>): number {
    const id = nextMessageId.current++
    setMessages((past) => [...past, { ...message, id }])
    return id
  }

  // Changes one message in place (the live one, while the AI works)
  function updateMessage(
    id: number,
    change: (message: ChatMessage) => Partial<ChatMessage>,
  ) {
    setMessages((past) =>
      past.map((message) =>
        message.id === id ? { ...message, ...change(message) } : message,
      ),
    )
  }

  function changeMode(next: Mode) {
    setMode(next)
    select(null) // selecting only makes sense in edit mode
  }

  function stop() {
    abortRef.current?.abort()
  }

  function startOver() {
    const hasWork = history.length > 1 || messages.length > 0
    const question = 'Start over? The UI, its history and the chat are cleared.'
    if (hasWork && !confirm(question)) return
    stop()
    clearSession()
    setHistory([emptySpec])
    setMessages([])
    setDraft(null)
    select(null)
  }

  // Downloads the current UI as JSON. json-render's Renderer can show it
  // in any React app.
  function exportSpec() {
    const json = JSON.stringify(spec, null, 2)
    const url = URL.createObjectURL(
      new Blob([json], { type: 'application/json' }),
    )
    const link = document.createElement('a')
    link.href = url
    link.download = 'hyperdraft-ui.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function send(text: string) {
    // What was said before this, for context (captured before adding)
    const history = messages
      .filter((message) => message.role === 'user')
      .map((message) => message.text)
      .slice(-MAX_HISTORY_MESSAGES)
    addMessage({ role: 'user', text })
    setBusy(true)
    const controller = new AbortController()
    abortRef.current = controller

    // One assistant message that fills in as events arrive
    const reply = addMessage({ role: 'assistant', text: '', live: true })
    const update = (change: Parameters<typeof updateMessage>[1]) =>
      updateMessage(reply, change)
    const addStep = (step: string) =>
      update((message) => ({ steps: [...(message.steps ?? []), step] }))

    // Patches build on this, starting from the UI as it was when sent
    let working = spec
    let isCreate = false
    let design = designOf.get(spec) ?? 0
    setDraftDesign(design)

    function onEvent(event: ChatEvent) {
      switch (event.kind) {
        case 'step':
          addStep(event.text)
          break
        case 'decision':
          if (event.intent === 'unrelated') break // a 'reply' follows
          isCreate = event.intent === 'create'
          if (isCreate) {
            working = emptySpec
            design = nextDesign.current++ // a new design
            setDraftDesign(design)
          }
          addStep(
            isCreate
              ? `Jev: ${event.pageType} page, ` +
                  `${event.components.length} components ` +
                  `(${seconds(event.ms)})`
              : `Jev: ${event.edit?.kind ?? 'edit'} → ` +
                  `${event.edit?.target ?? 'page'} (${seconds(event.ms)})`,
          )
          break
        case 'narration':
          update((message) => ({
            narration: compact([message.narration, event.text]).join(' '),
          }))
          break
        case 'patch': {
          working = applyPatches(working, [event.patch])
          setDraft(working)
          // A whole new element: show what is being added
          const type = get(event.patch, 'value.type')
          if (event.patch.op === 'add' && isElementPath(event.patch.path)) {
            if (isString(type)) showAdding(type)
          }
          break
        }
        case 'done':
          setDraft(null)
          if (event.changed.length === 0) {
            update(() => ({
              live: false,
              isError: true,
              text:
                'Nothing changed. Try rephrasing, or select the element ' +
                'you mean first.',
            }))
            break
          }
          // One undo step. Very old steps are dropped to save memory.
          designOf.set(event.spec, design)
          setHistory((past) => [...past, event.spec].slice(-MAX_HISTORY))
          update(() => ({
            live: false,
            text: isCreate
              ? `Built ${event.changed.length} elements.`
              : `Changed ${event.changed.map(startCase).join(', ')}.`,
            detail:
              `${seconds(event.ms)} · ` +
              (event.model === 'jev' ? 'Jev only, no LLM' : event.model) +
              (event.skipped ? ` · skipped ${event.skipped} bad patches` : ''),
          }))
          break
        case 'reply':
          update(() => ({ live: false, steps: [], text: event.text }))
          break
        case 'error':
          throw new Error(event.message)
      }
    }

    // "Adding Hero…", replacing the previous "Adding …" line
    function showAdding(type: string) {
      update((message) => {
        const steps = [...(message.steps ?? [])]
        const line = `Adding ${type}…`
        if (last(steps)?.startsWith('Adding ')) steps[steps.length - 1] = line
        else steps.push(line)
        return { steps }
      })
    }

    try {
      await streamChat(
        {
          message: text,
          spec,
          selectedId,
          selectedProp,
          mode: requestMode,
          history,
        },
        onEvent,
        controller.signal,
      )
    } catch (error) {
      setDraft(null) // throw away the half-built UI
      const stopped = controller.signal.aborted
      update(() => ({
        live: false,
        isError: !stopped,
        text: stopped
          ? 'Stopped.'
          : error instanceof Error
            ? error.message
            : String(error),
      }))
    } finally {
      update(() => ({ live: false })) // in case the stream just ended
      setBusy(false)
      abortRef.current = null
      // "New UI" is one-shot, so the next message doesn't replace the
      // design again. "Modify" stays on for a series of changes.
      if (requestMode === 'create') setRequestMode('auto')
    }
  }

  // The "dark" class on <html> switches every shadcn color
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Everything the preview needs to draw, in one message
    function sendRender() {
      const message: Render = {
        type: 'render',
        spec: shownSpec,
        designId: shownDesign,
        mode,
        selectedId,
        selectedProp,
        theme,
        busy,
      }
      iframeRef.current?.contentWindow?.postMessage(message, location.origin)
    }

    function onMessage(event: MessageEvent<PreviewMessage>) {
      // Only accept messages from OUR iframe
      if (event.source !== iframeRef.current?.contentWindow) return

      // Case 1: iframe loads after us. Wait for its "ready", then send.
      if (event.data?.type === 'ready') sendRender()

      // User clicked something in the preview (edit mode only)
      if (event.data?.type === 'select') {
        select(event.data.id, event.data.prop ?? null)
      }
      // An example prompt picked in the empty preview
      if (
        event.data?.type === 'suggest' &&
        typeof event.data.text === 'string'
      ) {
        setPrefill({ text: event.data.text, key: Date.now() })
      }
    }
    window.addEventListener('message', onMessage)

    // Case 2: iframe already loaded and something changed. Send right away.
    sendRender()

    return () => window.removeEventListener('message', onMessage)
  }, [shownSpec, shownDesign, mode, selectedId, selectedProp, theme, busy])

  return (
    // Phones: preview on top, chat below. Wider: chat on the left.
    <div className="flex h-dvh flex-col-reverse md:grid
      md:grid-cols-[360px_1fr]">
      <ChatPanel
        prefill={prefill}
        messages={messages}
        busy={busy}
        selection={
          selectedId
            ? {
                id: selectedId,
                type: spec.elements[selectedId].type,
                part: selectedProp && partLabel(selectedProp),
              }
            : null
        }
        hint={
          mode === 'edit'
            ? 'Click an element in the preview to select it.'
            : 'Switch to Edit to select an element.'
        }
        onClearSelection={() => select(null)}
        onSelectParent={
          // From a part to its element, then up to the element around it
          selectedProp
            ? () => select(selectedId)
            : parentId && parentId !== spec.root
              ? () => select(parentId)
              : null
        }
        onSend={send}
        onStop={stop}
        mode={requestMode}
        onModeChange={setRequestMode}
        hasUI={Boolean(spec.root)}
      />

      {/* Right: toolbar on top, preview frame below */}
      <main className="flex min-h-0 flex-1 flex-col bg-muted">
        <div
          className="flex flex-wrap items-center gap-2 border-b bg-background
            p-2"
        >
          <Button variant="outline" size="sm" onClick={startOver}>
            <RotateCcwIcon />
            Start over
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canUndo || busy}
            onClick={() => setHistory((past) => past.slice(0, -1))}
          >
            <Undo2Icon />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!spec.root || busy}
            onClick={exportSpec}
          >
            <DownloadIcon />
            Export
          </Button>

          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            className="ml-auto"
            value={mode}
            // Radix sends '' when the active item is clicked again; ignore it
            onValueChange={(value) => value && changeMode(value as Mode)}
          >
            <ToggleGroupItem value="edit">
              <PencilIcon />
              Edit
            </ToggleGroupItem>
            <ToggleGroupItem value="preview">
              <EyeIcon />
              Preview
            </ToggleGroupItem>
          </ToggleGroup>

          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={device}
            onValueChange={(value) => value && setDevice(value as Device)}
          >
            <ToggleGroupItem value="mobile" aria-label="Mobile">
              <SmartphoneIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="desktop" aria-label="Desktop">
              <MonitorIcon />
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>

        <div className="flex flex-1 justify-center overflow-hidden p-4">
          <iframe
            ref={iframeRef}
            src="/preview.html"
            title="Preview"
            className={cn(
              'h-full max-w-full rounded-lg bg-background ring-1',
              'ring-border',
              deviceWidth[device],
            )}
          />
        </div>
      </main>
    </div>
  )
}

// "/elements/hero" (a whole element), not "/elements/hero/props/title"
function isElementPath(path: string) {
  return /^\/elements\/[^/]+$/.test(path)
}

function seconds(ms: number) {
  return `${(ms / 1000).toFixed(1)}s`
}

// "plans.1" → "plan 2", "title" → "title"
function partLabel(prop: string): string {
  const [list, index] = prop.split('.')
  if (index === undefined) return list
  const one = list.endsWith('s') ? list.slice(0, -1) : list
  return `${one === 'item' ? 'item' : one} ${Number(index) + 1}`
}
