// Jev: fast typed decisions. It never writes UI, it only chooses.
// Everything that is a choice between known options goes through here;
// the LLM is only used for what has to be written.
import type { Spec, UIElement } from '@json-render/core'
import {
  choice,
  noul,
  TypeSafeClient,
  type JsonValue,
  type NoulQuestion,
} from '@typesafe-ai/sdk'
import { get, isEmpty, keys, mapValues, pick, toPairs, uniq } from 'lodash-es'
import type { EditKind, Intent } from '../src/api'
import {
  alwaysIncluded,
  componentDefinitions,
  componentNames,
  type ComponentName,
} from '../src/catalog'
import { outline, targetOptions } from './describe'
import { optionProps } from './edit'

const client = new TypeSafeClient() // reads TYPESAFE_API_KEY from .env

// A component is offered to the LLM when Jev says it's at least this
// likely to be needed. Low on purpose: a missing component hurts more
// than an extra one. ponytail: tune on real prompts.
const NEEDED_THRESHOLD = 0.35

export const editKinds = {
  text: 'Change wording: a title, label, description, prices, list items',
  style:
    'Change a visual option of one element: color, variant, size, ' +
    'alignment, background, width',
  add: 'Add something new: a section, field, button, item',
  remove: 'Remove or delete something that is there',
  restructure: 'Rearrange, redesign, or change several things at once',
}

export type Scope = 'focused' | 'full'

// What kind of page a request is about (shown in the chat)
export const pageTypes = {
  landing: 'A marketing or product page that presents something',
  auth: 'Sign in, sign up, or password reset',
  dashboard: 'An app screen with data: metrics, charts, tables, admin',
  form: 'A form to fill in: contact, checkout, settings, survey',
  content: 'A page of content: blog post, docs, profile, about',
  other: 'Anything else, or a single small component',
}
export type PageType = keyof typeof pageTypes

// What an edit is about. Plans, features, FAQ questions… are items in
// one block's props, not elements: removing "the pro plan" must not
// delete the whole PricingTable.
export const editParts = {
  whole: 'The whole element or section',
  item:
    'Only some items or part inside it: one plan, a feature, a ' +
    'question, a link, a list entry, a word',
  unclear:
    'It does not say which thing it means (e.g. "remove it" with no ' +
    'element selected)',
}
export type EditPart = keyof typeof editParts

// Jev is sure which element an edit is about at this confidence or more
export const TARGET_SURE = 0.5

// The target plus the other elements Jev says the request changes.
// Its yes/no scores rank well but their scale varies per request, so
// the cutoff is relative: at least half the top score (and 0.25).
// The page itself is left out: a page-wide change isn't scoped.
function touched(
  target: string,
  ids: string[],
  chance: (index: number) => number | undefined,
  root: string,
): string[] {
  const scores = ids.map((id, index) => [id, chance(index) ?? 0] as const)
  const top = Math.max(0, ...scores.map(([, score]) => score))
  const likely = scores
    .filter(([id, score]) => id !== root && score >= Math.max(0.25, top / 2))
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
  return uniq([target, ...likely])
    .filter((id) => id !== 'page')
    .slice(0, 6) // a vague request mustn't open up the whole page
}

// "unclear" only when nothing tells us the element. With a clicked
// element, "it" is that element; with a confident target ("remove the
// gift options feature"), it's something inside it.
function clearPart(
  part: EditPart,
  selectedId: string | null,
  target: string,
  confidence: number,
): EditPart {
  if (part !== 'unclear') return part
  if (selectedId) return 'whole'
  return target !== 'page' && confidence >= TARGET_SURE ? 'item' : part
}

export type Decision = {
  intent: Intent
  pageType: PageType
  scope: Scope
  components: ComponentName[]
  // Only when a UI already exists (otherwise null)
  edit: {
    kind: EditKind
    kindConfidence: number
    target: string // element id, or "page"
    targetConfidence: number
    part: EditPart
    // The target and close runner-ups ("the pricing and feature cards")
    scope: string[]
  } | null
  // Option values Jev already picked in the same call, for the likely
  // targets (the selected element and the page): id → changed props,
  // or null when no listed value fits ("other")
  options: Record<string, Record<string, string> | null>
}

