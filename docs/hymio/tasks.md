# Tasks and multi-Agent work

The task screen answers one question: **what still needs to happen, and what has already been
produced?**

It is not a cron editor and it is not a raw Agent debugger. Hymio displays tasks owned and executed
by Oath, keeps the primary view understandable, and puts Agent context, communication and tool calls
one level deeper.

<DocFigure
  variant="phone"
  src="/screenshots/hymio-material-tasks.png"
  caption="Current Material 3 task list. Exceptions are no longer duplicated above the affected task."
/>

## What a user sees

The task workspace opens in **Task list**, not a calendar:

- **Ongoing tasks**: recurring or tracking work that Supervisor may wake again;
- **Temporary tasks**: work expected to finish and stop;
- exceptions inside the affected task card.

Completed and cancelled tasks leave the current list and remain in **Archive**. Archive preserves
the difference between a successful outcome and a cancellation. Removing an item from Archive is a
soft view operation: the Task and its execution records remain available to Oath.

On iOS, switch from Task list to month, week or day when a time view is useful. Calendar blocks are
derived from real task occurrences and recurring projections; an unscheduled task is not assigned a
made-up date.

There is no second page-level budget alert. If one task exhausted its budget, that state appears only
on that task. The task tells the user to ask the Agent in conversation; the main Agent can call
`task_adjust_budget` to continue the **same Run** from its checkpoint. There is no budget editor in
the task UI. Raw token counts belong in the task's run detail.

## One outcome, two axes

The task model separates:

| Axis | Choices | What it means |
| --- | --- | --- |
| Time | temporary / ongoing | One bounded outcome or continuing tracking/recurrence |
| Execution | program / parallel Subagents / Agent Team / Dynamic Workflow | How the current Run is carried out |

Execution choice does not force a schedule. A temporary task can still run Agent Team work, and a
long-running task can use a deterministic program trigger.

The trigger may be one-off, daily/weekly, an explicit event, or a manual continuation. A reminder is
one possible program action, not the definition of a task.

## Execution modes in plain language

| Label | Use it when | User-visible result |
| --- | --- | --- |
| Automated | A fixed action is enough; no model is needed | “Sending” / receipt / completed |
| Agent parallel | Independent work can be split and merged | Leader and bound helpers |
| Agent Team | Helpers must coordinate while working | Leader, members and `A → B` messages |
| Dynamic workflow | Steps have dependencies | A DAG with directed dependency edges and node results |

The mode label is intentionally short. A small help button explains it only when requested.

## Task, Run and Agent

| Record | Meaning |
| --- | --- |
| Task | The durable outcome and policy |
| Run | One execution attempt |
| TaskAgent | The Agent responsible for that Run |
| Subagent | A Team member or workflow node bound to the same Run |

Every Subagent belongs to a TaskRun. This is what lets the UI answer “who is working for which task?”
and lets cancellation stop the relevant work.

A Task has one coherent outcome. Every delegated Subagent or Workflow node must state its concrete
deliverable, source inputs, in-scope work, exclusions/non-goals, observable acceptance criteria and
the condition for stopping with a blocker. The TaskAgent keeps final integration and completion.

## Status language

### Task

- active;
- paused;
- closed: achieved, cancelled or expired.

### Current Run

- preparing;
- running;
- waiting for a real condition;
- paused for attention;
- succeeded;
- failed;
- cancelled.

“Waiting” is not automatically an error. A normal notification delivery can be in progress. Only a
user decision or a blocked/failed execution should appear as attention.

### Supervisor

Supervisor checks persisted schedules, waits, leases, timeouts, budgets and messages and requests a
wake-up when a condition is due. It does not independently reason about the user's goal or claim a
task is semantically correct. The bound TaskAgent owns execution, evidence and the completion
report.

## Inspect a task

The primary detail page keeps:

1. title and current state;
2. one time label and one execution-mode label;
3. an attention explanation when needed;
4. current Run progress and compact budget usage;
5. the plan or workflow dependencies;
6. the leader and bound members;
7. the user-visible final result.

The task definition is collapsed by default. Technical event payloads and raw tool JSON are not part
of the consumer task page.

## Agent collaboration

For parallel Subagents, the primary view shows the TaskAgent and its bound helpers. For Agent Team,
communication records use explicit direction:

```text
Architecture research → Research leader
Research leader → Framework comparison
```

