// App and form parts from shadcn: date picker, calendar, OTP, command
// menu, sheet… Each keeps its own state, so the preview is interactive.
import { Fragment, useState } from 'react'
import type { BaseComponentProps } from '@json-render/react'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import type { z } from 'zod'
import {
  Breadcrumb as UIBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Calendar as UICalendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  HoverCard as UIHoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Kbd as UIKbd, KbdGroup } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sheet as UISheet,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { blockDefinitions } from './definitions'
import { Icon } from './icons'
import { list } from './safe'

type Defs = typeof blockDefinitions
type PropsOf<K extends keyof Defs> = BaseComponentProps<
  z.infer<Defs[K]['props']>
>

const formatDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export function DatePicker({ props }: PropsOf<'DatePicker'>) {
  const [date, setDate] = useState<Date>()
  const [range, setRange] = useState<DateRange>()
  const shown = props.range
    ? range?.from &&
      `${formatDate(range.from)}${range.to ? ` – ${formatDate(range.to)}` : ''}`
    : date && formatDate(date)
  return (
    <div className={cn('flex w-full flex-col gap-2', props.className)}>
      {props.label && <Label>{props.label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start font-normal',
              !shown && 'text-muted-foreground',
            )}
          >
            <CalendarIcon />
            {shown ?? props.placeholder ?? 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {props.range ? (
            <UICalendar
              mode="range"
              selected={range}
              onSelect={setRange}
              numberOfMonths={2}
            />
          ) : (
            <UICalendar mode="single" selected={date} onSelect={setDate} />
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function Calendar({ props }: PropsOf<'Calendar'>) {
  const [date, setDate] = useState<Date>()
  const [range, setRange] = useState<DateRange>()
  return (
    <div className={cn('w-fit rounded-xl border bg-card', props.className)}>
      {props.range ? (
        <UICalendar mode="range" selected={range} onSelect={setRange} />
      ) : (
        <UICalendar mode="single" selected={date} onSelect={setDate} />
      )}
    </div>
  )
}

export function OtpInput({ props }: PropsOf<'OtpInput'>) {
  const length = Number(props.length ?? '6')
  return (
    <div className={cn('flex flex-col items-center gap-2', props.className)}>
      {props.label && <Label>{props.label}</Label>}
      <InputOTP maxLength={length}>
        <InputOTPGroup>
          {Array.from({ length }, (_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  )
}

export function Breadcrumb({ props }: PropsOf<'Breadcrumb'>) {
  const items = list(props.items)
  return (
    <UIBreadcrumb className={props.className ?? undefined}>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {index === items.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href ?? '#'}>
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </UIBreadcrumb>
  )
}

export function Kbd({ props }: PropsOf<'Kbd'>) {
  return (
    <KbdGroup className={props.className ?? undefined}>
      {list(props.keys).map((key, index) => (
        <UIKbd key={index}>{key}</UIKbd>
      ))}
    </KbdGroup>
  )
}

export function Sheet({ props, children }: PropsOf<'Sheet'>) {
  return (
    <UISheet>
      <SheetTrigger asChild>
        <Button variant="outline" className={props.className ?? undefined}>
          {props.trigger}
        </Button>
      </SheetTrigger>
      <SheetContent side={props.side ?? 'right'}>
        <SheetHeader>
          <SheetTitle>{props.title}</SheetTitle>
          {props.description && (
            <SheetDescription>{props.description}</SheetDescription>
          )}
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">{children}</div>
      </SheetContent>
    </UISheet>
  )
}

export function CommandMenu({ props }: PropsOf<'CommandMenu'>) {
  return (
    <Command
      className={cn(
        'w-full max-w-lg rounded-xl border shadow-md',
        props.className,
      )}
    >
      <CommandInput placeholder={props.placeholder ?? 'Type a command…'} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {list(props.groups).map((group, index) => (
          <CommandGroup key={index} heading={group.heading}>
            {list(group.items).map((item, itemIndex) => (
              <CommandItem key={itemIndex}>
                {item.icon && <Icon name={item.icon} />}
                <span>{item.label}</span>
                {item.shortcut && (
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  )
}

export function HoverCard({ props }: PropsOf<'HoverCard'>) {
  return (
    <UIHoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" className={cn('px-0', props.className)}>
          {props.trigger}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-72 gap-3">
        {props.image && (
          <img
            src={props.image}
            alt=""
            className="size-10 shrink-0 rounded-full object-cover"
            onError={(event) => (event.currentTarget.hidden = true)}
          />
        )}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">{props.title}</span>
          {props.description && (
            <span className="text-sm text-muted-foreground">
              {props.description}
            </span>
          )}
        </div>
      </HoverCardContent>
    </UIHoverCard>
  )
}

export function EmptyState({ props, children }: PropsOf<'EmptyState'>) {
  return (
    <Empty className={cn('border border-dashed', props.className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon name={props.icon ?? 'folder'} />
        </EmptyMedia>
        <EmptyTitle>{props.title}</EmptyTitle>
        {props.description && (
          <EmptyDescription>{props.description}</EmptyDescription>
        )}
      </EmptyHeader>
      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  )
}

export function NavMenu({ props }: PropsOf<'NavMenu'>) {
  return (
    <NavigationMenu className={props.className ?? undefined}>
      <NavigationMenuList>
        {list(props.menus).map((menu, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuTrigger>{menu.label}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[420px] gap-1 p-2 md:grid-cols-2">
                {list(menu.items).map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <NavigationMenuLink href={item.href ?? '#'}>
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.description && (
                        <span
                          className="line-clamp-2 text-sm text-muted-foreground"
                        >
                          {item.description}
                        </span>
                      )}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const scrollHeights = { sm: 'h-48', md: 'h-72', lg: 'h-96' }

export function ScrollBox({ props, children }: PropsOf<'ScrollBox'>) {
  return (
    <ScrollArea
      className={cn(
        'w-full rounded-xl border',
        scrollHeights[props.height ?? 'md'],
        props.className,
      )}
    >
      <div className="flex flex-col gap-3 p-4">{children}</div>
    </ScrollArea>
  )
}
