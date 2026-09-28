// Planning a new page: the LLM decides what the page is, how it
// should feel, and which sections it has, in its own words. No fixed
// recipe; it gets a menu of what exists, not a template to fill in.
import { isArray, isPlainObject, isString, kebabCase, uniq } from 'lodash-es'
import { componentDefinitions, componentNames } from '../src/catalog'
import type { Scope } from './jev'
import { streamLines } from './llm'
import { optionProps } from './edit'
import { products } from './products'

export type Section = {
  id: string // becomes the section's element id
  job: string // what it shows and says, for the builder
  uses: string[] // components the planner has in mind
}

export type Plan = {
  direction: string // mood, color, type, motion: shared by all sections
  page: Record<string, string> // Page options: background, surface…
  sections: Section[]
}

// "Hero: Large headline area…" → one short line per component
const menu = componentNames
  .map((name) => {
    const about = String(componentDefinitions[name].description)
    return `- ${name}: ${about.split(/(?<=\.)\s/)[0]}`
  })
  .join('\n')

// Jev sets the dials and the page's look; the planner is told the dials
const pageOptions = Object.entries(optionProps('Page'))
  .filter(
    ([prop]) =>
      ![
        'variance',
        'motion',
        'density',
        'background',
        'texture',
        'surface',
      ].includes(prop),
  )
  .map(([prop, values]) => `${prop}: ${values.join(' | ')}`)
  .join('; ')

const system = `You are a senior product designer planning one web page.
Reply with ONLY a JSON object, no markdown:
{
  "direction": "2-4 sentences: the mood, color feel, typography, and which motion or effects to use (or none)",
  "page": { Page options, chosen from: ${pageOptions} },
  "sections": [
    { "id": "kebab-case-id", "job": "what this section shows and says, concretely: headline ideas, items, numbers", "uses": ["Component", ...] }
  ]
}

Think about what THIS product or request needs, then design for it:
- Build with the designed blocks (Hero, FeatureGrid, Stats, Testimonials, PricingTable, Steps, CallToAction, Carousel, Marquee, Chart, AppShell, the showcase blocks…): they look finished. Vary a page through their layouts, content and effects, and through which sections it has and their order. Basic pieces (Stack, Text, List, Input) are for what no block covers, not a replacement for blocks.
- A landing page or site opens with a strong first screen: a Hero (centered, split or background) or a Split, with a clear headline and a call to action. Include only the sections that serve this product, in a fitting order.
- The direction should feel specific to this subject, not generic "clean and modern". Before choosing, weigh a few genuinely different directions (light or dark, calm or loud, dense or airy, playful or serious) and pick what fits this subject best, not your usual default.
- The page's background and texture are chosen by the app; describe the mood you want in the direction and plan sections that fit it.
- Avoid what makes pages look AI-made: placeholder names (Acme, Nexus), filler verbs (Elevate, Seamless, Unleash), perfect numbers (99.99%), generic people (John Doe), and version or numbered eyebrows.
- An app screen with a sidebar (dashboard, admin, settings): make AppShell the first section; the sections after it become its main area, so plan them as the screen's content.
- A focused request (a login form, a pricing table, a chart) is one or two sections: build that one thing fully, nothing around it.
- A whole site or landing page: 3 to 8 sections, in the order a visitor should meet them.
- "uses" lists components from this menu (exact names):
${menu}`

type PlanEvents = {
  // The direction and page options, as soon as the sections begin
  onHead: (head: Pick<Plan, 'direction' | 'page'>) => void
  // Each section, the moment it's complete in the stream
  onSection: (section: Section) => void
}

// Asks the plan model. The plan streams in, so sections can be built
// while the rest is still being planned. Returns the whole plan.
export async function planPage(
  message: string,
  history: string[],
  scope: Scope,
  signal: AbortSignal,
  events: PlanEvents,
  product: string | null, // the kind of product, when Jev knows it
  dials: Record<string, string>,
): Promise<Plan & { model: string }> {
  const earlier = history.length
    ? `Earlier in this conversation the user asked:\n${history.map((h) => `- ${h}`).join('\n')}\n\n`
    : ''
  const size =
    scope === 'focused'
      ? 'This is a focused request: one or two sections.'
      : 'This is a whole page.'
  // Design notes for this kind of product: guidance, not a template
  const about = product && products[product]
  const reference = about
    ? `\n\nDesign notes for a ${about.type} (a reference, not a rule): ` +
      `style ${about.style}. ${about.notes} The brand colors are already ` +
      `set for it (${about.colors}); write the direction to suit them.`
    : ''
  // A reply that gives no usable section gets one more try
  for (let attempt = 1; ; attempt++) {
    const reader = planReader(events)
    const lines = streamLines(
      'plan',
      system,
      `${earlier}Request: ${message}\n\n${size}${reference}\n\n` +
        `Dials already set for this page: layout variance ${dials.variance}, ` +
        `motion ${dials.motion}, density ${dials.density}. Plan to fit them.`,
      signal,
    )
    let next = await lines.next()
    for (; !next.done; next = await lines.next()) reader.feed(next.value + '\n')
    const plan = reader.finish()
    if (plan) return { ...plan, model: next.value.model }
    if (attempt === 2 || signal.aborted) {
      throw new Error('The page plan could not be read. Try again.')
    }
    console.warn('unreadable plan, retrying')
  }
}

