// Our own page-level components, next to json-render's shadcn ones.
// Props are small choices ("gradient", "center") instead of free CSS,
// so even a small model gets a good-looking, dark-mode-safe result.
// No React here: the server reads these too.
import { shadcnComponentDefinitions as shadcn } from '@json-render/shadcn/catalog'
import { z } from 'zod'
import { illustrationHelp, illustrationStyles } from './art'
import { fontHelp, fontNames } from './fonts'
import { iconNames } from './icon-names'

const link = z.object({ label: z.string(), href: z.string() })
const icon = z.enum(iconNames).nullable()
// What cards do when the pointer is over them
const hover = z.enum(['none', 'lift', 'glow']).nullable()
// Every block also takes Tailwind classes on its outer element, for
// effects the options don't cover (glass, borders, blur, animation)
const styled = <T extends z.ZodRawShape>(shape: T) =>
  z.object({ ...shape, className: z.string().nullable() })
// Animated text for titles. "rotate" and "morph" cycle through `words`.
const textEffect = z
  .enum([
    'none',
    'typing',
    'aurora',
    'animate',
    'sparkles',
    'scramble',
    'shiny',
    'gradient',
    'highlight',
    'rotate',
    'morph',
  ])
  .nullable()
const textEffectHelp =
  ' Title effects: "typing" types it out, "aurora" and "gradient" fill ' +
  'it with moving color, "animate" fades the words in, "sparkles" adds ' +
  'twinkles, "scramble" decodes it like a terminal, "shiny" sweeps a ' +
  'shine across, "highlight" marks it like a highlighter pen, "rotate" ' +
  'ends it with a word that keeps changing through `words`, "morph" ' +
  'melts between the title and `words`.'
const words = z.array(z.string()).nullable()

// Animated borders and surfaces for cards
const cardEffect = z.enum(['none', 'beam', 'shine', 'neon', 'glare']).nullable()
const cardEffectHelp =
  ' cardEffect: "beam" runs a light around the border, "shine" makes ' +
  'the border shimmer, "neon" gives a glowing neon frame, "glare" ' +
  'sweeps a glare over it on hover.'

const hoverHelp =
  ' hover: "lift" raises the cards, "glow" rings them in the brand color.'

