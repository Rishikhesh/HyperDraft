// Extra instructions for the LLM, added to json-render's own rules.
// General design principles, not recipes for particular pages: the
// suggested outline (from Jev's page type) is only a starting point.

export const designRules = [
  // Talking to the user
  'Start with one or two plain sentences (no markdown) telling the user ' +
    'what you are building: the layout and its main parts. They see ' +
    'this while the UI appears.',

  // Structure
  'The root element is ALWAYS a Page. Pick the background for the mood: ' +
    '"gradient" or "aurora" for marketing and welcoming screens, "grid" ' +
    'for technical products, "muted" or "plain" for tools and data.',
  'Include everything the request names. If a suggested structure is ' +
    'given, use it as a starting point: add, drop or reorder parts so ' +
    'it fits the request.',
  'Build exactly what is asked for, polished and complete in itself, ' +
    'but do not add parts nobody asked for. Write realistic copy ' +
    '(names, prices with currency, labels). No lorem ipsum.',
  'Prefer the ready-made blocks (Navbar, Hero, Section, FeatureGrid, ' +
    'PricingTable, Testimonials, Stats, Steps, LogoCloud, CallToAction, ' +
    'AppShell, Chart, List, Footer) over rebuilding the same thing from ' +
    'Cards. Several items or steps go in a List, not one long Text.',
  'Every form ends with a primary submit Button.',
  'To switch between panels use TabbedContent (one child per tab), not ' +
    'Tabs. Never read state paths you did not put in /state.',

  // Styling: options first, Tailwind classes for everything else
  "Use a component's own options first (background, surface, hover, " +
    'variant). For any effect they do not cover, every block plus ' +
    'Stack, Grid and Card accepts "className" (any Tailwind CSS v4 ' +
    'class): blur, gradients, rings, shadows, rounded corners, ' +
    'opacity, transforms, animation. Your classes override the defaults.',
  'Glass / frosted look: Page surface "glass" over background "aurora" ' +
    'or "gradient". For a single element: className "bg-background/40 ' +
    'backdrop-blur-xl border border-foreground/10 shadow-xl".',
  'Never use fixed surface colors like bg-white, bg-black, bg-gray-50 or ' +
    'text-black: they break dark mode. Use theme classes instead: ' +
    'bg-background, bg-card, bg-muted, bg-primary/10, text-foreground, ' +
    'text-muted-foreground, text-primary, border-border.',
  'Centered content like a single form: Page with align "center" and a ' +
    'Card with className "w-full max-w-md shadow-xl" (maxWidth null).',
  'Content beside an image (image one side, form or text the other): ' +
    'use Split, never a horizontal Stack. Never lay out page halves or ' +
    'columns with Stack className; use Split, Grid or the blocks.',
  'Responsive grids: set columns to 1 and add className ' +
    '"md:grid-cols-2" or "md:grid-cols-3", so phones get one column.',

  // Motion: tasteful, never distracting
  'Anything that scrolls or plays by itself (auto-playing carousel, ' +
    'moving logos, testimonial wall): reviews are Testimonials with ' +
    'layout "marquee", company logos are LogoCloud with layout ' +
    '"marquee". Photos, products or simple slides: Carousel with ' +
    'autoplay true. Anything richer is a Marquee whose children are ' +
    'the slides, each a real element (Card, Image). ' +
    'Ready-made effects: Page background "dots", "animated-grid", ' +
    '"meteors", "particles", "ripple"; Hero titleEffect "typing" or ' +
    '"aurora". Use them when the request asks for motion, effects or ' +
    'something eye-catching.',
  'Motion is welcome but subtle. Card-based blocks take hover "lift" or ' +
    '"glow". In className you may use: ' +
    '"motion-safe:animate-in fade-in slide-in-from-bottom-4 duration-700" ' +
    '(entrance; add delay-150, delay-300 to stagger), "transition ' +
    'hover:-translate-y-1 hover:shadow-lg" (hover), animate-pulse for a ' +
    'live badge. Always prefix movement with motion-safe:. Never ' +
    'animate-bounce or animate-spin on content.',

  // Edits
  'When editing, keep the existing look and change only what was asked.',
]
