# HTTP contracts

The Nostalgia protocol is implemented under `/v1`. The service publishes its generated schema at
`/openapi.json` and interactive documentation at `/docs`. This page explains the stable semantics;
the deployed OpenAPI document remains authoritative for exact field constraints.

## Common rules

- Every business request uses `Authorization: Bearer <token>`.
- A token maps to one owner. `user_id` is derived from that token and is never trusted from the body.
- Every write requires `Idempotency-Key` (1–200 characters).
- Reusing a key with the same semantic request returns the original result. Different content returns
  `409`.
- Artifact/record edits use `ETag` with `If-Match`; creation uses `If-None-Match: *`.
- Lists return `items`, `next_cursor` and `visible_through_id`.
- Pagination cursors are signed, query-bound and publication-view-bound. A changed view requires a
  new page sequence.
- Successful write responses may include an `ETag`. A `201` means durable acceptance, not that a
  command's requested outcome has already happened.
- JSON request bodies are required except for raw asset upload.
- Responses use `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`.

Errors use:

```json
{"error":{"code":"invalid_reference","message":"Reference is outside this dream's input","retryable":false}}
```

Common status codes are `400` invalid input, `401/403` authentication, `404` absent/invisible,
`409` lifecycle or idempotency conflict, `412` precondition/source conflict,
`413` size limit, `415` unsupported media type, `422` invalid references/submission and
`503` temporary storage/provider failure.

## Discovery and health

| Route | Purpose |
| --- | --- |
| `GET /healthz` | Unauthenticated process/storage health. |
| `GET /v1/capabilities` | Authenticated protocol version, graph limits, search modes, body/page/history/buffer limits and dreaming configuration. |

The current capability response advertises `filter` and `text` search only. It explicitly describes
text search as a case-insensitive substring scan in stable ID order.

## Records

| Route | Purpose |
| --- | --- |
| `POST /v1/records` | Append one context or command. |
| `GET /v1/records` | List/filter records by root, source, type, state, time and bounded ID window. |
| `GET /v1/records/{id}` | Read one exact record, optionally through a draft. |
| `PATCH /v1/records/{id}?dream_id=...` | Save an Agent's process/status decision in an editable dream. |

An original record is immutable. Changes to the same external object are appended under its
`root_id` with the latest `expected_record_id`. Unknown command types remain explicit data; they do
not default to delete or update.

Context decisions use `processing_state=applied|noop|needs_input`. `noop` and `needs_input` require a
reason. Context status is `pending|active|obsolete|deleted`; commands use the processing state
instead of content status. A publish may therefore say “needs clarification” without pretending the
request succeeded.

## Account provisioning

| Route | Purpose |
| --- | --- |
| `PUT /v1/admin/tokens/{user_id}` | Service-only, idempotent creation or rotation of one user credential. |

This control-plane request uses the private service credential, not an end-user bearer token. The
body is `{"token":"..."}`. Nostalgia stores only a SHA-256 digest, creates the active namespace if
needed and makes the token usable immediately. Reproviding a user atomically replaces the previous
token. Hymio owns the stable `user_id` and encrypts its copy of the token.

## Artifacts and retrieval

| Route | Purpose |
| --- | --- |
| `GET /v1/artifacts/{id}` | Read a published card or a draft version. |
| `PUT /v1/artifacts/{id}?dream_id=...` | Create/replace a card inside a draft. |
| `DELETE /v1/artifacts/{id}?dream_id=...` | Remove a non-index card from a draft. |
| `POST /v1/search` | Search/filter records, artifacts or both in the authoritative snapshot. |
| `POST /v1/graph/query` | Read a bounded neighborhood or recent-change graph. |
| `POST /v1/retrieve` | Literal seed search plus bounded relation expansion for Agent retrieval. |
| `PUT /v1/relations?dream_id=...` | Create/replace one typed relation in a draft. |

The artifact ID is stable across publication. `_index` cannot be deleted; it must be replaced and
explicitly confirmed. Ordinary cards require at least one exact original reference.

`POST /v1/search` supports:

- `target=records|artifacts|all`;
- `mode=filter|text` (a request for `semantic` is rejected honestly);
- root/source/type/status/time/topic/artifact-type filters;
- `cursor` and bounded `limit`.

The result reports `search_method=authoritative_scan`, `index_through_id` and `partial=false` for the
current implementation. A truncated preview is not a substitute for an exact read.

`POST /v1/retrieve` is the Agent-oriented bounded path. It returns nodes, visible edges, a snapshot,
`bounded=true` and the method `literal-plus-relations`.

## Dream lifecycle

| Route | Purpose |
| --- | --- |
| `POST /v1/dreams` | Create/resume the one active draft for this user. |
| `GET /v1/dreams/{id}` | Read fixed input range, state, handled counts, ETag and retention state. |
| `POST /v1/dreams/{id}/commit` | Validate and atomically publish the draft. |
| `POST /v1/dreams/{id}/abort` | Abandon the draft without changing the active version. |
| `POST /v1/dreams/rollback` | Restore the immediately previous retained publication. |

Only one unfinished draft may exist. Commit uses the whole-draft ETag, not only a card ETag. A commit
failure keeps the draft editable. A successful commit closes it. Abort is idempotent. Rollback is
allowed only when no draft is active and the caller presents the current `view_token`.

## Assembly, injection and events

| Route | Purpose |
| --- | --- |
| `GET /v1/assembly` | Stable `_core` content/cache key plus dynamic injection. |
| `GET /v1/injection` | `_index`, recent pending records, counts, truncation and view token. |
| `GET /v1/events?after=...&limit=...` | Ordered user-scoped event replay. |
| `GET /v1/operations/status` | Owner-scoped counts and recent dreaming/opportunity events. |

Events are at least once. Consumers must persist `next_after` only after accepting the batch and
deduplicate by event ID. Event payloads should be treated as invalidations: read current authorized
objects rather than trusting an old preview.

Opportunity events contain a stable proposal ID, title, objective, success criteria, reason and
evidence record IDs. At most three are accepted per dream. They are suggestions, not task creation
authority.

## Assets

| Route | Purpose |
| --- | --- |
| `POST /v1/assets` | Upload a raw binary asset with a bounded `Content-Type`. |
| `GET /v1/assets/{id}` | Read an owner-scoped asset without exposing a storage path. |

An asset is a bounded binary object in the current SQLite adapter. It is not equivalent to a
canonical personal fact. Records reference assets by ID.

## Example: save, publish and read

```json
{
  "item_type": "context",
  "context_type": "text",
  "context": {"text": "I prefer tea after lunch."},
  "source": {
    "kind": "user",
    "namespace": "hymio.saved",
    "external_id": "synthetic-note-1"
  }
}
```

Send this body to `POST /v1/records` with a fresh stable idempotency key. The accepted record is
immediately readable. Start a dream, mark the record `applied/active`, create a card with an exact
reference, save `_index`, then commit the draft with its current ETag. Only after commit does the
new card become part of the normal published view.

## Compatibility

New fields may be added compatibly. Clients must ignore unknown response fields but must not guess
the meaning of unknown command types, unsupported search modes or expired cursors. Breaking changes
require a new API major version.
