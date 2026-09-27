// Self-check for URL cleaning. Run: bun server/sanitize.check.ts
import { ok } from 'node:assert'
import { cleanUrls, safeUrl } from './sanitize'

const cases: [key: 'href' | 'src', url: string, expected: string][] = [
  ['href', 'https://example.com', 'https://example.com'],
  ['href', '/pricing', '/pricing'],
  ['href', '#faq', '#faq'],
  ['href', 'pricing', 'pricing'], // relative: fine
  ['href', 'mailto:hi@x.io', 'mailto:hi@x.io'],
  ['href', 'javascript:alert(1)', '#'],
  ['href', ' JavaScript:alert(1)', '#'], // case and spaces
  ['href', 'data:text/html,<script>', '#'],
  ['src', 'https://img.io/a.png', 'https://img.io/a.png'],
  ['src', 'data:image/png;base64,AAA', 'data:image/png;base64,AAA'],
  ['src', 'data:image/svg+xml,<svg onload=x>', ''], // svg can run scripts
  ['src', 'javascript:x', ''],
]
for (const [key, url, expected] of cases) {
  ok(safeUrl(key, url) === expected, `${key} ${url}`)
}

// Nested, like a Navbar's links array inside a whole element
const element = {
  type: 'Navbar',
  props: { links: [{ label: 'x', href: 'javascript:bad()' }], brand: 'a' },
}
const cleaned = cleanUrls(element) as typeof element
ok(cleaned.props.links[0].href === '#', 'nested')
ok(element.props.links[0].href === 'javascript:bad()', 'copy')

// Block image props ("image") are image URLs too
const carousel = cleanUrls({
  items: [{ image: 'javascript:bad()' }, { image: 'https://x.dev/a.jpg' }],
}) as { items: { image: string }[] }
ok(carousel.items[0].image === '', 'image key')
ok(carousel.items[1].image === 'https://x.dev/a.jpg', 'image kept')

console.log('sanitize checks done')
