// Our own page-level components, next to json-render's shadcn ones.
// Props are small choices ("gradient", "center") instead of free CSS,
// so even a small model gets a good-looking, dark-mode-safe result.
// No React here: the server reads these too.
import { z } from 'zod'
import { iconNames } from './icon-names'

const link = z.object({ label: z.string(), href: z.string() })
const icon = z.enum(iconNames).nullable()
// What cards do when the pointer is over them
const hover = z.enum(['none', 'lift', 'glow']).nullable()
// Every block also takes Tailwind classes on its outer element, for
// effects the options don't cover (glass, borders, blur, animation)
const styled = <T extends z.ZodRawShape>(shape: T) =>
  z.object({ ...shape, className: z.string().nullable() })
const hoverHelp =
  ' hover: "lift" raises the cards, "glow" rings them in the brand color.'

export const blockDefinitions = {
  Page: {
    props: styled({
      background: z
        .enum([
          'plain',
          'muted',
          'gradient',
          'aurora',
          'grid',
          // Animated
          'dots',
          'animated-grid',
          'meteors',
          'particles',
          'ripple',
        ])
        .nullable(),
      align: z.enum(['top', 'center']).nullable(),
      surface: z.enum(['solid', 'glass']).nullable(),
    }),
    slots: ['default'],
    description:
      'The whole page. ALWAYS the root element. Fills the screen with a ' +
      'background; animated ones: "dots", "animated-grid" (squares ' +
      'fading in and out), "meteors" (shooting stars), "particles" ' +
      '(floating, follow the mouse), "ripple" (rings from the center). ' +
      'align "center" centers its content (auth pages, ' +
      'simple forms); "top" stacks Navbar, Hero, Sections, Footer. ' +
      'surface "glass" turns every card on the page into frosted, ' +
      'see-through glass (best over "aurora" or "gradient").',
  },
  Navbar: {
    props: styled({
      brand: z.string(),
      links: z.array(link).nullable(),
      cta: z.string().nullable(),
    }),
    description:
      'Top menu bar with brand, links and an optional call-to-action ' +
      'button. Collapses into a menu button on mobile. First child of Page.',
  },
  Hero: {
    props: styled({
      eyebrow: z.string().nullable(),
      title: z.string(),
      subtitle: z.string().nullable(),
      align: z.enum(['center', 'left']).nullable(),
      titleEffect: z.enum(['none', 'typing', 'aurora']).nullable(),
    }),
    slots: ['default'],
    description:
      'Large headline area at the top of a landing page. Children are ' +
      'usually a horizontal Stack of Buttons. titleEffect: "typing" ' +
      'types the title out, "aurora" fills it with a moving gradient.',
  },
  Section: {
    props: styled({
      title: z.string().nullable(),
      subtitle: z.string().nullable(),
      background: z.enum(['none', 'muted']).nullable(),
      width: z.enum(['narrow', 'normal', 'wide']).nullable(),
    }),
    slots: ['default'],
    description:
      'A page section with spacing and a centered, width-limited ' +
      'container. Use one per topic (features, pricing, FAQ...).',
  },
  Footer: {
    props: styled({
      brand: z.string(),
      text: z.string().nullable(),
      links: z.array(link).nullable(),
    }),
    description: 'Page footer with brand, a short line and links. Last child.',
  },

  Split: {
    props: styled({
      image: z.string().nullable(),
      imageAlt: z.string().nullable(),
      imageSide: z.enum(['left', 'right']).nullable(),
      caption: z.string().nullable(),
    }),
    slots: ['default'],
    description:
      'Split screen: an image fills one half of the screen, the children ' +
      'are centered in the other half. Use for "image on one side, form ' +
      'or text on the other" (sign in with a picture, contact, product ' +
      'showcase). Put it directly in a Page with align "top". image is ' +
      'an https URL (e.g. from images.unsplash.com); without one, the ' +
      'half shows a soft gradient. caption: an optional quote over the ' +
      'image.',
  },

  // --- Interactive ---
  // Replaces json-render's Carousel (text only, no autoplay)
  Carousel: {
    props: styled({
      items: z.array(
        z.object({
          title: z.string().nullable(),
          description: z.string().nullable(),
          image: z.string().nullable(),
        }),
      ),
      autoplay: z.boolean().nullable(),
    }),
    description:
      'Row of slides (image and/or title and description): photos, ' +
      'products, features. autoplay true scrolls them endlessly on its ' +
      'own (pauses on hover); otherwise the visitor swipes or scrolls. ' +
      'image is an https URL (e.g. from images.unsplash.com).',
  },
  Marquee: {
    props: styled({
      speed: z.enum(['slow', 'normal', 'fast']).nullable(),
      direction: z.enum(['left', 'right']).nullable(),
    }),
    slots: ['default'],
    description:
      'Auto-scrolling row that loops forever and pauses on hover: an ' +
      'auto-playing carousel, a testimonial wall, a logo strip. The ' +
      'children are the slides (Cards, Images, Text), 4 to 10 of them; ' +
      'give Cards a fixed width like className "w-72".',
  },
  TabbedContent: {
    props: styled({ tabs: z.array(z.string()) }),
    slots: ['default'],
    description:
      'Tabs that switch between panels, e.g. "Sign in" / "Sign up". Give ' +
      'exactly one child per tab, in the same order; switching is built ' +
      'in, no state or visible rules needed. Prefer this over Tabs.',
  },

  // --- Marketing sections (put inside a Section) ---
  FeatureGrid: {
    props: styled({
      items: z.array(
        z.object({ icon, title: z.string(), description: z.string() }),
      ),
      columns: z.enum(['2', '3', '4']).nullable(),
      hover,
    }),
    description:
      'Grid of features, each with an icon, title and description. ' +
      '3 or 6 items look best.' +
      hoverHelp,
  },
  PricingTable: {
    props: styled({
      plans: z.array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().nullable(),
          description: z.string().nullable(),
          features: z.array(z.string()),
          cta: z.string(),
          highlighted: z.boolean().nullable(),
        }),
      ),
      hover,
    }),
    description:
      'Pricing plans side by side. Mark one plan highlighted (the ' +
      'recommended one). price like "$12", period like "/month".' +
      hoverHelp,
  },
  Testimonials: {
    props: styled({
      items: z.array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().nullable(),
        }),
      ),
      hover,
      layout: z.enum(['grid', 'marquee']).nullable(),
    }),
    description:
      'Customer quotes with name and role. layout "grid": 3 items look ' +
      'best; "marquee": an endless auto-scrolling row (carousel), 5 or ' +
      'more items.' +
      hoverHelp,
  },
  Stats: {
    props: styled({
      items: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
          change: z.string().nullable(),
          trend: z.enum(['up', 'down']).nullable(),
        }),
      ),
      hover,
    }),
    description:
      'Row of key numbers (KPIs), e.g. "Revenue $48,210 +12%". For ' +
      'dashboards and "by the numbers" sections.' +
      hoverHelp,
  },
  CallToAction: {
    props: styled({
      title: z.string(),
      subtitle: z.string().nullable(),
      primary: z.string(),
      secondary: z.string().nullable(),
    }),
    description:
      'Closing banner asking the visitor to act ("Start free trial"). ' +
      'Near the end of landing pages.',
  },
  LogoCloud: {
    props: styled({
      title: z.string().nullable(),
      names: z.array(z.string()),
      layout: z.enum(['row', 'marquee']).nullable(),
    }),
    description:
      'Row of company names as "trusted by" social proof, under the ' +
      'Hero. layout "marquee" scrolls them endlessly.',
  },
  Steps: {
    props: styled({
      items: z.array(z.object({ title: z.string(), description: z.string() })),
    }),
    description: 'Numbered steps: "how it works", onboarding, a process.',
  },

  // --- Content ---
  List: {
    props: styled({
      items: z.array(z.string()),
      style: z.enum(['bullet', 'number', 'check']).nullable(),
    }),
    description:
      'A list of short items: ingredients, steps, requirements, what is ' +
      'included. "number" for ordered steps, "check" for benefits.',
  },

  // --- App / dashboard ---
  AppShell: {
    props: styled({
      brand: z.string(),
      nav: z.array(
        z.object({
          label: z.string(),
          icon,
          active: z.boolean().nullable(),
        }),
      ),
      title: z.string().nullable(),
    }),
    slots: ['default'],
    description:
      'Dashboard / admin layout: sidebar navigation plus a main area ' +
      '(children). Sidebar collapses to a menu on mobile. Use as the only ' +
      'child of Page for dashboards, settings and admin tools.',
  },
  Chart: {
    props: styled({
      title: z.string().nullable(),
      type: z.enum(['bar', 'line', 'area']),
      data: z.array(z.object({ label: z.string(), value: z.number() })),
    }),
    description:
      'Simple chart of one series, e.g. monthly revenue. 5 to 12 points.',
  },
}
