# Reddit Launch Posts — Day 60

Three subreddit-tuned posts. Each one respects the community's tone and rules:
- **No self-promotion in title.** Titles are questions or observations, not ads.
- **Value first, link second.** The post body earns the click.
- **Never repost the same wording across subs.** Reddit's cross-detection will nuke it.

Post them one at a time, spaced 2-3 hours apart, on launch day.

---

## 1. r/analytics

**TITLE:** I got tired of executives asking "why is retention down?" and expecting a real answer in 24 hours, so I built a tool to scope the question first. Feedback wanted.

**BODY:**

Analyst here. Every job I've had, the same pattern happens: an executive drops a one-line question in Slack ("why is churn up this month?"), the analyst has 24 hours to respond, and there's zero shared understanding of what "up" means, over what period, for which segment, or what decision the exec is trying to make.

You go do the analysis, present it, and the exec says "no I meant enterprise churn, not SMB" — and now you've wasted a day.

I built a tiny scoping tool called Kickoff. You paste the vague exec question. It runs a 5-minute AI interview to probe baseline, segments, definitions, and downstream decisions. Then it produces a structured brief you can send the exec BEFORE you start the analysis to confirm scope.

The brief includes:
- The refined question (unambiguous)
- Ranked sub-questions
- Stack-ranked hypotheses
- Data sources needed
- What "success" for the analysis looks like

Free. No signup. Permalink you can share.

Three example briefs you can look at (no interview required):
- Nonprofit retention drop: https://kickoff-5r0.pages.dev/b/retention
- SaaS Q3 revenue variance: https://kickoff-5r0.pages.dev/b/revenue
- Product launch go/no-go: https://kickoff-5r0.pages.dev/b/launch

Or paste your own real exec question at https://kickoff-5r0.pages.dev

What I'm looking for from this community:
1. Does the brief format match what you'd actually send an exec, or does it feel too "AI-generated"?
2. What's missing that would make you use this on a real Monday-morning question?
3. Any prompt patterns you'd add?

Feedback is genuinely wanted. This is v1.

---

## 2. r/dataanalysis

**TITLE:** Free tool: turn vague stakeholder questions into structured analysis briefs before you touch SQL

**BODY:**

I built this because I kept starting analyses that turned out to be answering the wrong question. Sharing it because you might find it useful.

**What it does:** You paste any vague stakeholder question ("why did numbers change?", "should we do X?", "what happened with segment Y?"). It runs a short AI-powered interview to probe scope, segments, baseline, timeframe, and the actual decision behind the ask. Then it generates a structured brief you can send back for scope alignment.

**Why it exists:** Because "the ask → the SQL" gap is where 60% of analyst time gets wasted. Kickoff is that intermediate step you always wished you had time for.

**What it costs:** $0. No signup. No account. No API key. The permalink itself is the deliverable.

**Try it:** https://kickoff-5r0.pages.dev
Sample briefs: /b/retention, /b/revenue, /b/launch

Built as a solo project — genuinely want feedback from working analysts on whether the brief format is useful. What would you add, remove, or change?

Tech notes for the curious: Cloudflare Pages + Workers + Workers AI (Llama 3.2 3B) + KV. Entire stack on free tier.

Source is MIT: https://github.com/garvit-mittal04/kickoff

---

## 3. r/nonprofits

**TITLE:** Built a free tool for nonprofit ops teams — turn "why are donations down?" into a structured analysis plan in 5 minutes

**BODY:**

I've been helping a couple of small nonprofits with data work, and the biggest recurring issue isn't the analysis itself. It's that leadership asks questions like:

- "Why are donations down this quarter?"
- "Are we losing volunteers?"
- "Is program X actually working?"

...and the ops person has no shared understanding with leadership on what data would answer that, what segments to look at, or what decision the answer would drive.

So I built a small free tool called Kickoff. You paste the leadership question. It walks you through a 5-minute AI interview to scope it properly. You get a shareable brief you can send back to your ED before you spend a week doing the wrong analysis.

**Free, no signup, no personal data collected.** The permalink is the product — send it to leadership, they can read it in 2 minutes.

Example brief for a "why are we losing recurring donors?" style question: https://kickoff-5r0.pages.dev/b/retention

Try it with your own real question: https://kickoff-5r0.pages.dev

Genuinely built for small-org ops folks who don't have a dedicated data team but keep getting asked data questions anyway. Would love your feedback — what breaks, what's missing, what would make you actually use it in your role?

---

## POSTING SCHEDULE (Day 60)

- 09:00 AM local — r/analytics
- 11:30 AM local — r/dataanalysis
- 02:00 PM local — r/nonprofits

Reply to every comment within the first 2 hours. Reddit rewards early comment velocity in ranking.

## RULES TO FOLLOW

- Do NOT crosspost — write each one fresh.
- Do NOT use link shorteners (Reddit spam-filters them).
- If a mod removes the post, do NOT reargue — thank them and ask what would be acceptable.
- Track upvote count + comment count at 1h, 6h, 24h in a small spreadsheet.
