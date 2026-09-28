# HyperDraft

Describe a UI in plain language and see it built live from real component
libraries.

## Setup

```sh
bun install
cp .env.example .env   # add TYPESAFE_API_KEY, GOOGLE_API_KEY, NVIDIA_API_KEY
bun dev                # app on http://localhost:5173, API on :3001
```

## Production

```sh
bun run build   # builds the app into dist/
bun start       # one server: app + API on $PORT (default 3001)
```

`bun start` serves the built app and the API from one process, so any host that
runs Bun works (a VPS, Fly.io, Render, Railway). Set the same variables as in
`.env.example` on the host; set `TRUST_PROXY=true` if it sits behind a proxy.
Put it behind HTTPS.

**Vercel:** import the repo; `vercel.json` runs `api/chat.ts` on Vercel's Bun
runtime and Vercel serves the built app. Add the `.env.example` variables in
Project → Settings → Environment Variables (`TRUST_PROXY` isn't needed there).

What protects it:

- API keys stay on the server; the browser never sees them.
- Rate limit per visitor (`RATE_LIMIT_PER_MINUTE`, default 10).
- Requests are size-limited and validated.
- Links and images from the AI are cleaned (no `javascript:` URLs).
- A model that is busy or goes silent is retried or replaced by the next one in
  `LLM_MODELS`.

Known limits: the rate limit is in memory (one server instance), sessions are
saved in the visitor's browser only, and small models sometimes skip details
(say "add a submit button" and it will).

## How it works

```
message ─► Jev (one call, ~1s): new page or edit, which elements it
           touches, option values, what kind of change
   ├─ new focused thing (a form, a table) ─► one section, built by the LLM;
   │                                          Jev picks the page's look
   ├─ new page ─► LLM plans it (direction + sections, streamed)
   │              └─ each section built by its own LLM call as soon as
   │                 it's planned, 4 at a time; Jev samples its layouts
   ├─ remove / change an option ─► code does it (no LLM, ~1s)
   └─ other edits ─► LLM sees only the elements in scope; code rejects
                      changes outside it
preview ◄─ patches stream in and animate; chat shows each step live
```

| File                        | Job                                             |
| --------------------------- | ----------------------------------------------- |
| `src/App.tsx`               | Owns the spec, history (undo), mode, selection  |
| `src/ChatPanel.tsx`         | Chat UI (display only)                          |
| `src/chat.ts`               | Reads the server's event stream                 |
| `src/Preview.tsx`           | Runs in the iframe, renders whatever it is sent |
| `src/messages.ts`           | Messages between the app and the iframe         |
| `src/api.ts`                | Messages between the app and the server         |
| `src/catalog.ts`            | Components the AI may use (no React)            |
| `src/registry.tsx`          | Component name → React (big groups load lazily) |
| `src/patch.ts`              | Applies patches without changing the old spec   |
| `src/storage.ts`            | Saves the session in the browser                |
| `src/ErrorBoundary.tsx`     | Shows a message if a UI fails to render         |
| `src/blocks/definitions.ts` | Block props and descriptions (no React)         |
| `src/blocks/layout.tsx`     | Page, Navbar, Hero, Section, Footer, Split      |
| `src/blocks/marketing.tsx`  | FeatureGrid, PricingTable, Testimonials, ...    |
| `src/blocks/app.tsx`        | TabbedContent, Carousel, Marquee, AppShell      |
| `src/blocks/chart.tsx`      | Charts (recharts), loaded on first use          |
| `src/blocks/showcase.tsx`   | Device frames, terminal, globe, logos, ...      |
| `src/blocks/app-parts.tsx`  | Date picker, OTP, command menu, sheet, ...      |
| `src/blocks/effects.tsx`    | Title effects and card borders                  |
| `src/blocks/overrides.tsx`  | json-render's Button/Card/Heading, extended     |
| `src/components/ui/`        | shadcn + Magic UI (MIT), via the shadcn CLI     |
| `server/index.ts`           | Bun server: /api/chat and the built app         |
| `server/chat.ts`            | /api/chat: rate limit, validate, stream events  |
| `api/chat.ts`               | The same handler as a Vercel function           |
| `server/generate.ts`        | Jev, then code or the LLM, for each message     |
| `server/jev.ts`             | Jev decisions (TypeSafe)                        |
| `server/describe.ts`        | The UI as words Jev can read                    |
| `server/plan.ts`            | Plans a new page (streamed JSON)                |
| `server/sections.ts`        | Builds a new page's sections in parallel        |
| `server/tracker.ts`         | Applies and streams LLM patches                 |
| `server/edit.ts`            | Removes, sets options, finds an edit's scope    |
| `server/repair.ts`          | Fixes model slips: brackets, props, containers  |
| `server/design-rules.ts`    | Design instructions added to the AI prompt      |
| `server/llm.ts`             | LLM streaming per job (Google, NVIDIA)          |
| `server/sanitize.ts`        | Makes AI-written links and images safe          |
| `server/rate-limit.ts`      | Requests per visitor per minute                 |
| `server/static.ts`          | Serves the built app in production              |

The LLM runs on your own free Google AI Studio and NVIDIA quotas, trying the
models in `LLM_MODELS` in order. Jev answers greetings without using the LLM.

## Credits

Design knowledge adapted from these MIT-licensed projects:

- [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill):
  color palettes and design notes per product type (`src/blocks/palettes.ts`,
  `server/products.ts`)
- [taste-skill](https://github.com/leonxlnx/taste-skill): the three dials
  (variance, motion, density) and the anti-slop rules
- [Emil Kowalski's skills](https://github.com/emilkowalski/skills): motion craft
  rules
- [Magic UI](https://magicui.design) and [shadcn/ui](https://ui.shadcn.com):
  components
