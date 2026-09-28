// Edits that need no LLM: code does them from Jev's decision.
// - remove: delete an element and everything inside it
// - style: set option props (variant, background...) to allowed values
import type { JsonPatch, Spec } from '@json-render/core'
import {
  flatMap,
  get,
  includes,
  isArray,
  isString,
  memoize,
  toPairs,
  without,
} from 'lodash-es'
import { z } from 'zod'
import { componentDefinitions, type ComponentName } from '../src/catalog'

// Element ids go into JSON Pointer paths, where "~" and "/" are special
const pointer = (id: string) => id.replace(/~/g, '~0').replace(/\//g, '~1')

export function removePatches(spec: Spec, id: string): JsonPatch[] | null {
  if (id === spec.root || !spec.elements[id]) return null // keep the page

  // Unlink it from any parent…
  const unlink = toPairs(spec.elements)
    .filter(([, element]) => includes(element.children, id))
    .map(([parentId, element]) => ({
      op: 'replace' as const,
      path: `/elements/${pointer(parentId)}/children`,
      value: without(element.children, id),
    }))
  // …then delete it and everything inside it
  const remove = [id, ...descendants(spec, id)].map((gone) => ({
    op: 'remove' as const,
    path: `/elements/${pointer(gone)}`,
  }))
  return [...unlink, ...remove]
}

// The elements an edit may touch: the targets, everything inside them,
// and (to add something next to them) their parents
export function scopeOf(
  spec: Spec,
  ids: string[],
  withParents: boolean,
): Set<string> {
  const scope = new Set(ids.flatMap((id) => [id, ...descendants(spec, id)]))
  if (withParents) {
    for (const [parentId, element] of toPairs(spec.elements)) {
      if (ids.some((id) => includes(element.children, id))) scope.add(parentId)
    }
  }
  return scope
}

function descendants(spec: Spec, id: string, seen = new Set<string>()) {
  const children = get(spec.elements, [id, 'children'], []) as string[]
  return flatMap(children, (child): string[] => {
    if (seen.has(child) || !spec.elements[child]) return [] // no loops
    seen.add(child)
    return [child, ...descendants(spec, child, seen)]
  })
}

// The option props of a component and their allowed values, from its
// zod schema: { variant: ['primary', 'secondary', 'danger'], ... }
export const optionProps = memoize((type: string): Record<string, string[]> => {
  const definition = get(componentDefinitions, type) as
    (typeof componentDefinitions)[ComponentName] | undefined
  if (!definition) return {}
  const schema = z.toJSONSchema(definition.props) as {
    properties?: Record<string, unknown>
  }
  const options: Record<string, string[]> = {}
  for (const [prop, value] of toPairs(schema.properties)) {
    // A nullable enum is { anyOf: [{ enum: [...] }, { type: "null" }] }
    const direct = get(value, 'enum')
    const nested = flatMap(get(value, 'anyOf', []), (v) => get(v, 'enum', []))
    const values = (isArray(direct) ? direct : nested).filter(isString)
    if (values.length > 1) options[prop] = values
  }
  return options
})

export function propPatches(
  id: string,
  changes: Record<string, string>,
): JsonPatch[] {
  return toPairs(changes).map(([prop, value]) => ({
    op: 'add', // "add" also overwrites, and works if the prop was missing
    path: `/elements/${pointer(id)}/props/${pointer(prop)}`,
    value,
  }))
}
