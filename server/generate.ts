// Turns one chat message into UI changes, streaming progress as it goes.
// Jev decides; code applies what it can; the LLM writes the rest.
import { buildUserPrompt, type Spec } from '@json-render/core'
import { get, has, isEmpty, pick, startCase, uniq } from 'lodash-es'
import type { ChatEvent, ChatRequest } from '../src/api'
import { catalogOf } from '../src/catalog'
import { designRules, pageRules } from './design-rules'
import { outline } from './describe'
import { optionProps, propPatches, removePatches, scopeOf } from './edit'
import { decide, decideProps, TARGET_SURE, type Decision } from './jev'
import { streamLines } from './llm'
import { buildPage } from './sections'
import { applyStream, inScope, tracker } from './tracker'

// How sure Jev must be before code edits without asking the LLM.
// ponytail: tune on real prompts.
const KIND_SURE = 0.6

type Send = (event: ChatEvent) => void

export async function generate(
  request: Required<ChatRequest>,
  send: Send,
  signal: AbortSignal,
) {
  const { message, spec, selectedId, selectedProp, mode, history } = request
  const started = performance.now()
  const elapsed = () => Math.round(performance.now() - started)

  // 1. Jev decides what this message is and what it touches
  send({ kind: 'step', text: 'Reading your request…' })
  const decision = await decide(
    message,
    spec,
    selectedId,
    history,
    selectedProp,
  )
  // The user's explicit choice beats Jev's guess. Editing needs
  // something to edit, so "edit" on an empty canvas means "create".
  if (mode === 'create' || (mode === 'edit' && !spec.root)) {
    decision.intent = 'create'
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

  // A new page: planned, then built section by section
  if (decision.intent === 'create') {
    return buildPage(
      message,
      history,
      decision.scope,
      decision.components,
      send,
      signal,
      elapsed,
    )
  }

  // Which elements the LLM may change (null: the whole page)
  const scope = editScope(spec, decision, selectedId)
  // "Remove it" with nothing selected: ask, instead of guessing and
  // deleting the wrong thing. Only for removals: a vague add or style
  // change can't destroy anything, so the LLM just tries.
  const vagueRemove =
    decision.edit?.kind === 'remove' && decision.edit.part === 'unclear'
  if (vagueRemove) {
    send({
      kind: 'reply',
      text:
        'Which part? Switch to Edit, click it in the preview, then send ' +
        'your message again. Or name it, e.g. "remove the FAQ section".',
    })
    return
  }
  const changes = tracker(
    spec,
    send,
    scope ? (patch) => inScope(spec, scope, patch) : undefined,
  )
  const finish = (model: string) =>
    send({ kind: 'done', ...changes.result(), model, ms: elapsed() })

  // 2. Simple edits: code does them from Jev's answers, no LLM needed
  if (
    await tryWithoutLlm(message, spec, decision, selectedProp, changes, send)
  ) {
    return finish('jev')
  }

  // 3. The LLM writes the rest, using only the components Jev picked
  send({ kind: 'step', text: 'Writing the change…' })
  const system = catalogOf(decision.components).prompt({
    mode: 'inline', // a few words first (shown to the user), then patches
    customRules: [...pageRules, ...designRules],
  })
  const user = buildUserPrompt({
    prompt: withHistory(
      history,
      scope
        ? withScope(message, spec, scope, selectedId, selectedProp)
        : withTarget(message, spec, decision, selectedId, selectedProp),
    ),
    // A scoped edit shows the LLM only what it may change
    currentSpec: scope
      ? { ...spec, elements: pick(spec.elements, [...scope]) }
      : spec,
  })

  const model = await applyStream(
    streamLines('edit', system, user, signal),
    changes.apply,
    changes.skip,
    (text) => send({ kind: 'narration', text }),
  )
  // New sections the LLM forgot to link into the page would never show
  if (decision.edit?.kind === 'add') {
    changes.adoptOrphans(selectedId ?? decision.edit.target)
  }
  finish(model)
}

// Returns true if the edit was done without the LLM
async function tryWithoutLlm(
  message: string,
  spec: Spec,
  decision: Decision,
  selectedProp: string | null,
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

  // A clicked list item ("plans.1") is removed from its list directly
  const [list, index] = selectedProp?.split('.') ?? []
  const items = get(spec.elements, [edit.target, 'props', list])
  if (
    edit.kind === 'remove' &&
    index !== undefined &&
    Array.isArray(items) &&
    Number(index) < items.length
  ) {
    send({ kind: 'step', text: `Removing it from ${label(edit.target)}` })
    changes.apply({
      op: 'remove',
      path: `/elements/${edit.target}/props/${list}/${index}`,
    })
    return true
  }

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
    // Every element in scope ("the pricing and feature cards"), each
    // with option values Jev picks; the likely ones were answered in
    // the first call, the rest are asked now, in parallel
    const targets = uniq([edit.target, ...edit.scope]).filter(
      (id) =>
        spec.elements[id] && !isEmpty(optionProps(spec.elements[id].type)),
    )
    if (!targets.length) return false
    send({
      kind: 'step',
      text: `Choosing new options for ${targets.map(label).join(', ')}…`,
    })
    const picks = await Promise.all(
      targets.map((id) =>
        has(decision.options, id)
          ? decision.options[id]
          : decideProps(message, id, spec.elements[id]),
      ),
    )
    // The main target's options can't do it: the LLM writes it. Other
    // elements whose options don't fit (a button, for "make the cards
    // glow") are simply left alone.
    if (!picks[0]) return false
    const patches = targets.flatMap((id, index) =>
      propPatches(id, picks[index] ?? {}),
    )
    if (!patches.length) return false // nothing to change: ask the LLM
    patches.forEach(changes.apply)
    return true
  }

  return false
}

