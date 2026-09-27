# saywhat

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
bun run test    # self-checks: URL cleaning, rate limit, AI retries
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
message ─► Jev (one call, ~1s): intent, page type, components,
           and for edits: what kind of edit, on which element
   ├─ remove / change an option ─► code does it (no LLM, ~1s)
   └─ everything else ─► LLM: a sentence for the user, then JSON patches
preview ◄─ patches stream in and animate; chat shows each step live
```

| File                       | Job                                             |
| -------------------------- | ----------------------------------------------- |
| `src/App.tsx`              | Owns the spec, history (undo), mode, selection  |
| `src/ChatPanel.tsx`        | Chat UI (display only)                          |
| `src/chat.ts`              | Reads the server's event stream                 |
| `src/Preview.tsx`          | Runs in the iframe, renders whatever it is sent |
| `src/messages.ts`          | Messages between the app and the iframe         |
| `src/api.ts`               | Messages between the app and the server         |
| `src/catalog.ts`           | Components the AI may use (no React)            |
| `src/registry.ts`          | Component name → React component                |
| `src/patch.ts`             | Applies patches without changing the old spec   |
| `server/index.ts`          | `/api/chat`: Jev, then LLM, then validate       |
| `server/jev.ts`            | Jev decisions (TypeSafe)                        |
| `src/blocks/layout.tsx`    | Page, Navbar, Hero, Section, Footer             |
| `src/blocks/marketing.tsx` | FeatureGrid, PricingTable, Testimonials, ...    |
| `src/blocks/app.tsx`       | TabbedContent, Carousel, Marquee, AppShell, ... |
| `src/blocks/overrides.tsx` | Fixes to json-render's own components           |
| `src/components/ui/`       | shadcn + Magic UI (MIT) effects, via shadcn CLI |
| `server/outlines.ts`       | Page outline per type, picked by Jev            |
| `server/repair.ts`         | Fixes small model slips (missing brackets)      |
| `src/storage.ts`           | Saves the session in the browser                |
| `src/ErrorBoundary.tsx`    | Shows a message if a UI fails to render         |
| `server/design-rules.ts`   | Design instructions added to the AI prompt      |
| `server/sanitize.ts`       | Makes AI-written links and images safe          |
| `server/rate-limit.ts`     | Requests per visitor per minute                 |
| `server/static.ts`         | Serves the built app in production              |
| `server/llm.ts`            | LLM streaming (Google, NVIDIA)                  |

The LLM runs on your own free Google AI Studio and NVIDIA quotas, trying the
models in `LLM_MODELS` in order. Jev answers greetings without using the LLM.
