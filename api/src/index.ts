/**
 * index.ts — Kickoff API Worker entry point
 *
 * Routes:
 *   GET  /                  → API info
 *   GET  /api/health        → health check
 *   POST /api/interview     → adaptive clarifier Q&A
 *   POST /api/brief         → generate the structured brief
 *   POST /api/save          → persist brief, return slug
 *   GET  /api/brief/:slug   → retrieve a saved brief
 *   OPTIONS *               → CORS preflight
 */

import { handleInterview } from './endpoints/interview';
import { handleBrief } from './endpoints/brief';
import { handleSave } from './endpoints/save';
import { handleRetrieve } from './endpoints/retrieve';
import type { AIBinding } from './lib/ai';

export interface Env {
  AI: AIBinding;
  KICKOFF_BRIEFS: KVNamespace;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
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
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // POST /api/interview
    if (url.pathname === '/api/interview' && request.method === 'POST') {
      return handleInterview(request, env);
    }

    // POST /api/brief  (generate)
    if (url.pathname === '/api/brief' && request.method === 'POST') {
      return handleBrief(request, env);
    }

    // POST /api/save  (persist to KV)
    if (url.pathname === '/api/save' && request.method === 'POST') {
      return handleSave(request, env);
    }

    // GET /api/brief/:slug  (retrieve from KV)
    const retrieveMatch = url.pathname.match(/^\/api\/brief\/([a-z0-9-]{3,20})$/i);
    if (retrieveMatch && request.method === 'GET') {
      return handleRetrieve(retrieveMatch[1].toLowerCase(), env);
    }

    // GET /api/health
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json({
        status: 'ok',
        service: 'kickoff-api',
        version: '1.2',
        model: '@cf/meta/llama-3.2-3b-instruct',
        endpoints_live: 5,
        timestamp: new Date().toISOString(),
      });
    }

    // GET /
    if (url.pathname === '/' || url.pathname === '') {
      return json({
        service: 'Kickoff API',
        version: '1.2',
        tagline: 'The analysis brief you write before you write any SQL.',
        endpoints: [
          'GET  /api/health',
          'POST /api/interview  { originalQuestion, transcript }',
          'POST /api/brief      { originalQuestion, transcript }',
          'POST /api/save       { originalQuestion, briefMarkdown, slugHint? }',
          'GET  /api/brief/:slug',
        ],
      });
    }

    return json({
      error: 'not_found',
      message: `No route matches ${request.method} ${url.pathname}`,
    }, 404);
  },
} satisfies ExportedHandler<Env>;
