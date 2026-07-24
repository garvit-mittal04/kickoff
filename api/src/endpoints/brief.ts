/**
 * endpoints/brief.ts — POST /api/brief
 *
 * Generates the final structured brief from a completed interview transcript.
 * Called once, after /api/interview returns isReady: true.
 *
 * Request:  { originalQuestion: string, transcript: Array<{role, text}> }
 * Response: { briefMarkdown: string }
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

  // Assemble a plain-text transcript for the model
  const transcriptText = transcript.map((t, i) => {
    return t.role === 'model' ? `[Clarifier ${Math.floor(i/2) + 1}] ${t.text}` : `[Analyst answer] ${t.text}`;
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
    return new Response(JSON.stringify({ error: 'ai_generation_failed', message: 'The brief could not be generated. Please try again.' }), { status: 502, headers: cors });
  }

  // Basic sanity check: brief should contain the expected section headers
  const hasQuestionSection = /##\s+The Question/i.test(raw);
  const hasSubqSection = /##\s+Sub-questions/i.test(raw);
  if (!hasQuestionSection || !hasSubqSection) {
    return new Response(JSON.stringify({
      briefMarkdown: raw,
      warning: 'brief_may_be_malformed',
    }), { status: 200, headers: cors });
  }

  return new Response(JSON.stringify({ briefMarkdown: raw }), { status: 200, headers: cors });
}
