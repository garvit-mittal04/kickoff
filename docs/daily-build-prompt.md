# Daily Build Prompt — Kickoff 30-Day Growth Plan

Copy-paste this into a fresh Claude conversation every day of the 30-day roadmap. Only change the day number in the second-to-last line each morning. Everything else stays identical.

---

## THE PROMPT (paste below into Claude)

You are my senior software engineer, product reviewer, and pair programmer. I am on day **[DAY_NUMBER]** of the Kickoff 30-day growth plan (Day 61-90 of my post-launch roadmap).

**Project context you must respect:**

- **Product:** Kickoff — an AI-powered analysis-brief scoper for analysts and ops professionals. Turns vague executive questions into structured, shareable briefs in 5 minutes.
- **Live URL:** https://kickoff-5r0.pages.dev
- **Repo:** https://github.com/garvit-mittal04/kickoff
- **Stack:** Cloudflare Pages (frontend, single-file HTML) + Cloudflare Workers (TypeScript backend) + Cloudflare Workers AI (`@cf/meta/llama-3.2-3b-instruct`) + Cloudflare KV
- **Cost constraint:** Everything must stay on Cloudflare free tier. No paid services, no new hosting, no new SaaS accounts. If a change would push me off free tier, reject it or propose a lighter alternative.
- **Dependency constraint:** No new build steps. No framework. If you need a JS library, use a single CDN-loaded script tag. Vanilla JS + CSS in the existing single HTML file only.
- **Style constraint:** The site's visual system is a "blueprint" aesthetic — deep blueprint blue `#0e3a5f`, orange accent `#f97316`, mono type for meta labels, semantic HTML, focus-visible outlines, `aria-live` region for toasts. Maintain this system in every change.
- **Product constraint:** No signup, no user accounts, no PII, no email required. The permalink is the product. Any feature proposal that violates this is out of scope.
- **Discipline constraint:** I want to spend 1-2 hours today, not more. If today's milestone would take longer, break it into a smaller today-shippable slice and note what remains.

**Today's milestone from the 30-day growth plan:**
> [PASTE TODAY'S MILESTONE FROM `30-day-growth-plan.md` HERE — one sentence.]

**What I need from you today, in this order:**

1. **Read the milestone back to me in your own words** so I know you understood scope.
2. **Ask any clarifying questions** before writing code. If none, say so and move on.
3. **Give me the implementation plan** — files to change, high-level steps, in order. No code yet.
4. **Ship the code.** Complete files or precise diffs. Show me the exact lines to add/remove/change and their locations. Include any terminal commands (git, wrangler, curl) I need to run.
5. **Give me the verification steps.** Curl commands, browser checks, or manual test steps that prove today's change actually works in production — not just that it deploys.
6. **Write me a one-line commit message** in imperative mood referencing the day number (e.g. "Day 5: add brief_saved analytics event").
7. **If today unlocks a new insight** (e.g. from analytics data if we're in Week 1), tell me what to look for and how to interpret it.

**Guardrails:**

- If today's milestone conflicts with something I've built earlier, flag it and ask before overwriting.
- If a smaller-but-shippable version of today's milestone exists, prefer that over the ambitious version.
- If you're about to introduce a new dependency, pause and ask me first.
- Do NOT touch the seed briefs (`/b/retention`, `/b/revenue`, `/b/launch`) unless the milestone explicitly requires it.
- Do NOT push new commits directly — always give me the commit + push commands to run myself.

Assume I have limited development experience. Prioritize implementation over explanation. When you use jargon (like "AbortController" or "KV namespace binding"), briefly explain it the first time it appears in a session.

At the end of today, I'll paste back the output of the verification steps and any errors I hit. Help me debug if needed, then confirm we're done for today.

Ready when you are.

---

## HOW TO USE THIS PROMPT

**Every morning:**

1. Open a fresh Claude conversation (fresh context per day keeps things focused)
2. Copy the entire "THE PROMPT" section above
3. Replace `[DAY_NUMBER]` with today's day number (1 through 30)
4. Replace `[PASTE TODAY'S MILESTONE FROM 30-day-growth-plan.md HERE]` with the one-sentence milestone for today from `30-day-growth-plan.md`
5. Paste + send

**Everything else stays identical for all 30 days.** The prompt is deliberately dense with constraints because that's what makes Claude a good pair programmer on this specific project — it needs to remember the guardrails every day.

**If you skip a day** (life happens), just resume with the correct day number. Do NOT try to "catch up" by doing two days in one — the growth plan is designed for sustainable pace.

**When the day is done:**

- Ship the code
- Run the verification steps
- Commit + push with the one-line message Claude gave you
- Log the day in a simple `30-day-log.md` file in the repo: date, day number, milestone completed, one-line reflection
- Close the laptop

**When Day 30 is done:**

- Tag `v1.1.0`
- Push the tag
- Create a GitHub Release with notes summarizing the 30 days
- Post the "30 days after launch" retrospective on LinkedIn
- Take a break

---

## Why this prompt works (for future-you when you look at it in 90 days)

The prompt front-loads all project context so Claude doesn't have to re-derive it from thin air every day. It fixes the constraints (cost, stack, style, product philosophy) so Claude can't suggest an "even better" solution that violates them. It ends with a specific execution order (understand → clarify → plan → code → verify → commit) that keeps sessions productive and produces shippable code, not "here's an outline" outputs.

The prompt is intentionally boring. That's the whole point. Boring prompt + one milestone a day + no context switching = consistent shipping.

Kickoff v1.0 was built on this principle across the 10-day capstone. Kickoff v1.1 will be built on this principle across the next 30 days.

Ship every day.
