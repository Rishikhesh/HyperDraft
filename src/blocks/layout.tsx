// How our blocks are drawn. Colors come from theme variables, so every
// block looks right in light and dark mode.
import { useState } from 'react'
import type { BaseComponentProps } from '@json-render/react'
import { MenuIcon, XIcon } from 'lucide-react'
import type { z } from 'zod'
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern'
import { AuroraText } from '@/components/ui/aurora-text'
import { Button } from '@/components/ui/button'
import { DotPattern } from '@/components/ui/dot-pattern'
import { Meteors } from '@/components/ui/meteors'
import { Particles } from '@/components/ui/particles'
import { Ripple } from '@/components/ui/ripple'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { cn } from '@/lib/utils'
import type { blockDefinitions } from './definitions'
import { list } from './safe'

type Defs = typeof blockDefinitions
type PropsOf<K extends keyof Defs> = BaseComponentProps<
  z.infer<Defs[K]['props']>
>

const pageBackgrounds = {
  plain: 'bg-background',
  muted: 'bg-muted/50',
  // Low-opacity tints over the theme background: fine in light and dark
  gradient:
    'bg-background bg-linear-to-br from-indigo-500/20 via-transparent ' +
    'to-fuchsia-500/20',
  aurora: 'bg-background',
  grid:
    'bg-background bg-[linear-gradient(to_right,var(--border)_1px,' +
    'transparent_1px),linear-gradient(to_bottom,var(--border)_1px,' +
    'transparent_1px)] bg-size-[40px_40px]',
  // Animated (Magic UI): drawn by the layer below
  dots: 'bg-background',
  'animated-grid': 'bg-background',
  meteors: 'bg-background',
  particles: 'bg-background',
  ripple: 'bg-background',
}

// Soft edges, so a pattern fades out instead of ending in a hard line
const fade = 'mask-[radial-gradient(ellipse_at_center,white,transparent_75%)]'

// The moving layer behind the content, for the animated backgrounds
const backgroundLayers: Partial<Record<string, React.ReactNode>> = {
  dots: <DotPattern className={cn('text-foreground/40', fade)} />,
  'animated-grid': (
    <AnimatedGridPattern
      numSquares={30}
      maxOpacity={0.15}
      className={cn('text-foreground/40', fade)}
    />
  ),
  meteors: <Meteors number={24} />,
  // Canvas colors can't read theme variables; indigo reads in both modes
  particles: <Particles className="absolute inset-0" color="#818cf8" />,
  ripple: <Ripple />,
}

export function Page({ props, children }: PropsOf<'Page'>) {
  const background = props.background ?? 'plain'
  return (
    <div
      className={cn(
        'relative isolate flex min-h-dvh w-full flex-col',
        'overflow-hidden text-foreground',
        pageBackgrounds[background],
        props.align === 'center' && 'items-center justify-center p-6',
        props.surface === 'glass' && 'sw-glass',
        props.className,
      )}
    >
      {background === 'aurora' && (
        // Soft blurred color blobs behind the content
        <div aria-hidden className="absolute inset-0 -z-10">
          <div
            className="absolute -top-32 -left-32 size-96 rounded-full
              bg-indigo-500/30 blur-3xl"
          />
          <div
            className="absolute top-1/3 -right-32 size-96 rounded-full
              bg-fuchsia-500/25 blur-3xl"
          />
          <div
            className="absolute -bottom-32 left-1/3 size-96 rounded-full
              bg-sky-500/20 blur-3xl"
          />
        </div>
      )}
      {backgroundLayers[background] && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden
            motion-reduce:hidden"
        >
          {backgroundLayers[background]}
        </div>
      )}
      {children}
    </div>
  )
}

