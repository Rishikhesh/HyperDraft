// Fixes common, harmless model slips before the spec is checked.
import type { Spec, UIElement } from '@json-render/core'
import {
  get,
  includes,
  isArray,
  isEqual,
  isPlainObject,
  keys,
  set,
} from 'lodash-es'
import type { z } from 'zod'
import { componentDefinitions } from '../src/catalog'

// Blocks meant to sit inside a Section (for padding and width). Put
// directly in the Page, they touch the screen edges.
const SECTION_CONTENT = [
  'PricingTable',
  'FeatureGrid',
  'Testimonials',
  'Stats',
  'Steps',
  'LogoCloud',
  'CallToAction',
  'Chart',
  'List',
  'Marquee',
]

export function repair(spec: Spec) {
  wrapBareBlocks(spec)

  for (const element of Object.values(spec.elements)) {
    // Some models leave out "children" or "props" on simple elements
    if (!isArray(element.children)) element.children = []
    // Drop links to elements that were never written (or were skipped)
    element.children = element.children.filter((id) => spec.elements[id])
    if (!isPlainObject(element.props)) element.props = {}

    // TabbedContent needs one child per tab. More tabs than panels
    // would give empty tabs, so drop the extra tabs.
    const tabs = get(element.props, 'tabs')
    if (element.type === 'TabbedContent' && isArray(tabs)) {
      element.props.tabs = tabs.slice(0, element.children.length)
    }
    fixProps(element)
    listAsContainer(element)
  }
}

// A block that draws its own lists (List, FeatureGrid…) ignores
// children. Models sometimes use one as a container anyway: children
// and no items. Then it becomes a Stack, so the children show.
function listAsContainer(element: UIElement) {
  const definition = get(componentDefinitions, element.type)
  if (!definition || definition.slots || !element.children?.length) return
  const shape = (definition.props as z.ZodObject).shape
  const lists = keys(shape).filter((prop) => shape[prop].safeParse([]).success)
  const empty = lists.every((prop) => !get(element.props, [prop, 'length']))
  if (!lists.length || !empty) return
  element.type = 'Stack'
  element.props = {
    direction: 'vertical',
    gap: 'md',
    className: get(element.props, 'className') ?? null,
  }
}

// The spec check only looks at structure, not props, so an invented
// value (variant "outline" on a Button without one, an icon we don't
// have inside a feature item) would slip through and render wrong.
// Invalid values that may be null are reset to null (the default);
// anything else is left for the component to handle.
function fixProps(element: UIElement) {
  const schema = get(componentDefinitions, [element.type, 'props']) as
    z.ZodType | undefined
  if (!schema) return
  const invalid = (path: PropertyKey[]) =>
    schema
      .safeParse(element.props)
      .error?.issues.some((issue) => isEqual(issue.path, path)) ?? false
  const issues = schema.safeParse(element.props).error?.issues ?? []
  for (const { path } of issues) {
    if (!path.length || isBinding(get(element.props, path[0]))) continue
    const value = get(element.props, path)
    set(element.props, path, null)
    if (invalid(path)) set(element.props, path, value) // null not allowed
  }
}

// {"$state": …}, {"$cond": …}: json-render fills these in at render time
function isBinding(value: unknown): boolean {
  return isPlainObject(value) && keys(value).some((k) => k.startsWith('$'))
}

// Page > PricingTable becomes Page > Section > PricingTable
function wrapBareBlocks(spec: Spec) {
  const page = spec.elements[spec.root]
  if (page?.type !== 'Page' || !isArray(page.children)) return
  page.children = page.children.map((id) => {
    const child = spec.elements[id]
    if (!child || !includes(SECTION_CONTENT, child.type)) return id
    const sectionId = `${id}-section`
    if (spec.elements[sectionId]) return id // already has one, leave it
    spec.elements[sectionId] = {
      type: 'Section',
      props: { title: null, subtitle: null, background: 'none', width: 'wide' },
      children: [id],
    }
    return sectionId
  })
}

// Fixes the mistakes models make in patch lines, so they can be read:
// missing closing brackets, "op":"add":"path" (colon for a comma), a
// markdown fence glued to the line ({…}```spec), and an element closed
// too early: "props":{…}},{"children":[…]} instead of …},"children":[…],
// and quotes inside text left unescaped: "Try the "Morning Blend"!"
export function fixLine(line: string): string {
  return closeBrackets(
    escapeStrayQuotes(line)
      .replace(/^\s*```\w*|```\w*\s*$/g, '')
      .replace(/^(\s*\{\s*"op"\s*:\s*"\w+"\s*):/, '$1,')
      .replace(/\}\},\{"children":/, '},"children":'),
  )
}

// A quote inside a string ends it only if JSON can continue there: a
// comma, colon or closing bracket, and after a comma another value or
// key. Otherwise it's a quote in the text ("Try the "Morning Blend"")
// and gets escaped. Lines that are valid JSON are left untouched.
export function escapeStrayQuotes(line: string): string {
  try {
    JSON.parse(line)
    return line
  } catch {
    // fall through: look for stray quotes
  }
  let out = ''
  let inString = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inString && char === '\\') {
      out += char + (line[++i] ?? '')
      continue
    }
    if (char === '"') {
      if (inString && !endsString(line, i + 1)) {
        out += '\\"' // a quote in the text
        continue
      }
      inString = !inString
    }
    out += char
  }
  return out
}

// Can JSON continue at `at` after a closing quote?
function endsString(line: string, at: number): boolean {
  const rest = line.slice(at).trimStart()
  if (!rest || /^[:}\]]/.test(rest)) return true
  // After a comma comes a key or a value, not plain words
  return /^,\s*["{[\d\-tfn]/.test(rest)
}

// Models often end a long JSON line one or two brackets short:
// {"op":"add","value":{"type":"Button","props":{...},"children":[]}
// Adds the missing closing brackets, in the right order. Brackets inside
// strings don't count. Returns the line unchanged if nothing is open.
export function closeBrackets(line: string): string {
  const open: string[] = [] // closers still needed, innermost last
  let inString = false
  let escaped = false
  for (const char of line) {
    if (escaped) escaped = false
    else if (char === '\\') escaped = inString
    else if (char === '"') inString = !inString
    else if (inString) continue
    else if (char === '{') open.push('}')
    else if (char === '[') open.push(']')
    else if (char === '}' || char === ']') open.pop()
  }
  return line + open.reverse().join('')
}
