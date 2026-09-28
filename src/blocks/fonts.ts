// Fonts a page may use, from Google Fonts. A fixed list, so every name
// is real and Jev can pick one instantly ("serif headings"). Each has
// the weights Google actually serves (asking for others fails).
// No React here: the server reads the names too.

export const fonts = {
  // Sans
  Geist: { weights: '', mood: 'default, neutral and modern' },
  Inter: { weights: '400;500;600;700', mood: 'neutral, product UI' },
  'DM Sans': { weights: '400;500;600;700', mood: 'soft, friendly' },
  Manrope: { weights: '400;500;600;700', mood: 'clean, geometric' },
  'Plus Jakarta Sans': { weights: '400;500;600;700', mood: 'polished' },
  'Space Grotesk': { weights: '400;500;600;700', mood: 'techy, quirky' },
  Outfit: { weights: '400;500;600;700', mood: 'rounded, modern' },
  Sora: { weights: '400;500;600;700', mood: 'futuristic' },
  Nunito: { weights: '400;600;700', mood: 'rounded, playful, kids' },
  Poppins: { weights: '400;500;600;700', mood: 'bold, marketing' },
  // Display (for headings)
  'Bricolage Grotesque': { weights: '400;600;700', mood: 'expressive' },
  Syne: { weights: '400;600;700', mood: 'artsy, avant-garde' },
  'Archivo Black': { weights: '400', mood: 'heavy, loud headlines' },
  // Serif
  'Playfair Display': { weights: '400;600;700', mood: 'elegant, editorial' },
  Fraunces: { weights: '400;600;700', mood: 'warm, quirky serif' },
  Lora: { weights: '400;500;600;700', mood: 'bookish, calm' },
  'DM Serif Display': { weights: '400', mood: 'classic headlines' },
  'Instrument Serif': { weights: '400', mood: 'refined, fashion' },
  'Cormorant Garamond': { weights: '400;600;700', mood: 'luxury, weddings' },
  // Mono
  'JetBrains Mono': { weights: '400;500;700', mood: 'code, developer tools' },
  'Space Mono': { weights: '400;700', mood: 'retro terminal' },
} as const

export type FontName = keyof typeof fonts
export const fontNames = Object.keys(fonts) as [FontName, ...FontName[]]

// "Playfair Display (elegant, editorial), Lora (bookish, calm), …"
export const fontHelp = fontNames
  .map((name) => `${name} (${fonts[name].mood})`)
  .join(', ')

// The Google Fonts stylesheet for a font; Geist ships with the app
export function fontUrl(name: FontName): string | null {
  const { weights } = fonts[name]
  if (!weights) return null
  const family = name.replaceAll(' ', '+')
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap`
}
