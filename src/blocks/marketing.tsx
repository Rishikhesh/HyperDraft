// Landing-page sections. They look designed out of the box, so the AI
// only supplies the content.
import type { BaseComponentProps } from '@json-render/react'
import {
  CheckIcon,
  QuoteIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from 'lucide-react'
import { uniq } from 'lodash-es'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { BentoGrid } from '@/components/ui/bento-grid'
import { Marquee } from '@/components/ui/marquee'
import { NumberTicker } from '@/components/ui/number-ticker'
import { cn } from '@/lib/utils'
import type { blockDefinitions } from './definitions'
import { list, text } from './safe'
import { CardEffect } from './effects'
import { Icon } from './icons'
import { marqueeFade } from './styles'

type Defs = typeof blockDefinitions
type PropsOf<K extends keyof Defs> = BaseComponentProps<
  z.infer<Defs[K]['props']>
>

// Card hover effects (the blocks' "hover" option)
const hoverEffects = {
  none: '',
  lift:
    'transition duration-300 hover:shadow-lg ' +
    'motion-safe:hover:-translate-y-1',
  glow:
    'transition duration-300 hover:shadow-lg hover:shadow-primary/10 ' +
    'hover:ring-2 hover:ring-primary/40',
}
const hoverOf = (value: keyof typeof hoverEffects | null | undefined) =>
  hoverEffects[value ?? 'none'] ?? ''

const columnClasses = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
}

// Bento: tile widths (out of 3 columns) repeat 2-1, 1-2; the last tile
// stretches to fill its row
function bentoSpans(count: number): number[] {
  const spans: number[] = []
  let used = 0
  for (let i = 0; i < count; i++) {
    const span = [2, 1, 1, 2][i % 4]
    if (used + span > 3) used = 0
    spans.push(span)
    used = (used + span) % 3
  }
  if (spans.length && used) spans[spans.length - 1] += 3 - used
  return spans
}
const spanClasses = ['', 'md:col-span-1', 'md:col-span-2', 'md:col-span-3']

export function FeatureGrid({ props }: PropsOf<'FeatureGrid'>) {
  const items = list(props.items)
  const bento = props.layout === 'bento'
  const spans = bentoSpans(items.length)
  const cards = items.map((item, index) => (
    <CardEffect
      key={index}
      part={`items.${index}`}
      effect={props.cardEffect}
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-card p-6',
        bento && 'col-span-3 justify-end',
        bento && spanClasses[spans[index]],
        hoverOf(props.hover),
      )}
    >
      {item.icon && (
        <span
          className="flex size-10 items-center justify-center rounded-lg
            bg-primary/10 text-primary"
        >
          <Icon name={item.icon} className="size-5" />
        </span>
      )}
      <h3 className="font-semibold">{item.title}</h3>
      <p className="text-sm text-muted-foreground">{item.description}</p>
    </CardEffect>
  ))
  if (props.layout === 'list') {
    // Compact rows: icon beside title and description
    return (
      <ul
        className={cn(
          'mx-auto flex w-full max-w-3xl flex-col divide-y',
          props.className,
        )}
      >
        {items.map((item, index) => (
          <li
            key={index}
            data-sw-prop={`items.${index}`}
            className="flex gap-4 py-5"
          >
            {item.icon && (
              <span
                className="flex size-10 shrink-0 items-center justify-center
                  rounded-lg bg-primary/10 text-primary"
              >
                <Icon name={item.icon} className="size-5" />
              </span>
            )}
            <span className="flex flex-col gap-1">
              <span className="font-semibold">{item.title}</span>
              <span className="text-sm text-muted-foreground">
                {item.description}
              </span>
            </span>
          </li>
        ))}
      </ul>
    )
  }
  if (bento) {
    return (
      <BentoGrid
        className={cn('auto-rows-[minmax(11rem,auto)]', props.className)}
      >
        {cards}
      </BentoGrid>
    )
  }
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 gap-6',
        columnClasses[props.columns ?? '3'],
        props.className,
      )}
    >
      {cards}
    </div>
  )
}

