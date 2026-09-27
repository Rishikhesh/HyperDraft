// For new pages: a suggested structure per kind of page, added to the
// request. Small models decide on little structure by themselves; this
// gives them a starting point, which they adapt. Jev picks the kind.
import type { ComponentName } from '../src/catalog'
import type { Scope } from './jev'

export const pageTypes = {
  landing: 'A marketing or product page that presents something',
  auth: 'Sign in, sign up, or password reset',
  dashboard: 'An app screen with data: metrics, charts, tables, admin',
  form: 'A form to fill in: contact, checkout, settings, survey',
  content: 'A page of content: blog post, docs, profile, about',
  other: 'Anything else, or a single small component',
}

export type PageType = keyof typeof pageTypes

const outlines: Record<PageType, string | null> = {
  landing:
    'Page (align "top", background "gradient" or "aurora") containing, ' +
    'in order: Navbar; Hero with a horizontal Stack of two Buttons; ' +
    'Section with LogoCloud; Section with a FeatureGrid of 6 items; ' +
    'Section with Steps or Testimonials; Section with PricingTable of 3 ' +
    'plans (one highlighted) if the product is paid; Section with an ' +
    'Accordion FAQ if available; Section with CallToAction; Footer.',
  auth:
    'Page (align "center", background "aurora") with ONE Card ' +
    '(className "w-full max-w-md shadow-xl"). If both sign in and sign ' +
    'up are wanted, the Card holds a TabbedContent with exactly two ' +
    'child Stacks, one per tab. Each form: labeled Inputs, then a ' +
    'primary submit Button, then a Link to the other form.',
  dashboard:
    'Page (background "plain") with one AppShell (brand, 4-6 nav items ' +
    'with icons, one active, a title) containing: Stats with 4 KPIs; a ' +
    'Grid (columns 1, className "md:grid-cols-2") of 2 Charts; a Card ' +
    'with a Table of recent items (5-8 rows).',
  form:
    'Page (align "center", background "muted") with a Card ' +
    '(className "w-full max-w-lg") holding the fields in a vertical ' +
    'Stack, grouped with Separators if long, and a primary submit Button.',
  content:
    'Page (align "top", background "plain") with Navbar, then Sections ' +
    'of width "narrow" holding Headings, Text and Lists, then Footer.',
  other: null,
}

// Components each outline uses, so they're always offered to the LLM
export const kits: Record<PageType, ComponentName[]> = {
  landing: [
    'Navbar',
    'Hero',
    'Section',
    'Footer',
    'LogoCloud',
    'FeatureGrid',
    'Steps',
    'Testimonials',
    'PricingTable',
    'Accordion',
    'CallToAction',
  ],
  auth: [
    'Card',
    'TabbedContent',
    'Input',
    'Checkbox',
    'Button',
    'Link',
    'Split',
  ],
  dashboard: ['AppShell', 'Stats', 'Chart', 'Table', 'Card', 'Badge'],
  form: ['Card', 'Input', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Switch'],
  content: ['Navbar', 'Section', 'Footer', 'Image', 'List'],
  other: [],
}

// Focused requests get the opposite: build only what was asked
const focusedNote =
  'Build only what is asked for, but build it fully: the requested thing ' +
  '(e.g. a PricingTable with its plans, or a form with all its fields) ' +
  'inside a Section with a title and a one-line subtitle, in a Page with ' +
  'align "center". No Navbar, Hero, Footer or extra sections unless the ' +
  'request asks for them.'

export function withOutline(
  message: string,
  type: PageType,
  scope: Scope,
): string {
  if (scope === 'focused') return `${message}\n\n${focusedNote}`
  const outline = outlines[type]
  return outline
    ? `${message}\n\nA good starting structure (adapt it to the ` +
        `request): ${outline}`
    : message
}
