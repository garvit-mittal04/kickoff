/**
 * endpoints/brief.ts — POST /api/brief
 *
 * Generates the final structured brief from a completed interview transcript.
 *
 * Day 58 hardening:
 *  - Reject too-short AI responses (< 300 chars) as generation failure
 *  - Warn when brief doesn't contain the expected core headers
 *
 * Request:  { originalQuestion: string, transcript: Array<{role, text}> }
 * Response: { briefMarkdown: string, warning?: string }
 */

import { callAI, type AIBinding, type Message } from '../lib/ai';
import { BRIEF_GENERATION_PROMPT } from '../lib/prompts';
import { validateInterviewBody } from '../lib/validation';

export async function handleBrief(request: Request, env: { AI: AIBinding }): Promise<Response> {
  const cors = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400, headers: cors });
  }

  const validated = validateInterviewBody(body);
  if (!validated.ok) {
    return new Response(JSON.stringify({ error: 'invalid_request', message: validated.error }), { status: 400, headers: cors });
  }
  const { originalQuestion, transcript } = validated.data;

  const transcriptText = transcript.map((t, i) => {
    return t.role === 'model'
      ? `[Clarifier ${Math.floor(i/2) + 1}] ${t.text}`
      : `[Analyst answer] ${t.text}`;
  }).join('\n\n');

  const userMessage = `Original exec question:\n"${originalQuestion}"\n\nInterview transcript:\n\n${transcriptText || '(No clarifiers were needed; the original question was specific enough.)'}\n\nProduce the structured brief now.`;

  const messages: Message[] = [
    { role: 'system', content: BRIEF_GENERATION_PROMPT },
    { role: 'user', content: userMessage },
  ];

  let raw: string;
  try {
    raw = await callAI(env.AI, messages, { maxTokens: 2000, temperature: 0.4 });
  } catch (err: any) {
    console.error('Brief generation AI call failed:', err?.message || err);
    return new Response(JSON.stringify({
      error: 'ai_generation_failed',
      message: 'The AI service could not produce a brief. Please try again in a moment.',
    }), { status: 502, headers: cors });
  }

  const briefMarkdown = raw.trim();

  // Day 58 hardening — reject too-short responses (likely refusal or error)
  if (briefMarkdown.length < 300) {
    console.error('Brief too short, likely AI refusal:', briefMarkdown.slice(0, 200));
    return new Response(JSON.stringify({
      error: 'brief_too_short',
      message: 'The AI returned an unexpectedly short brief. Please retry — often works on the second attempt.',
    }), { status: 502, headers: cors });
  }

  // Check structural quality — should have H2 headers for our canonical sections
  const hasQuestionSection = /##\s+The Question/i.test(briefMarkdown);
  const hasSubqSection = /##\s+Sub-questions/i.test(briefMarkdown);

  if (!hasQuestionSection || !hasSubqSection) {
    return new Response(JSON.stringify({
      briefMarkdown,
      warning: 'brief_may_be_malformed',
      message: 'The brief was generated but is missing expected sections. You can still save it.',
    }), { status: 200, headers: cors });
  }

  return new Response(JSON.stringify({ briefMarkdown }), { status: 200, headers: cors });
}
