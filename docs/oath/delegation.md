# Multi-agent tasks and collaboration

Oath now runs durable work as a task system, not as one unbounded conversation with ad-hoc
children. The central rule is simple:

> Every Agent-backed TaskRun has one TaskAgent, and every collaborating Subagent belongs to that
> TaskRun. A deterministic `program` Run has no TaskAgent.

The second rule is **explicit ownership**. A Task has one coherent outcome. Every Subagent or
Workflow node receives one concrete deliverable, required source inputs, in-scope work,
exclusions/non-goals, observable acceptance criteria and a stop condition for insufficient or
conflicting context. The TaskAgent retains final decisions, cross-part integration and completion.

This rule makes multi-agent work observable, recoverable and safe to control. A user can cancel one
task without deleting the conversation, inspect which Agent is doing what, and understand whether
work is still running or merely scheduled for later.

## Executive summary

Five decisions define the current model:

1. **A Task records intent; a Run records execution.** “Follow my weight for six months” is a Task.
   The report generated on Tuesday is one Run.
2. **One TaskAgent owns each Agent-backed Run.** The interaction Agent creates work and returns to
   the conversation; the TaskAgent executes in an isolated context. Program runs execute a fixed
   action without an Agent.
3. **Every Subagent is bound.** There are no unbound background children. Temporary parallel work
   first becomes a one-off Task.
4. **Execution mode is independent from time.** A one-off research task and a recurring tracking
   task can both use parallel Subagents, Agent Team or a Dynamic Workflow.
5. **Primary UI shows collaboration; deeper UI shows evidence.** Users first see status, results,
   the leader and teammates. Agent context, messages, execution records and tool calls are one level
   deeper.

## The two independent axes

Multi-agent products often confuse schedule with execution architecture. Hymio keeps them separate.

| Axis | Values | Answers |
| --- | --- | --- |
| Time | temporary, ongoing | Is this a bounded one-off task or continuing tracking/recurrence? |
| Execution | program, parallel Subagents, Agent Team, Dynamic Workflow | How is this attempt carried out? |

All combinations are valid:

| Example | Time | Execution |
| --- | --- | --- |
| Send a fixed reminder at 20:00 | temporary or ongoing | program |
| Research three vendors once | temporary | parallel Subagents |
| Weekly competitive briefing | ongoing | Agent Team |
| Build a report with dependent research stages | temporary | Dynamic Workflow |

The selected execution mode is not a display label. Oath injects the selected mode into the bound
TaskAgent's system prompt and first assignment as a hard execution contract. A
`parallel_subagents` TaskAgent must create at least two independently bounded leaf Agents before
broad work; `agent_team` requires actual teammates and durable team communication; and
`dynamic_workflow` requires a persisted DAG before node execution. If the Task cannot honestly be
split that way, the TaskAgent reports a concrete blocker instead of claiming that the selected mode
was followed while executing serially.

## Four execution modes

### 1. Program execution

Use `program` for deterministic work that does not need model reasoning: a fixed reminder,
notification, or application action with stable parameters. Oath starts no TaskAgent and no
Subagent. Delivery receipt is separate from task completion.

### 2. Parallel Subagents

Use `parallel_subagents` when the leader can divide independent work, run bounded children, then
integrate the results. Each child has its own context, journal, step budget, deadline and terminal
result. Children return findings to the TaskAgent; they cannot delegate again.

Children must have non-overlapping responsibilities. A vague assignment such as “research the
topic” is invalid because it gives the user no stable boundary for progress, acceptance or
cancellation.

Best for:

- comparing independent sources;
- collecting several bounded datasets;
- separate checks whose results the leader can merge.

### 3. Agent Team

Use `agent_team` when members need to communicate while the work is still in progress. The TaskAgent
acts as leader. Teammates can send durable peer messages, reply to the leader, and read messages in
which they are sender or recipient.

Each teammate has a distinct owned boundary. Communication may change how work is coordinated, but
it does not transfer final accountability away from the TaskAgent.