export function Navbar({ props }: PropsOf<'Navbar'>) {
  const [open, setOpen] = useState(false) // mobile menu
  const links = list(props.links)
  return (
    <header
      className={cn(
        'sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur',
        props.className,
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <span className="text-lg font-semibold">{props.brand}</span>
        {/* Desktop: links inline */}
        <div className="ml-auto hidden items-center gap-6 md:flex">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          {props.cta && <Button size="sm">{props.cta}</Button>}
        </div>
        {/* Mobile: a menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <XIcon /> : <MenuIcon />}
        </Button>
      </nav>
      {open && (
        <div className="flex flex-col gap-1 border-t px-6 py-3 md:hidden">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="rounded-md px-2 py-2 text-sm hover:bg-muted"
            >
              {link.label}
            </a>
          ))}
          {props.cta && <Button className="mt-2">{props.cta}</Button>}
        </div>
      )}
    </header>
  )
}

export function Hero({ props, children }: PropsOf<'Hero'>) {
  const centered = props.align !== 'left'
  return (
    <section
      className={cn(
        'mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-20 md:py-28',
        centered ? 'items-center text-center' : 'items-start',
        props.className,
      )}
    >
      {props.eyebrow && (
        <span
          className="rounded-full border bg-background/60 px-3 py-1 text-xs
            font-medium text-muted-foreground"
        >
          {props.eyebrow}
        </span>
      )}
      <h1
        className={cn(
          'text-4xl font-bold tracking-tight text-balance',
          'md:text-6xl',
        )}
      >
        <HeroTitle text={props.title} effect={props.titleEffect} />
      </h1>
      {props.subtitle && (
        <p className="max-w-2xl text-lg text-pretty text-muted-foreground">
          {props.subtitle}
        </p>
      )}
      {children}
    </section>
  )
}

function HeroTitle({
  text,
  effect,
}: {
  text: string
  effect: 'none' | 'typing' | 'aurora' | null | undefined
}) {
  if (effect === 'aurora') return <AuroraText>{text}</AuroraText>
  if (effect === 'typing') {
    return <TypingAnimation as="span">{text}</TypingAnimation>
  }
  return text
}

const sectionWidths = {
  narrow: 'max-w-2xl',
  normal: 'max-w-4xl',
  wide: 'max-w-6xl',
}

export function Section({ props, children }: PropsOf<'Section'>) {
  return (
    <section
      className={cn(
        'w-full py-16',
        props.background === 'muted' && 'bg-muted',
        props.className,
      )}
    >
      <div
        className={cn(
          'mx-auto flex flex-col gap-8 px-6',
          sectionWidths[props.width ?? 'wide'],
        )}
      >
        {(props.title || props.subtitle) && (
          <div className="flex flex-col gap-2 text-center">
            {props.title && (
              <h2 className="text-3xl font-bold tracking-tight">
                {props.title}
              </h2>
            )}
            {props.subtitle && (
              <p className="text-muted-foreground">{props.subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

export function Footer({ props }: PropsOf<'Footer'>) {
  return (
    <footer className={cn('mt-auto w-full border-t', props.className)}>
      <div
        className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm
          text-muted-foreground md:flex-row md:items-center"
      >
        <span className="font-semibold text-foreground">{props.brand}</span>
        {props.text && <span>{props.text}</span>}
        <div className="flex flex-wrap gap-4 md:ml-auto">
          {list(props.links).map((link, index) => (
            <a key={index} href={link.href} className="hover:text-foreground">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// Two halves: an image fills one, the content is centered in the other.
// Phones: the image becomes a short banner above the content.
export function Split({ props, children }: PropsOf<'Split'>) {
  const imageRight = props.imageSide === 'right'
  return (
    <div
      className={cn(
        'grid min-h-dvh w-full grid-cols-1 md:grid-cols-2',
        props.className,
      )}
    >
      <div
        className={cn(
          'relative h-48 overflow-hidden md:h-auto',
          'bg-linear-to-br from-indigo-500/40 via-fuchsia-500/20',
          'to-sky-500/30',
          imageRight && 'md:order-2',
        )}
      >
        {props.image && (
          <img
            src={props.image}
            alt={props.imageAlt ?? ''}
            className="absolute inset-0 size-full object-cover"
            // A dead link leaves the gradient behind it instead
            onError={(event) => (event.currentTarget.hidden = true)}
          />
        )}
        {props.caption && (
          <p
            className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70
              to-transparent p-8 text-lg font-medium text-balance text-white"
          >
            {props.caption}
          </p>
        )}
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        {/* Children fill the width; a narrower one (a small Card) is
            centered instead of sticking to the left */}
        <div
          className="flex w-full max-w-md flex-col items-center gap-6
            [&>*]:w-full"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