export function PricingTable({ props }: PropsOf<'PricingTable'>) {
  if (props.layout === 'comparison') return <PricingComparison {...props} />
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 items-start gap-6',
        list(props.plans).length >= 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2',
        props.className,
      )}
    >
      {list(props.plans).map((plan, index) => (
        <CardEffect
          key={index}
          part={`plans.${index}`}
          effect={props.cardEffect}
          className={cn(
            'relative flex flex-col gap-6 rounded-xl border bg-card p-6',
            hoverOf(props.hover),
            plan.highlighted && 'shadow-lg ring-2 ring-primary',
          )}
        >
          {plan.highlighted && (
            <span
              className="absolute top-5 right-5 rounded-full bg-primary px-3
                py-0.5 text-xs font-medium text-primary-foreground"
            >
              Most popular
            </span>
          )}
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold">{plan.name}</h3>
            {plan.description && (
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            )}
          </div>
          <p className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">
              {plan.price}
            </span>
            {plan.period && (
              <span className="text-sm text-muted-foreground">
                {plan.period}
              </span>
            )}
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            {list(plan.features).map((feature, index) => (
              <li key={index} className="flex gap-2">
                <CheckIcon className="size-4 shrink-0 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
          <Button variant={plan.highlighted ? 'default' : 'outline'}>
            {plan.cta}
          </Button>
        </CardEffect>
      ))}
    </div>
  )
}

export function Testimonials({ props }: PropsOf<'Testimonials'>) {
  const scrolling = props.layout === 'marquee'
  const cards = list(props.items).map((item, index) => (
    <CardEffect
      key={index}
      part={`items.${index}`}
      effect={props.cardEffect}
      className={cn(
        'flex flex-col gap-4 rounded-xl border bg-card p-6',
        scrolling && 'w-80 shrink-0',
        hoverOf(props.hover),
      )}
    >
      <blockquote className="text-sm leading-relaxed">
        “{item.quote}”
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <span
          className="flex size-9 items-center justify-center rounded-full
            bg-primary/10 text-sm font-semibold text-primary"
        >
          {text(item.name).charAt(0)}
        </span>
        <span className="flex flex-col text-sm">
          <span className="font-medium">{item.name}</span>
          {item.role && (
            <span className="text-muted-foreground">{item.role}</span>
          )}
        </span>
      </figcaption>
    </CardEffect>
  ))
  const [first] = list(props.items)
  if (props.layout === 'spotlight' && first) {
    // One big quote; the others' names underneath
    return (
      <figure
        data-sw-prop="items.0"
        className={cn(
          'mx-auto flex max-w-3xl flex-col items-center gap-6 text-center',
          props.className,
        )}
      >
        <QuoteIcon className="size-10 text-primary/40" />
        <blockquote
          className="text-2xl leading-snug font-medium text-balance md:text-3xl"
        >
          {first.quote}
        </blockquote>
        <figcaption className="text-sm">
          <span className="font-semibold">{first.name}</span>
          {first.role && (
            <span className="text-muted-foreground"> · {first.role}</span>
          )}
        </figcaption>
      </figure>
    )
  }
  if (scrolling) {
    return (
      <Marquee
        pauseOnHover
        className={cn('w-full', marqueeFade, props.className)}
      >
        {cards}
      </Marquee>
    )
  }
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 gap-6 md:grid-cols-3',
        props.className,
      )}
    >
      {cards}
    </div>
  )
}

export function Stats({ props }: PropsOf<'Stats'>) {
  if (props.layout === 'inline') {
    // Big numbers in a row, split by thin lines; no boxes
    return (
      <dl
        className={cn(
          'grid w-full grid-cols-2 gap-y-8 md:flex md:divide-x',
          props.className,
        )}
      >
        {list(props.items).map((item, index) => (
          <div
            key={index}
            data-sw-prop={`items.${index}`}
            className="flex flex-1 flex-col items-center gap-1 px-4"
          >
            <dd className="text-4xl font-bold tracking-tight">
              {props.countUp ? <CountUp value={item.value} /> : item.value}
            </dd>
            <dt className="text-sm text-muted-foreground">{item.label}</dt>
          </div>
        ))}
      </dl>
    )
  }
  return (
    <div
      className={cn(
        'grid w-full grid-cols-2 gap-4 lg:grid-cols-4',
        props.className,
      )}
    >
      {list(props.items).map((item, index) => (
        <CardEffect
          key={index}
          part={`items.${index}`}
          effect={props.cardEffect}
          className={cn(
            'flex flex-col gap-1 rounded-xl border bg-card p-5',
            hoverOf(props.hover),
          )}
        >
          <span className="text-sm text-muted-foreground">{item.label}</span>
          <span className="text-2xl font-bold tracking-tight">
            {props.countUp ? <CountUp value={item.value} /> : item.value}
          </span>
          {item.change && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                item.trend === 'down' ? 'text-red-500' : 'text-emerald-500',
              )}
            >
              {item.trend === 'down' ? (
                <TrendingDownIcon className="size-3.5" />
              ) : (
                <TrendingUpIcon className="size-3.5" />
              )}
              {item.change}
            </span>
          )}
        </CardEffect>
      ))}
    </div>
  )
}

// "$48,210" → "$" + a ticker counting to 48210 + "". Values that aren't
// a number ("Unlimited") are shown as they are.
function CountUp({ value }: { value: string }) {
  const match = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(text(value))
  if (!match) return value
  const [, prefix, digits, suffix] = match
  const decimals = digits.split('.')[1]?.length ?? 0
  return (
    <>
      {prefix}
      <NumberTicker
        value={Number(digits.replaceAll(',', ''))}
        decimalPlaces={decimals}
        className="tracking-tight text-foreground"
      />
      {suffix}
    </>
  )
}

