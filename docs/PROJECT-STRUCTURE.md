# Kickoff — Project Folder Structure

**Version:** 1.0
**Date:** Day 52 · Capstone Day 2
**Repo:** `garvit-mittal04/kickoff`
**Deployment topology:** Cloudflare Pages (frontend, from `public/`) + Cloudflare Workers (backend, from `api/`)

---

## 1. Top-level structure

```
kickoff/
├── README.md                    # Project overview + quickstart
├── LICENSE                      # MIT
├── .gitignore                   # Node + editor + env files
│
├── public/                      # Static frontend files (Cloudflare Pages)
│   ├── index.html               # Single-file frontend (Day 54)
│   ├── favicon.ico              # Browser tab icon
│   ├── favicon-32.png           # High-res favicon
│   ├── og-image.png             # 1200x630 social preview image
│   └── _redirects               # SPA routing rule for /b/:slug
│
├── api/                         # Cloudflare Workers backend (Day 53)
│   ├── wrangler.toml            # Worker config: bindings, routes, secrets
│   ├── package.json             # dependencies (@cloudflare/workers-types)
│   ├── tsconfig.json            # TypeScript config
│   ├── src/
│   │   ├── index.ts             # Worker entry point + router
│   │   ├── endpoints/
│   │   │   ├── interview.ts     # POST /api/interview handler
│   │   │   ├── brief.ts         # POST /api/brief handler
│   │   │   ├── save.ts          # POST /api/save handler
│   │   │   ├── retrieve.ts      # GET /api/brief/:slug handler
│   │   │   └── health.ts        # GET /api/health handler
│   │   ├── lib/
│   │   │   ├── anthropic.ts     # Wrapper around Anthropic Messages API
│   │   │   ├── ratelimit.ts     # IP-hash-based rate limiter
│   │   │   ├── validation.ts    # Request body validation helpers
│   │   │   └── prompts.ts       # Decomposition + brief-generation prompts as constants
│   │   └── types.ts             # Shared TypeScript types (Session, Brief, etc.)
│   └── README.md                # API-specific dev instructions
│
├── design/                      # Design decisions + assets
│   ├── prompts.md               # Hand-tuned Claude prompts (Day 52 evening)
│   ├── wireframes/              # Low-fi wireframe PNGs
│   │   ├── landing.png
│   │   ├── interview.png
│   │   ├── brief-output.png
│   │   └── permalink-viewer.png
│   └── design-tokens.md         # Colors, fonts, spacing scale
│
├── docs/                        # Living technical documentation
│   ├── ARCHITECTURE.md          # System architecture (this doc set)
│   ├── SCHEMA.md                # Data schema
│   ├── API.md                   # API contract
│   ├── UI-WIREFRAMES.md         # UI and user flow
│   ├── PROJECT-STRUCTURE.md     # This file
│   ├── v2-parking-lot.md        # Feature requests deferred from v1.0
│   ├── beta-log.md              # Beta feedback tracker (Day 58)
│   └── kickoff-prd-v1.pdf       # Copy of yesterday's PRD, for reference
│
└── launch/                      # Launch-day assets (Day 59-60)
    ├── linkedin-post.md
    ├── linkedin-carousel.pdf
    ├── reddit-analytics.md
    ├── reddit-dataanalysis.md
    ├── reddit-nonprofit.md
    ├── outreach-templates.md
    └── day-60-timeline.md
```

---

## 2. What each major folder is responsible for

### `public/` — Frontend deployment target

**Responsibility:** everything Cloudflare Pages serves as static assets.

- Single-file `index.html` is the entire frontend: hero, interview modal, brief view, permalink viewer. All CSS and JavaScript embedded inline. No build step.
- `_redirects` file rewrites `/b/:slug` requests to `index.html` so client-side routing works (the JS reads `window.location.pathname` on load).
- Favicons and OG image live here for standard web conventions.

**Deploys automatically:** Cloudflare Pages is wired to the `main` branch. Every `git push` to main redeploys `public/` in ~30 seconds.

### `api/` — Backend Worker

**Responsibility:** the Cloudflare Worker that proxies Anthropic calls, enforces rate limits, and reads/writes KV.

- `wrangler.toml` declares KV namespace bindings (`KICKOFF_BRIEFS`, `KICKOFF_SESSIONS`, `KICKOFF_RATELIMIT`), routes, and the `ANTHROPIC_API_KEY` secret.
- `src/index.ts` is the main entry: parses the URL, dispatches to the right handler in `endpoints/`.
- `src/endpoints/` — one handler per API endpoint (small files, easy to read).
- `src/lib/` — reusable helpers. Anthropic API wrapper, rate limiter, validation, prompt constants.
- `src/types.ts` — TypeScript types shared across the Worker.

