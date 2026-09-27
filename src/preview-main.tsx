// Entry point of preview.html (the iframe page), like main.tsx for the app.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import theme from '@/theme.css?raw'
// shadcn's animation utilities (animate-in, fade-in, slide-in-from-…),
// written as Tailwind source, so the runtime can generate them too. By
// file path: the package only exports its CSS as a stylesheet, not ?raw.
import animations from '../node_modules/tw-animate-css/dist/tw-animate.css?raw'
import Preview from '@/Preview.tsx'

// The AI styles elements with Tailwind classes we can't know at build
// time. Tailwind's browser build generates CSS for them on the fly.
// It reads <style type="text/tailwindcss">, so give it our theme and
// animation utilities first (bg-primary, dark:, animate-in…), then load it.
const tailwindTheme = document.createElement('style')
tailwindTheme.setAttribute('type', 'text/tailwindcss')
tailwindTheme.textContent = `${theme}\n${animations}`
document.head.append(tailwindTheme)
await import('@tailwindcss/browser')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
)
