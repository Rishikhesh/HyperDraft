// How each catalog name is drawn: name -> real React component.
import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { defineRegistry } from '@json-render/react'
import { shadcnComponents } from '@json-render/shadcn'
import * as appBlocks from '@/blocks/app'
import * as layoutBlocks from '@/blocks/layout'
import * as marketingBlocks from '@/blocks/marketing'
import * as overrides from '@/blocks/overrides'
import { addedClassName, catalog } from '@/catalog'
import { cn } from '@/lib/utils'

// Big, less common blocks load on first use, so a page without a chart
// doesn't download recharts. Each group is one download.
function lazyBlocks<M, N extends keyof M & string>(
  load: () => Promise<M>,
  names: readonly N[],
): Pick<M, N> {
  return Object.fromEntries(
    names.map((name) => {
      const Lazy = lazy(() =>
        load().then((module) => ({
          default: module[name] as ComponentType<object>,
        })),
      )
      const Block = (ctx: object) => (
        <Suspense fallback={null}>
          <Lazy {...ctx} />
        </Suspense>
      )
      return [name, Block]
    }),
  ) as Pick<M, N>
}

// json-render components that ignore className get a wrapper holding
// it, so width, spacing and alignment classes work on them too. Our own
// versions (Heading, Text, Button) apply it themselves.
type Drawn = (ctx: { props: { className?: string | null } }) => ReactNode
function withClassName(Component: Drawn): Drawn {
  return function WithClassName(ctx) {
    const className = ctx.props.className
    if (!className) return <Component {...ctx} />
    return (
      <div className={cn(className)}>
        <Component {...ctx} />
      </div>
    )
  }
}
const wrapped = Object.fromEntries(
  addedClassName.map((name) => [
    name,
    withClassName(
      shadcnComponents[name as keyof typeof shadcnComponents] as Drawn,
    ),
  ]),
) as unknown as typeof shadcnComponents

const chartBlocks = lazyBlocks(() => import('@/blocks/chart'), ['Chart'])
const showcaseBlocks = lazyBlocks(
  () => import('@/blocks/showcase'),
  [
    'DeviceFrame',
    'Terminal',
    'Globe',
    'LogoCloud3D',
    'OrbitingLogos',
    'ActivityFeed',
    'AvatarStack',
    'FileTree',
    'Dock',
    'VideoPreview',
  ],
)
const appParts = lazyBlocks(
  () => import('@/blocks/app-parts'),
  [
    'DatePicker',
    'Calendar',
    'OtpInput',
    'Breadcrumb',
    'Kbd',
    'Sheet',
    'CommandMenu',
    'HoverCard',
    'EmptyState',
    'NavMenu',
    'ScrollBox',
  ],
)

export const { registry } = defineRegistry(catalog, {
  components: {
    ...shadcnComponents,
    ...wrapped,
    ...layoutBlocks,
    ...marketingBlocks,
    ...appBlocks,
    ...chartBlocks,
    ...appParts,
    ...showcaseBlocks,
    ...overrides, // last, so they replace the originals
  },
})
