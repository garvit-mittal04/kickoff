# Kickoff — 30-Day Growth Plan (Day 61 → Day 90)

Every day = one achievable milestone. Each is scoped to ~1-2 hours (real time, not "in a coding blitz"). Nothing here breaks the free tier. Every day builds on the previous. The goal at Day 90: ship v1.1.0 with real user data behind the decisions.

---

## Week 1 — Instrument the product (Days 1-7)

**Day 1.** Enable Cloudflare Web Analytics on the Pages project. Verify the site tag fires by loading the homepage and checking the analytics dashboard within 15 minutes.

**Day 2.** Add a custom event `interview_started` when the user clicks "Start" on the homepage. Verify it fires in the analytics dashboard.

**Day 3.** Add a custom event `interview_answered` per clarifier answered. Include the clarifier index (1-6) as a property so we can see where users drop off.

**Day 4.** Add a custom event `brief_generated` on successful `/api/brief` response. Add a corresponding `brief_generation_failed` on error.

**Day 5.** Add a custom event `brief_saved` on successful `/api/save`. Add `permalink_opened` on every `GET /b/:slug`.

**Day 6.** Add a tiny read-only `/api/stats` endpoint (IP-restricted to your IP or a shared secret) that returns raw event counts from KV. No admin UI yet — just JSON.

**Day 7.** First analytics review. Look at the funnel: homepage → interview_started → interview_answered (per clarifier) → brief_generated → brief_saved → permalink_opened. Identify the single biggest drop-off. Write a 500-word "Week 1 numbers" post for LinkedIn.

---

## Week 2 — Content + distribution (Days 8-14)

**Day 8.** Add 2 more seed briefs (e.g. `/b/hiring` for a "should we hire another engineer?" scoping example, `/b/pricing` for "should we raise prices?"). Deploy.

**Day 9.** Add another 2 seed briefs (`/b/ops-staffing`, `/b/marketing-budget`). Now you have 7 seeded canonical examples covering 7 archetypal exec question categories.

**Day 10.** Rewrite the homepage introduction to explicitly call out "7 example scenarios from real analyst work." Add a small carousel or grid linking to each.

**Day 11.** Ship per-brief Open Graph images. Every saved brief gets a dynamically rendered OG card (via a tiny Worker route that produces a 1200×630 PNG with the brief's question as headline). Test by pasting a brief URL into a LinkedIn draft.

**Day 12.** Add "Share on LinkedIn" and "Share on X" buttons to the brief view. Pre-populate the share text with the brief question + a link.

**Day 13.** Write a 700-word blog post: "How to scope an exec question in 5 minutes." Publish on your GitHub Pages / personal blog. Link to Kickoff at the end.

**Day 14.** Cross-post Day 13 to dev.to, Medium, and Substack (if you have one). Each cross-post = 1 backlink to Kickoff and 1 new audience touch.

---

## Week 3 — Product depth (Days 15-21)

**Day 15.** Add a "Regenerate brief" button on the brief view. Same interview transcript, fresh AI call, replaces the current brief markdown.

**Day 16.** Add "Download as Markdown" — a simple browser blob download. One button, one utility function, ~20 lines of code.

**Day 17.** Add "Download as PDF" — client-side via `jsPDF` (CDN, ~50KB). Formatted with the same visual system as the brief view.

**Day 18.** Add "Copy for Notion" — copies the brief as Notion-friendly markdown (Notion has some markdown quirks; test one before/after).

**Day 19.** Add an inline "Edit brief" mode. User can tweak the generated markdown before saving. Saves the edited version.

**Day 20.** Add "Clone this brief" from any permalink. Creates a new draft pre-filled with the current brief's question, useful for iterating on the same exec ask.

**Day 21.** Ship a "Week 3 changelog" post on LinkedIn covering all six new features. Solicit feedback specifically on which one gets the most excitement.

---

## Week 4 — Retention + community + v1.1 (Days 22-30)

**Day 22.** Add a `localStorage`-based "recent briefs on this device" sidebar. Only visible to users who've saved at least one brief. Purely client-side, no backend changes.

**Day 23.** Add search across the sidebar (client-side, no backend). Instant filter as user types.

**Day 24.** Ship a `/starters` page — a curated library of "starter templates" (the 7 seed briefs plus 5-10 more) organized by archetype (retention, growth, staffing, ops, product, marketing, hiring). This becomes the primary discovery surface.

**Day 25.** Enable GitHub Discussions on the Kickoff repo. Post the first two threads: "What's your favorite exec question archetype?" and "What feature would you use most?"

**Day 26.** Add a homepage callout linking to GitHub Discussions for feedback / feature requests. Mention it in a small LinkedIn post.

**Day 27.** Prompt tuning pass. Look at the last 30 days of generated briefs (via `/api/stats`). Identify the 3 most common failure modes (bad section, weak hypotheses, missing data sources). Adjust the BRIEF_GENERATION_PROMPT accordingly. Ship.

**Day 28.** Update the README with the new features. Update the OG image if the visual has evolved. Update the "Try it" section with the 7 seeded briefs.

**Day 29.** Tag `v1.1.0`. Push the tag. Create a GitHub Release with release notes covering all Week 1-4 improvements.

**Day 30.** Publish a "30 days after launch" retrospective post on LinkedIn. Include real analytics numbers (total briefs generated, unique visitors, biggest drop-off point identified in Week 1, most-used feature from Weeks 3-4). Thank the first 5 users by name (with permission).

---

## Guardrails throughout the 30 days

- **Free tier only.** If a proposed change would push you off free tier, reject it or find a lighter alternative.
- **No new dependencies.** Every day's change should either use existing dependencies or a single CDN-loaded library.
- **Ship every day.** Even a 10-line commit counts. The habit is the point.
- **One post per week.** Not more. Not less. Week 1 numbers, Week 3 changelog, Week 4 retrospective.
- **No sprints. No blitzes.** 1-2 hours per day. Sustainable pace beats heroic pace over 30 days.

---

## Success criteria (measured on Day 30)

- ✅ Cloudflare Web Analytics live with a full funnel view since Day 1
- ✅ 7-12 seed briefs live and linked from the homepage
- ✅ At least 3 new user-facing features (regenerate / download / clone)
- ✅ Public GitHub Discussions with at least 5 threads
- ✅ v1.1.0 tagged and released with meaningful release notes
- ✅ 4 LinkedIn posts over 30 days documenting progress
- ✅ At least 2 real testimonials from users who used Kickoff on a real exec question
- ✅ Traffic (unique visitors) grew week-over-week for 3 of the 4 weeks

If you hit 6 of these 8, the 30 days were a success. If you hit 3, you learned something important about where the product actually needs to go — pivot with data.
