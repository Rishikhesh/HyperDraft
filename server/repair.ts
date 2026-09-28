// Fixes common, harmless model slips before the spec is checked.
import type { Spec, UIElement } from '@json-render/core'
import {
  findKey,
  get,
  has,
  includes,
  isArray,
  isEqual,
  isPlainObject,
  isString,
  keys,
  set,
} from 'lodash-es'
import type { z } from 'zod'
import { palettes } from '../src/blocks/palettes'
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
  contentFromState(spec)

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
    unquoteBindings(element)
    fixProps(element)
    listAsContainer(element)
    // A palette id the app doesn't know: none
    const palette = get(element.props, 'palette')
    if (
      element.type === 'Page' &&
      palette != null &&
      !has(palettes, String(palette))
    ) {
      element.props.palette = null
    }
  }
  dropEmptyBlocks(spec)
}

const parentOf = (spec: Spec, id: string) =>
  findKey(spec.elements, (element) => element.children?.includes(id))

// Models sometimes keep a page's content in /state and point blocks at
// it. Content belongs in the props, so it shows even when the pointing
// goes wrong:
// - a block's list given as {"$state": "/metrics"} gets the list itself
// - a block's empty list is filled from a /state list whose items fit
//   it (Stats items [] beside /state/metrics [{label, value}])
// - a card written as a template ("${quote}", "${name}") for each item of
//   a /state list is repeated over that list, as json-render does it
function contentFromState(spec: Spec) {
  const state = (spec.state ?? {}) as Record<string, unknown>
  const at = (path: string) => get(state, path.split('/').filter(Boolean))
  for (const [id, element] of Object.entries(spec.elements)) {
    for (const [prop, value] of Object.entries(element.props ?? {})) {
      const path = get(value, '$state')
      const list = isString(path) && keys(value).length === 1 && at(path)
      if (isArray(list) && list.length) {
        element.props[prop] = structuredClone(list)
      }
    }
    const definition = get(componentDefinitions, element.type)
    const shape = definition && (definition.props as z.ZodObject).shape
    for (const prop of keys(shape ?? {})) {
      const current = get(element.props, prop)
      if (!(current == null || (isArray(current) && !current.length))) continue
      if (!shape[prop].safeParse([]).success) continue // not a list
      const fits = Object.values(state).find(
        (list) =>
          isArray(list) && list.length && shape[prop].safeParse(list).success,
      )
      if (fits) element.props[prop] = structuredClone(fits)
    }
    const text = get(element.props, 'text')
    const field = isString(text) && /^\$\{(\w+)\}$/.exec(text)?.[1]
    if (!field) continue
    const listKey = keys(state).find((key) => has(get(state, [key, 0]), field))
    const item = parentOf(spec, id)
    const container = item && parentOf(spec, item)
    if (!listKey || !container) continue
    spec.elements[container].repeat ??= { statePath: `/${listKey}` }
    element.props.text = { $item: field }
  }
}

// A block whose content list is empty (Stats with no items) would show
// as a blank band, and so would a Section left holding nothing: both go
function dropEmptyBlocks(spec: Spec) {
  const isEmpty = (element: UIElement) => {
    if (element.children?.length) return false
    // A titled section can be content in itself (a dashboard tile)
    if (element.type === 'Section') {
      return !get(element.props, 'title') && !get(element.props, 'subtitle')
    }
    const definition = get(componentDefinitions, element.type)
    if (!definition || definition.slots) return false
    const shape = (definition.props as z.ZodObject).shape
    const required = keys(shape).filter(
      (prop) =>
        shape[prop].safeParse([]).success &&
        !shape[prop].safeParse(null).success,
    )
    return (
      required.length > 0 &&
      required.every((prop) => {
        const value = get(element.props, prop)
        return value == null || (isArray(value) && !value.length)
      })
    )
  }
  for (let found = true; found;) {
    const id = findKey(
      spec.elements,
      (element, key) => key !== spec.root && isEmpty(element),
    )
    found = Boolean(id)
    if (!id) continue
    delete spec.elements[id]
    for (const element of Object.values(spec.elements)) {
      element.children = element.children?.filter((child) => child !== id)
    }
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
    // A binding anywhere along the path ({"$cond": …} on one plan's
    // "highlighted") is filled in at render time: not a mistake
    const bound = path.some((_, end) =>
      isBinding(get(element.props, path.slice(0, end + 1))),
    )
    if (!path.length || bound) continue
    const value = get(element.props, path)
    set(element.props, path, null)
    if (invalid(path)) set(element.props, path, value) // null not allowed
  }
}

// A binding written as text: "{ $state: \"/countdown/days\" }" would show
// literally. Made into the real binding, it shows the value (12).
const BINDING_TEXT = /^\s*\{\s*"?\$state"?\s*:\s*"([^"]+)"\s*\}\s*$/
function unquoteBindings(element: UIElement) {
  for (const [prop, value] of Object.entries(element.props)) {
    const path = typeof value === 'string' && BINDING_TEXT.exec(value)?.[1]
    if (path) element.props[prop] = { $state: path }
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
// quotes inside text left unescaped ("Try the "Morning Blend"!"), and a
// value written twice: "value":"bg-grad":"bg-gradient-to-b …"
export function fixLine(line: string): string {
  return closeBrackets(
    escapeStrayQuotes(line)
      .replace(/^\s*```\w*|```\w*\s*$/g, '')
      .replace(/^(\s*\{\s*"op"\s*:\s*"\w+"\s*):/, '$1,')
      .replace(/\}\},\{"children":/, '},"children":')
      // A stuttered value: "value":"bg-grad":"bg-gradient-to-b …"
      .replace(/("value"\s*:\s*)"(?:[^"\\]|\\.)*"\s*:\s*(?=")/, '$1'),
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
