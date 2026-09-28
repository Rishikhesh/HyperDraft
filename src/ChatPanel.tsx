// The left panel: messages, what's selected, and the input box.
// Display only. App decides what happens when you send.
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import {
  ArrowUpIcon,
  CheckIcon,
  LoaderIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  SquareIcon,
  XIcon,
} from 'lucide-react'
import type { RequestMode } from '@/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

export type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  text: string
  detail?: string // small grey line under the text (timings, model)
  isError?: boolean
  // While the AI works: what has happened so far, and its own words
  steps?: string[]
  narration?: string
  live?: boolean
}

type Props = {
  messages: ChatMessage[]
  busy: boolean
  selection: { id: string; type: string } | null
  hint: string // shown when nothing is selected
  onClearSelection: () => void
  // Select the element around the selected one (null: it's the page)
  onSelectParent: (() => void) | null
  onSend: (text: string) => void
  onStop: () => void
  // New UI or modify the current one; "auto" lets Jev decide
  mode: RequestMode
  onModeChange: (mode: RequestMode) => void
  hasUI: boolean // "modify" needs something to modify
}

const placeholders: Record<RequestMode, string> = {
  auto: 'Describe a UI, or what to change…',
  create: 'Describe the new UI…',
  edit: 'What should change?',
}

export default function ChatPanel({
  messages,
  busy,
  selection,
  hint,
  onClearSelection,
  onSelectParent,
  onSend,
  onStop,
  mode,
  onModeChange,
  hasUI,
}: Props) {
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  // Keep the newest message in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  function send() {
    const text = draft.trim()
    if (!text || busy) return
    onSend(text)
    setDraft('')
  }

  // Enter sends. Shift+Enter makes a new line.
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  return (
    <aside
      className="flex h-[45dvh] min-h-0 flex-col gap-2 border-t p-4 md:h-auto
        md:border-t-0 md:border-r"
    >
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {messages.length === 0 && (
          <p className="m-auto text-center text-sm text-muted-foreground">
            Describe a UI, like “a pricing page with three plans”.
          </p>
        )}
        {messages.map((message) => (
          <Bubble key={message.id} message={message} />
        ))}
        <div ref={endRef} />
      </div>

      {/* What "this" / "it" will mean in the next message */}
      {selection ? (
        <div
          className="flex items-center gap-2 rounded-md bg-blue-500/10 px-2 py-1
            text-sm"
        >
          <span className="font-medium">{selection.type}</span>
          <span className="text-muted-foreground">{selection.id}</span>
          {onSelectParent && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="ml-auto"
              aria-label="Select the element around it"
              title="Select the element around it"
              onClick={onSelectParent}
            >
              <ArrowUpIcon />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn(!onSelectParent && 'ml-auto')}
            aria-label="Clear selection"
            onClick={onClearSelection}
          >
            <XIcon />
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}

      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={mode}
        // Radix sends '' when the active item is clicked again; ignore it
        onValueChange={(value) => value && onModeChange(value as RequestMode)}
        aria-label="What the message does"
      >
        <ToggleGroupItem value="auto" className="text-xs">
          <SparklesIcon />
          Auto
        </ToggleGroupItem>
        <ToggleGroupItem value="create" className="text-xs">
          <PlusIcon />
          New UI
        </ToggleGroupItem>
        <ToggleGroupItem value="edit" className="text-xs" disabled={!hasUI}>
          <PencilIcon />
          Modify
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="relative">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholders[mode]}
          className="max-h-40 pr-11"
        />
        {busy ? (
          <Button
            size="icon-sm"
            variant="secondary"
            className="absolute right-2 bottom-2"
            aria-label="Stop"
            onClick={onStop}
          >
            <SquareIcon className="fill-current" />
          </Button>
        ) : (
          <Button
            size="icon-sm"
            className="absolute right-2 bottom-2"
            aria-label="Send"
            disabled={!draft.trim()}
            onClick={send}
          >
            <ArrowUpIcon />
          </Button>
        )}
      </div>
    </aside>
  )
}

function Bubble({ message }: { message: ChatMessage }) {
  const steps = message.steps ?? []
  return (
    <div
      className={cn(
        'max-w-[85%] rounded-lg px-3 py-2 text-sm',
        'motion-safe:animate-in motion-safe:fade-in',
        'motion-safe:slide-in-from-bottom-2 motion-safe:duration-300',
        message.role === 'user'
          ? 'self-end bg-primary text-primary-foreground'
          : 'self-start bg-muted',
        message.isError && 'bg-destructive/10 text-destructive',
      )}
    >
      {steps.length > 0 && (
        <ol className="mb-1 flex flex-col gap-1 text-xs">
          {steps.map((step, index) => {
            const current = message.live && index === steps.length - 1
            return (
              <li
                key={index}
                className="flex items-center gap-1.5 text-muted-foreground
                  motion-safe:animate-in motion-safe:fade-in"
              >
                {current ? (
                  <LoaderIcon className="size-3 motion-safe:animate-spin" />
                ) : (
                  <CheckIcon className="size-3 text-emerald-500" />
                )}
                <span className={cn(current && 'text-foreground')}>{step}</span>
              </li>
            )
          })}
        </ol>
      )}
      {message.narration && (
        <p className="text-muted-foreground italic">
          {message.narration}
          {message.live && (
            // A blinking caret while the AI is still writing
            <span
              className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5
                bg-current motion-safe:animate-pulse"
            />
          )}
        </p>
      )}
      {message.text && (
        <p className={cn('whitespace-pre-wrap', steps.length && 'mt-1')}>
          {message.text}
        </p>
      )}
      {message.detail && (
        <p className="mt-1 text-xs opacity-70">{message.detail}</p>
      )}
    </div>
  )
}
