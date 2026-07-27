/**
 * endpoints/save.ts — POST /api/save
 *
 * Persists a brief to KICKOFF_BRIEFS KV. Returns the slug + full URL.
 *
 * Day 58 hardening:
 *  - slugHint no longer allows overwriting an existing slug (409 Conflict)
 *  - stricter briefMarkdown validation (min 200 chars, must contain '##')
 *  - rejects slugHint values matching reserved words
 *
 * Request:  { originalQuestion, briefMarkdown, slugHint? }
 * Response: { slug, url, createdAt }
 */

export interface SaveEnv {
  KICKOFF_BRIEFS: KVNamespace;
}

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

// Reserved slugs — cannot be claimed even with a valid slugHint
const RESERVED_SLUGS = new Set([
  'admin', 'api', 'health', 'brief', 'save', 'new', 'help',
  'about', 'terms', 'privacy', 'legal', 'settings', 'account',
  'login', 'logout', 'signup', 'signin', 'dashboard', 'home',
]);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

function generateSlug(): string {
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
  if (typeof briefMarkdown !== 'string' || briefMarkdown.trim().length < 200) {
    return json({
      error: 'invalid_request',
      message: 'briefMarkdown too short — briefs must be at least 200 characters.',
    }, 400);
  }
  if (briefMarkdown.length > 50000) {
    return json({ error: 'invalid_request', message: 'briefMarkdown too long' }, 400);
  }
  // Structural validation — a real brief should have at least one H2 header
  if (!/^##\s+/m.test(briefMarkdown)) {
    return json({
      error: 'invalid_request',
      message: 'briefMarkdown appears malformed — no H2 headers found.',
    }, 400);
  }

  let slug: string;
  let usedHint = false;

  if (typeof body?.slugHint === 'string') {
    const hint = body.slugHint.toLowerCase();
    if (!/^[a-z0-9-]{3,20}$/.test(hint)) {
      return json({ error: 'invalid_request', message: 'slugHint must be 3-20 chars, lowercase alphanumeric + dashes' }, 400);
    }
    if (RESERVED_SLUGS.has(hint)) {
      return json({ error: 'reserved_slug', message: 'That slug is reserved.' }, 400);
    }
    // CRITICAL FIX (Day 58): check for existing slug — never overwrite
    const existing = await env.KICKOFF_BRIEFS.get(`brief:${hint}`);
    if (existing) {
      return json({
        error: 'slug_taken',
        message: 'That slug already exists. Omit slugHint to get an auto-generated one.',
      }, 409);
    }
    slug = hint;
    usedHint = true;
  } else {
    // Auto-generate with collision retry
    slug = generateSlug();
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
    hint_used: usedHint,
  }, 201);
}