Team communication is not a transient WebSocket message. Each record stores:

- Task and Run;
- sender and recipient Agent IDs;
- content and timestamp;
- a stable message ID for idempotency.

The inspection API joins those IDs to current Agent titles before displaying the message.

The task-level collaboration view should read **sender → recipient**. A deeper Agent view shows the
full message and the messages relevant to that member.

<DocFigure
  variant="phone"
  src="/screenshots/hymio-material-agent-communication.png"
  caption="Agent detail makes communication directional: sender name → recipient name, followed by the durable message."
/>

### 4. Dynamic Workflow

Use `dynamic_workflow` when the TaskAgent must first decide dependencies between bounded nodes.
`workflow_define` persists a DAG. Each node is a bound Subagent. The scheduler:

1. starts root nodes;
2. marks a node ready only after every dependency succeeds;
3. propagates failure to dependent nodes;
4. enforces the active-Agent limit;
5. wakes the TaskAgent only after the final join.

The leader receives the node results when it is woken for integration. It must not declare the Task
complete while any workflow node is unfinished.

Each node must be independently verifiable and state its own inputs, scope, exclusions and bounded
output. Dependencies must represent a real data or decision handoff. The consumer view renders the
edges as a DAG; it does not display Agent-to-Agent communication because that concept belongs to
Agent Team.

When a node becomes ready, the scheduler injects the bounded outputs of every dependency into its
assignment. The node must not scan devices, conversation history or the filesystem to rediscover
those inputs. The TaskAgent also sends a concise progress checkpoint after each meaningful tool
batch or eight active steps so background token use never becomes an invisible loop.

The interaction Agent may propose the initial Task plan. It cannot call `workflow_define`; the bound
TaskAgent owns that operation. Nodes are rows in `task_workflow_nodes`, scoped by Run, with each row
recording its dependency list and bound Subagent. No workflow graph is stored in an external file.

## Task, Run and Agent hierarchy

| Level | Owner | Responsibility |
| --- | --- | --- |
| Task | Oath task database | Durable intent, acceptance, plan, trigger, policy, budget and memory |
| TaskRun | Oath task database | One execution attempt, status, checkpoint, result, usage and control epoch |
| TaskAgent | Dedicated delegated Agent for Agent-backed Runs | Executes the Run and owns integration/verification |
| Team member | Subagent bound to the same Run | Executes a bounded responsibility and communicates within that Run |
| Workflow node | Persistent graph node plus bound Subagent | Waits for dependencies, executes and returns one bounded result |
| Interaction Agent | Main conversation | Creates and controls Tasks, stays responsive to the user |

The interaction Agent cannot create an unbound Subagent. Temporary parallel work and long-running
work both become Tasks first.

## Execution flow

1. The interaction Agent accepts a user goal.
2. It creates a Task with trigger, executor, acceptance, context, plan and budget.
3. The task scheduler creates a queued TaskRun.
4. A program Run executes its deterministic action. An Agent-backed Run creates and binds a
   TaskAgent.
5. For an Agent-backed Run, the TaskAgent either:
   - works directly;
   - creates parallel Subagents;
   - creates teammates and exchanges durable messages;
   - defines a Dynamic Workflow DAG;
   - reports a concrete wait or blocker.
6. Child results return through durable queues.
7. The TaskAgent integrates the result and reports completion.
8. Hymio displays task state and result; notification delivery remains a separate concern.

Supervisor can wake or reconcile either kind of Run from durable state. It is not a second reasoning
model and does not decide that a research result satisfies the user's goal.

## State machines

### Task

| State | Meaning |
| --- | --- |
| `active` | Accepted and may create future Runs |
| `paused` | No new execution should start |
| `closed` | Terminal; `close_reason` is `achieved`, `cancelled` or `expired` |

### Run