export async function decide(
  message: string,
  spec: Spec,
  selectedId: string | null,
  history: string[] = [],
): Promise<Decision> {
  const isEmpty = keys(spec.elements).length === 0

  // One yes/no question per component, all answered in the same call
  const componentQuestions = Object.fromEntries(
    componentNames.map((name) => [
      name,
      noul({
        question: 'Would building what `request` asks for need this?',
        component: `${name}: ${componentDefinitions[name].description}`,
      }),
    ]),
  ) as Record<ComponentName, NoulQuestion> // fromEntries loses the key names

  // One yes/no per element: does the request change it? A single choice
  // can only name one target; this finds all of them ("the pricing and
  // feature cards"). Same call, so it costs almost nothing.
  // Always has "page", so the question is valid on an empty canvas too
  const targets = targetOptions(spec, message)
  const elementIds = keys(targets).filter((id) => id !== 'page')
  const touchQuestions = Object.fromEntries(
    elementIds.map((id, index) => [
      `touches_${index}`,
      noul({
        question:
          'Does `request` directly change this element itself: its own ' +
          'text, options, items or children?',
        element: `${id}: ${targets[id]}`,
      }),
    ]),
  )

  // Always asked, even before the intent is known: they cost almost
  // nothing extra in the same call, and save a second round trip for
  // edits. Ignored when there is no UI yet.
  const editQuestions = {
    editKind: choice(
      'If `request` changes `current_ui`, what kind of change is it?',
      editKinds,
    ),
    target: choice(
      'Which element of `current_ui` does `request` mostly change? ' +
        'If `selected_element` is set, words like "this" mean it.',
      targets,
    ),
    part: choice(
      'Is `request` about that whole element, or part of it?',
      editParts,
    ),
  }

  // Style edits need option values too. Ask them now for the likely
  // targets, so a style edit needs one Jev call instead of two.
  const candidates = uniq([selectedId, spec.root]).filter(
    (id): id is string =>
      !!id &&
      !!spec.elements[id] &&
      keys(optionProps(spec.elements[id].type)).length > 0,
  )
  const optionQs = Object.fromEntries(
    candidates.flatMap((id, index) =>
      toPairs(optionQuestions(id, spec.elements[id])).map(
        ([prop, question]) => [`option_${index}_${prop}`, question],
      ),
    ),
  )

  const { answers } = await client.systemOne({
    state: {
      request: message,
      option_help: optionHelp(candidates.map((id) => spec.elements[id])),
      current_ui: isEmpty ? 'nothing yet' : outline(spec),
      selected_element: selectedId ?? 'none',
      // What "the bridge" or "it" means often comes from earlier
      earlier_requests: history.length ? history.join('\n') : 'none',
    },
    questions: {
      intent: choice(
        'What is the user asking for in `request`? `earlier_requests` ' +
          'tell you what it builds on.',
        {
          create: 'A different, new UI or page that replaces what is there now',
          edit:
            'Change, add to, or remove parts of `current_ui`, including ' +
            'building something new for it ("add a timeline to it")',
          unrelated: 'Not a request to build or change a UI (e.g. a greeting)',
        },
      ),
      pageType: choice('What kind of page does `request` describe?', pageTypes),
      scope: choice('How much does `request` ask to build?', {
        focused:
          'One specific thing, shown on its own: a pricing page, a login ' +
          'form, a contact form, a chart, a profile card, a settings panel',
        full:
          'A whole site or screen with many parts: a landing page, a ' +
          'homepage, a website, a full dashboard or app',
      }),
      ...componentQuestions,
      ...editQuestions,
      ...touchQuestions,
      ...optionQs,
    },
  })
  const answered = answers as unknown as Record<
    string,
    { choice?: unknown; noul?: number }
  >
  const options = Object.fromEntries(
    candidates.map((id, index) => [
      id,
      changedProps(
        spec.elements[id],
        mapValues(
          optionQuestions(id, spec.elements[id]),
          (_, key) => answered[`option_${index}_${key}`]?.choice,
        ),
      ),
    ]),
  )

  // Nothing to edit yet, so an "edit" is really a "create"
  const intent: Intent =
    answers.intent.choice === 'edit' && isEmpty
      ? 'create'
      : answers.intent.choice

  const picked = componentNames.filter(
    (name) => answers[name].noul >= NEEDED_THRESHOLD,
  )

  // Always keep: layout basics + whatever the current UI already uses
  const inUse = Object.values(spec.elements).map(
    (element) => element.type as ComponentName,
  )
  const pageType = answers.pageType.choice
  const scope = answers.scope.choice
  const components = [...new Set([...alwaysIncluded, ...inUse, ...picked])]

  const edit = isEmpty
    ? null
    : {
        kind: answers.editKind.choice,
        kindConfidence: answers.editKind.confidence,
        // A clicked element beats Jev's guess
        target: selectedId ?? String(answers.target.choice),
        targetConfidence: selectedId ? 1 : answers.target.confidence,
        scope: selectedId
          ? [selectedId]
          : touched(
              String(answers.target.choice),
              elementIds,
              (index) => answered[`touches_${index}`]?.noul,
              spec.root,
            ),
        part: clearPart(
          answers.part.choice,
          selectedId,
          String(answers.target.choice),
          answers.target.confidence,
        ),
      }

  return { intent, pageType, scope, components, edit, options }
}

// For "style" edits: Jev picks the new value of each option the element
// has (e.g. variant: primary/secondary/danger), or "unchanged".
// Returns only the props that change, or null when the request asks for
// something none of the values can do ("glass background"): then the
// LLM has to write it, instead of Jev forcing the nearest wrong value.
export async function decideProps(
  message: string,
  id: string,
  element: UIElement,
): Promise<Record<string, string> | null> {
  const questions = optionQuestions(id, element)
  if (isEmpty(questions)) return {}
  const { answers } = await client.systemOne({
    state: {
      request: message,
      element: {
        id,
        type: element.type,
        // Its options, plus its text so Jev knows which one it is
        // ("the testimonials section" is titled "What customers say")
        props: pick(element.props, [
          ...keys(questions),
          'title',
          'label',
          'text',
          'name',
        ]) as JsonValue,
      },
      option_help: optionHelp([element]),
    },
    questions,
  })
  return changedProps(
    element,
    mapValues(answers, (answer) => answer.choice),
  )
}

