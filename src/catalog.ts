// What the AI may use: component names, prop schemas, descriptions.
// No React in here, so the server can import it too.
import { defineCatalog } from '@json-render/core'
import { schema } from '@json-render/react/schema'
import { shadcnComponentDefinitions } from '@json-render/shadcn/catalog'
import { mapValues } from 'lodash-es'
import { z } from 'zod'
import { blockDefinitions } from './blocks/definitions' // relative: the server imports this too

// json-render's components, each also taking Tailwind classes. Many
// lack a className, so a request like "make this wider" had nothing to
// change. (The registry applies it; see withClassName.)
const shadcnWithClass = mapValues(shadcnComponentDefinitions, (definition) =>
  'className' in definition.props.shape
    ? definition
    : {
        ...definition,
        props: definition.props.extend({ className: z.string().nullable() }),
      },
) as typeof shadcnComponentDefinitions

// Components json-render draws without a className of their own
export const addedClassName = Object.keys(shadcnComponentDefinitions).filter(
  (name) =>
    !(
      'className' in
      shadcnComponentDefinitions[
        name as keyof typeof shadcnComponentDefinitions
      ].props.shape
    ),
)

// json-render's shadcn components + our page-level blocks
export const componentDefinitions = {
  ...shadcnWithClass,
  ...blockDefinitions,
}

export type ComponentName = keyof typeof componentDefinitions

export const componentNames = Object.keys(
  componentDefinitions,
) as ComponentName[]

// Layout basics almost every UI needs. Always offered, never left to Jev.
export const alwaysIncluded: ComponentName[] = [
  'Page',
  'Stack',
  'Grid',
  'Card',
  'Heading',
  'Text',
  'Button',
  'Separator',
]

// A catalog limited to some components (Jev's picks). The LLM's
// instructions are generated from this, so it can only use these.
export function catalogOf(names: ComponentName[]) {
  const components = Object.fromEntries(
    names.map((name) => [name, componentDefinitions[name]]),
  )
  return defineCatalog(schema, { components, actions: {} })
}

// Every component. Used by the preview, and to check the final spec.
export const catalog = defineCatalog(schema, {
  components: componentDefinitions,
  actions: {},
})
