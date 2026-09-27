// App-style blocks: tabs, a dashboard layout, and a chart.
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
      {item.image && (
        <img
          src={item.image}
          alt={item.title ?? ''}
          className="aspect-4/3 w-full object-cover"
          // AI-written image URLs can be dead: hide instead of a broken icon
          onError={(event) => (event.currentTarget.hidden = true)}
        />
      )}
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

// Chart drawing area, in SVG units. The SVG scales to its container.
const WIDTH = 600
const HEIGHT = 220
const PAD = 8

export function Chart({ props }: PropsOf<'Chart'>) {
  const data = list(props.data).filter((point) => Number.isFinite(point.value))
  const max = Math.max(1, ...data.map((point) => point.value))
  const step = data.length > 1 ? (WIDTH - PAD * 2) / (data.length - 1) : 0
  const x = (index: number) => PAD + index * step
  const y = (value: number) => HEIGHT - PAD - (value / max) * (HEIGHT - PAD * 2)
  const line = data.map((point, i) => `${x(i)},${y(point.value)}`).join(' ')
  const barWidth = ((WIDTH - PAD * 2) / Math.max(1, data.length)) * 0.6

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4 rounded-xl border bg-card p-5',
        props.className,
      )}
    >
      {props.title && <h3 className="font-semibold">{props.title}</h3>}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-48 w-full text-indigo-500"
        preserveAspectRatio="none"
        role="img"
        aria-label={props.title ?? 'Chart'}
      >
        {props.type === 'bar' &&
          data.map((point, i) => {
            const slot = (WIDTH - PAD * 2) / data.length
            return (
              <rect
                key={i}
                x={PAD + i * slot + (slot - barWidth) / 2}
                y={y(point.value)}
                width={barWidth}
                height={HEIGHT - PAD - y(point.value)}
                rx={4}
                className="fill-current opacity-80"
              />
            )
          })}
        {props.type === 'area' && data.length > 1 && (
          <polygon
            points={`${x(0)},${HEIGHT - PAD} ${line} ${x(data.length - 1)},${
              HEIGHT - PAD
            }`}
            className="fill-current opacity-15"
          />
        )}
        {props.type !== 'bar' && (
          <polyline
            points={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        {data.map((point, i) => (
          <span key={i}>{point.label}</span>
        ))}
      </div>
    </div>
  )
}
