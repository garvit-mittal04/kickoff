/**
 * endpoints/save.ts — POST /api/save
 *
 * Persists a brief to KICKOFF_BRIEFS KV. Returns the slug + full URL.
 *
 * Request:  { originalQuestion, briefMarkdown, transcript? }
 * Response: { slug, url, createdAt }
 */

export interface SaveEnv {
  KICKOFF_BRIEFS: KVNamespace;
}

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

function generateSlug(): string {
  // 8-char base36 slug, ~1 in 2.8 trillion collision at 50 briefs — negligible
  return Math.random().toString(36).substring(2, 10);
}

export async function handleSave(request: Request, env: SaveEnv): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const originalQuestion = body?.originalQuestion;
  const briefMarkdown = body?.briefMarkdown;

  if (typeof originalQuestion !== 'string' || originalQuestion.trim().length < 5) {
    return json({ error: 'invalid_request', message: 'originalQuestion required' }, 400);
  }
  if (typeof briefMarkdown !== 'string' || briefMarkdown.trim().length < 100) {
    return json({ error: 'invalid_request', message: 'briefMarkdown too short' }, 400);
  }
  if (briefMarkdown.length > 50000) {
    return json({ error: 'invalid_request', message: 'briefMarkdown too long' }, 400);
  }

  // Allow client-suggested slug for seeding (optional, ignored if collision)
  let slug: string = typeof body?.slugHint === 'string' && /^[a-z0-9-]{3,20}$/.test(body.slugHint)
    ? body.slugHint
    : generateSlug();

  // If slug already exists AND it wasn't user-provided, generate a new one (retry up to 3 times)
  if (!body?.slugHint) {
    for (let i = 0; i < 3; i++) {
      const existing = await env.KICKOFF_BRIEFS.get(`brief:${slug}`);
      if (!existing) break;
      slug = generateSlug();
    }
  }

  const createdAt = new Date().toISOString();
  const record = {
    slug,
    originalQuestion: originalQuestion.trim(),
    briefMarkdown,
    createdAt,
    version: '1.0',
  };

  try {
    await env.KICKOFF_BRIEFS.put(`brief:${slug}`, JSON.stringify(record));
  } catch (err: any) {
    console.error('KV write failed:', err);
    return json({ error: 'save_failed', message: 'Could not persist brief. Please try again.' }, 500);
  }

  return json({
    slug,
    url: `/b/${slug}`,
    createdAt,
  }, 201);
}
