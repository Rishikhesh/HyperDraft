// Self-check for edits done without the LLM. Run: bun server/edit.check.ts
import { ok } from 'node:assert'
import { applySpecPatch, type Spec } from '@json-render/core'
import { optionProps, propPatches, removePatches } from './edit'

const el = (type: string, children: string[] = [], props = {}) => ({
  type,
  props,
  children,
})
const spec: Spec = {
  root: 'page',
  elements: {
    page: el('Page', ['hero', 'pricing']),
    hero: el('Hero', ['buttons']),
    buttons: el('Stack', ['a', 'b']),
    a: el('Button', [], { label: 'A', variant: 'primary' }),
    b: el('Button'),
    pricing: el('Section', ['loop']),
    loop: el('Stack', ['pricing']), // a bad spec with a cycle
  },
}
const run = (patches: ReturnType<typeof removePatches>) => {
  const copy = structuredClone(spec)
  for (const patch of patches ?? []) applySpecPatch(copy, patch)
  return copy
}

// Removing the hero removes everything inside it and unlinks it
const noHero = run(removePatches(spec, 'hero'))
ok(!noHero.elements.hero && !noHero.elements.a, 'hero and children gone')
ok(noHero.elements.page.children?.join() === 'pricing', 'unlinked')

// The page itself can't be removed; unknown ids do nothing
ok(removePatches(spec, 'page') === null, 'root kept')
ok(removePatches(spec, 'nope') === null, 'unknown id')

// A cycle doesn't hang or crash
ok(!run(removePatches(spec, 'pricing')).elements.loop, 'cycle handled')

// Option props come from the component schemas
ok(optionProps('Button').variant?.includes('danger'), 'button variants')
ok(optionProps('Page').background?.includes('aurora'), 'page backgrounds')
ok(!('label' in optionProps('Button')), 'free text is not an option')
ok(Object.keys(optionProps('Nope')).length === 0, 'unknown type')

// Setting options
const red = structuredClone(spec)
for (const p of propPatches('a', { variant: 'danger' })) {
  applySpecPatch(red, p)
}
ok((red.elements.a.props as { variant: string }).variant === 'danger', 'set')
ok(propPatches('a/b~c', { v: 'x' })[0].path === '/elements/a~1b~0c/props/v')

console.log('edit checks done')
