// The LLM's output is untrusted: a prompt could trick it into writing a
// link like "javascript:stealStuff()". Every href/src it produces goes
// through here before it reaches the browser.
import { isArray, isPlainObject, isString, mapValues } from 'lodash-es'

const SAFE_HREF = /^(https?:|mailto:|tel:|#|\/|\.\/|\?)/i
const SAFE_SRC = /^(https?:|\/|data:image\/(png|jpe?g|gif|webp|avif);)/i

// "javascript:x" → "#". Anything without a scheme ("pricing") is a
// relative link, which is safe.
export function safeUrl(key: 'href' | 'src', url: string): string {
  const trimmed = url.trim()
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
  const allowed = key === 'href' ? SAFE_HREF : SAFE_SRC
  if (!hasScheme || allowed.test(trimmed)) return trimmed
  return key === 'href' ? '#' : ''
}

// Props that hold an image URL (our blocks call it "image")
const IMAGE_KEYS = ['src', 'image']

// Returns a copy of any JSON value with every link/image URL made safe,
// however deeply nested (e.g. Navbar links: [{ label, href }]).
export function cleanUrls(value: unknown, key?: string): unknown {
  if (isString(value)) {
    if (key === 'href') return safeUrl('href', value)
    if (key && IMAGE_KEYS.includes(key)) return safeUrl('src', value)
    return value
  }
  if (isArray(value)) return value.map((item) => cleanUrls(item))
  if (isPlainObject(value)) {
    return mapValues(value as object, (v, k) => cleanUrls(v, k))
  }
  return value
}
