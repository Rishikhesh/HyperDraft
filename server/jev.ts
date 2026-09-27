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
import { find, get, isString, keys, pick, take, toPairs } from 'lodash-es'
import type { EditKind, Intent } from '../src/api'
import {
  alwaysIncluded,
  componentDefinitions,
  componentNames,
  type ComponentName,
} from '../src/catalog'
import { optionProps } from './edit'
import { kits, pageTypes, type PageType } from './outlines'

const client = new TypeSafeClient() // reads TYPESAFE_API_KEY from .env

// A component is offered to the LLM when Jev says it's at least this
// likely to be needed. Low on purpose: a missing component hurts more
// than an extra one. ponytail: tune on real prompts.
const NEEDED_THRESHOLD = 0.35

// Jev allows up to 255 options per choice; leave room for "page"
const MAX_TARGETS = 250

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
  } | null
}

export async function decide(
  message: string,
  spec: Spec,
  selectedId: string | null,
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
      targetOptions(spec),
    ),
  }

  const { answers } = await client.systemOne({
    state: {
      request: message,
      current_ui: isEmpty ? 'nothing yet' : summarize(spec),
      selected_element: selectedId ?? 'none',
    },
    questions: {
      intent: choice('What is the user asking for in `request`?', {
        create: 'Build a new UI or page, replacing what is there now',
        edit: 'Change, add to, or remove parts of `current_ui`',
        unrelated: 'Not a request to build or change a UI (e.g. a greeting)',
      }),
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
    },
  })

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
  // New pages also get the components their suggested outline uses
  // A focused request ("a pricing page") gets no page kit: offering
  // Navbar, Hero, Footer… invites the LLM to build a whole website
  const pageType = answers.pageType.choice
  const scope = answers.scope.choice
  const kit = intent === 'create' && scope === 'full' ? kits[pageType] : []
  const components = [
    ...new Set([...alwaysIncluded, ...kit, ...inUse, ...picked]),
  ]

  const edit = isEmpty
    ? null
    : {
        kind: answers.editKind.choice,
        kindConfidence: answers.editKind.confidence,
        // A clicked element beats Jev's guess
        target: selectedId ?? String(answers.target.choice),
        targetConfidence: selectedId ? 1 : answers.target.confidence,
      }

  return { intent, pageType, scope, components, edit }
}

// For "style" edits: Jev picks the new value of each option the element
// has (e.g. variant: primary/secondary/danger), or "unchanged".
// Returns only the props that change, or null when the request asks for
// something none of the values can do ("glass background"): then the
// LLM has to write it, instead of Jev forcing the nearest wrong value.
export async function decideProps(
  message: string,
  element: UIElement,
  options: Record<string, string[]>, // prop name → allowed values
): Promise<Record<string, string> | null> {
  const questions = Object.fromEntries(
    toPairs(options).map(([prop, values]) => [
      prop,
      choice(`After applying \`request\`, what is the element's "${prop}"?`, {
        unchanged: 'Leave it as it is now',
        other:
          'The request wants a change to this that none of the other ' +
          'values describe',
        ...Object.fromEntries(values.map((value) => [value, null])),
      }),
    ]),
  )
  if (!keys(questions).length) return {}

  const { answers } = await client.systemOne({
    state: {
      request: message,
      element: {
        type: element.type,
        // Only the options being decided; props are JSON from the spec
        props: pick(element.props, keys(options)) as JsonValue,
      },
    },
    questions,
  })
  const picked = toPairs(answers).map(([prop, answer]) => [
    prop,
    String(answer.choice),
  ])
  if (picked.some(([, value]) => value === 'other')) return null
  return Object.fromEntries(
    picked
      // "unchanged", or the value it already has, is not a change
      .filter(
        ([prop, value]) =>
          value !== 'unchanged' && value !== get(element.props, prop),
      ),
  )
}

// A short text version of the UI for Jev, one element per line:
// "pricing: PricingTable "Simple pricing" (in pricing-section)"
function summarize(spec: Spec): string {
  return take(toPairs(spec.elements), MAX_TARGETS)
    .map(([id, element]) => `${id}: ${describe(element)}`)
    .join('\n')
}

// Target options: every element id with a readable description
function targetOptions(spec: Spec): Record<string, string> {
  return {
    page: 'The page as a whole, or nothing specific',
    ...Object.fromEntries(
      take(toPairs(spec.elements), MAX_TARGETS).map(([id, element]) => [
        id,
        describe(element),
      ]),
    ),
  }
}

// How Jev sees an element: its type, its most telling text, and its
// current option values, e.g. 'Split imageSide=left "Welcome back"'.
// The options let Jev find the element a change like "move the image
// to the right" is about.
function describe(element: UIElement): string {
  const text = find(
    ['title', 'label', 'text', 'brand', 'name', 'caption', 'placeholder'].map(
      (key) => get(element.props, key),
    ),
    isString,
  )
  const options = keys(optionProps(element.type))
    .map((prop) => [prop, get(element.props, prop)])
    .filter(([, value]) => isString(value))
    .map(([prop, value]) => `${prop}=${value}`)
  return [element.type, ...options, text && `"${text.slice(0, 60)}"`]
    .filter(Boolean)
    .join(' ')
}
