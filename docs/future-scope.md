# Kickoff — Future Scope

How Kickoff can evolve over the next 3, 6, and 12 months. Written for a solo maintainer with limited time, biased toward changes that either (a) grow distribution or (b) deepen the core product for existing users. Every item stays on the Cloudflare free tier unless explicitly noted.

---

## 3 months (v1.0 → v1.2)

**Instrument the product.** No decisions can be made without a funnel view. Add Cloudflare Web Analytics on Day 1 post-launch. Add custom events for `homepage_view`, `interview_started`, `interview_completed`, `brief_saved`, `permalink_opened`. Ship a private admin `/stats` page (read-only, IP-restricted) that renders funnel counts from KV so you don't need a third-party analytics dashboard.

**Expand the seed brief library from 3 to ~15.** Cover the most-searched categories from your analytics: SaaS growth, ops staffing, marketing budget, product launch, hiring, fundraising, board deck prep. Each seed brief doubles as SEO landing content.

**Ship per-brief Open Graph images.** Every saved brief gets a dynamically rendered OG card (via Cloudflare Worker + `og-image-worker` pattern). When a user shares `/b/xyz` on LinkedIn, the preview card shows the brief's actual question — dramatically higher click-through than a generic card.

**Add download formats.** PDF, Word, plain markdown. The brief is often the artifact that needs to end up in a Google Doc or emailed to an exec. Free-tier PDF generation via a tiny Worker calling `@vercel/og` equivalent, or client-side via `jsPDF`.

**Ship v1.2 with the above.** Write a "3 months of Kickoff" retrospective post.

---

## 6 months (v1.2 → v2.0)

**Multi-brief workspaces (still no auth).** A user can generate 3-4 related briefs (baseline / diagnosis / remediation) that link to each other via slug references. Everything still permalink-first, still no signup — the workspace is just a hub URL that lists the child briefs.

**Interview quality upgrade.** Move from Llama 3.2 3B to Llama 3.3 70B (still on Workers AI free tier if under the neuron budget) for the interviewer role only, keeping the smaller model for the brief-generation role where latency matters more. Higher-quality clarifiers = better final briefs.

**Add prompt injection defenses.** Post-launch, real users will paste hostile prompts to test edge cases. Add a system-prompt reinforcement layer + basic keyword filtering. Not paranoid, but defended.

**Optional lightweight account layer.** Not required for use — the permalink-first experience stays default. But for users who want their saved-briefs sidebar to persist across devices, offer opt-in email-only login (magic link via Cloudflare Turnstile + Workers KV). No password. No profile.

**Community layer.** Public GitHub Discussions for feedback + `/showcase` page that lists (with owner permission) the best real briefs users have generated. Real analyst work as social proof.

**Publish 3 case studies.** Real users (nonprofits, small SaaS teams) walk through a real brief they used Kickoff to write and the analysis outcome. This is the single highest-conversion marketing move for a tool like this.

**Ship v2.0.** Rebrand from "solo capstone" to "used by X analysts across Y organizations" if the numbers justify.

---

## 12 months (v2.0 → v3.0)

**Kickoff for teams.** A team can share a private brief library at `kickoff.io/t/team-slug`. Still no complex auth — teams share a single access token they distribute internally. Perfect for a 5-analyst team at a nonprofit or the ops team at a Series A. This is where a paid tier could sensibly emerge ($10/mo per team, unlimited briefs, private workspace).

**Integration with the tools analysts actually use.** One-click send-to-Slack. Embed-in-Notion via oEmbed. Export-to-Linear. Push-to-Confluence. Every integration removes one copy-paste step and dramatically increases weekly-active-analyst usage.

**A "brief → dashboard scaffold" companion tool.** After the brief is written, the analyst clicks "generate SQL scaffold" and Kickoff produces starter SQL (or LookML, or dbt) for the sub-questions it identified. Now the tool spans the whole "vague ask → refined ask → first draft of the analysis" arc.

**Public API.** Every operation that works via the UI becomes an authenticated REST endpoint. Analytics platforms, notebook environments, and workflow tools (n8n, Zapier) can integrate. This is where an OSS project either becomes infrastructure or plateaus as a demo.

**A yearly Kickoff Report.** Publish anonymized analytics on the most-asked exec question categories, the most common misalignments between exec intent and analyst interpretation, and what a well-scoped analysis looks like across industries. This becomes the primary content marketing asset and drives inbound.

**Ship v3.0.** By this point Kickoff is either (a) a modest side-project bringing in $500-2000/mo from team subscriptions, or (b) has been acquired by an analytics platform (Hex, Mode, Metabase) as a scoping onboarding step. Both outcomes are wins.

---

## Explicitly out of scope (the "won't do" list)

Every roadmap needs a won't-do list to stay honest.

- **Full user profiles / social features / following other analysts.** Kickoff is a scoping tool, not a social network.
- **Real-time collaboration on a single brief.** Overhead > value for the target user. Users can just share the permalink and comment async.
- **Native mobile apps.** The web app is already mobile-responsive. Native adds a maintenance surface disproportionate to its value.
- **Multi-model LLM switching.** Users don't care what model wrote the brief; they care that it's good. Complexity without user benefit.
- **A paid tier before there's clear organic pull.** Adding pricing to a $0-cost product without demand is the fastest way to kill it.

---

*Living document. Reviewed monthly. Deprecated / done items get struck through, not deleted.*
