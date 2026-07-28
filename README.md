# Kickoff

> The analysis brief you write **before** you write any SQL.

[![Live](https://img.shields.io/badge/live-kickoff--5r0.pages.dev-7c3aed?style=flat-square)](https://kickoff-5r0.pages.dev)
[![Free](https://img.shields.io/badge/cost-%240%20forever-10b981?style=flat-square)](https://kickoff-5r0.pages.dev)
[![Built with Claude](https://img.shields.io/badge/built%20with-Claude-22d3ee?style=flat-square)](https://claude.ai)
[![License: MIT](https://img.shields.io/badge/license-MIT-a4acbd?style=flat-square)](LICENSE)

**Live:** https://kickoff-5r0.pages.dev
**Example brief:** https://kickoff-5r0.pages.dev/b/retention

---

## What Kickoff is

A scoping tool for analysts and operations professionals at nonprofits and mid-market companies. Turn any vague exec question ("why is retention down?") into a structured, shareable analysis brief in five minutes.

**The problem:** Executives ask questions that are not yet answerable. "Why is retention down?" is not one data question — it's ten data questions in a trench coat. The analyst either guesses wrong and spends four hours on the wrong analysis, or asks a clarifier in Slack and waits six hours.

**The solution:** Kickoff runs a short AI-powered interview to decompose the ask, rank hypotheses, and name the data sources. The output is a shareable permalink you send to the exec for scope alignment BEFORE you touch the warehouse.

---

## Try it

**Example briefs** (no interview needed):
- [Nonprofit retention drop →](https://kickoff-5r0.pages.dev/b/retention)
- [SaaS Q3 revenue variance →](https://kickoff-5r0.pages.dev/b/revenue)
- [Product launch go/no-go →](https://kickoff-5r0.pages.dev/b/launch)

**Or paste your own** exec question at https://kickoff-5r0.pages.dev

---

## How it works

1. **Paste the vague ask** — copy the exec question exactly as it arrived
2. **Answer 4-6 clarifiers** — adaptive AI follow-ups probe baseline, segments, definitions, downstream decisions
3. **Share the permalink** — every brief gets a stable URL you can send to your exec for scope sign-off

Total time: ~5 minutes.

---

## Tech stack

| Layer | Choice | Cost |
|---|---|---|
| Frontend | Single-file HTML + vanilla CSS/JS (no framework, no CDN) | free |
| Hosting | Cloudflare Pages | free |
| Backend | Cloudflare Workers (TypeScript) | free tier: 100k req/day |
| AI | Cloudflare Workers AI · `@cf/meta/llama-3.2-3b-instruct` | free tier: 10k neurons/day |
| Storage | Cloudflare KV | free tier: 100k reads / 1k writes daily |

**Total monthly cost at launch scale: $0.00.** No signup, no API key, no credit card.

---

## Architecture

```
Browser (index.html)
    ├── POST /api/interview  → adaptive Q&A (Workers AI)
    ├── POST /api/brief      → generate structured brief (Workers AI)
    ├── POST /api/save       → persist brief, return slug (KV)
    └── GET  /api/brief/:slug → retrieve brief (KV)
                                ↓
                    Cloudflare Worker (api/src/index.ts)
                                ↓
                    Cloudflare KV (KICKOFF_BRIEFS)
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full system design.

---

## Repo structure

```
kickoff/
├── public/          # Frontend deployed to Cloudflare Pages
│   ├── index.html   # Single-file app (~50 KB)
│   ├── 404.html     # Custom not-found page
│   ├── _redirects   # SPA fallback for /b/:slug
│   ├── favicon-32.png
│   └── og-image.png
├── api/             # Cloudflare Worker (backend)
│   ├── src/
│   │   ├── index.ts               # Router
│   │   ├── endpoints/             # /interview /brief /save /retrieve
│   │   └── lib/                   # ai · prompts · validation
│   └── wrangler.toml
├── docs/            # Living documentation
│   ├── ARCHITECTURE.md
│   ├── SCHEMA.md
│   ├── API.md
│   ├── UI-WIREFRAMES.md
│   ├── PROJECT-STRUCTURE.md
│   ├── SETUP.md
│   └── ENVIRONMENT.md
├── design/          # Wireframes + canonical prompts
├── launch/          # Day 60 launch content (posts, outreach, timeline)
└── README.md
```

---

## Run locally

**Prerequisites:** Node 20+, a Cloudflare account (free).

```bash
git clone https://github.com/garvit-mittal04/kickoff.git
cd kickoff

# Backend
cd api
npm install
npx wrangler login          # one-time OAuth
npx wrangler dev            # → http://localhost:8787

# Frontend (in a new terminal)
open ../public/index.html   # opens directly in browser
```

For the frontend to talk to your local Worker instead of production, edit the `API_BASE` constant in `public/index.html`.

Full setup guide: [`docs/SETUP.md`](docs/SETUP.md).

---

## Deploy

Backend:

```bash
cd api && npx wrangler deploy
```

Frontend:

```bash
cd .. && npx wrangler pages deploy public --project-name=kickoff
```

Custom domain setup, KV namespace bindings, and secret management: see [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md).

---

## Built as part of the #60DayClaudeChallenge

Kickoff is the capstone project of the [AB Talks 60-Day Claude AI Challenge](https://www.linkedin.com/in/anilbajpai/). Days 51-60 of the challenge were spent building this product end to end, in public.

- **Day 51** — Product discovery + PRD + Blueprint + Pitch Deck
- **Day 52** — System design (5 technical docs)
- **Day 53** — Project setup + Hello World Worker
- **Day 54** — Full frontend UI shell + deployed
- **Day 55** — Live AI wired in
- **Day 56** — MVP complete: real permalinks + KV
- **Day 57** — Product refinement + UX pass
- **Day 58** — Release audit + hardening
- **Day 59** — Launch prep
- **Day 60** — Launch

Daily writeups: [garvit-mittal04/claude-60-days-challenge](https://github.com/garvit-mittal04/claude-60-days-challenge)

---

## License

MIT © [Garvit Mittal](https://github.com/garvit-mittal04)

See [LICENSE](LICENSE) for the full text.

---

## Contact + feedback

- Issues + feature requests: [GitHub Issues](https://github.com/garvit-mittal04/kickoff/issues)
- LinkedIn: [Garvit Mittal](https://www.linkedin.com/in/garvit-mittal04/)
- If you use Kickoff on a real exec question, I'd love to hear whether the brief actually helped scope your analysis. Drop a note.