// "pricing-section" → "Pricing Section"
const label = (id: string) => startCase(id)

// Earlier messages explain words like "the bridge" in this one
export function withHistory(history: string[], prompt: string): string {
  if (!history.length) return prompt
  const earlier = history.map((text) => `- ${text}`).join('\n')
  return (
    `Earlier in this conversation the user asked (for context only; ` +
    `do what the latest request says):\n${earlier}\n\n` +
    `Latest request: ${prompt}`
  )
}

// Scoped edits: the LLM may change only elements in scope. Text is
// narrow on purpose; a redesign or an unsure target gets the whole page.
function editScope(
  spec: Spec,
  decision: Decision,
  selectedId: string | null,
): Set<string> | null {
  const edit = decision.edit
  if (!edit || edit.kind === 'restructure') return null
  if (!selectedId && edit.targetConfidence < TARGET_SURE) return null
  const ids = edit.scope.filter((id) => spec.elements[id])
  if (!ids.length || ids.includes(spec.root)) return null
  return scopeOf(spec, ids, edit.kind === 'add')
}

function withScope(
  message: string,
  spec: Spec,
  scope: Set<string>,
  selectedId: string | null,
  selectedProp: string | null,
) {
  const selected = selectedId
    ? ` The user selected ${partOf(selectedId, selectedProp)}; "this" or ` +
      '"it" means it.'
    : ''
  return (
    `${message}

(Only these elements may change: ` +
    `${[...scope].join(', ')}. The current UI below shows just those.` +
    `${selected} New elements are fine when linked from them. The ` +
    `whole page, for context:
${outline(spec)})`
  )
}

// Tell the LLM which element the request is about: the clicked one,
// or Jev's pick if it is fairly sure
// 'the "title" of "hero"', 'item 2 of "plans" of "pricing"', '"hero"'
function partOf(id: string, prop: string | null): string {
  if (!prop) return `"${id}"`
  const [list, index] = prop.split('.')
  return index === undefined
    ? `the "${list}" of "${id}"`
    : `item ${Number(index) + 1} of "${list}" of "${id}"`
}

function withTarget(
  message: string,
  spec: Spec,
  decision: Decision,
  selectedId: string | null,
  selectedProp: string | null,
) {
  const edit = decision.edit
  const id =
    selectedId ?? (edit && edit.targetConfidence >= TARGET_SURE && edit.target)
  const element = id ? get(spec.elements, id) : undefined
  if (!id || !element) return message
  const who = selectedId
    ? `The user selected ${partOf(id, selectedProp)}, in`
    : 'This most likely changes'
  return (
    `${message}\n\n(${who} element "${id}", a ${element.type}. ` +
    `Words like "this" or "it" refer to that element. ` +
    `Change only what the request asks for.)`
  )
}