| State | Meaning |
| --- | --- |
| `queued` | Ready to acquire execution |
| `running` | The program action or TaskAgent is active |
| `waiting` | Waiting for a declared condition such as children, time, event, user or tool |
| `paused` | Stopped with resumable checkpoint or attention required |
| `succeeded` | Current Run produced an accepted result |
| `failed` | Current Run terminated without success |
| `cancelled` | Run and owned execution were stopped |

### Workflow node

The normal path is `pending → running → succeeded`. `pending` means only that the start condition has
not been satisfied. Once every dependency succeeds, the scheduler must release the node instead of
leaving it labelled as waiting for dependencies.

An already-started node becomes `paused` when its owning Run pauses. `paused` is neither `pending` nor
failure: the UI says the execution is paused, and resuming continues the same node and bound Subagent
without recreating the Run or discarding progress. Terminal states are `failed`, `blocked` and
`cancelled`; cancellation moves every unfinished node to `cancelled`, including nodes that were paused.
A dependent node becomes `blocked` when an upstream dependency does not succeed.

### Subagent

Members can be `waiting`, `running`, `succeeded`, `failed`, `cancelled` or temporarily `paused`.
When the owning Run pauses, its TaskAgent and running children must stop advertising themselves as
running. Program Runs have no member rows.

## Cancellation and pause are not completion

Cancellation is a terminal user action. It must:

- close the Task as `cancelled`;
- mark the open Run `cancelled`;
- stop future triggers;
- stop or cancel bound members;
- prevent stale messages from resuming the work;
- remove the task from the current task list.

A cancelled task is **not completed**. “Completed” means successful outcome, not “the row has
stopped moving”. If a product needs an archive, cancellation belongs in a separate archive/history
surface, not inside the success group.

Pause is different. It preserves the ability to resume and must leave a truthful checkpoint. Budget
exhaustion and no-progress detection normally pause for attention rather than pretending success.

## Failure and recovery

| Failure | Required behavior |
| --- | --- |
| Budget exhausted | Persist partial checkpoint, pause owner, stop or pause children, request attention; after user authorization the Agent may raise the current Run budget and resume the same Run |
| No progress | Pause only when no active external tool remains |
| Child fails | Parent can inspect the failure; Dynamic Workflow blocks dependent nodes |
| Agent ends without report | Pause with `REPORT_REQUIRED`; never infer completion from process exit |
| Stale run finishes | Lease/control fencing prevents it from overwriting newer state |
| User cancels | New events and stale timers cannot revive the cancelled Run |
| Service restart | Supervisor reconciles durable Runs, queues and terminal Agent rows |

Recovery is based on durable facts. Restarting a process is not evidence that an external side
effect did or did not happen; uncertain effects require reconciliation.

Budget continuation is not cancel-and-recreate. `task_adjust_budget` validates
`BUDGET_EXHAUSTED`, increases step/token/time limits above current usage, keeps the same Task, Run,
checkpoint and result history, and queues that Run again. The tool belongs to the interaction Agent;
the task UI only explains that continuation should happen in conversation.

## Communication and context model

### What is shared

- Task goal, acceptance criteria and policy;
- explicit context references supplied by the interaction Agent;
- durable Team messages;
- child findings and final result;
- workflow node outcomes;
- Task memory between Runs.

### What remains isolated

- Each Agent's journal and model context;
- each Agent's tool approvals and terminal records;
- each TaskRun's spec snapshot and checkpoint;
- per-Agent budgets and deadlines.

The system should not copy the whole main conversation into every worker. Broad context increases
cost and can leak unrelated personal information. The TaskAgent must provide enough task-specific
material for each assignment.

Occurrence timestamps remain UTC for durable ordering. When events are injected into model context,
the event `<time>` is converted to the latest client-supplied `time_zone` and the timezone is included
as context metadata. This is presentation context, not a second stored clock.

For recurring Agent work, each TaskRun is scoped to one `due_at` occurrence. Its TaskAgent receives
that occurrence time, analyzes evidence for that occurrence, and completes it before a later
occurrence creates a new Run. Previous Task memory is background history, not a batch of pending
results; multiple due times must not be merged into one model response.

## User-visible layers

