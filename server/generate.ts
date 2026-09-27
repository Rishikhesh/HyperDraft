// Turns one chat message into UI changes, streaming progress as it goes.
// Jev decides; code applies what it can; the LLM writes the rest.
import {
  applySpecPatch,
  autoFixSpec,
  buildUserPrompt,
  parseSpecStreamLine,
  type JsonPatch,
  type Spec,
} from '@json-render/core'
import { get, includes, isEmpty, keys, last, startCase, union } from 'lodash-es'
import type { ChatEvent, RequestMode } from '../src/api'
import { catalog, catalogOf, componentNames } from '../src/catalog'
import { designRules } from './design-rules'
import { optionProps, propPatches, removePatches } from './edit'
import { decide, decideProps, type Decision } from './jev'
import { streamLines } from './llm'
import { kits, withOutline } from './outlines'
import { fixLine, repair } from './repair'
import { cleanUrls } from './sanitize'

// How sure Jev must be before code edits without asking the LLM.
// ponytail: tune on real prompts.
const KIND_SURE = 0.6
const TARGET_SURE = 0.5

type Send = (event: ChatEvent) => void

export async function generate(
  message: string,
  spec: Spec,
  selectedId: string | null,
  mode: RequestMode,
  send: Send,
  signal: AbortSignal,
) {
  const started = performance.now()
  const elapsed = () => Math.round(performance.now() - started)

  // 1. Jev decides what this message is and what it touches
  send({ kind: 'step', text: 'Reading your request…' })
  const decision = await decide(message, spec, selectedId)
  // The user's explicit choice beats Jev's guess. Editing needs
  // something to edit, so "edit" on an empty canvas means "create".
  if (mode === 'create' || (mode === 'edit' && !spec.root)) {
    decision.intent = 'create'
    // Jev may have read it as an edit; new pages need their kit
    if (decision.scope === 'full') {
      decision.components = union(decision.components, kits[decision.pageType])
    }
  } else if (mode === 'edit') {
    decision.intent = 'edit'
  }
  send({
    kind: 'decision',
    intent: decision.intent,
    pageType: decision.pageType,
    components: decision.components,
    edit: decision.edit && {
      kind: decision.edit.kind,
      target: decision.edit.target,
    },
    ms: elapsed(),
  })

  if (decision.intent === 'unrelated') {
    send({
      kind: 'reply',
      text:
        'Describe a UI to build, or select an element and ' +
        'say what to change.',
    })
    return
  }

  const isEdit = decision.intent === 'edit'
  // "Remove it" with nothing selected: ask, instead of guessing and
  // deleting the wrong thing. Only for removals: a vague add or style
  // change can't destroy anything, so the LLM just tries.
  const vagueRemove =
    decision.edit?.kind === 'remove' && decision.edit.part === 'unclear'
  if (isEdit && vagueRemove) {
    send({
      kind: 'reply',
      text:
        'Which part? Switch to Edit, click it in the preview, then send ' +
        'your message again. Or name it, e.g. "remove the FAQ section".',
    })
    return
  }
  const changes = tracker(isEdit ? spec : { root: '', elements: {} }, send)
  const finish = (model: string) =>
    send({ kind: 'done', ...changes.result(), model, ms: elapsed() })

  // 2. Simple edits: code does them from Jev's answers, no LLM needed
  if (isEdit && (await tryWithoutLlm(message, spec, decision, changes, send))) {
    return finish('jev')
  }

  // 3. The LLM writes the rest, using only the components Jev picked
  send({
    kind: 'step',
    text: isEdit
      ? 'Writing the change…'
      : decision.scope === 'focused'
        ? 'Designing it…'
        : `Designing ${/^[aeiou]/.test(decision.pageType) ? 'an' : 'a'} ` +
          `${decision.pageType} page…`,
  })
  const system = catalogOf(decision.components).prompt({
    mode: 'inline', // a few words first (shown to the user), then patches
    customRules: designRules,
  })
  const user = buildUserPrompt({
    prompt: isEdit
      ? withTarget(message, spec, decision, selectedId)
      : withOutline(message, decision.pageType, decision.scope),
    currentSpec: isEdit ? spec : null,
  })

  const lines = streamLines(system, user, signal)
  let next = await lines.next()
  while (!next.done) {
    const line = next.value
    // A patch? Retry once with the usual model mistakes fixed.
    const patch =
      parseSpecStreamLine(line) ?? parseSpecStreamLine(fixLine(line))
    if (patch) changes.apply(patch)
    else if (line.trim().startsWith('{')) {
      changes.skip() // broken patch
      console.warn(
        'broken patch line:',
        line.slice(0, 120),
        '…',
        line.slice(-160),
      )
    } else if (isNarration(line)) send({ kind: 'narration', text: line.trim() })
    next = await lines.next()
  }
  finish(next.value.model)
}

// Returns true if the edit was done without the LLM
async function tryWithoutLlm(
  message: string,
  spec: Spec,
  decision: Decision,
  changes: ReturnType<typeof tracker>,
  send: Send,
): Promise<boolean> {
  const edit = decision.edit && {
    ...decision.edit,
    // "The page as a whole" is the root element (its background, align)
    target: decision.edit.target === 'page' ? spec.root : decision.edit.target,
  }
  const element = edit && get(spec.elements, edit.target)
  const sure =
    edit &&
    element &&
    edit.kindConfidence >= KIND_SURE &&
    edit.targetConfidence >= TARGET_SURE
  if (!sure) return false

  // Deleting elements is for whole ones. Removing an item inside a
  // block ("the pro plan") means rewriting its list: the LLM does that.
  if (edit.kind === 'remove' && edit.part === 'whole') {
    const patches = removePatches(spec, edit.target)
    if (!patches) return false
    send({
      kind: 'step',
      text: `Removing ${label(edit.target)} (no AI needed)`,
    })
    patches.forEach(changes.apply)
    return true
  }

  if (edit.kind === 'style') {
    const options = optionProps(element.type)
    if (isEmpty(options)) return false
    send({
      kind: 'step',
      text:
        `Choosing new ${keys(options).join(', ')} ` +
        `for ${label(edit.target)}…`,
    })
    const picked = await decideProps(message, element, options)
    // Nothing to change, or nothing here fits: the LLM writes it
    if (!picked || isEmpty(picked)) return false
    propPatches(edit.target, picked).forEach(changes.apply)
    return true
  }
  return false
}

// Applies patches to a working copy, streams the good ones, and counts
function tracker(start: Spec, send: Send) {
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

// Words the LLM writes around its patches, worth showing to the user
function isNarration(line: string): boolean {
  const text = line.trim()
  return text.length > 0 && !text.startsWith('```')
}

// "pricing-section" → "Pricing Section"
const label = (id: string) => startCase(id)

// "/elements/card/props/title" → "card". null for "/root", "/state/…"
function elementIdOf(patch: JsonPatch): string | null {
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

// Tell the LLM which element the request is about: the clicked one,
// or Jev's pick if it is fairly sure
function withTarget(
  message: string,
  spec: Spec,
  decision: Decision,
  selectedId: string | null,
) {
  const edit = decision.edit
  const id =
    selectedId ?? (edit && edit.targetConfidence >= TARGET_SURE && edit.target)
  const element = id ? get(spec.elements, id) : undefined
  if (!id || !element) return message
  const who = selectedId ? 'The user selected' : 'This most likely changes'
  return (
    `${message}\n\n(${who} element "${id}", a ${element.type}. ` +
    `Words like "this" or "it" refer to that element. ` +
    `Change only what the request asks for.)`
  )
}