// Reads the plan's JSON while it streams. Sections are handed out as
// their objects close; anything the stream scan missed is recovered
// from the whole text at the end.
export function planReader(events: PlanEvents) {
  let text = ''
  let head: Pick<Plan, 'direction' | 'page'> | null = null
  const sections: Section[] = []
  const seen = new Set<string>()
  // Scanner state inside the "sections" array
  let at = -1 // next character to scan, once the array is found
  let depth = 0
  let inString = false
  let escaped = false
  let start = -1 // where the current section object began

  const add = (raw: unknown) => {
    const section = toSection(raw, sections.length, seen)
    if (!section) return
    sections.push(section)
    events.onSection(section)
  }
  const sendHead = (value: Pick<Plan, 'direction' | 'page'>) => {
    if (head) return
    head = value
    events.onHead(value)
  }

  return {
    feed(chunk: string) {
      text += chunk
      if (at < 0) {
        const key = text.search(/"sections"\s*:\s*\[/)
        if (key < 0) return
        // Everything before "sections" is the head: direction, page
        try {
          const before = text.slice(text.indexOf('{'), key).trim()
          sendHead(toHead(JSON.parse(`${before.replace(/,$/, '')}}`)))
        } catch {
          // Unusual key order: the head comes from the whole text later
        }
        at = text.indexOf('[', key) + 1
      }
      for (; at < text.length; at++) {
        const char = text[at]
        if (escaped) escaped = false
        else if (char === '\\') escaped = inString
        else if (char === '"') inString = !inString
        else if (inString) continue
        else if (char === '{' || char === '[') {
          if (depth++ === 0) start = at
        } else if (char === '}' || char === ']') {
          if (--depth === 0 && start >= 0) {
            try {
              add(JSON.parse(text.slice(start, at + 1)))
            } catch {
              // A broken section: skipped
            }
            start = -1
          }
        }
      }
    },
    // The whole plan, or null if nothing usable came
    finish(): Plan | null {
      try {
        const whole = JSON.parse(
          text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1),
        )
        sendHead(toHead(whole))
        if (!sections.length && isArray(whole.sections)) {
          whole.sections.forEach(add)
        }
      } catch {
        // Cut off: keep whatever sections came through
      }
      if (!sections.length) return null
      return { ...(head ?? { direction: '', page: {} }), sections }
    },
  }
}

// The direction and page options, keeping only options that exist
function toHead(raw: unknown): Pick<Plan, 'direction' | 'page'> {
  const plan = (isPlainObject(raw) ? raw : {}) as Record<string, unknown>
  const options = optionProps('Page')
  const page = Object.fromEntries(
    Object.entries(
      isPlainObject(plan.page) ? (plan.page as object) : {},
    ).filter(
      ([prop, value]) => isString(value) && options[prop]?.includes(value),
    ),
  ) as Record<string, string>
  return { direction: String(plan.direction ?? ''), page }
}

// One section, cleaned up: a unique kebab-case id, known components
function toSection(
  raw: unknown,
  index: number,
  seen: Set<string>,
): Section | null {
  if (!isPlainObject(raw)) return null
  const section = raw as Record<string, unknown>
  const job = String(section.job ?? '')
  if (!job) return null
  let id = kebabCase(String(section.id ?? `section-${index + 1}`))
  while (seen.has(id) || id === 'page') id = `${id}-${index + 1}`
  seen.add(id)
  const uses = isArray(section.uses) ? section.uses : []
  return {
    id,
    job,
    uses: uniq(
      uses.filter(
        (name): name is string =>
          isString(name) && name in componentDefinitions,
      ),
    ),
  }
}
