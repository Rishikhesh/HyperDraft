// A new page, built in two steps: the LLM plans it (direction and
// sections, in its own words), then each section is built by its own
// LLM call, all in parallel, into one shared page.
import { startCase, uniq } from 'lodash-es'
import type { ChatEvent } from '../src/api'
import { catalogOf, type ComponentName } from '../src/catalog'
import { designRules, sectionRules } from './design-rules'
import { streamLines } from './llm'
import { planPage, type Plan, type Section } from './plan'
import type { Scope } from './jev'
import { propPatches } from './edit'
import { decideLayouts, decidePage } from './jev'
import { applyStream, elementIdOf, tracker } from './tracker'

type Send = (event: ChatEvent) => void

// Sections built at the same time. Free tiers limit requests per
// minute, so not all at once. ponytail: raise on paid keys.
const PARALLEL = 4

// Every section may use these, besides what the plan suggests
const BASICS: ComponentName[] = [
  'Section',
  'Stack',
  'Grid',
  'Card',
  'Heading',
  'Text',
  'Button',
  'Badge',
  'Image',
  'Separator',
]

export async function buildPage(
  message: string,
  history: string[],
  scope: Scope,
  components: ComponentName[], // Jev's picks, for a focused request
  send: Send,
  signal: AbortSignal,
  elapsed: () => number,
) {
  const changes = tracker({ root: '', elements: {} }, send)
  const head: Pick<Plan, 'direction' | 'page'> = { direction: '', page: {} }
  const models = new Set<string>()
  const sections: Section[] = []

  // Sections are built as soon as they're known, a few at a time
  const queue = workQueue<Section>(PARALLEL, async (section) => {
    // A section that fails (busy model, nothing usable) gets one retry;
    // after that it's left out and the rest of the page still works
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        models.add(await buildSection(section, head, message, changes, signal))
        if (changes.has(section.id)) {
          send({ kind: 'step', text: `Built ${startCase(section.id)}` })
          return
        }
      } catch (error) {
        if (signal.aborted) throw error
        console.warn(`section ${section.id} failed:`, String(error))
      }
    }
    send({ kind: 'step', text: `Skipped ${startCase(section.id)}` })
  })
  // The page appears with its first section; each one is listed on it
  // right away, so the preview shows it the moment it's built
  const addSection = (section: Section) => {
    if (!sections.length) {
      changes.apply({ op: 'add', path: '/root', value: 'page' })
      changes.apply({
        op: 'add',
        path: '/elements/page',
        value: { type: 'Page', props: head.page, children: [] },
      })
    }
    sections.push(section)
    changes.apply({
      op: 'add',
      path: '/elements/page/children/-',
      value: section.id,
    })
    queue.push(section)
  }

  let planModel = ''
  let pageOptions: Promise<Record<string, string> | null> =
    Promise.resolve(null)
  if (scope === 'focused') {
    // One focused thing (a login form, a pricing table) needs no plan:
    // the request is the section's job; Jev picks the page's look
    head.page = { align: 'center' }
    pageOptions = decidePage(message).catch(() => null)
    addSection({ id: 'main', job: message, uses: components })
  } else {
    // A whole page is planned; sections start while planning goes on
    send({ kind: 'step', text: 'Planning the page…' })
    const plan = await planPage(message, history, scope, signal, {
      onHead: ({ direction, page }) => {
        head.direction = direction
        // Several sections stack from the top; centering is for one
        head.page = { ...page, align: 'top' }
        send({ kind: 'narration', text: direction })
        send({ kind: 'step', text: 'Building sections as they are planned…' })
      },
      onSection: addSection,
    }).finally(() => queue.close()) // no builder waits for more
    planModel = plan.model
  }
  queue.close()
  await queue.done

  if (!sections.some((section) => changes.has(section.id))) {
    throw new Error('No section could be built. Try again.')
  }
  // Page options that arrived after the page was created
  const picked = { ...head.page, ...(await pageOptions) }
  propPatches('page', picked).forEach(changes.apply)
  send({
    kind: 'done',
    ...changes.result(),
    model: [planModel && `${planModel} (plan)`, ...models]
      .filter(Boolean)
      .join(', '),
    ms: elapsed(),
  })
}