// One question per option prop of the element, plus "options_fit":
// can these options do the whole request? If not ("make it cyberpunk"),
// the LLM handles it instead of Jev forcing the nearest values. Asked
// once for the element, not per prop: a prop the request isn't about
// would otherwise answer "none fit" and block a good edit.
const FIT = 'options_fit'
function optionQuestions(id: string, element: UIElement) {
  return {
    ...mapValues(optionProps(element.type), (values, prop) =>
      choice(
        `After applying \`request\`, what is "${prop}" of element ` +
          `"${id}" (a ${element.type})? \`option_help\` explains the values.`,
        {
          unchanged: 'Leave it as it is now',
          ...Object.fromEntries(values.map((value) => [value, null])),
        },
      ),
    ),
    [FIT]: choice(
      `Can \`request\` be done fully by only changing these options of ` +
        `element "${id}" (${keys(optionProps(element.type)).join(', ')}) ` +
        `to values listed in \`option_help\`?`,
      {
        yes: 'Yes, picking listed values does exactly what it asks',
        no:
          'No, it also needs something else: a look or effect not listed, ' +
          'custom colors, new content, or other elements',
      },
    ),
  }
}

// What option values mean ("meteors" = shooting stars) lives in the
// component descriptions; Jev needs them to match the user's words.
// Adds every option's values: "… Options: variant = primary | outline"
function optionHelp(elements: UIElement[]): Record<string, string> {
  return Object.fromEntries(
    elements.map((element) => {
      const values = toPairs(optionProps(element.type))
        .map(([prop, list]) => `${prop} = ${list.join(' | ')}`)
        .join('; ')
      const about = get(componentDefinitions, [element.type, 'description'])
      return [element.type, `${about ?? ''} Options: ${values}.`]
    }),
  )
}

// Jev's picks → only the props that change; null if the options can't
// do the request
function changedProps(
  element: UIElement,
  picks: Record<string, unknown>,
): Record<string, string> | null {
  if (picks[FIT] === 'no') return null
  return Object.fromEntries(
    toPairs(picks)
      .map(([prop, value]) => [prop, String(value)])
      // "unchanged", or the value it already has, is not a change
      .filter(
        ([prop, value]) =>
          prop !== FIT &&
          value !== 'unchanged' &&
          value !== String(get(element.props, prop)) &&
          // "none" where nothing is set yet is no change either
          !(value === 'none' && get(element.props, prop) == null),
      ),
  )
}

// A new page's look (background, texture, surface) for a request.
// Picks by sampling from Jev's probabilities among the likely values,
// so the same request doesn't always get the same look, yet a banking
// app never gets a playful one.
export async function decidePage(
  message: string,
): Promise<Record<string, string>> {
  const options = pick(optionProps('Page'), [
    'background',
    'texture',
    'surface',
  ])
  const { answers } = await client.systemOne({
    state: {
      request: message,
      option_help: optionHelp([{ type: 'Page', props: {}, children: [] }]),
    },
    questions: mapValues(options, (values, prop) =>
      choice(
        `Which "${prop}" suits a page for \`request\`? \`option_help\` ` +
          'explains the values.',
        Object.fromEntries(values.map((value) => [value, null])),
      ),
    ),
  })
  return mapValues(answers, (answer) => sample(answer.probabilities))
}

// A value drawn at random, weighted by probability, among those at
// least a third as likely as the best one
function sample(probabilities: Record<string, number>): string {
  const top = Math.max(...Object.values(probabilities))
  const likely = toPairs(probabilities).filter(([, p]) => p >= top / 3)
  const total = likely.reduce((sum, [, p]) => sum + p, 0)
  let roll = Math.random() * total
  for (const [value, p] of likely) if ((roll -= p) <= 0) return value
  return likely[0][0]
}

// Which layout each block of a new section uses (Hero "split",
// PricingTable "comparison"…). Sampled, so pages don't all get each
// block's default; weighted by fit, so the choice suits the section.
export async function decideLayouts(
  job: string,
  direction: string,
  types: string[],
): Promise<Record<string, string>> {
  const withLayouts = types.filter((type) => optionProps(type).layout)
  if (!withLayouts.length) return {}
  const { answers } = await client.systemOne({
    state: {
      section: job,
      design_direction: direction || 'none given',
      option_help: optionHelp(
        withLayouts.map((type) => ({ type, props: {}, children: [] })),
      ),
    },
    questions: Object.fromEntries(
      withLayouts.map((type) => [
        type,
        choice(
          `Which "layout" of ${type} suits \`section\` best? ` +
            '`option_help` explains the layouts.',
          Object.fromEntries(
            optionProps(type).layout.map((value) => [value, null]),
          ),
        ),
      ]),
    ),
  })
  return mapValues(answers, (answer) => sample(answer.probabilities))
}
