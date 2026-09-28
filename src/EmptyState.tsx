// What the preview shows before any UI exists: a small page wireframe
// that keeps assembling itself and leans toward the pointer, plus a few
// example prompts to start from.
import { useState, type CSSProperties } from 'react'

const examples = [
  'A landing page for an agentic AI Saas product modern',
  'A login page for an online SaaS product with a modern UI',
  'A dashboard for a coffee roastery with a modern UI',
]

// The wireframe's blocks, in the order they appear: x, y, width, height,
// and whether it's an accent (the primary color)
const blocks: [number, number, number, number, boolean?][] = [
  [110, 70, 180, 14, true], // headline
  [140, 94, 120, 8], // subtitle
  [168, 112, 64, 14, true], // button
  [40, 146, 96, 70], // cards
  [152, 146, 96, 70],
  [264, 146, 96, 70],
  [40, 230, 320, 8], // footer lines
  [40, 246, 200, 8],
]

export default function EmptyState({
  onPick,
}: {
  onPick: (prompt: string) => void
}) {
  // -0.5…0.5 across the area: the wireframe leans that way
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const transform = `perspective(900px) rotateX(${-tilt.y * 10}deg) rotateY(${tilt.x * 14}deg)`

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-8 p-8"
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        setTilt({
          x: (event.clientX - box.left) / box.width - 0.5,
          y: (event.clientY - box.top) / box.height - 0.5,
        })
      }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <svg
        viewBox="0 0 400 290"
        aria-hidden
        className="w-full max-w-md text-foreground transition-transform
          duration-200 ease-out motion-reduce:transform-none!"
        style={{ transform }}
      >
        <rect
          x="10"
          y="10"
          width="380"
          height="270"
          rx="16"
          fill="var(--card)"
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        <line
          x1="10"
          y1="44"
          x2="390"
          y2="44"
          stroke="currentColor"
          strokeOpacity="0.1"
        />
        {[30, 46, 62].map((x) => (
          <circle
            key={x}
            cx={x}
            cy="27"
            r="5"
            fill="currentColor"
            opacity="0.15"
          />
        ))}
        {blocks.map(([x, y, width, height, accent], index) => (
          <rect
            key={index}
            className="sw-build"
            style={{ animationDelay: `${index * 0.18}s` } as CSSProperties}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={height > 20 ? 10 : height / 2}
            fill={accent ? 'var(--primary)' : 'currentColor'}
            fillOpacity={accent ? 0.9 : 0.12}
          />
        ))}
      </svg>

      <div className="flex max-w-md flex-col items-center gap-2 text-center">
        <h2 className="text-lg font-semibold">
          Describe a UI, watch it appear here
        </h2>
        <p className="text-sm text-muted-foreground">
          Type in the chat, or start from one of these:
        </p>
      </div>
      <div className="flex max-w-xl flex-wrap justify-center gap-2">
        {examples.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="rounded-full border bg-card px-3 py-1.5 text-sm
              text-muted-foreground transition duration-200 ease-out
              hover:border-primary/40 hover:text-foreground
              motion-safe:hover:-translate-y-0.5"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
