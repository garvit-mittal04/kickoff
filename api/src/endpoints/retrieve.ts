/**
 * endpoints/retrieve.ts — GET /api/brief/:slug
 *
 * Fetches a saved brief from KICKOFF_BRIEFS KV. Public — no auth, no rate limit.
 * Backs the permalink viewer page.
 *
 * Response: { slug, originalQuestion, briefMarkdown, createdAt }
 * Errors:   404 if slug not found
 */

export interface RetrieveEnv {
  KICKOFF_BRIEFS: KVNamespace;
}

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=300', // briefs are immutable, aggressive edge cache OK
};

export async function handleRetrieve(slug: string, env: RetrieveEnv): Promise<Response> {
  if (!/^[a-z0-9-]{3,20}$/.test(slug)) {
    return new Response(JSON.stringify({ error: 'invalid_slug' }), { status: 400, headers: CORS });
  }

  try {
    const raw = await env.KICKOFF_BRIEFS.get(`brief:${slug}`);
    if (!raw) {
      return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: CORS });
    }
    return new Response(raw, { status: 200, headers: CORS });
  } catch (err: any) {
    console.error('KV read failed:', err);
    return new Response(JSON.stringify({ error: 'retrieve_failed' }), { status: 500, headers: CORS });
  }
}
