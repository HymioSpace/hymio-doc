# Context & draft contracts

::: info Draft only
These contracts describe planned behavior. There is no deployed API or generated OpenAPI specification yet.
:::

## Context model

| Entity | Meaning |
| --- | --- |
| Space | Ownership and authorization boundary |
| Context | Stable identity for a piece of information |
| Revision | Immutable content version |
| Asset | Binary content referenced by a Context |
| Source | External identity and revision |
| Provenance | Derivation and parent revisions |
| Change | Ordered record for incremental consumers |

A summary, chunk or embedding refers to its source Context and revision. A derived index does not become the canonical record. A Kit's successful business write remains distinct from a user statement describing that action.

## Planned HTTP shape

The draft uses `/v1` and resolves principals from authentication rather than trusting a body `user_id`.

| Route family | Purpose |
| --- | --- |
| `/capabilities`, `/spaces` | Discover supported behavior and authorized spaces |
| `/spaces/{space}/contexts` | Create and list |
| `/spaces/{space}/contexts/{id}` | Read, conditional update, tombstone |
| `/spaces/{space}/contexts/{id}/revisions/{revision}` | Read a fixed revision |
| `/spaces/{space}/assets` | Authorized binary upload/read |
| `/spaces/{space}/search` | Declared search modes and versioned hits |
| `/spaces/{space}/changes` | Cursor-based ordered changes |

## Write and read semantics

Writes use an `Idempotency-Key` scoped to principal, space, method and path. The receipt also checks a request fingerprint. Reusing a key with different content is a conflict.

Updates and deletion require `If-Match`: missing preconditions produce 428, mismatched revisions 412. A mutation must atomically write revision, current pointer, source identity, idempotency receipt and change record.

Exact reads after acknowledged writes should see the new value. Search can lag but must report index position or timing. Expired change cursors require a new snapshot rather than silently resuming at “now”.

## Replaceable storage

`ContextStore`, `BlobStore` and `SearchProvider` are internal ports. A database adapter must satisfy transaction or equivalent compare-and-set semantics. A custom HTTPS endpoint implements the public contract; a raw database connection is not an endpoint implementation.

Open decisions include a reference database, indexing implementation, complete request schemas, OpenAPI and adapter conformance tests. This section will expand with those implementation choices.
