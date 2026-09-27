// Self-check for spec repairs. Run: bun server/repair.check.ts
import { ok } from 'node:assert'
import type { Spec } from '@json-render/core'
import { closeBrackets, fixLine, repair } from './repair'

const spec = {
  root: 't',
  elements: {
    t: {
      type: 'TabbedContent',
      props: { tabs: ['Sign in', 'Sign up'] },
      children: ['a'], // the model forgot the sign-up panel
    },
    a: { type: 'Stack', props: {} }, // no children key at all
  },
} as unknown as Spec
repair(spec)
const tabs = (spec.elements.t.props as { tabs: string[] }).tabs
ok(tabs.join() === 'Sign in', 'extra tab dropped')
ok(Array.isArray(spec.elements.a.children), 'children added')

// A block put straight into the Page gets a Section around it
const bare = {
  root: 'p',
  elements: {
    p: { type: 'Page', props: {}, children: ['plans', 'hero'] },
    plans: { type: 'PricingTable', props: {}, children: [] },
    hero: { type: 'Hero', props: {}, children: [] },
  },
} as unknown as Spec
repair(bare)
ok(bare.elements.p.children?.join() === 'plans-section,hero', 'wrapped')
ok(bare.elements['plans-section'].children?.join() === 'plans', 'inside')
repair(bare) // running twice changes nothing
ok(bare.elements.p.children?.join() === 'plans-section,hero', 'idempotent')

// Links to elements that were never written are dropped
const dangling = {
  root: 'p',
  elements: {
    p: { type: 'Page', props: {}, children: ['ghost', 'real'] },
    real: { type: 'Text', props: {}, children: [] },
  },
} as unknown as Spec
repair(dangling)
ok(dangling.elements.p.children?.join() === 'real', 'dangling')

// Missing closing brackets are added back, innermost first
const short = '{"op":"add","value":{"props":{"items":[{"a":1}]},"c":[]}'
ok(JSON.parse(closeBrackets(short)).value.c.length === 0, 'closed')
const deep = '{"a":{"b":[{"c":"x"'
ok(closeBrackets(deep) === '{"a":{"b":[{"c":"x"}]}}', 'order')
// Brackets inside strings are text, not structure
const text = '{"t":"a } and { and ]"'
ok(JSON.parse(closeBrackets(text)).t === 'a } and { and ]', 'strings')
const escaped = '{"t":"say \\"hi\\" {"'
ok(JSON.parse(closeBrackets(escaped)).t === 'say "hi" {', 'escapes')
// "op":"add":"path" (a colon for a comma) is read as intended
const colon = '{"op":"add":"path":"/elements/a","value":{"x":"a:b"}'
ok(JSON.parse(fixLine(colon)).path === '/elements/a', 'op colon')
ok(JSON.parse(fixLine(colon)).value.x === 'a:b', 'op colon only')

// Complete lines are left alone
ok(closeBrackets('{"a":1}') === '{"a":1}', 'unchanged')

console.log('repair checks done')