The sending Agent and receiving Agent are always named. Selecting a member opens:

- responsibility and acceptance;
- Team communication;
- chronological execution records;
- semantic tool calls.

Tool calls are collapsed by default. “Run command”, “browser” or raw implementation names are not
used as the main explanation when the Agent supplied a semantic description.

Every Oath tool call requires a short `description`. The primary exploration view uses that
description, with the tool name as secondary context. Raw arguments and result JSON remain in the
Agent or trace detail.

## Dynamic Workflow

For Dynamic Workflow the task page renders the dependency graph as a DAG. Directed edges connect
real dependencies; nodes in the same layer can run in parallel:

- waiting for dependencies;
- running;
- paused execution;
- completed;
- failed or blocked.

"Waiting for dependencies" is only the `pending` state, meaning that a start condition is not yet
satisfied. A started node stopped by a budget or task pause becomes `paused`, not `pending`; resuming
continues the same node and Agent. Cancelling the Task moves every unfinished node to `cancelled`, so
an archived cancellation never continues to claim that it is waiting for dependencies.

Selecting a node reveals its inputs, result, error and bound Agent activity. Dynamic Workflow does
not show Agent-to-Agent communication because that concept belongs to Agent Team, not to a dependency
graph.

The initial task plan is proposed by the interaction Agent when it creates the Task. The bound
TaskAgent owns the runtime DAG and calls `workflow_define`; the interaction Agent cannot define nodes
inside that Run. Until the first DAG definition arrives, the task page shows **Preparing workflow**
instead of an empty section. DAG nodes live in Oath's `task_workflow_nodes` SQL table; their JSON
dependency field is structured relational state, not a separate DAG file.

The leader is not asked to integrate until all required nodes finish. A failed node blocks dependent
nodes rather than allowing them to run on missing input.

<DocFigure
  variant="phone"
  src="/screenshots/hymio-material-workflow.png"
  caption="Dynamic Workflow dependency view: waiting for dependencies, running and completed nodes stay on one compact surface."
/>

## Cancel, pause and delete

### Cancel

Cancel is terminal:

- the Task and open Run become cancelled;
- future triggers stop;
- bound members stop or are cancelled;
- the card disappears from current tasks;
- the record enters Archive with `Cancelled`, never `Completed`.

The conversation remains available. Cancel affects the task, not the account or chat history.

### Pause

Pause preserves the Run and checkpoint for a later resume. If the task is paused because a budget or
progress limit was reached, the relevant task explains that condition. For `BUDGET_EXHAUSTED`, the
user asks in conversation and the Agent raises the current Run budget only after confirmation.

### Remove from view

Removing a completed or cancelled task from Archive is a view concern. The backend stores an
owner-scoped hidden marker; it does not imply that the task succeeded, deletes its history or undoes
an external side effect.

## Notifications

Two separate concepts are involved:

1. **Delivery policy** controls which channels Hymio may use and under which conditions.
2. **Agent notify request** is a semantic request to surface an update. It does not override user
   settings, foreground suppression, deduplication or approval rules.

Task completion and notification delivery are also separate. A result can be complete even when a
notification is pending or fails.

## Why tasks live in Oath

Hymio does not maintain a second scheduler or task database.

- Oath persists Task, Run, checkpoint, budget and Agent execution.
- Hymio authenticates the user, projects the Oath result into the product API, and renders it.
- Pause, resume and cancel are forwarded to Oath.
- Notifications are delivered through Hymio after Oath requests a result delivery.

This avoids “task state says running, but executor says paused” disagreement.

## API surface

Hymio exposes:

- `GET /tasks`;
- `POST /tasks` with `get`, `pause`, `resume`, `cancel`, `archive_list` or `archive_hide`.

Task creation and requirement changes remain Agent-managed. The HTTP client cannot fabricate internal
pending statuses or bypass Oath state validation. `task_adjust_budget` is intentionally an Agent tool,
not a public task GUI or HTTP action.

## Design principles

- Show work, not implementation;
- put exceptions beside the affected task;
- never label cancellation as completion;
- never duplicate a page-level alert and the task card;
- use compact labels and progressive disclosure;
- keep Agent communication directional;
- keep raw tools and traces one level deeper;
- respect loading, empty, error and cancelled states.

See [Multi-agent tasks and collaboration](../oath/delegation) for the execution architecture.
