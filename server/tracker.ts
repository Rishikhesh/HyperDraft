// Applies the LLM's patches to a working copy of the UI: checks each
// one, streams the good ones to the app, and cleans up the result.
import type { JsonPatch, Spec } from '@json-render/core'
import {
  applySpecPatch,
  autoFixSpec,
  parseSpecStreamLine,
} from '@json-render/core'
import { findKey, get, includes, keys, last } from 'lodash-es'
import type { ChatEvent } from '../src/api'
import { catalog, componentNames } from '../src/catalog'
import { fixLine, repair } from './repair'
import { cleanUrls } from './sanitize'

type Send = (event: ChatEvent) => void

// Applies patches to a working copy, streams the good ones, and counts
export function tracker(
  start: Spec,
  send: Send,
  // Optional filter: patches it rejects are skipped (edit scope)
  allow?: (patch: JsonPatch) => boolean,
) {
  const working = structuredClone(start)
  const changed = new Set<string>()
  let skipped = 0

  return {
    apply(raw: JsonPatch) {
      // Make links/images safe before anything else sees them.
      // The last path part matters: "/elements/x/props/href" → "href".
      const patch = {
        ...raw,
        value: cleanUrls(raw.value, last(raw.path.split('/'))),
      }
      if (allow && !allow(patch)) {
        skipped++ // an element this change wasn't meant to touch
        console.warn('out of scope:', JSON.stringify(raw).slice(0, 200))
        return
      }
      if (!fits(working, patch)) {
        skipped++ // e.g. aimed at an element that doesn't exist
        console.warn('skipped patch:', JSON.stringify(raw).slice(0, 300))
        return
      }
      applySpecPatch(working, patch)
      send({ kind: 'patch', patch })
      const id = elementIdOf(patch)
      if (id) changed.add(id)
    },
    skip() {
      skipped++
    },
    has(id: string) {
      return Boolean(working.elements[id])
    },
    typeOf(id: string): string | undefined {
      return working.elements[id]?.type
    },
    prop(id: string, name: string): unknown {
      return get(working.elements, [id, 'props', name])
    },
    childrenOf(id: string): string[] {
      return working.elements[id]?.children ?? []
    },
    // New elements nothing links to get linked next to `anchor`: before
    // it if it's last in its parent (a footer: "above the footer"),
    // after it otherwise. ponytail: a guess at "above"/"below".
    adoptOrphans(anchor: string) {
      const linked = new Set(
        Object.values(working.elements).flatMap((e) => e.children ?? []),
      )
      const orphans = keys(working.elements).filter(
        (id) => !start.elements[id] && !linked.has(id) && id !== working.root,
      )
      if (!orphans.length) return
      const parentId =
        findKey(working.elements, (e) => includes(e.children, anchor)) ??
        working.root
      const siblings = working.elements[parentId]?.children ?? []
      const at = siblings.indexOf(anchor)
      const index =
        at < 0 ? siblings.length : at === siblings.length - 1 ? at : at + 1
      this.apply({
        op: 'replace',
        path: `/elements/${parentId}/children`,
        value: [
          ...siblings.slice(0, index),
          ...orphans,
          ...siblings.slice(index),
        ],
      })
    },
    // Check the result: fix small mistakes, reject anything invalid
    result() {
      repair(working)
      const { spec } = autoFixSpec(working)
      const check = catalog.validate(spec)
      if (!check.success) {
        throw new Error(`The generated UI was invalid: ${check.error?.message}`)
      }
      return { spec, changed: [...changed], skipped }
    },
  }
}

// Reads LLM output line by line: patches go to `onPatch`, broken patch
// lines are counted, words around them go to `onWords`. Returns which
// model answered.
// More lines than any real UI needs (the biggest pages are ~70 elements)
const MAX_LINES = 800

export async function applyStream(
  lines: AsyncGenerator<string, { model: string }>,
  onPatch: (patch: JsonPatch) => void,
  onBroken: () => void,
  onWords?: (text: string) => void,
): Promise<string> {
  const read = (line: string) =>
    parseSpecStreamLine(line) ?? parseSpecStreamLine(fixLine(line))
  // A patch the model broke across lines waits here for the rest
  let pending = ''
  let waited = 0
  const giveUp = () => {
    onBroken()
    console.warn(
      'broken patch line:',
      pending.slice(0, 200),
      '…',
      pending.slice(-160),
    )
    pending = ''
  }

  // A model can get stuck writing the same lines forever; it never goes
  // quiet, so the silence timeout doesn't catch it. Stop reading when a
  // line repeats, or after far more lines than any real UI needs.
  const seen = new Map<string, number>()
  let count = 0
  const stuck = (text: string) => {
    if (++count > MAX_LINES) return true
    if (text.length < 20) return false // short lines repeat naturally
    const times = (seen.get(text) ?? 0) + 1
    seen.set(text, times)
    return times >= 3
  }

  let next = await lines.next()
  for (; !next.done; next = await lines.next()) {
    const text = next.value.trim()
    if (stuck(text)) {
      console.warn('model stuck repeating; stopped after', count, 'lines')
      if (pending) giveUp()
      await lines.return({ model: '' }) // closes the model's stream
      return 'a model that got stuck (stopped)'
    }
    if (pending) {
      const joined = read(pending + text)
      if (joined) {
        onPatch(joined)
        pending = ''
        continue
      }
      // Keep collecting for up to two more lines, unless a new patch
      // clearly starts; then this one is lost and the line read afresh
      if (!text.startsWith('{') && ++waited <= 2) {
        pending += text
        continue
      }
      giveUp()
    }
    const patch = read(text)
    if (patch) onPatch(patch)
    else if (text.startsWith('{')) {
      pending = text
      waited = 0
    } else if (isNarration(text)) onWords?.(text)
  }
  if (pending) giveUp()
  return next.value.model
}

// Words the LLM writes around its patches, worth showing to the user
function isNarration(line: string): boolean {
  const text = line.trim()
  return text.length > 0 && !text.startsWith('```')
}

// "/elements/card/props/title" → "card". null for "/root", "/state/…"
export function elementIdOf(patch: JsonPatch): string | null {
  const [, section, id] = patch.path.split('/')
  return section === 'elements' && id ? id : null
}

// A patch inside an element ("/elements/x/props/…") needs x to exist.
// Without this check it would silently create a broken, typeless x.
// Adding a whole element ("/elements/x") is always fine.
function fits(spec: Spec, patch: JsonPatch): boolean {
  const id = elementIdOf(patch)
  const insideElement = patch.path.split('/').length > 3
  if (id && insideElement && !spec.elements[id]) return false
  // An invented component ("FAQ", "AccordionItem") can't be drawn, and
  // would fail the final check: skip it, keep the rest of the page
  const type = patch.path.endsWith('/type')
    ? patch.value
    : get(patch.value, 'type')
  if (id && type !== undefined && !includes(componentNames, type)) {
    return false
  }
  try {
    applySpecPatch(structuredClone(spec), patch) // dry run
    return true
  } catch {
    return false
  }
}

// Existing elements outside the scope, and the root, are off limits;
// new elements are fine
export function inScope(start: Spec, scope: Set<string>, patch: JsonPatch) {
  if (patch.path === '/root') return false
  const id = elementIdOf(patch)
  return !id || !start.elements[id] || scope.has(id)
}
