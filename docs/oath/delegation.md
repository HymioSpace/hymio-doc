# Subagents & application events

A subagent performs a bounded assignment with its own context, journal, tools and execution lease. It belongs to the same user as its parent, while the parent can continue receiving input.

## Spawn and inspect

Biz exposes authenticated action endpoints:

| Endpoint | Input |
| --- | --- |
| `POST /subagents/spawn` | `request_id`, `title`, `objective`, `success_criteria`; optional `model`, `max_steps`, `timeout_seconds` |
| `POST /subagents/get` | `agent_id` or original `request_id` |
| `POST /subagents/list` | Owner-scoped recent executions |
| `POST /subagents/cancel` | Child identity |

Example spawn body:

```json
{
  "request_id": "research-example-1",
  "title": "Compare document converters",
  "objective": "Compare supported input formats and deployment requirements",
  "success_criteria": "Return a concise table with source references",
  "max_steps": 20,
  "timeout_seconds": 600
}
```

Reuse the same `request_id` after a lost response; do not create a new child merely because transport timed out. Ownership comes from authentication. `agent_id` selects a delegated execution and is not another account identity.

## Execution constraints

- No recursive delegation or task-management tools in children.
- Independent context; the parent's conversation is not copied.
- After initial admission, only tool results wake the child. It does not bind to user/system queues.
- Ambiguity or required approval becomes a blocker, not an indefinite wait for a user.
- A final tool-free response terminates only after earlier outstanding results are consumed.
- Cancellation prevents later Brain commits and queued tools; already-running external effects may still finish.

Defaults are 40 steps and 15 minutes; the maximum is 100 steps / one hour. A user can have at most eight running children. Findings are bounded to 100 notes of 4,000 characters; final text to 16,000 characters.

## Progress and completion

`subagent_notify` sends an intermediate `subagent.progress` event to the parent's system path. Terminal state produces `subagent.completed`. The terminal state and parent notification commit together; reconnecting is not required to keep the event.

The child exposes status to clients through `subagent.status`. Application code can reconcile a main-agent continuation through `POST /executions/get` using its tool invocation ID; a successful tool alone does not establish a finished continuation.

## Application events

Applications submit semantic input through authenticated `POST /events`:

```json
{"event_id":"example-due-1","type":"app.example.due","payload":{"item_id":"example-item"}}
```

Types must be under `app.*`. The endpoint does not accept runtime control commands. Oath uses the credential's owner, and a stable `event_id` supports idempotent delivery. Hymio schedules tasks through this mechanism; task business state remains in Hymio.

Source: [bounded delegation contract](https://github.com/HymioSpace/Oath/blob/main/spec/feature-subagents.md).
