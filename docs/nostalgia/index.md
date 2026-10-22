# Nostalgia

Nostalgia is the personal-context component under design. It defines how context is identified, attributed, revised and retrieved. There is no running service, database adapter or Hymio integration yet.

## Ground the design in real material

The Hymio case uploaded [a real demonstration travel note](/examples/trip-notes.txt) and displayed three model-generated checks on iPhone; see [the attachment case](../hymio/media). This is useful material for understanding Nostalgia's planned boundary: content is an input, file identity maps to a Source, edits should create Revisions, and derived results should refer to a source version.

The actual running path is Hymio attachments and chat, without Nostalgia. The context-management flow below remains a design, not evidence of a deployable service.

## Start with an example

An agent needs a travel plan that changes over time. An application connector reads the file and supplies its content and source to Nostalgia. Edits produce new revisions. Later retrieval returns relevant content together with its source file and revision.

<ProjectOverviewMap kind="nostalgia" />

This is a planned flow, not a callable service. Nostalgia is a context collector and manager: connectors read external sources, while Nostalgia organizes supplied information and preserves sources and revisions. It is not a general-purpose crawler.

## Terms used in this section

| Term | Meaning here |
| --- | --- |
| Context | Information and background an agent can refer to: plans, notes or file excerpts. |
| Space | An ownership and permission scope for a set of context. |
| Source | The external object the information came from, such as a file and its version. |
| Revision | An immutable content version of a context item at a point in time. |
| Asset | Binary content referenced by context, such as a file or image. |
| Provenance | The link between derived content, such as a summary, and its source revisions. |
| Change feed | Ordered changes that let consumers synchronize additions and edits incrementally. |
| Embedding | A derived representation for semantic search; no implementation has been selected. |
| Kit | A planned application capability module owning canonical business data; not integrated yet. |
| Storage adapter | An internal implementation connecting the same interfaces to a database; not implemented yet. |

## Intended boundary

| Responsibility | Owner |
| --- | --- |
| Import a file or synchronize an external source | Hymio / application connector |
| Store canonical business facts | The application or Kit that owns the operation |
| Represent context, provenance and revisions | Nostalgia design |
| Schedule and execute agent work | Oath |

The design separates a Context HTTP API from internal storage adapters. A future endpoint could use different databases while preserving the same ownership, revision and change-feed semantics. No database or embedding strategy has been selected.

## Documentation status

[Context & draft contracts](./contracts) summarizes the existing schema and API design. Examples describe planned semantics, not callable endpoints or a stable SDK. Installation and operational instructions will be added when there is an implementation.
