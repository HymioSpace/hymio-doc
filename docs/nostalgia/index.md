# Nostalgia

Nostalgia is Hymio's personal-context service. It accepts source material, keeps its provenance,
lets a scheduled dreaming process propose durable understanding, validates that proposal, and
publishes the result as one versioned state. Agents can then read a bounded overview, retrieve
cards and follow their evidence back to the original records.

The service is implemented and integrated with the same Hymio account used for login. When a user
registers or signs in, Hymio provisions a Nostalgia namespace keyed by the stable Hymio `user_id`.
There is no second account or user-visible binding step. Basic chat can run if provisioning is
temporarily unavailable; memory and context-originated task discovery recover automatically when the
context service returns.

<ProjectOverviewMap kind="nostalgia" />

## What the user gets

The product surface calls this capability **Memory**. It has two layers:

| Layer | What it contains | What the user should understand |
| --- | --- | --- |
| Footprints | Original conversation quotes, notes, connector records and other source material | The source was accepted. It is not automatically a finished personal fact. |
| Remembered understanding | Published cards, relations and an overall `_core` summary | Hymio has organized this version from cited originals. It can change when new evidence arrives. |

Reading, searching, correction and connector status are available independently of a dreaming
cycle. A newly accepted source can be read immediately; its derived understanding appears after a
later successful publication.

## The complete loop

1. Hymio authenticates the user, enforces source consent, parses the source and submits an
   idempotent record to Nostalgia.
2. Nostalgia keeps the original record and source identity. A later revision of the same external
   object becomes another attributable record.
3. Nostalgia starts a bounded dreaming draft and sends the fixed input window to Hymio's private
   proposal adapter.
4. The proposal returns understanding, record decisions, relations and optional opportunities.
   Nostalgia validates it through its own state machine; the model never writes storage directly.
5. A successful commit atomically publishes cards, `_index`, record states, relations and the new
   processing cursor. A failed proposal aborts the draft.
6. Oath asks Hymio for application context and can use `recall` to move from a bounded summary to
   exact cards, related nodes and original evidence.
7. Hymio consumes durable context events. A grounded opportunity can become a task, but the
   suggestion itself grants no permission to act.

## Core terms

| Term | Meaning |
| --- | --- |
| Record | An immutable context item or command, identified across revisions by `root_id`. |
| Source | The external identity of a record: kind, namespace, external ID, version and optional parser metadata. |
| Dream | One draft/commit/abort lifecycle over a fixed record window. |
| Artifact | A published understanding card. `_core` is the stable overview; `_index` is navigation. |
| Relation | A typed, directional statement between any two records or artifacts. |
| Event | A durable, user-scoped notification such as `record.appended`, `context.published` or `opportunity.proposed`. |
| Assembly | The stable `_core` content plus dynamic summary/injection data exposed to Hymio. |
| Footprint | The product label for an original record shown to the user. |

`kit` remains a supported source kind for old/projection records. It does not mean the retired Kit
Host or generated-application runtime is active.

## Ownership

| Responsibility | Owner |
| --- | --- |
| Accounts, consent, connectors, parsers, media files and product UI | Hymio |
| Personal-context records, cards, relations, versions, events and retrieval | Nostalgia |
| Dreaming schedule, draft validation, atomic commit and rollback | Nostalgia |
| Proposal model invocation and application-specific task comparison | Hymio Backend |
| Agent execution, task state and tool lifecycle | Oath |

Hymio is the identity authority. It creates one Nostalgia token per Hymio user, encrypts that token
with a key next to the Backend database, and keeps the credential server-side. The Nostalgia token
never enters the browser, mobile client, Oath or model context. Static token maps remain available
for existing deployments and standalone Nostalgia testing, but they are not the registration path.

## Important boundaries

- Search is currently exact filtering plus a case-insensitive substring scan over an authoritative
  snapshot. It is not embedding or vector search and does not claim relevance ranking.
- Graph retrieval is bounded to the current user snapshot and at most two hops. The implementation
  builds the view from version details; it is not a dedicated graph database.
- SQLite is the current storage adapter. The service is designed for one writer and does not claim
  horizontal database failover.
- Original records are retained. The latest few published snapshots are retained for rollback;
  old draft/detail payloads may be pruned without deleting the source log.
- A connector disconnect stops future collection but does not automatically erase prior records or
  derived understanding.

## Source labels are evidence, not built-in memory

Gmail and Dida are not seeded Nostalgia categories. A `gmail` or `dida` chip appears only after the
signed-in user has connected that provider and source records exist. The same rule applies to Apple
Calendar and Apple Health. Empty or unbound memory must not invent source groups.

Continue with [architecture and publication](./architecture), the [HTTP contracts](./contracts), or
[deployment and operations](./operations).