export const blockDefinitions = {
  // --- json-render components, extended with more options ---
  Button: {
    ...shadcn.Button,
    props: z.object({
      label: z.string(),
      variant: z
        .enum(['primary', 'secondary', 'outline', 'ghost', 'link', 'danger'])
        .nullable(),
      size: z.enum(['sm', 'md', 'lg']).nullable(),
      effect: z
        .enum(['none', 'shimmer', 'rainbow', 'pulse', 'shiny', 'arrow'])
        .nullable(),
      disabled: z.boolean().nullable(),
      toast: z.string().nullable(),
    }),
    description:
      'Clickable button. Bind on.press for handler. effect (for one ' +
      'standout call to action, not every button): "shimmer" a light ' +
      'running around a dark button, "rainbow" a rainbow glow, "pulse" ' +
      'a pulsing ring, "shiny" a shine sweeping across, "arrow" an ' +
      'arrow sliding in on hover. toast: a short message that pops up ' +
      'as a notification when pressed ("Saved!", "Added to cart").',
  },
  Card: {
    ...shadcn.Card,
    props: shadcn.Card.props.extend({ effect: cardEffect }),
    description:
      shadcn.Card.description + cardEffectHelp.replace('cardEffect', 'effect'),
  },
  Heading: {
    ...shadcn.Heading,
    props: shadcn.Heading.props.extend({ effect: textEffect, words }),
    description: shadcn.Heading.description + '.' + textEffectHelp,
  },

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
          'flickering-grid',
          'retro-grid',
          'hexagons',
          'stripes',
          'light-rays',
        ])
        .nullable(),
      texture: z.enum(['none', 'noise']).nullable(),
      font: z.enum(fontNames).nullable(),
      headingFont: z.enum(fontNames).nullable(),
      align: z.enum(['top', 'center']).nullable(),
      surface: z.enum(['solid', 'glass']).nullable(),
    }),
    slots: ['default'],
    description:
      'The whole page. ALWAYS the root element. Fills the screen with a ' +
      'background; animated ones: "dots", "animated-grid" (squares ' +
      'fading in and out), "meteors" (shooting stars), "particles" ' +
      '(floating, follow the mouse), "ripple" (rings from the center), ' +
      '"flickering-grid" (tiny squares twinkling), "retro-grid" (a ' +
      'synthwave floor grid in perspective), "hexagons" (honeycomb ' +
      'lines), "stripes" (diagonal lines), "light-rays" (soft beams from ' +
      'above). texture "noise" adds a film-grain feel. ' +
      'align "center" centers its content (auth pages, ' +
      'simple forms); "top" stacks Navbar, Hero, Sections, Footer. ' +
      'font sets the text, headingFont the titles (pair a display or ' +
      `serif heading with a plain text font): ${fontHelp}. ` +
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
      layout: z.enum(['centered', 'split', 'background']).nullable(),
      image: z.string().nullable(),
      imageAlt: z.string().nullable(),
      illustration: z.enum(illustrationStyles).nullable(),
      illustrationIcon: icon,
      illustrationMotion: z.enum(['still', 'moving']).nullable(),
      titleEffect: textEffect,
      words,
    }),
    slots: ['default'],
    description:
      'Large headline area at the top of a landing page. Children are ' +
      'usually a horizontal Stack of Buttons. layout: "centered" (text ' +
      'only), "split" (text beside the image), "background" (the image ' +
      'fills the hero behind the text). Leave image null unless the ' +
      'request needs real photos; the picture is then an illustration. ' +
      illustrationHelp +
      textEffectHelp,
  },
  Section: {
    props: styled({
      title: z.string().nullable(),
      subtitle: z.string().nullable(),
      background: z.enum(['none', 'muted']).nullable(),
      width: z.enum(['narrow', 'normal', 'wide']).nullable(),
      titleEffect: textEffect,
      words,
      reveal: z.enum(['none', 'fade']).nullable(),
    }),
    slots: ['default'],
    description:
      'A page section with spacing and a centered, width-limited ' +
      'container. Use one per topic (features, pricing, FAQ...). ' +
      'reveal "fade" blurs the content in as it scrolls into view.' +
      textEffectHelp,
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
      illustration: z.enum(illustrationStyles).nullable(),
      illustrationIcon: icon,
      illustrationMotion: z.enum(['still', 'moving']).nullable(),
      caption: z.string().nullable(),
    }),
    slots: ['default'],
    description:
      'Split screen: an image fills one half of the screen, the children ' +
      'are centered in the other half. Use for "image on one side, form ' +
      'or text on the other" (sign in with a picture, contact, product ' +
      'showcase). Put it directly in a Page with align "top". image: ' +
      'an https photo URL, only when the request needs real photos; ' +
      'otherwise leave it null and the half shows an illustration. ' +
      'caption: an optional quote over it. ' +
      illustrationHelp,
  },

  // --- Showcase ---
  DeviceFrame: {
    props: styled({
      device: z.enum(['browser', 'phone']),
      image: z.string().nullable(),
      url: z.string().nullable(),
      illustration: z.enum(illustrationStyles).nullable(),
      illustrationIcon: icon,
      illustrationMotion: z.enum(['still', 'moving']).nullable(),
    }),
    description:
      'A product screenshot inside a browser window ("browser", with url ' +
      'in its address bar) or a phone ("phone"). For heroes and product ' +
      'sections. Leave image null (a real screenshot URL is rarely ' +
      'known): the screen then shows an illustration, "cards" (an ' +
      'abstract app screen) unless another style fits. ' +
      illustrationHelp,
  },
  Terminal: {
    props: styled({
      lines: z.array(
        z.object({
          text: z.string(),
          kind: z.enum(['command', 'output', 'success']).nullable(),
        }),
      ),
    }),
    description:
      'An animated terminal window: commands type themselves out, then ' +
      'their output appears line by line. For developer tools, CLIs, ' +
      'install instructions.',
  },
  Globe: {
    props: styled({}),
    description:
      'A rotating 3D globe with glowing location dots. For global, ' +
      'international or "anywhere in the world" messages.',
  },
  LogoCloud3D: {
    props: styled({ logos: z.array(z.string()) }),
    description:
      'A rotating 3D sphere of brand logos, for integrations or tech ' +
      'stacks. logos: brand names as on simpleicons.org (github, figma, ' +
      'slack, stripe, notion, vercel…), 8 to 20 of them.',
  },
  OrbitingLogos: {
    props: styled({
      center: z.string().nullable(),
      logos: z.array(z.string()),
    }),
    description:
      'Brand logos orbiting a center on two rings: "connects with all ' +
      'your tools". center: short text in the middle (the product name). ' +
      'logos: simpleicons.org names, 4 to 10.',
  },
  ActivityFeed: {
    props: styled({
      items: z.array(
        z.object({
          icon,
          title: z.string(),
          description: z.string().nullable(),
          time: z.string().nullable(),
        }),
      ),
    }),
    description:
      'Notifications popping in one after another, like a live feed ' +
      '("New signup", "Payment received · 2m ago"). 4 to 8 items.',
  },
  AvatarStack: {
    props: styled({
      people: z.array(z.string()),
      extra: z.number().nullable(),
      label: z.string().nullable(),
    }),
    description:
      'Overlapping round avatars plus "+extra", for social proof ' +
      '("Loved by 10,000+ teams"). people: 4 to 6 first names (their ' +
      'avatars are generated). extra: the number in the last circle.',
  },
  FileTree: {
    props: styled({ paths: z.array(z.string()) }),
    description:
      'A folder and file tree that opens and closes, for docs and dev ' +
      'tools. paths: file paths like "src/app/page.tsx".',
  },
  Dock: {
    props: styled({
      items: z.array(z.object({ icon, label: z.string() })),
    }),
    description:
      'A macOS-style dock of app icons that grow under the pointer. 4 to ' +
      '8 items.',
  },
  VideoPreview: {
    props: styled({
      video: z.string(),
      image: z.string().nullable(),
      animation: z
        .enum(['from-center', 'from-bottom', 'fade', 'top-in-bottom-out'])
        .nullable(),
    }),
    description:
      'A video thumbnail with a play button that opens the video in a ' +
      'popup. video: a YouTube embed URL (https://www.youtube.com/embed/' +
      'ID); image: the thumbnail (optional for YouTube).',
  },

  // --- App and form parts ---
  DatePicker: {
    props: styled({
      label: z.string().nullable(),
      placeholder: z.string().nullable(),
      range: z.boolean().nullable(),
    }),
    description:
      'A date field that opens a calendar. range true picks a start and ' +
      'end date (bookings, reports).',
  },
  Calendar: {
    props: styled({ range: z.boolean().nullable() }),
    description:
      'A month calendar shown on the page, for scheduling and bookings.',
  },
  OtpInput: {
    props: styled({
      label: z.string().nullable(),
      length: z.enum(['4', '6']).nullable(),
    }),
    description:
      'Boxes for a one-time verification code (two-factor, email or ' +
      'phone confirmation).',
  },
  Breadcrumb: {
    props: styled({
      items: z.array(
        z.object({ label: z.string(), href: z.string().nullable() }),
      ),
    }),
    description:
      'Where you are: Home / Settings / Billing. The last item is the ' +
      'current page.',
  },
  Kbd: {
    props: styled({ keys: z.array(z.string()) }),
    description: 'Keyboard shortcut keys, e.g. ["⌘", "K"].',
  },
  Sheet: {
    props: styled({
      trigger: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      side: z.enum(['left', 'right', 'top', 'bottom']).nullable(),
    }),
    slots: ['default'],
    description:
      'A button that slides a panel in from a side (filters, cart, ' +
      'details). Children are the panel content.',
  },
  CommandMenu: {
    props: styled({
      placeholder: z.string().nullable(),
      groups: z.array(
        z.object({
          heading: z.string(),
          items: z.array(
            z.object({
              label: z.string(),
              icon,
              shortcut: z.string().nullable(),
            }),
          ),
        }),
      ),
    }),
    description:
      'A searchable command palette (like ⌘K): type to filter actions, ' +
      'grouped under headings.',
  },
  HoverCard: {
    props: styled({
      trigger: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      image: z.string().nullable(),
    }),
    description:
      'Text (like @username) that shows a small profile or preview card ' +
      'when hovered.',
  },
  EmptyState: {
    props: styled({
      icon,
      title: z.string(),
      description: z.string().nullable(),
    }),
    slots: ['default'],
    description:
      'What an empty list or first-run screen shows: an icon, a title, a ' +
      'hint, and children (usually a Button to create the first item).',
  },
  NavMenu: {
    props: styled({
      menus: z.array(
        z.object({
          label: z.string(),
          items: z.array(
            z.object({
              title: z.string(),
              description: z.string().nullable(),
              href: z.string().nullable(),
            }),
          ),
        }),
      ),
    }),
    description:
      'A navigation bar whose items open dropdown panels of links with ' +
      'descriptions (a "mega menu": Products, Solutions, Resources).',
  },
  ScrollBox: {
    props: styled({ height: z.enum(['sm', 'md', 'lg']).nullable() }),
    slots: ['default'],
    description:
      'A fixed-height box whose children scroll inside it (long lists, ' +
      'terms, chat history).',
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
          icon,
        }),
      ),
      autoplay: z.boolean().nullable(),
    }),
    description:
      'Row of slides (image and/or title and description): photos, ' +
      'products, features. autoplay true scrolls them endlessly on its ' +
      'own (pauses on hover); otherwise the visitor swipes or scrolls. ' +
      'image: an https photo URL, only when real photos are needed; ' +
      'without one, a slide shows a drawn illustration (with its icon).',
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
      layout: z.enum(['grid', 'bento', 'list']).nullable(),
      hover,
      cardEffect,
    }),
    description:
      'Grid of features, each with an icon, title and description. ' +
      '3 or 6 items look best. layout "bento": tiles of mixed sizes, the ' +
      'first ones larger (5 items look best); "list": compact rows, ' +
      'icon beside text.' +
      hoverHelp +
      cardEffectHelp,
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
      layout: z.enum(['cards', 'comparison']).nullable(),
      hover,
      cardEffect,
    }),
    description:
      'Pricing plans side by side. Mark one plan highlighted (the ' +
      'recommended one). price like "$12", period like "/month". ' +
      'layout "comparison": one table, features as rows, plans as ' +
      'columns (good for many features).' +
      hoverHelp +
      cardEffectHelp,
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
      cardEffect,
      layout: z.enum(['grid', 'marquee', 'spotlight']).nullable(),
    }),
    description:
      'Customer quotes with name and role. layout "grid": 3 items look ' +
      'best; "marquee": an endless auto-scrolling row (carousel), 5 or ' +
      'more items; "spotlight": one large quote (the first item).' +
      hoverHelp +
      cardEffectHelp,
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
      countUp: z.boolean().nullable(),
      layout: z.enum(['cards', 'inline']).nullable(),
      hover,
      cardEffect,
    }),
    description:
      'Row of key numbers (KPIs), e.g. "Revenue $48,210 +12%". For ' +
      'dashboards and "by the numbers" sections. countUp true animates ' +
      'the numbers counting up. layout "inline": big numbers in a row, ' +
      'no boxes.' +
      hoverHelp +
      cardEffectHelp,
  },
  CallToAction: {
    props: styled({
      title: z.string(),
      subtitle: z.string().nullable(),
      primary: z.string(),
      secondary: z.string().nullable(),
      layout: z.enum(['banner', 'card', 'minimal']).nullable(),
    }),
    description:
      'Closing banner asking the visitor to act ("Start free trial"). ' +
      'Near the end of landing pages. layout: "banner" (bold, brand ' +
      'color), "card" (a calm bordered card), "minimal" (just text and ' +
      'buttons).',
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
      description: z.string().nullable(),
      type: z.enum(['bar', 'line', 'area', 'pie', 'radar']),
      series: z.array(z.string()).nullable(),
      data: z.array(
        z.object({
          label: z.string(),
          value: z.number().nullable(),
          values: z.array(z.number()).nullable(),
        }),
      ),
      stacked: z.boolean().nullable(),
    }),
    description:
      'A chart with tooltips and a legend. One series: set "value" on ' +
      'each point. Several (e.g. revenue vs costs): name them in series ' +
      'and give each point "values" in the same order. "pie" shows one ' +
      'series as shares; "radar" compares a few categories. stacked ' +
      'piles bar/area series on top of each other. 4 to 12 points.',
  },
}
