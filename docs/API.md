# Kickoff — API Design

**Version:** 1.0
**Date:** Day 52 · Capstone Day 2
**Base URL:** `https://api.kickoff.[tbd-domain]`  (routed via Cloudflare Workers)
**Content-Type:** `application/json` on all endpoints
**Auth:** None. IP-based rate limiting on write endpoints.

---

## 1. Endpoint summary

| Method | Path | Purpose | Auth | Rate limit |
|---|---|---|---|---|
| POST | `/api/interview` | Start or continue an adaptive interview | None | 10/IP/hour |
| POST | `/api/brief` | Generate the final structured brief from a completed interview | None | 10/IP/hour |
| POST | `/api/save` | Persist a completed brief and return a permalink | None | 10/IP/hour |
| GET | `/api/brief/:slug` | Retrieve a saved brief by slug (public permalink) | None | Unlimited |
| GET | `/api/health` | Health check for uptime monitoring | None | Unlimited |

---

## 2. POST `/api/interview`

Runs the adaptive Q&A phase of a brief. Called once per interview turn. First call starts a session; subsequent calls continue it.

### Request

**First turn (start session):**
```json
{
  "originalQuestion": "Why is program retention down this quarter?"
}
```

**Subsequent turns (continue session):**
```json
{
  "sessionId": "8f14e45f-ceea-467a-9575-d43b4f3a3d0b",
  "answer": "Retention of program participants — the ones who enrolled in the Fall 2024 cohort."
}
```

### Response (200 OK)

**Clarifier returned:**
```json
{
  "sessionId": "8f14e45f-ceea-467a-9575-d43b4f3a3d0b",
  "clarifier": "What baseline are you comparing against — the same quarter last year, or the immediately preceding quarter?",
  "isReady": false,
  "turnNumber": 2
}
```

**Interview complete (ready for brief generation):**
```json
{
  "sessionId": "8f14e45f-ceea-467a-9575-d43b4f3a3d0b",
  "clarifier": null,
  "isReady": true,
  "turnNumber": 5
}
```

### Validation
- `originalQuestion`: required on first turn, string, 10-2000 chars
- `sessionId`: required on subsequent turns, valid UUID format
- `answer`: required on subsequent turns, string, 1-5000 chars
- If both `originalQuestion` AND `sessionId` are present → 400 (must be one or the other)

### Errors
| Code | Meaning | Response |
|---|---|---|
| 400 | Malformed request | `{ "error": "invalid_request", "message": "..." }` |
| 404 | `sessionId` not found or expired | `{ "error": "session_not_found" }` |
| 429 | Rate limit exceeded | `{ "error": "rate_limited", "retryAfter": 1234 }` |
| 502 | Upstream Anthropic error | `{ "error": "upstream_error" }` |
| 504 | Upstream timeout (>10s) | `{ "error": "upstream_timeout" }` |

---

## 3. POST `/api/brief`

Generates the final structured brief from a completed interview session. Called once, after `/api/interview` returns `isReady: true`.

### Request
```json
{
  "sessionId": "8f14e45f-ceea-467a-9575-d43b4f3a3d0b"
}
```

### Response (200 OK)
```json
{
  "sessionId": "8f14e45f-ceea-467a-9575-d43b4f3a3d0b",
  "briefMarkdown": "## The Question\nInvestigate the drivers of the drop in Fall 2024 cohort retention...\n\n## Sub-questions\n1. How much has retention actually dropped? (Baseline + magnitude)\n2. When did the drop start? (Weekly cohort view)\n...",
  "tokensUsed": 1847
}
```

### Validation
- `sessionId`: required, valid UUID, must reference an existing session with `isReady: true`

### Errors
| Code | Meaning |
|---|---|
| 400 | Session is not ready (interview incomplete) |
| 404 | Session not found or expired |
| 429 | Rate limit exceeded |
| 502 | Upstream error |
| 504 | Upstream timeout (>20s for brief generation) |

---

## 4. POST `/api/save`

Persists a completed brief and returns a permalink slug.

### Request
```json
{
  "sessionId": "8f14e45f-ceea-467a-9575-d43b4f3a3d0b",
  "briefMarkdown": "## The Question\n..."
}
```

Note: `briefMarkdown` is passed from the client rather than re-fetched, so the analyst can make trivial edits before saving in future versions. In v1.0, the client always sends what it received unchanged.

### Response (201 Created)
```json
{
  "slug": "a1b2c3d4",
  "url": "/b/a1b2c3d4",
  "createdAt": "2026-07-21T14:32:11.000Z"
}
```

### Validation
- `sessionId`: required, valid UUID, must reference a session with `isReady: true`
- `briefMarkdown`: required, string, 200-50000 chars

### Errors
| Code | Meaning |
|---|---|
| 400 | Malformed request or brief too short/long |
| 404 | Session not found |
| 409 | Slug collision (should never happen after retries; if returned, client should just retry the entire save) |
| 429 | Rate limit exceeded |

---

## 5. GET `/api/brief/:slug`

Retrieves a saved brief by slug. Public — no auth, no rate limit. Backs the permalink page.

### Request
```
GET /api/brief/a1b2c3d4
```

### Response (200 OK)
```json
{
  "slug": "a1b2c3d4",
  "originalQuestion": "Why is program retention down this quarter?",
  "briefMarkdown": "## The Question\n...",
  "createdAt": "2026-07-21T14:32:11.000Z"
}
```

### Errors
| Code | Meaning |
|---|---|
| 404 | Slug not found (brief does not exist) |

**Cache header:** `Cache-Control: public, max-age=300` (5 min edge cache — briefs are immutable after creation, so aggressive caching is safe).

---

## 6. GET `/api/health`

Uptime monitoring endpoint. Returns 200 if the Worker is running and KV bindings are wired.

### Response (200 OK)
```json
{
  "status": "ok",
  "version": "1.0",
  "timestamp": "2026-07-21T14:32:11.000Z"
}
```

---

## 7. CORS

All endpoints allow cross-origin requests from the production frontend origin and from localhost (dev):

```
Access-Control-Allow-Origin: https://kickoff.[domain]
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

`OPTIONS` preflight requests return 204 with the above headers.

---

## 8. Rate limiting behavior

**Enforced on:** POST `/api/interview`, POST `/api/brief`, POST `/api/save`
**Not enforced on:** GET `/api/brief/:slug`, GET `/api/health`

**Algorithm:**
1. Hash the requester's IP with SHA-256.
2. Compute the current hour bucket: `Math.floor(Date.now() / 3600000)`.
3. Read the counter at `ratelimit:{ipHash}:{hourBucket}` from `KICKOFF_RATELIMIT` KV.
4. If counter ≥ 10, return 429 with `retryAfter: <seconds until next hour bucket>`.
5. Otherwise increment counter (with 1-hour TTL) and proceed.

**Response header:** All write endpoints include `X-RateLimit-Remaining: <N>` and `X-RateLimit-Reset: <unix timestamp>`.

---

## 9. Error response format (standard across all endpoints)

```json
{
  "error": "error_code_snake_case",
  "message": "Human-readable explanation, safe to show to the user.",
  "details": {}   // optional, endpoint-specific
}
```

Never expose internal errors, stack traces, or PII in the `message` field.

---

## 10. Not in v1.0

- No `PUT /api/brief/:slug` — briefs are immutable
- No `DELETE /api/brief/:slug` — no deletion (see privacy note in SCHEMA.md — no PII stored)
- No `POST /api/comment` — comments are v2
- No auth headers — no accounts in v1.0
- No pagination — no list endpoint exists

---

*End of API.md v1.0 — Day 52 of 60*
