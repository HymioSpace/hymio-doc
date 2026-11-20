# Current status

This page records the implementation baseline verified on **2026-11-20**. “Implemented” means the
repository contains a callable path and tests; “deployment-dependent” means the capability exists
but needs private credentials, provider approval, physical-device permissions, or operator setup.
It does not mean every deployment has enabled the feature.

## Product summary

| Project | Current | Important boundary |
| --- | --- | --- |
| Hymio | Web, Desktop and native iOS clients; one continuing conversation; durable task projection; memory UI; connectors; media; personal-device and cloud execution; operator console | Chrome extension and Apple Watch are not shipped; Kit application generation is retired |
| Oath | Durable Task/Run state, TaskAgent execution, Supervisor recovery, parallel Subagents, Agent Team and Dynamic Workflow | Supervisor checks durable state; it does not replace the Agent's semantic judgement |
| Nostalgia | Authenticated HTTP service, SQLite persistence, versioned card publication, rollback, events, bounded graph retrieval, scheduled dreaming and evidence-grounded opportunities | Text search remains a literal authoritative scan; semantic/vector search and large-graph indexing are not implemented |

## Hymio

### Available now

- One ongoing conversation across Web, Desktop and native iOS, with per-installation delivery
  cursors and server work that survives a disconnected client.
- A compact iOS shell with **Today**, **Chat** and **My**. Tasks, memory, connections, model and
  notification settings, devices and diagnostics are reached from My.
- A Web rail for Today, Chat, Memory and Tasks, with responsive wide-screen task inspection.
- A list-first task workspace. iOS starts with task groups and can switch to month, week or day
  calendar views; task status, time scope and execution mode are separate concepts.
- Bound Subagents with explicit deliverables and exclusions, durable Agent Team messages with
  visible sender → recipient direction, and Dynamic Workflow DAG edges.
- Completed and cancelled tasks leave the current list for an Archive. Archive removal is
  owner-scoped and soft; cancellation is never presented as completion.
- Budget and other exceptions stay inside the affected task. With user authorization the main
  Agent can enlarge the current Run budget and continue from its checkpoint without re-creating it.
- Conversation anchoring based on actual visible content, keyboard dismissal after send, and
  downward expansion of working details without page-level blank ranges.
- Task definitions use a summary plus a bounded rendered reading sheet instead of expanding a long
  raw objective in-place. Agent activity retains the complete bounded history rather than only the
  latest ten or twenty records.
- Tool activity uses the model-supplied semantic `description`; raw command syntax and generic
  transport labels are fallback/debug detail rather than primary user copy.
- Trace lists use the first input body as a readable title, show local wall-clock and elapsed time,
  and keep bounded LLM request/response content in the default detail. The raw trace ID is disclosed
  separately instead of becoming the primary label.
- Trace requests render messages structurally; oversized raw JSON has its own height-bounded
  disclosure. Escaped Agent text, Markdown and tool records render with stable left alignment.
- Task execution records include local timestamps. A personal Mac supports up to four concurrent
  Shell commands while browser/desktop actions remain exclusive.
- Memory view with original footprints and published understanding, explicit loading/error/empty
  states, provider chips derived from existing records, evidence reading and user corrections.
- Gmail, Dida, Apple Calendar and Apple Health connector foundations with read-only scopes,
  encrypted credentials, bounded sync and idempotent delivery to Nostalgia.
- Personal Mac and Android execution through the outbound HymioDevice Link protocol, plus managed
  cloud desktops. A conversation client is distinct from an execution target.
- Material Design 3 tokens, tonal surfaces, shape hierarchy, navigation geometry and interaction
  states are present in the iOS and Web convergence layers.

### Deployment-dependent

- Gmail and Dida require private OAuth registrations. Gmail restricted-scope verification may
  still be required before broad distribution.
- Apple Calendar and Apple Health require a signed iOS build, physical-device permission checks,
  HealthKit capability and explicit user consent to upload selected summaries.
- APNs, Live Activities, cloud providers, the Nostalgia service URL and administrator IDs require
  private deployment configuration. User-level Nostalgia binding is automatic at account login.
- Real provider quotas, cloud-phone availability and App Store privacy requirements depend on the
  operator and provider account.

### Not currently shipped

- A built Chrome extension with capture and packaging.
- An Apple Watch client or a user-facing Hymio Android app. HymioDevice has an Android execution
  adapter.
- Cloud-phone execution and manual device takeover.
- Write actions for connectors. Gmail, Dida, Calendar and Health are initially read-only.
- The former Kit Host, generated application runtime and `kit_*` Agent tools. They were retired
  from the current product path.

## Oath

### Available now

- Durable Task and Run lifecycle with checkpoint, wait, retry, pause, resume, cancellation and
  supervisor recovery.
- One TaskAgent per Agent-backed Run. The interaction Agent cannot create an unbound Subagent.
- Four execution modes: `program`, `parallel_subagents`, `agent_team` and `dynamic_workflow`.
- Durable Team messages, a cycle-free workflow DAG with bounded nodes, dependency failure
  propagation and leader join.
- Owner-scoped delegated activity, semantic tool descriptions, tool approvals, traces and
  per-Agent context isolation.
- External application context providers, model/window selection, media tools and private
  authentication integrations.
- Optional `agent.compress_model` separates bounded history compaction from the main model and uses
  that model's context capacity.

### Important boundary

Schedules and reminders are only one way a Task can start or continue. A Task can be one-off,
event-driven, manually directed or long-running without becoming a cron entry. Program execution
uses deterministic actions; Agent execution uses a bound TaskAgent. Supervisor is a durable-state
observer, not a second reasoning model.

## Nostalgia

### Available now

- User-scoped records for context and commands, immutable source history and explicit source
  kinds: `kit`, `conversation`, `connector`, `user` and `legacy`.
- Draft → validate → atomic commit lifecycle with ETag conflicts, idempotency receipts, rollback
  and bounded retained history.
- Published understanding cards with original-record references, explicit relations, `_core`
  stable context and `_index` navigation summary.
- Scheduled dreaming owned by Nostalgia, with a bounded input window and a stateless configured
  proposal provider. Failed proposals abort their draft.
- Evidence-validated opportunity proposals of at most three per cycle, emitted as durable events
  and consumed by Hymio without granting execution authority.
- Authoritative ID/source/filter and case-insensitive substring search; exact reads, pagination
  snapshots and source-version conflict handling.
- Bounded record/artifact graph query and retrieval with one- or two-hop expansion, explicit
  truncation and snapshot conflicts.
- Automatic per-user provisioning from the single Hymio registration/login flow. Provisioning is
  idempotent across retries and workers, can start with zero static tokens, and is retried lazily on
  the first memory operation after an outage.
- Encrypted private per-user connection through Hymio Backend, with no Nostalgia token exposed to
  clients, Oath, or the model.

### Not claimed

- Embeddings, vector recall, reranking or a semantic-search quality guarantee.
- A dedicated graph database or optimized global graph view at unbounded scale.
- Multi-region storage, automatic database failover or multi-writer deployment. The current
  adapter is a single SQLite service.
- Automatic capture of every conversation. Conversation import is explicit; the Agent uses
  `remember` and `recall` for durable facts and retrieval.

## Reading the documentation

- Use [Hymio](hymio/) for product behavior and deployment.
- Use [Oath](oath/) for execution, task semantics and multi-Agent collaboration.
- Use [Nostalgia](nostalgia/) for personal-context architecture, APIs and operations.
- Start with the [multi-Agent task guide](oath/delegation) when diagnosing task or collaboration
  behavior; it is the deepest explanation of the current task system.
