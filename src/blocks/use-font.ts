// Loading Google fonts in the preview, for the Page and single titles
import { useEffect } from 'react'
import { fontUrl, type FontName } from './fonts'

// Adds a font's stylesheet to the page once, on first use
export function useFont(name: FontName | null | undefined) {
  useEffect(() => {
    const url = name && fontUrl(name)
    if (!url || document.querySelector(`link[href="${url}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    document.head.append(link)
  }, [name])
}

// The CSS font-family for a font, with a plain fallback
export const family = (name: FontName) => `'${name}', ui-sans-serif, sans-serif`
