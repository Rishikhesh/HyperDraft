// Illustrations drawn in code (SVG), used instead of photos: nothing
// to download, so nothing can break; colors come from the theme's
// chart palette, so they follow light and dark mode. The seed (e.g.
// the title) makes each page's art different but stable.
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from './icons'

import { illustrationStyles, type IllustrationStyle } from './art'

const colors = [1, 2, 3, 4, 5].map((n) => `var(--chart-${n})`)

// Same seed → same numbers: "Build faster" always draws the same art
function random(seed: string) {
  let state =
    [...seed].reduce(
      (h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619),
      2166136261,
    ) >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function Illustration({
  style,
  icon,
  seed,
  className,
}: {
  style?: IllustrationStyle | null
  icon?: string | null
  seed: string
  className?: string
}) {
  const rand = random(seed)
  // No style chosen: pick one from the seed, so pages still vary
  const kind = style ?? illustrationStyles[Math.floor(rand() * 6)]
  const offset = Math.floor(rand() * 5)
  const color = (i: number) => colors[(i + offset) % colors.length]
  const between = (min: number, max: number) => min + rand() * (max - min)
  const id = `ill-${seed.replace(/\W/g, '').slice(0, 12)}-${kind}`

  let art: ReactNode
  if (kind === 'blobs') {
    art = (
      <>
        <defs>
          <filter id={`${id}-blur`}>
            <feGaussianBlur stdDeviation="28" />
          </filter>
        </defs>
        <g filter={`url(#${id}-blur)`} opacity="0.85">
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={between(80, 320)}
              cy={between(60, 240)}
              r={between(60, 110)}
              fill={color(i)}
            />
          ))}
        </g>
      </>
    )
  } else if (kind === 'geometric') {
    art = Array.from({ length: 9 }, (_, i) => {
      const x = between(20, 330)
      const y = between(20, 250)
      const size = between(24, 90)
      const fill = color(i)
      const shape = i % 3
      return shape === 0 ? (
        <circle key={i} cx={x} cy={y} r={size / 2} fill={fill} opacity="0.8" />
      ) : shape === 1 ? (
        <rect
          key={i}
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          rx="10"
          fill={fill}
          opacity="0.75"
          transform={`rotate(${between(-30, 30)} ${x} ${y})`}
        />
      ) : (
        <polygon
          key={i}
          points={`${x},${y - size / 2} ${x + size / 2},${y + size / 2} ${x - size / 2},${y + size / 2}`}
          fill={fill}
          opacity="0.7"
        />
      )
    })
  } else if (kind === 'orbit') {
    art = [50, 85, 120].map((r, ring) => (
      <g key={ring}>
        <circle
          cx="200"
          cy="150"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        {[0, 1, 2].map((i) => {
          const angle = between(0, Math.PI * 2)
          return (
            <circle
              key={i}
              cx={200 + Math.cos(angle) * r}
              cy={150 + Math.sin(angle) * r}
              r={between(5, 11)}
              fill={color(ring + i)}
            />
          )
        })}
      </g>
    ))
  } else if (kind === 'waves') {
    art = [0, 1, 2, 3].map((i) => {
      const y = 110 + i * 40
      const a = between(20, 45)
      return (
        <path
          key={i}
          d={`M0 ${y} C 100 ${y - a}, 150 ${y + a}, 200 ${y} S 320 ${y - a}, 400 ${y} V300 H0Z`}
          fill={color(i)}
          opacity={0.35 + i * 0.12}
        />
      )
    })
  } else if (kind === 'grid') {
    art = Array.from({ length: 8 * 6 }, (_, i) => {
      const lit = rand() < 0.22
      return (
        <rect
          key={i}
          x={24 + (i % 8) * 45}
          y={20 + Math.floor(i / 8) * 45}
          width="36"
          height="36"
          rx="8"
          fill={lit ? color(i) : 'currentColor'}
          opacity={lit ? 0.85 : 0.07}
        />
      )
    })
  } else {
    // "cards": an abstract app screen, stacked panels and bars
    art = [0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${60 + i * 34} ${50 + i * 30})`}>
        <rect
          width="220"
          height="150"
          rx="14"
          fill="var(--card)"
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        <rect x="18" y="18" width="70" height="10" rx="5" fill={color(i)} />
        {[0, 1, 2].map((j) => (
          <rect
            key={j}
            x="18"
            y={44 + j * 22}
            width={between(90, 180)}
            height="8"
            rx="4"
            fill="currentColor"
            opacity="0.12"
          />
        ))}
        <circle cx="190" cy="120" r="14" fill={color(i + 1)} opacity="0.9" />
      </g>
    ))
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-linear-to-br from-muted/60 to-muted/20',
        'text-foreground',
        className,
      )}
    >
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        aria-hidden
      >
        {art}
      </svg>
      {icon && (
        <span
          className="absolute top-1/2 left-1/2 flex size-20 -translate-1/2
            items-center justify-center rounded-2xl border bg-background/80
            text-primary shadow-lg backdrop-blur"
        >
          <Icon name={icon} className="size-9" />
        </span>
      )}
    </div>
  )
}
