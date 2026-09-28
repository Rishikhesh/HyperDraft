// Charts (recharts via shadcn). Its own file: it's large, so the
// preview loads it only when a page has a chart (see registry.tsx).
import type { BaseComponentProps } from '@json-render/react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
} from 'recharts'
import type { z } from 'zod'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'
import type { blockDefinitions } from './definitions'
import { list } from './safe'

type Defs = typeof blockDefinitions
type PropsOf<K extends keyof Defs> = BaseComponentProps<
  z.infer<Defs[K]['props']>
>

// One row per point, one key per series (s0, s1…): the shape recharts
// wants. A single "value" counts as the only series.
function chartRows(
  data: { label: string; value?: number | null; values?: number[] | null }[],
) {
  return data.map((point) => {
    const values = point.values ?? (point.value == null ? [] : [point.value])
    return {
      label: point.label,
      ...Object.fromEntries(values.map((value, index) => [`s${index}`, value])),
    }
  })
}

const color = (index: number) => `var(--chart-${(index % 5) + 1})`

export function Chart({ props }: PropsOf<'Chart'>) {
  const data = list(props.data)
  const rows = chartRows(data)
  const count = Math.max(1, ...data.map((p) => p.values?.length ?? 1))
  const names = list(props.series)
  const keys = Array.from({ length: count }, (_, index) => `s${index}`)
  const config: ChartConfig = Object.fromEntries(
    keys.map((key, index) => [
      key,
      { label: names[index] ?? props.title ?? 'Value', color: color(index) },
    ]),
  )
  const stack = props.stacked ? 'total' : undefined
  const grid = <CartesianGrid vertical={false} />
  const xAxis = (
    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
  )
  const tooltip = <ChartTooltip content={<ChartTooltipContent />} />
  const legend = count > 1 && <ChartLegend content={<ChartLegendContent />} />

  let chart
  if (props.type === 'pie') {
    // One slice per point, each its own color
    const pieConfig: ChartConfig = Object.fromEntries(
      rows.map((row, index) => [
        row.label,
        { label: row.label, color: color(index) },
      ]),
    )
    chart = (
      <ChartContainer
        config={pieConfig}
        className="mx-auto aspect-square w-full max-w-72"
      >
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent nameKey="label" hideLabel />}
          />
          <Pie data={rows} dataKey="s0" nameKey="label" innerRadius={50}>
            {rows.map((row, index) => (
              <Cell key={row.label} fill={color(index)} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="label" />} />
        </PieChart>
      </ChartContainer>
    )
  } else if (props.type === 'radar') {
    chart = (
      <ChartContainer
        config={config}
        className="mx-auto aspect-square w-full max-w-80"
      >
        <RadarChart data={rows}>
          {tooltip}
          <PolarGrid />
          <PolarAngleAxis dataKey="label" />
          {keys.map((key) => (
            <Radar
              key={key}
              dataKey={key}
              fill={`var(--color-${key})`}
              fillOpacity={0.5}
            />
          ))}
          {legend}
        </RadarChart>
      </ChartContainer>
    )
  } else if (props.type === 'line') {
    chart = (
      <ChartContainer config={config} className="h-64 w-full">
        <LineChart data={rows}>
          {grid}
          {xAxis}
          {tooltip}
          {keys.map((key) => (
            <Line
              key={key}
              dataKey={key}
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              dot={false}
              type="monotone"
            />
          ))}
          {legend}
        </LineChart>
      </ChartContainer>
    )
  } else if (props.type === 'area') {
    chart = (
      <ChartContainer config={config} className="h-64 w-full">
        <AreaChart data={rows}>
          {grid}
          {xAxis}
          {tooltip}
          {keys.map((key) => (
            <Area
              key={key}
              dataKey={key}
              stackId={stack}
              type="monotone"
              stroke={`var(--color-${key})`}
              fill={`var(--color-${key})`}
              fillOpacity={0.3}
            />
          ))}
          {legend}
        </AreaChart>
      </ChartContainer>
    )
  } else {
    chart = (
      <ChartContainer config={config} className="h-64 w-full">
        <BarChart data={rows}>
          {grid}
          {xAxis}
          {tooltip}
          {keys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              stackId={stack}
              fill={`var(--color-${key})`}
              radius={4}
            />
          ))}
          {legend}
        </BarChart>
      </ChartContainer>
    )
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4 rounded-xl border bg-card p-5',
        props.className,
      )}
    >
      {(props.title || props.description) && (
        <div className="flex flex-col gap-1">
          {props.title && <h3 className="font-semibold">{props.title}</h3>}
          {props.description && (
            <p className="text-sm text-muted-foreground">{props.description}</p>
          )}
        </div>
      )}
      {chart}
    </div>
  )
}
