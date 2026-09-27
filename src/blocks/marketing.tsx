// Landing-page sections. They look designed out of the box, so the AI
// only supplies the content.
import type { BaseComponentProps } from '@json-render/react'
import { CheckIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Marquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'
import type { blockDefinitions } from './definitions'
import { list, text } from './safe'
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

export function FeatureGrid({ props }: PropsOf<'FeatureGrid'>) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 gap-6',
        columnClasses[props.columns ?? '3'],
        props.className,
      )}
    >
      {list(props.items).map((item, index) => (
        <div
          key={index}
          className={cn(
            'flex flex-col gap-3 rounded-xl border bg-card p-6',
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
        </div>
      ))}
    </div>
  )
}

export function PricingTable({ props }: PropsOf<'PricingTable'>) {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 items-start gap-6',
        list(props.plans).length >= 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2',
        props.className,
      )}
    >
      {list(props.plans).map((plan, index) => (
        <div
          key={index}
          className={cn(
            'relative flex flex-col gap-6 rounded-xl border bg-card p-6',
            hoverOf(props.hover),
            plan.highlighted && 'shadow-lg ring-2 ring-primary',
          )}
        >
          {plan.highlighted && (
            <span
              className="absolute -top-3 left-6 rounded-full bg-primary px-3
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
        </div>
      ))}
    </div>
  )
}

export function Testimonials({ props }: PropsOf<'Testimonials'>) {
  const scrolling = props.layout === 'marquee'
  const cards = list(props.items).map((item, index) => (
    <figure
      key={index}
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
    </figure>
  ))
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
  return (
    <div
      className={cn(
        'grid w-full grid-cols-2 gap-4 lg:grid-cols-4',
        props.className,
      )}
    >
      {list(props.items).map((item, index) => (
        <div
          key={index}
          className={cn(
            'flex flex-col gap-1 rounded-xl border bg-card p-5',
            hoverOf(props.hover),
          )}
        >
          <span className="text-sm text-muted-foreground">{item.label}</span>
          <span className="text-2xl font-bold tracking-tight">
            {item.value}
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
        </div>
      ))}
    </div>
  )
}

export function CallToAction({ props }: PropsOf<'CallToAction'>) {
  return (
    <div
      className={cn(
        `flex w-full flex-col items-center gap-4 rounded-2xl bg-primary px-6
        py-14 text-center text-primary-foreground`,
        props.className,
      )}
    >
      <h2 className="text-3xl font-bold tracking-tight text-balance">
        {props.title}
      </h2>
      {props.subtitle && (
        <p className="max-w-xl opacity-80">{props.subtitle}</p>
      )}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button variant="secondary" size="lg">
          {props.primary}
        </Button>
        {props.secondary && (
          <Button
            variant="ghost"
            size="lg"
            className="text-primary-foreground hover:bg-primary-foreground/10
              hover:text-primary-foreground"
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
        <li key={index} className="flex flex-col gap-3">
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
