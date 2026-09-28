// Page backgrounds drawn on a canvas, from React Bits (see its
// LICENSE.md: fine inside the app; don't ship them in exported code).
// Loaded only when a page uses one: the WebGL ones bring ogl along.
// Canvas and shaders can't read theme variables, so they get the
// palette's hex colors (or indigo tones without a palette).
import Aurora from '@/components/reactbits/Aurora'
import Galaxy from '@/components/reactbits/Galaxy'
import Threads from '@/components/reactbits/Threads'
import Waves from '@/components/reactbits/Waves'
import type { Palette } from './palettes'
import { useDark } from './use-dark'

export type ShaderBackgroundName =
  'aurora-flow' | 'threads' | 'galaxy' | 'waves'

const indigo = { primary: '#6366f1', secondary: '#a78bfa', accent: '#38bdf8' }

// "#6366f1" → [0.39, 0.4, 0.95], the 0-1 channels shaders use
function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1, 7), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

// The hue of a color, 0-360: turns Galaxy's stars toward the brand
function hue(hex: string): number {
  const [r, g, b] = channels(hex)
  const max = Math.max(r, g, b)
  const range = max - Math.min(r, g, b)
  if (!range) return 0
  const h =
    max === r
      ? ((g - b) / range) % 6
      : max === g
        ? (b - r) / range + 2
        : (r - g) / range + 4
  return (h * 60 + 360) % 360
}

export default function ShaderBackground({
  kind,
  palette,
}: {
  kind: ShaderBackgroundName
  palette: Palette | undefined
}) {
  const dark = useDark()
  const colors = palette ?? indigo
  if (kind === 'aurora-flow') {
    return (
      <Aurora
        colorStops={[colors.primary, colors.accent, colors.secondary]}
        amplitude={1}
        blend={0.5}
        lightMode={!dark}
      />
    )
  }
  if (kind === 'threads') {
    return (
      <Threads color={channels(colors.primary)} amplitude={1} distance={0} />
    )
  }
  if (kind === 'galaxy') {
    return (
      <Galaxy
        hueShift={hue(colors.primary)}
        saturation={0.6}
        density={1}
        glowIntensity={0.3}
        mouseRepulsion={false}
        lightMode={!dark}
      />
    )
  }
  return (
    <Waves
      lineColor={`${colors.primary}55`}
      waveAmpX={40}
      waveAmpY={20}
      xGap={12}
      yGap={36}
    />
  )
}