**Deploys via:** `wrangler deploy` from inside `api/`. Manual for v1.0 (we're not auto-deploying the backend on every commit — safer).

### `design/` — Design decisions + non-code assets

**Responsibility:** wireframes, design tokens, and the hand-tuned Claude prompts that shape the AI's behavior.

- `prompts.md` is the two prompts (decomposition + brief-generation) in their canonical form. If they change, they change here, and get copied into `api/src/lib/prompts.ts`. Single source of truth.
- `wireframes/` — the low-fi PNGs referenced in UI-WIREFRAMES.md.
- `design-tokens.md` — colors, fonts, spacing scale. Referenced from `public/index.html`'s inline CSS.

### `docs/` — Living technical documentation

**Responsibility:** every technical decision that outlives a single work session.

- Five docs from Day 52: ARCHITECTURE, SCHEMA, API, UI-WIREFRAMES, PROJECT-STRUCTURE.
- `v2-parking-lot.md` catches every feature request that arrives during beta and after launch. Zero features get added to v1.0 after Day 54 — they all land here.
- `beta-log.md` tracks Day 58 beta feedback: bugs, categorized by severity.
- Reference copies of the PRD, Blueprint, and Pitch Deck from Day 51 live here too (so a mentor reviewing the repo has full context).

### `launch/` — Launch-day artifacts

**Responsibility:** everything created Day 59 for Day 60 launch.

- LinkedIn post text + carousel/visual assets.
- Reddit posts (one per subreddit).
- Outreach templates.
- The Day 60 timeline (times, actions, screenshots to capture).

---

## 3. Where future code will live

| What | Where | When |
|---|---|---|
| Frontend HTML | `public/index.html` | Day 54 (built) → refined Days 55, 57 |
| Worker entry point | `api/src/index.ts` | Day 53 |
| Endpoint handlers | `api/src/endpoints/*.ts` | Day 53 (interview + health), Day 55 (brief), Day 56 (save + retrieve) |
| Anthropic wrapper | `api/src/lib/anthropic.ts` | Day 53 |
| Rate limiter | `api/src/lib/ratelimit.ts` | Day 53 |
| Prompts (canonical) | `design/prompts.md` | Day 52 evening |
| Prompts (in code) | `api/src/lib/prompts.ts` | Day 53 (imported by handlers) |
| Wireframes | `design/wireframes/*.png` | Day 52 evening |
| OG image + favicons | `public/assets/` | Day 57 |
| Launch content | `launch/*.md` | Day 59 |

---

## 4. Why this structure

**Small footprint.** Every folder has a clear responsibility. No `src/` at the top level because `public/` and `api/` deploy to different services and would confuse Cloudflare's auto-detection.

**Frontend and backend are separate deployables.** `public/` goes to Cloudflare Pages. `api/` goes to Cloudflare Workers. They talk over HTTPS. This means either can be updated independently.

**Zero build step for the frontend.** `public/index.html` is a real HTML file. Open it in a browser locally, works. No webpack, no Vite, no bundler. Same architecture as 50 prior single-file HTML builds in this challenge.

**Design decisions are versioned.** `design/prompts.md` and `docs/*.md` are in the repo, tracked, reviewable via `git diff`. Prompt engineering IS engineering — treated as such.

**Room to grow, no premature abstraction.** No `src/components/`, no `src/utils/`, no `src/hooks/`. If v2 needs those, v2 will earn them. v1.0 uses the flattest structure that works.

---

## 5. .gitignore contents

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Wrangler
.wrangler/
.dev.vars
wrangler.toml.bak

# Environment
.env
.env.local
.env.*.local

# Build outputs (none for v1.0, but reserving)
dist/
build/
.next/
.output/
.nuxt/

# Editor
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
Thumbs.db
```

---

## 6. What's NOT in the structure

**Explicit exclusions from v1.0:**

- No `src/components/` — no framework, no components
- No `tests/` — v1.0 has manual QA + beta testing, not automated tests
- No `.github/workflows/` — no CI/CD for v1.0 (Cloudflare Pages auto-deploys on push, that's enough)
- No `docker/` — no containers
- No `terraform/` or `pulumi/` — no IaC (Cloudflare dashboard for the tiny bit of manual setup)
- No `migrations/` — KV needs no migrations
- No `types/` at top level (types live inside `api/src/types.ts`)

Everything on this list is a good idea. Nothing on this list is v1.0.

---

*End of PROJECT-STRUCTURE.md v1.0 — Day 52 of 60*
