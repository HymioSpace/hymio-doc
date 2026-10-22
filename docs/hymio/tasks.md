# Tasks & scheduling

A task records an intended outcome. A run records one attempt to achieve it. Scheduling is one way to start an attempt; work captured from an ongoing conversation is another.


## Real case: create a departure-check task on iPhone

In native iOS Tasks, we created `Weekend packing check`: organize checks for an ID card, charger, umbrella and hotel luggage storage, answer in Chinese and avoid cloud-computer operations.

1. **Set the goal:** enter a title and objective, choose now, and submit.
2. **Acceptance and sync:** iPhone first shows the task as scheduled. Web under the same account can open the task and its single execution record.
3. **Inspect the outcome:** after completion, the iPhone result detail lists three categories of checks and explicitly preserves hotel questions that the traveler must confirm.

<DocGallery :images='[{"src": "/screenshots/hymio-ios-task.png", "label": "iOS · scheduled", "caption": "Native iOS: the submitted task is scheduled."}, {"src": "/screenshots/hymio-ios-task-result.png", "label": "iOS · completed", "caption": "The same task after completion: outcome, unresolved questions and work record."}, {"src": "/screenshots/hymio-tasks.png", "label": "Web · original", "caption": "Original Web task-detail example, using demonstration records created through the product data layer."}]' />

The completed objective is to organize a checklist, not to verify the hotel's policy. Scheduled is not completed; inspect the particular run and its outcome.

## Use a task

Ask the agent to do something with an identifiable outcome, or create it in Tasks. Give a clear objective and completion condition. Inspect the current phase, latest progress, next step and final result from its detail view.

Examples include comparing options, preparing a document, and sending a one-time reminder. A greeting or an undecided idea does not need a task.

## Two state machines

| Record | States |
| --- | --- |
| Task | `active`, `paused`, `cancelled`, `archived` |
| Run | `scheduled`, `delivering`, `ready`, `running`, `blocked`, `succeeded`, `failed`, `cancelled`, `expired` |

A task can remain `active` while its most recent run has succeeded. For a recurring task, the next occurrence is planned after the current run terminates. A tool result alone does not establish completion of the overall task.

Pause prevents pending scheduled work from being admitted. Cancel also ends linked delegation. An external action already dispatched cannot be undone by changing the task state.

## Scheduling contract

Schedules support `now`, `once`, `daily` and `weekly`. Timed schedules require an IANA timezone. One-time `at` values must include an offset; weekly weekdays use Monday = 0.

```json
{
  "action": "create",
  "title": "Review the weekly plan",
  "objective": "Review open items and suggest next steps",
  "success_criteria": "A concise review is posted in the conversation",
  "schedule": {
    "mode": "weekly",
    "timezone": "Europe/London",
    "weekday": 0,
    "time": "09:00",
    "grace_seconds": 900,
    "run_timeout_seconds": 3600
  }
}
```

Send this body to `POST /tasks` with the user's bearer token. Backend uses indexed due times and a bounded scheduler loop; no daily cron planner is required. Due delivery uses `app.task.due` and a stable run ID. Start checks the task generation and state again, rejecting stale deliveries.

Overdue work is reconciled against its grace period. Outside the allowed window it can expire instead of executing a stale reminder. Recurrence catches up at most once rather than replaying every missed occurrence.

## Conversation capture and delegation

The internal `capture` action records already-admitted work without submitting another due event. A stable `intent_key` prevents duplicate capture. Public clients cannot call capture.

A running task can attach a bounded Oath subagent using the run ID as request identity. Backend mirrors findings and terminal status into the task history. Oath owns child execution; Hymio owns the task's business state.

Implementation: [task specification](https://github.com/HymioSpace/Hymio/blob/main/spec/feature23-tasks-and-delegation.md).