// One LLM call writes one section. Its elements all get ids starting
// with the section's id, so parallel sections can't overwrite each
// other or the page: ids the model names differently ("overview-card")
// are renamed ("system-overview-overview-card"), children included.
async function buildSection(
  section: Section,
  head: Pick<Plan, 'direction'>,
  message: string,
  changes: ReturnType<typeof tracker>,
  signal: AbortSignal,
): Promise<string> {
  const components = uniq([...BASICS, ...section.uses]).filter(
    (name) => name !== 'Page',
  ) as ComponentName[]
  // Jev picks the planned blocks' layouts (sampled, for variety)
  const layouts = await decideLayouts(
    section.job,
    head.direction,
    section.uses,
  ).catch(() => ({}))
  const layoutNote = Object.entries(layouts)
    .map(([type, layout]) => `${type} with layout "${layout}"`)
    .join(', ')
  const system = catalogOf(components).prompt({
    mode: 'inline',
    customRules: [...sectionRules, ...designRules],
  })
  const user =
    `The page: ${message}\n` +
    `Design direction for the whole page: ${head.direction || 'your choice'}\n\n` +
    `Build the section "${section.id}": ${section.job}\n` +
    `Suggested components: ${section.uses.join(', ') || 'your choice'}.\n` +
    (layoutNote ? `Use ${layoutNote}.\n` : '') +
    `Its outermost element's id is "${section.id}"; every other ` +
    `element's id starts with "${section.id}-".`
  const own = (id: string) =>
    id === section.id || id.startsWith(`${section.id}-`)
      ? id
      : `${section.id}-${id}`
  const created: string[] = []
  const model = await applyStream(
    streamLines('build', system, user, signal),
    (patch) => {
      const id = elementIdOf(patch)
      if (patch.path.startsWith('/state')) return changes.apply(patch) // form data
      if (!id) return changes.skip() // /root: the page owns it
      const renamed = own(id)
      if (!created.includes(renamed)) created.push(renamed)
      changes.apply({
        ...patch,
        path: patch.path.replace(`/elements/${id}`, `/elements/${renamed}`),
        value: renameChildren(patch.path, patch.value, own),
      })
    },
    changes.skip,
  )
  // The model named its outermost element differently: wrap its
  // top-level elements in one with the section's id
  if (!changes.has(section.id)) {
    const inner = new Set(created.flatMap((id) => changes.childrenOf(id)))
    const tops = created.filter((id) => changes.has(id) && !inner.has(id))
    if (tops.length) {
      changes.apply({
        op: 'add',
        path: `/elements/${section.id}`,
        value: {
          type: 'Stack',
          props: { direction: 'vertical' },
          children: tops,
        },
      })
    }
  }
  return model
}

// Children lists refer to elements by id, so rename those too: in a
// whole element, a children list, or one added child
function renameChildren(
  path: string,
  value: unknown,
  own: (id: string) => string,
): unknown {
  if (/\/children\/(\d+|-)$/.test(path) && typeof value === 'string') {
    return own(value)
  }
  if (path.endsWith('/children') && Array.isArray(value)) {
    return value.map((child) => own(String(child)))
  }
  const element = value as { children?: unknown } | null
  if (element && Array.isArray(element.children)) {
    return {
      ...element,
      children: element.children.map((child) => own(String(child))),
    }
  }
  return value
}

// Runs `work` on items as they're pushed, at most `limit` at a time.
// `done` settles after close() once everything pushed is finished.
function workQueue<T>(limit: number, work: (item: T) => Promise<void>) {
  const items: T[] = []
  const waiting: (() => void)[] = []
  let closed = false
  const wake = () => waiting.splice(0).forEach((resume) => resume())
  const worker = async () => {
    for (;;) {
      if (items.length) await work(items.shift()!)
      else if (closed) return
      else await new Promise<void>((resume) => waiting.push(resume))
    }
  }
  const done = Promise.all(Array.from({ length: limit }, worker))
  return {
    push(item: T) {
      items.push(item)
      wake()
    },
    close() {
      closed = true
      wake()
    },
    done,
  }
}
