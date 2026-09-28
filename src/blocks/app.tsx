// App-style blocks: tabs, carousel, marquee, dashboard layout.
import { Children, useState } from 'react'
import type { BaseComponentProps } from '@json-render/react'
import { MenuIcon, XIcon } from 'lucide-react'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Marquee as MagicMarquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'
import type { blockDefinitions } from './definitions'
import { list } from './safe'
import { Icon } from './icons'
import { Illustration } from './illustration'
import { marqueeFade } from './styles'

type Defs = typeof blockDefinitions
type PropsOf<K extends keyof Defs> = BaseComponentProps<
  z.infer<Defs[K]['props']>
>

// Shows the child at the active tab's position. The switching lives
// here, so the AI only lists panels: nothing to wire up wrongly.
export function TabbedContent({ props, children }: PropsOf<'TabbedContent'>) {
  const [active, setActive] = useState(0)
  const panels = Children.toArray(children)
  return (
    <div className={cn('flex w-full flex-col gap-4', props.className)}>
      <div role="tablist" className="flex rounded-lg bg-muted p-1">
        {list(props.tabs).map((tab, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === active}
            onClick={() => setActive(index)}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-sm font-medium',
              'text-muted-foreground transition-colors',
              index === active && 'bg-background text-foreground shadow-sm',
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <div role="tabpanel">{panels[active] ?? null}</div>
    </div>
  )
}

const marqueeDurations = { slow: '60s', normal: '40s', fast: '20s' }

// An endless, auto-scrolling row of the children (pauses on hover)
export function Marquee({ props, children }: PropsOf<'Marquee'>) {
  return (
    <MagicMarquee
      pauseOnHover
      reverse={props.direction === 'right'}
      style={
        {
          '--duration': marqueeDurations[props.speed ?? 'normal'],
        } as React.CSSProperties
      }
      className={cn('w-full', marqueeFade, props.className)}
    >
      {children}
    </MagicMarquee>
  )
}

// Slides in a row: scrolling by itself (autoplay), or swiped by the
// visitor with native scroll snapping
export function Carousel({ props }: PropsOf<'Carousel'>) {
  const slides = list(props.items).map((item, index) => (
    <figure
      key={index}
      className="flex w-72 shrink-0 snap-start flex-col overflow-hidden
        rounded-xl border bg-card"
    >
      <div className="relative aspect-4/3 w-full">
        <Illustration
          icon={item.icon}
          seed={item.title ?? String(index)}
          className="absolute inset-0"
        />
        {item.image && (
          <img
            src={item.image}
            alt={item.title ?? ''}
            className="absolute inset-0 size-full object-cover"
            // AI-written image URLs can be dead: hide instead of a broken icon
            onError={(event) => (event.currentTarget.hidden = true)}
          />
        )}
      </div>
      {(item.title || item.description) && (
        <figcaption className="flex flex-col gap-1 p-4">
          {item.title && <span className="font-semibold">{item.title}</span>}
          {item.description && (
            <span className="text-sm text-muted-foreground">
              {item.description}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  ))
  if (props.autoplay) {
    return (
      <MagicMarquee
        pauseOnHover
        className={cn('w-full', marqueeFade, props.className)}
      >
        {slides}
      </MagicMarquee>
    )
  }
  return (
    <div
      className={cn(
        'flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-4',
        props.className,
      )}
    >
      {slides}
    </div>
  )
}

export function AppShell({ props, children }: PropsOf<'AppShell'>) {
  const [open, setOpen] = useState(false) // mobile sidebar

  const nav = (
    <nav className="flex flex-col gap-1">
      {list(props.nav).map((item, index) => (
        <a
          key={index}
          href="#"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm',
            'text-muted-foreground hover:bg-muted hover:text-foreground',
            item.active && 'bg-muted font-medium text-foreground',
          )}
        >
          <Icon name={item.icon} className="size-4" />
          {item.label}
        </a>
      ))}
    </nav>
  )

  return (
    <div
      className={cn(
        'flex min-h-dvh w-full flex-col md:flex-row',
        props.className,
      )}
    >
      {/* Desktop: fixed sidebar */}
      <aside
        className="hidden w-60 shrink-0 flex-col gap-6 border-r bg-card p-4
          md:flex"
      >
        <span className="px-3 text-lg font-semibold">{props.brand}</span>
        {nav}
      </aside>

      {/* Mobile: top bar with a menu button */}
      <header
        className="flex items-center justify-between border-b bg-card px-4 py-3
          md:hidden"
      >
        <span className="font-semibold">{props.brand}</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <XIcon /> : <MenuIcon />}
        </Button>
      </header>
      {open && <div className="border-b bg-card p-3 md:hidden">{nav}</div>}

      <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-8">
        {props.title && (
          <h1 className="text-2xl font-bold tracking-tight">{props.title}</h1>
        )}
        {children}
      </main>
    </div>
  )
}
