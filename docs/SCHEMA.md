# Kickoff — Data Schema

**Version:** 1.0
**Date:** Day 52 · Capstone Day 2
**Store:** Cloudflare KV (key-value)
**Rationale:** No SQL database is needed. All access patterns are single-key lookups or writes. KV is native to Cloudflare Workers, free at expected scale, and eliminates an entire deployment layer.

---

## 1. Namespaces

Cloudflare KV uses "namespaces" instead of tables. We use three:

| Namespace | Purpose | TTL | Access pattern |
|---|---|---|---|
| `KICKOFF_BRIEFS` | Persistent brief storage | None (permanent) | Read + Write |
| `KICKOFF_SESSIONS` | In-progress interview state | 1 hour | Read + Write |
| `KICKOFF_RATELIMIT` | IP-based rate limit counters | 1 hour | Read + Write (atomic increment) |

Each namespace is created once via Wrangler CLI on Day 53 and bound to the Worker in `wrangler.toml`.

---

## 2. `KICKOFF_BRIEFS` — Brief records

### Key format
```
brief:{slug}
```
Where `{slug}` is an 8-character URL-safe string derived from `crypto.randomUUID().slice(0, 8)`.

Example key: `brief:a1b2c3d4`

### Value shape (JSON, stringified)
```typescript
{
  slug: string;                // 8-char slug, same as URL key
  originalQuestion: string;    // exec question, verbatim, ≤ 2000 chars
  transcript: Array<{          // full interview transcript
    role: 'analyst' | 'model';
    text: string;
  }>;
  briefMarkdown: string;       // final structured brief, markdown
  createdAt: string;           // ISO 8601 timestamp
  clientMeta: {                // for lightweight analytics only, no PII
    userAgent: string;         // truncated to 200 chars
    referer: string | null;    // referrer URL if any
  };
  version: '1.0';              // schema version, for future migrations
}
```

### Constraints
- **Immutability:** Once written, a brief is never updated. v1.0 explicitly excludes editing.
- **No PII collected:** No email, no name, no IP. `userAgent` is truncated. This is a deliberate privacy choice — the trust model is "public permalink, treat like a Pastebin."
- **Size:** Typical brief is 2-5 KB. KV entries are capped at 25 MB (never hit).

---

## 3. `KICKOFF_SESSIONS` — In-progress interview state

### Key format
```
session:{sessionId}
```
Where `{sessionId}` is a full `crypto.randomUUID()`.

### Value shape (JSON, stringified)
```typescript
{
  sessionId: string;
  originalQuestion: string;
  transcript: Array<{
    role: 'analyst' | 'model';
    text: string;
  }>;
  isReady: boolean;            // true once the model has emitted READY:
  createdAt: string;
  updatedAt: string;
}
```

### Constraints
- **TTL:** 1 hour (`expirationTtl: 3600` on the KV write). If an analyst walks away mid-interview, the session vanishes cleanly.
- **Not shared:** Sessions are keyed by UUID, never guessable. Only the analyst who started the session can add to it (enforced by them holding the sessionId client-side).

---

## 4. `KICKOFF_RATELIMIT` — IP-based rate limit counters

### Key format
```
ratelimit:{ipHash}:{hourBucket}
```
Where:
- `{ipHash}` is a SHA-256 hash of the requester's IP (never store raw IP)
- `{hourBucket}` is `Math.floor(Date.now() / (1000 * 60 * 60))` (integer)

### Value shape (integer)
Simple integer count of requests in this hour bucket.

### Constraints
- **TTL:** 1 hour (bucket rolls over naturally).
- **Limit:** 10 requests per IP per hour on write endpoints (`/api/interview`, `/api/brief`, `/api/save`).
- **No limit on reads** (`GET /api/brief/:slug` is public and permalinks must be shareable).
- **Hashing:** Raw IPs are never persisted. Only their SHA-256 hash.

---

## 5. Validation against PRD user stories

Every user story from the PRD is validated against this schema:

| # | User story | Schema support | Notes |
|---|---|---|---|
| US-01 | An analyst pastes a vague exec question and gets a first clarifier back within 5s | ✓ | `KICKOFF_SESSIONS` write on initial POST; response comes from Anthropic call |
| US-02 | An analyst answers 4-6 clarifiers and receives a structured brief | ✓ | `transcript` array accumulates; `isReady` flag signals brief-generation stage |
| US-03 | On brief completion, the analyst gets a shareable permalink | ✓ | `KICKOFF_BRIEFS` write returns `slug` → URL is `/b/{slug}` |
| US-04 | An executive opens the permalink and sees the brief without needing to sign in | ✓ | Public read on `KICKOFF_BRIEFS`, no auth |
| US-05 | The analyst cannot edit the brief after creation | ✓ | Immutable by design — no update endpoint exists |
| US-06 | Rate limiting prevents any single IP from abusing the tool | ✓ | `KICKOFF_RATELIMIT` enforces 10 writes/IP/hour |
| US-07 | A stale session (>1 hour old) cannot be resumed | ✓ | `KICKOFF_SESSIONS` TTL of 1 hour |
| US-08 | Brief creation records enough metadata to compute launch metrics | ✓ | `createdAt`, `clientMeta.referer` support "briefs created" and "shared from where" analytics |

---

## 6. Migration strategy

Every value includes a `version: '1.0'` field. If a future release changes the schema (e.g., adds team support in v2), the read path checks version and applies a migration function. v1.0 needs no migration logic — this is future-proofing only.

---

## 7. Not modeled in v1.0 (deferred to v2+)

- Users / accounts / auth
- Teams / workspaces
- Brief edit history
- Brief comments
- Templates
- Cross-brief search

All of these are explicit non-goals per PRD §9.2.

---

*End of SCHEMA.md v1.0 — Day 52 of 60*
