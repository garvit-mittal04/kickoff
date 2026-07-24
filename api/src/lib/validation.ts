/**
 * validation.ts — request body validation for endpoints
 */

export type ValidatedInterview = {
  originalQuestion: string;
  transcript: Array<{ role: 'analyst' | 'model'; text: string }>;
};

export function validateInterviewBody(body: any): { ok: true; data: ValidatedInterview } | { ok: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'body must be a JSON object' };
  }
  const originalQuestion = body.originalQuestion;
  if (typeof originalQuestion !== 'string' || originalQuestion.trim().length < 10) {
    return { ok: false, error: 'originalQuestion must be a string of at least 10 chars' };
  }
  if (originalQuestion.length > 2000) {
    return { ok: false, error: 'originalQuestion must be under 2000 chars' };
  }
  const transcript = body.transcript;
  if (!Array.isArray(transcript)) {
    return { ok: false, error: 'transcript must be an array (can be empty on first turn)' };
  }
  if (transcript.length > 20) {
    return { ok: false, error: 'transcript too long' };
  }
  for (const t of transcript) {
    if (!t || typeof t !== 'object') return { ok: false, error: 'each transcript entry must be an object' };
    if (t.role !== 'analyst' && t.role !== 'model') return { ok: false, error: 'transcript role must be analyst or model' };
    if (typeof t.text !== 'string' || t.text.length > 5000) return { ok: false, error: 'transcript text must be a string under 5000 chars' };
  }
  return {
    ok: true,
    data: { originalQuestion: originalQuestion.trim(), transcript },
  };
}