### Primary task view

Keep this small:

- title and current state;
- one temporal label;
- one execution-mode label;
- current user-visible result or blocker;
- leader and bound members;
- compact plan, or a Workflow DAG with directed dependency edges.

### Agent detail

Expose:

- Agent responsibility and acceptance;
- sender → recipient communication records;
- intermediate and final results;
- chronological execution history;
- semantic tool-call descriptions.

### Technical inspection

Raw tool JSON, trace IDs, journals and event payloads belong in an operator/developer view, not the
default consumer task screen.

## Tool boundaries

| Tool family | Available to |
| --- | --- |
| `task_create/list/get/update/message/pause/resume/cancel/retry/adjust_budget` | Interaction Agent |
| `task_report` | TaskAgent |
| `subagent_spawn/list/get/cancel/continue` | TaskAgent only |
| `subagent_notify` | Bound member |
| `team_send/inbox/members` | TaskAgent or teammate in `agent_team` mode |
| `workflow_define/status` | TaskAgent in `dynamic_workflow` mode |

Registration, model-facing definitions, admission checks and Storage execution all enforce the same
boundary. Hiding a tool from the prompt is not sufficient authorization.

## API projection

`task_get` with execution enabled returns:

- executor kind and execution mode;
- TaskAgent;
- bound Subagents and delegation role;
- recent activity with tool name and semantic description;
- Team messages;
- workflow nodes and edges;
- plan, usage, checkpoint, wait and recent task events.

The consumer task screen should not display the raw technical fields directly. It should translate
them into a stable hierarchy and keep tool details one level deeper.

## Limits and safety

- Subagents are bounded by steps, time and terminal status.
- A user has a finite number of active delegated Agents.
- Workflow nodes are bounded and validated as a cycle-free DAG.
- Team messages are Run-scoped and recipient-allowlisted.
- Tool approvals remain per Agent; a child never inherits an unbounded approval.
- Cancellation cannot undo an external action that already ran. It only prevents later work and
  records the remaining uncertainty.

## Next observability layers

The current implementation already has bound members, durable communication, DAG scheduling and
per-Agent activity. The next work should deepen those layers rather than call the existing modes
“future”.

### Phase 1: explicit team roster

Define leader, teammate, responsibility, tools and communication allowlist before execution.
Show the roster in the primary collaboration view.

### Phase 2: shared team artifacts

Add explicit shared findings and artifacts instead of broadcasting every message. Keep private
Agent journals isolated while allowing selected evidence to become team-visible.

### Phase 3: team communication graph

Expose who can talk to whom and which message caused a change in plan. Detect deadlocks, repeated
handoffs and members waiting for information that was never sent.

### Phase 4: dynamic leadership and conflict resolution

Allow a team to propose a new plan or rebalance work. The TaskAgent remains accountable unless the
task policy explicitly permits leadership transfer. Conflicts must resolve through evidence and
declared responsibility, not conversation volume.

### Phase 5: deeper team observability

Provide a first-level collaboration graph, a second-level Agent transcript and a third-level tool and
trace view. The levels should share identities and ordering so users can move from “who is working
with whom” to “what exactly happened” without losing context.

## Design rules for consumer products

- Show exceptions inside the affected task, not in a detached duplicate alert.
- Treat cancellation as history, not success.
- Put completed and cancelled work in a separate Archive; hide is soft and owner-scoped.
- Use one label for execution mode; place its explanation behind a small help affordance.
- Use `A → B` for communication direction; “from/to” without names is not enough.
- Use a DAG for Dynamic Workflow and omit Agent communication from that mode.
- Hide raw budget numbers in the primary list; show them in the task's run details.
- Keep the main task page concise and place diagnostics one level deeper.

## Related documents

- [Hymio task experience](../hymio/tasks)
- [Oath architecture](./architecture)
- [Tool, Skill and CLI boundaries](./extensions)
- [Oath task-system specification](https://github.com/HymioSpace/Oath/blob/main/spec/feature-task-system.md)
