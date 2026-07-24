import { callAI, type AIBinding, type Message } from '../lib/ai';
import { DECOMPOSITION_PROMPT, CANNED_QUESTIONS } from '../lib/prompts';
import { validateInterviewBody } from '../lib/validation';

export async function handleInterview(request: Request, env: { AI: AIBinding }): Promise<Response> {
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

  const messages: Message[] = [
    { role: 'system', content: DECOMPOSITION_PROMPT },
    { role: 'user', content: `The exec question I received:\n\n"${originalQuestion}"` },
  ];
  for (const entry of transcript) {
    messages.push({
      role: entry.role === 'model' ? 'assistant' : 'user',
      content: entry.text,
    });
  }

  const priorClarifierCount = transcript.filter(t => t.role === 'model').length;
  if (priorClarifierCount >= 6) {
    return new Response(JSON.stringify({ clarifier: null, isReady: true, turnNumber: priorClarifierCount + 1 }), { status: 200, headers: cors });
  }

  let raw: string;
  try {
    raw = await callAI(env.AI, messages, { maxTokens: 250, temperature: 0.7 });
  } catch (err: any) {
    console.error('AI interview call failed:', err?.message || err);
    const fallback = CANNED_QUESTIONS[Math.min(priorClarifierCount, CANNED_QUESTIONS.length - 1)];
    return new Response(JSON.stringify({
      clarifier: fallback,
      isReady: false,
      turnNumber: priorClarifierCount + 1,
      fallback: true,
    }), { status: 200, headers: cors });
  }

  const isReady = /^\s*READY:?\s*$/i.test(raw) || raw.trim().toUpperCase() === 'READY';
  if (isReady) {
    return new Response(JSON.stringify({ clarifier: null, isReady: true, turnNumber: priorClarifierCount + 1 }), { status: 200, headers: cors });
  }

  return new Response(JSON.stringify({
    clarifier: raw,
    isReady: false,
    turnNumber: priorClarifierCount + 1,
  }), { status: 200, headers: cors });
}
