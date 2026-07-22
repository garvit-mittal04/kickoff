export interface Env {
  // KV namespaces (added later today)
  // KICKOFF_BRIEFS: KVNamespace;
  // KICKOFF_SESSIONS: KVNamespace;
  // KICKOFF_RATELIMIT: KVNamespace;
  // ANTHROPIC_API_KEY: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

export default {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json({
        status: 'ok',
        service: 'kickoff-api',
        version: '1.0',
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname === '/' || url.pathname === '') {
      return json({
        service: 'Kickoff API',
        version: '1.0',
        tagline: 'The analysis brief you write before you write any SQL.',
        endpoints: [
          'GET  /api/health',
          'POST /api/interview  (coming Day 55)',
          'POST /api/brief      (coming Day 55)',
          'POST /api/save       (coming Day 56)',
          'GET  /api/brief/:slug (coming Day 56)',
        ],
      });
    }

    return json({
      error: 'not_found',
      message: `No route matches ${request.method} ${url.pathname}`,
    }, 404);
  },
} satisfies ExportedHandler<Env>;
