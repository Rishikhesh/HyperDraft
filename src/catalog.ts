// What the AI may use: component names, prop schemas, descriptions.
// No React in here, so the server can import it too.
import { defineCatalog } from '@json-render/core'
import { schema } from '@json-render/react/schema'
import { shadcnComponentDefinitions } from '@json-render/shadcn/catalog'
import { blockDefinitions } from './blocks/definitions' // relative: the server imports this too

// json-render's shadcn components + our page-level blocks
export const componentDefinitions = {
  ...shadcnComponentDefinitions,
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
