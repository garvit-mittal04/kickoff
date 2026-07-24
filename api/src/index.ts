/**
 * index.ts — Kickoff API Worker entry point
 *
 * Routes:
 *   GET  /                 → API info
 *   GET  /api/health       → health check
 *   POST /api/interview    → adaptive clarifier Q&A
 *   POST /api/brief        → generate the structured brief
 *   OPTIONS *              → CORS preflight
 */

import { handleInterview } from './endpoints/interview';
import { handleBrief } from './endpoints/brief';
import type { AIBinding } from './lib/ai';

export interface Env {
  AI: AIBinding;
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

    // POST /api/brief
    if (url.pathname === '/api/brief' && request.method === 'POST') {
      return handleBrief(request, env);
    }

    // GET /api/health
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json({
        status: 'ok',
        service: 'kickoff-api',
        version: '1.1',
        model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        timestamp: new Date().toISOString(),
      });
    }

    // GET /
    if (url.pathname === '/' || url.pathname === '') {
      return json({
        service: 'Kickoff API',
        version: '1.1',
        tagline: 'The analysis brief you write before you write any SQL.',
        endpoints: [
          'GET  /api/health',
          'POST /api/interview  { originalQuestion, transcript }',
          'POST /api/brief      { originalQuestion, transcript }',
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
