// Fixes common, harmless model slips before the spec is checked.
import type { Spec } from '@json-render/core'
import { get, includes, isArray, isPlainObject } from 'lodash-es'

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
  }
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
// missing closing brackets, and "op":"add":"path" (colon for a comma)
export function fixLine(line: string): string {
  return closeBrackets(line.replace(/^(\s*\{\s*"op"\s*:\s*"\w+"\s*):/, '$1,'))
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