const ctaLayouts = {
  banner: 'bg-primary text-primary-foreground',
  card: 'border bg-card text-card-foreground',
  minimal: 'bg-transparent',
}

export function CallToAction({ props }: PropsOf<'CallToAction'>) {
  const layout = props.layout ?? 'banner'
  const banner = layout === 'banner'
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center gap-4 rounded-2xl px-6 py-14',
        'text-center',
        ctaLayouts[layout],
        props.className,
      )}
    >
      <h2
        data-sw-prop="title"
        className="text-3xl font-bold tracking-tight text-balance"
      >
        {props.title}
      </h2>
      {props.subtitle && (
        <p
          data-sw-prop="subtitle"
          className={cn(
            'max-w-xl',
            banner ? 'opacity-80' : 'text-muted-foreground',
          )}
        >
          {props.subtitle}
        </p>
      )}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button variant={banner ? 'secondary' : 'default'} size="lg">
          {props.primary}
        </Button>
        {props.secondary && (
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              banner &&
                `text-primary-foreground hover:bg-primary-foreground/10
                hover:text-primary-foreground`,
            )}
          >
            {props.secondary}
          </Button>
        )}
      </div>
    </div>
  )
}

export function LogoCloud({ props }: PropsOf<'LogoCloud'>) {
  const names = list(props.names).map((name, index) => (
    <span
      key={index}
      data-sw-prop={`names.${index}`}
      className="text-lg font-semibold tracking-tight text-muted-foreground/70"
    >
      {name}
    </span>
  ))
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center gap-6 py-6',
        props.className,
      )}
    >
      {props.title && (
        <p className="text-sm text-muted-foreground">{props.title}</p>
      )}
      {props.layout === 'marquee' ? (
        <Marquee
          pauseOnHover
          className={cn('w-full [--gap:2.5rem]', marqueeFade)}
        >
          {names}
        </Marquee>
      ) : (
        <div
          className="flex flex-wrap items-center justify-center gap-x-10
            gap-y-4"
        >
          {names}
        </div>
      )}
    </div>
  )
}

export function Steps({ props }: PropsOf<'Steps'>) {
  return (
    <ol
      className={cn(
        'grid w-full grid-cols-1 gap-6 md:grid-cols-3',
        props.className,
      )}
    >
      {list(props.items).map((item, index) => (
        <li
          key={index}
          data-sw-prop={`items.${index}`}
          className="flex flex-col gap-3"
        >
          <span
            className="flex size-9 items-center justify-center rounded-full
              bg-primary text-sm font-semibold text-primary-foreground"
          >
            {index + 1}
          </span>
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </li>
      ))}
    </ol>
  )
}

export function List({ props }: PropsOf<'List'>) {
  const style = props.style ?? 'bullet'
  const items = list(props.items)
  if (style === 'check') {
    return (
      <ul className={cn('flex flex-col gap-2 text-sm', props.className)}>
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    )
  }
  const Tag = style === 'number' ? 'ol' : 'ul'
  return (
    <Tag
      className={cn(
        'flex flex-col gap-2 pl-5 text-sm marker:text-muted-foreground',
        style === 'number' ? 'list-decimal' : 'list-disc',
        props.className,
      )}
    >
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </Tag>
  )
}

type PricingProps = PropsOf<'PricingTable'>['props']

// All plans in one table: features as rows, plans as columns
function PricingComparison(props: PricingProps) {
  const plans = list(props.plans)
  const features = uniq(plans.flatMap((plan) => list(plan.features)))
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border bg-card',
        props.className,
      )}
    >
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left font-medium text-muted-foreground">
              Features
            </th>
            {plans.map((plan, index) => (
              <th
                key={index}
                className={cn(
                  'p-4 text-center',
                  plan.highlighted && 'bg-primary/5',
                )}
              >
                <div className="font-semibold">{plan.name}</div>
                <div className="mt-1 text-2xl font-bold">
                  {plan.price}
                  {plan.period && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature, row) => (
            <tr key={row} className="border-b last:border-0">
              <td className="p-4">{feature}</td>
              {plans.map((plan, index) => (
                <td
                  key={index}
                  className={cn(
                    'p-4 text-center',
                    plan.highlighted && 'bg-primary/5',
                  )}
                >
                  {list(plan.features).includes(feature) ? (
                    <CheckIcon className="mx-auto size-4 text-primary" />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td />
            {plans.map((plan, index) => (
              <td key={index} className="p-4 text-center">
                <Button variant={plan.highlighted ? 'default' : 'outline'}>
                  {plan.cta}
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
