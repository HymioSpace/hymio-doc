# Oath

Oath is a harness for personal agents: a server-side execution framework that manages execution state and scheduling. It lets an agent keep working between conversations: a client can submit a task and disconnect while the server continues, then return for persisted events.

Here, runtime means a server program that manages execution state and scheduling. It is not a browser or frontend runtime.

It fits applications that need long-running work, asynchronous tool results, or access from multiple clients. Oath does not provide product accounts, chat UI, or the task business state owned by an application.

## See the runtime first

<OathOverviewMap />

## Terms used in this section

These terms appear throughout the documentation. You do not need to memorize the internals before starting; understand what each part owns.

### Execution path

| Term | What it means here |
| --- | --- |
| Agent | A model-driven unit that can call tools and advance work. Oath manages its execution; the application defines its product identity. |
| Client | A Web, desktop, or iOS application that sends messages and receives events. It does not run the agent. |
| Message / Event | A message is business input or output. An event is a durable, ordered execution fact that can be replayed. Tool results are events too. |
| Gateway | The WebSocket entry for commands, event delivery, and client connections. |
| Biz | The HTTP entry for trace queries and application CLI commands. |
| Queue | Three input paths: User, Tool, and System, for messages, tool results, and interventions. |
| Buffer | The durable pending set behind a queue. Disconnecting a client does not erase it. |
| Intake | Claims a fixed batch from durable buffers for the next step. |
| Step | One bounded model advance with fixed input, a model request, and optional tool submissions. |
| Worker | A shared unit that executes a Step. Users do not own permanent Worker threads. |
| Brain | The Worker component that builds context, prepares the model request, and processes the result. |

### Tools, state, and recovery

| Term | What it means here |
| --- | --- |
| Manager | Schedules work and grants leases for the current Step. |
| Lease | Execution ownership that expires. A stale Worker cannot continue as the current owner. |
| Tool | A callable capability. Each Invocation has identity, arguments, a deadline, approval state, and a terminal result. |
| Skill | Markdown guidance that tells the model when and how to use capabilities. |
| CLI | An application command exposed over HTTP and callable through `oath-cli` from Bash. |
| Storage | Oath's durable state boundary. The current implementation uses SQLite for state and the journal. |
| Journal | An append-only record of execution facts used for recovery and traces. |
| Outbox | Events committed with runtime state and delivered asynchronously to the queue. |
| ACK | Confirmation that input or an event was durably accepted. It does not mean model work is complete. |
| Cursor | A client-specific event position used to replay events missed while disconnected. |
| Supervisor | An independent service that checks durable pending work and requests wake-up. An empty buffer makes no model call. |
| Trace | The observed Step, model request, tool call, and timing history for a task. |
| `user_id` | Oath's isolation identity. One `user_id` maps to one continuing conversation; no session creation is required. |

## Three foundations

- **Event-driven**: user input, tool results, and system interventions use separate queues. Tool results can also drive another step.
- **Durable**: Journal, Storage, outbox, and leases preserve execution facts for recovery and event replay.
- **Supervised**: an independent Supervisor checks pending work and requests wake-up; an empty buffer does not call the model.

[Execution architecture](./architecture) explains how these mechanisms work together and includes an interactive input-flow demo.

## Real integration case: a phone task returns a server-produced result

In this run, we created `Weekend packing check` in native Hymio iOS. It first appeared as scheduled, then its detail showed an actual completed checklist and unresolved questions. The user did not have to stay on the chat screen; Web could inspect the same task.

Oath advanced model and tool execution while Hymio stored and displayed Task / Run business state. A successful tool call alone is not task completion. See the captured [native task case](../hymio/tasks#real-case-create-a-departure-check-task-on-iphone).

## Start here

| Goal | Read |
| --- | --- |
| Run it first | [Install & run](./getting-started) |
| Understand execution and recovery | [Architecture & execution](./architecture) |
| Connect your client | [WebSocket & HTTP](./protocol) |
| Add tools, CLI commands, or skills | [Extensions](./extensions) |
| Configure prompts, models, and auth | [Runtime configuration](./configuration) |
| Create bounded subagents | [Subagents & application events](./delegation) |

## Build in this order

1. Start the runtime with `oath start`, then verify the model and tool path with the included terminal client.
2. Send `user.message` from your client and handle acceptance, events, and cursors. Do not duplicate server-side conversation state.
3. Keep business capabilities in your application and expose them through a Tool, CLI command, or Skill. Keep accounts, authorization, and business data out of Oath Core.
4. Use traces to inspect model requests, tool calls, and step links, then add idempotency and recovery based on real failure boundaries.

```sh
oath start \
  --system-prompt ./prompts/assistant.md \
  --skill ./skills \
  --tool ./tools \
  --cli ./cli
```

## Runtime boundaries

- External identity is `user_id`; there is no product session-creation API.
- An idle user does not need a permanent Worker thread.
- Accepted work is independent of a WebSocket connection.
- User, tool, and system input use separate admission paths.
- Oath owns execution state; accounts, task business state, and device quotas remain in the application.

## Current scope

The default deployment is single-host Docker Compose with separate services, SQLite through a Storage owner, RabbitMQ, and Vault. Automatic database failover and broker clustering are not included.

The default trusted access mode and allow-all tool policy are for local or controlled environments. Configure authentication and execution isolation before admitting untrusted callers.
