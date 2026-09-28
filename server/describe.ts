// The UI as words Jev can read: which elements exist, where they sit on
// the page, what they say, and what their lists contain. Jev matches
// requests like "the sign up tab" or "the cheapest plan" against this.
import type { Spec, UIElement } from '@json-render/core'
import {
  find,
  get,
  isNumber,
  isPlainObject,
  isString,
  keys,
  sortBy,
  take,
  toPairs,
} from 'lodash-es'
import { optionProps } from './edit'

// Jev allows up to 255 options per choice; leave room for "page"
export const MAX_TARGETS = 250

const TEXT_KEYS = ['title', 'label', 'text', 'brand', 'name', 'caption']
const ITEM_KEYS = ['name', 'title', 'label', 'question', 'heading', 'text']

// Element ids top to bottom as they appear on the page, then any
// element not reachable from the root. `parent` maps child → parent.
export function pageOrder(spec: Spec) {
  const order: string[] = []
  const parent: Record<string, string> = {}
  const visit = (id: string) => {
    if (!spec.elements[id] || order.includes(id)) return // no loops
    order.push(id)
    for (const child of spec.elements[id].children ?? []) {
      if (!parent[child]) parent[child] = id
      visit(child)
    }
  }
  visit(spec.root)
  for (const id of keys(spec.elements)) visit(id)
  return { order, parent }
}

// 'PricingTable hover=lift — plans: Starter $12, Pro $24 — in pricing'
export function describe(spec: Spec, id: string, parentId?: string): string {
  const element = spec.elements[id]
  return [
    [element.type, ...optionValues(element), quoted(mainText(element))]
      .filter(Boolean)
      .join(' '),
    itemSummary(element),
    parentId && location(spec, id, parentId),
  ]
    .filter(Boolean)
    .join(' — ')
}

// One short line per element, indented by depth: the page's outline
export function outline(spec: Spec): string {
  const { order, parent } = pageOrder(spec)
  const depth = (id: string): number => (parent[id] ? depth(parent[id]) + 1 : 0)
  return take(order, MAX_TARGETS)
    .map((id) => {
      const element = spec.elements[id]
      const text = quoted(mainText(element))
      return `${'  '.repeat(depth(id))}${id}: ${element.type}${text ? ` ${text}` : ''}`
    })
    .join('\n')
}

// Jev's target options: "page", then elements in page order. A page
// with more elements than Jev allows keeps those sharing the most words
// with the request (ponytail: word overlap; embeddings if it misfires).
export function targetOptions(
  spec: Spec,
  request: string,
): Record<string, string> {
  const { order, parent } = pageOrder(spec)
  const lines = order.map((id) => [id, describe(spec, id, parent[id])])
  const kept =
    lines.length <= MAX_TARGETS
      ? lines
      : sortBy(
          take(
            sortBy(lines, ([id, line]) => -overlap(request, `${id} ${line}`)),
            MAX_TARGETS,
          ),
          ([id]) => order.indexOf(id),
        )
  return {
    page: 'The page as a whole, or nothing specific',
    ...Object.fromEntries(kept),
  }
}

function overlap(request: string, line: string): number {
  const words = new Set(request.toLowerCase().match(/[a-z0-9]{3,}/g))
  return (line.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []).filter((word) =>
    words.has(word),
  ).length
}

function mainText(element: UIElement): string | undefined {
  return find(
    TEXT_KEYS.map((key) => get(element.props, key)),
    isString,
  )
}

const quoted = (text?: string) => text && `"${text.slice(0, 60)}"`

// Current option values, e.g. imageSide=left: they let Jev find the
// element a change like "move the image to the right" is about
function optionValues(element: UIElement): string[] {
  return keys(optionProps(element.type))
    .map((prop) => [prop, get(element.props, prop)])
    .filter(([, value]) => isString(value))
    .map(([prop, value]) => `${prop}=${value}`)
}

// What a block's lists hold: "plans: Starter $12, Pro $24, Team $36"
function itemSummary(element: UIElement): string | undefined {
  const parts = toPairs(element.props)
    .filter(([, value]) => Array.isArray(value) && value.length)
    .map(([prop, value]) => {
      const items = (value as unknown[]).map(itemText).filter(Boolean)
      const more = items.length > 6 ? ` +${items.length - 6} more` : ''
      return items.length
        ? `${prop}: ${take(items, 6).join(', ')}${more}`
        : undefined
    })
    .filter(Boolean)
  return parts.length ? parts.join('; ').slice(0, 240) : undefined
}

function itemText(item: unknown): string | undefined {
  if (isString(item)) return item.slice(0, 40)
  if (!isPlainObject(item)) return undefined
  const label = find(
    ITEM_KEYS.map((key) => get(item, key)),
    isString,
  )
  const amount = find(
    ['price', 'value'].map((key) => get(item, key)),
    (v) => isString(v) || isNumber(v),
  )
  return [label?.slice(0, 40), amount].filter((part) => part != null).join(' ')
}

// "in hero", or for a tab panel: 'in tabs, panel 2 "Sign up"'
function location(spec: Spec, id: string, parentId: string): string {
  const parent = spec.elements[parentId]
  const tabs = get(parent, 'props.tabs')
  if (parent?.type === 'TabbedContent' && Array.isArray(tabs)) {
    const index = (parent.children ?? []).indexOf(id)
    return `in ${parentId}, panel ${index + 1} ${quoted(String(tabs[index] ?? ''))}`
  }
  return `in ${parentId}`
}
