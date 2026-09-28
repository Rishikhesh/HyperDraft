// Effects the blocks share: animated title text and card borders.
// Each maps one option value (e.g. titleEffect "sparkles") to a
// Magic UI component, so the AI only chooses a word.
import type { ReactNode } from 'react'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { AuroraText } from '@/components/ui/aurora-text'
import { BorderBeam } from '@/components/ui/border-beam'
import { GlareHover } from '@/components/ui/glare-hover'
import { Highlighter } from '@/components/ui/highlighter'
import { HyperText } from '@/components/ui/hyper-text'
import { MorphingText } from '@/components/ui/morphing-text'
import { NeonGradientCard } from '@/components/ui/neon-gradient-card'
import { ShineBorder } from '@/components/ui/shine-border'
import { SparklesText } from '@/components/ui/sparkles-text'
import { TextAnimate } from '@/components/ui/text-animate'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { WordRotate } from '@/components/ui/word-rotate'
import { cn } from '@/lib/utils'
import { list } from './safe'

export type TextEffectName =
  | 'none'
  | 'typing'
  | 'aurora'
  | 'animate'
  | 'sparkles'
  | 'scramble'
  | 'shiny'
  | 'gradient'
  | 'highlight'
  | 'rotate'
  | 'morph'

// The title's text with its effect. The effect components bring their
// own sizes; "inherit" keeps the heading's size and weight instead.
export function TextEffect({
  text,
  effect,
  words,
}: {
  text: string
  effect: TextEffectName | null | undefined
  words?: string[] | null
}) {
  const extra = list(words)
  switch (effect) {
    case 'typing':
      return <TypingAnimation as="span">{text}</TypingAnimation>
    case 'aurora':
      return (
        <AuroraText
          colors={['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)']}
        >
          {text}
        </AuroraText>
      )
    case 'animate':
      return (
        <TextAnimate as="span" by="word" animation="blurInUp" once>
          {text}
        </TextAnimate>
      )
    case 'sparkles':
      return (
        <SparklesText className="text-[length:inherit] font-[inherit]">
          {text}
        </SparklesText>
      )
    case 'scramble':
      return (
        <HyperText
          as="span"
          className="inline-block py-0 text-[length:inherit] font-[inherit]"
        >
          {text}
        </HyperText>
      )
    case 'shiny':
      return (
        <AnimatedShinyText className="mx-0 max-w-none">
          {text}
        </AnimatedShinyText>
      )
    case 'gradient':
      return (
        <AnimatedGradientText
          colorFrom="var(--chart-1)"
          colorTo="var(--chart-2)"
        >
          {text}
        </AnimatedGradientText>
      )
    case 'highlight':
      return (
        <Highlighter action="highlight" color="#facc1566">
          {text}
        </Highlighter>
      )
    case 'rotate':
      // "Build faster" + words → "Build faster <changing word>"
      return extra.length ? (
        <>
          {text} <WordRotate words={extra} className="text-primary" />
        </>
      ) : (
        text
      )
    case 'morph':
      return (
        <MorphingText
          texts={[text, ...extra]}
          className="mx-0 h-[1.2em] max-w-none text-left text-[length:inherit]
            md:h-[1.2em] lg:text-[length:inherit]"
        />
      )
    default:
      return text
  }
}

export type CardEffectName = 'none' | 'beam' | 'shine' | 'neon' | 'glare'

// Wraps one card. "beam" and "shine" draw over the card's own border;
// "neon" and "glare" wrap the whole card.
export function CardEffect({
  effect,
  className,
  part,
  children,
}: {
  effect: CardEffectName | null | undefined
  className?: string
  part?: string // data-sw-prop: this card is one item, selectable alone
  children: ReactNode
}) {
  const tag = part ? { 'data-sw-prop': part } : {}
  switch (effect) {
    case 'beam':
      return (
        <div {...tag} className={cn('relative overflow-hidden', className)}>
          {children}
          <BorderBeam size={80} duration={8} />
        </div>
      )
    case 'shine':
      return (
        <div {...tag} className={cn('relative overflow-hidden', className)}>
          {children}
          <ShineBorder
            shineColor={['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)']}
          />
        </div>
      )
    case 'neon':
      // The neon frame brings its own surface and padding; keep only
      // the card's layout
      return (
        <NeonGradientCard
          {...tag}
          className="h-full"
          borderSize={2}
          borderRadius={12}
          neonColors={{
            firstColor: 'var(--chart-1)',
            secondColor: 'var(--chart-2)',
          }}
        >
          <div
            className={cn(className, 'border-0 bg-transparent p-0 shadow-none')}
          >
            {children}
          </div>
        </NeonGradientCard>
      )
    case 'glare':
      return (
        <GlareHover
          {...tag}
          className={cn(className, 'place-items-stretch')}
          width="100%"
          height="100%"
          background="var(--card)"
          opacity={0.25}
        >
          {children}
        </GlareHover>
      )
    default:
      return (
        <div {...tag} className={className}>
          {children}
        </div>
      )
  }
}
