// json-render's own shadcn components, fixed or given more options.
import type { ComponentProps } from 'react'
import type { BaseComponentProps } from '@json-render/react'
import { shadcnComponents } from '@json-render/shadcn'
import type { z } from 'zod'
import { Button as UIButton } from '@/components/ui/button'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { PulsatingButton } from '@/components/ui/pulsating-button'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { ShinyButton } from '@/components/ui/shiny-button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { blockDefinitions } from './definitions'
import { CardEffect, TextEffect } from './effects'
import { family, useFont } from './use-font'

type Defs = typeof blockDefinitions
type PropsOf<K extends keyof Defs> = BaseComponentProps<
  z.infer<Defs[K]['props']>
>
type StackProps = ComponentProps<typeof shadcnComponents.Stack>

// json-render's Stack defaults to align "start", so inputs and buttons
// in a vertical form shrink to their content. Stretch them instead
// (and center rows), unless the AI chose an alignment.
export function Stack(ctx: StackProps) {
  const vertical = ctx.props.direction !== 'horizontal'
  const align = ctx.props.align ?? (vertical ? 'stretch' : 'center')
  return <shadcnComponents.Stack {...ctx} props={{ ...ctx.props, align }} />
}

const buttonVariants = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  link: 'link',
  danger: 'destructive',
} as const
const buttonSizes = { sm: 'sm', md: 'default', lg: 'lg' } as const

// All shadcn variants and sizes, plus Magic UI effect buttons
export function Button({ props, emit }: PropsOf<'Button'>) {
  const common = {
    className: props.className ?? undefined,
    disabled: props.disabled ?? false,
    onClick: () => {
      emit('press')
      if (props.toast) toast(props.toast)
    },
  }
  switch (props.effect) {
    case 'shimmer':
      return <ShimmerButton {...common}>{props.label}</ShimmerButton>
    case 'rainbow':
      return <RainbowButton {...common}>{props.label}</RainbowButton>
    case 'pulse':
      return <PulsatingButton {...common}>{props.label}</PulsatingButton>
    case 'shiny':
      return <ShinyButton {...common}>{props.label}</ShinyButton>
    case 'arrow':
      return (
        <InteractiveHoverButton {...common}>
          {props.label}
        </InteractiveHoverButton>
      )
    default:
      return (
        <UIButton
          {...common}
          variant={buttonVariants[props.variant ?? 'primary']}
          size={buttonSizes[props.size ?? 'md']}
        >
          {props.label}
        </UIButton>
      )
  }
}

// The original Card, optionally wrapped in a border effect
export function Card(ctx: PropsOf<'Card'>) {
  const { effect, className } = ctx.props
  if (!effect || effect === 'none') return <shadcnComponents.Card {...ctx} />
  return (
    <CardEffect effect={effect} className={cn('w-full rounded-xl', className)}>
      <shadcnComponents.Card
        {...ctx}
        props={{
          ...ctx.props,
          // Inside a neon frame the frame is the surface; no second card
          className: cn(
            'h-full w-full max-w-none',
            effect === 'neon' && 'border-0 bg-transparent py-0 shadow-none',
          ),
        }}
      />
    </CardEffect>
  )
}

const headingSizes = {
  h1: 'text-2xl font-bold',
  h2: 'text-lg font-semibold',
  h3: 'text-base font-semibold',
  h4: 'text-sm font-semibold',
}

const textVariants = {
  body: 'text-sm',
  caption: 'text-xs',
  muted: 'text-sm text-muted-foreground',
  lead: 'text-xl text-muted-foreground',
  code: 'rounded bg-muted px-1.5 py-0.5 font-mono text-sm',
}

// The original Text, plus classes (so "make it bigger" can work)
export function Text({ props }: PropsOf<'Text'>) {
  const variant = props.variant ?? 'body'
  const Tag = variant === 'code' ? 'code' : 'p'
  return (
    <Tag className={cn(textVariants[variant], 'text-left', props.className)}>
      {props.text}
    </Tag>
  )
}

// The original Heading, plus title effects
export function Heading({ props }: PropsOf<'Heading'>) {
  const Tag = props.level ?? 'h2'
  useFont(props.titleFont)
  return (
    <Tag
      className={cn(headingSizes[Tag], 'text-left', props.className)}
      style={
        props.titleFont ? { fontFamily: family(props.titleFont) } : undefined
      }
    >
      <TextEffect text={props.text} effect={props.effect} words={props.words} />
    </Tag>
  )
}
