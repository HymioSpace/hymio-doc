# Architecture & execution semantics

Oath is an execution runtime for personal agents. A client submits input; Oath persists it, schedules model steps, runs tools and produces events on the server. Disconnecting a client does not revoke accepted work.

Oath owns execution state, not product accounts, chat UI or task business data. Those remain with the application that embeds it.

If a term is unfamiliar, start with the [overview glossary](./#terms-used-in-this-section).

## Three foundations

These describe how the runtime makes progress. They are not three independent feature switches.

| Foundation | Core implementation | What it means for developers |
| --- | --- | --- |
| Event-driven | User, tool and system inputs use separate queues and durable buffers; Brain receives a fixed batch | New input and tool results can drive later steps without binding the whole job to one WebSocket or blocking loop |
| Durable | Journal, Storage, transactional outbox and fenced leases | Accepted input, execution state and outbound events survive disconnects and Worker recovery |
| Supervised | An independent Supervisor checks durable work and requests wake-up through `system.invoke` | Pending work can resume; an empty buffer does not call the model |

### Event-driven

User messages, tool results and system interventions use separate queues. Each consumer decides when its inputs justify a wake-up. Intake then claims a fixed batch from durable buffers for Brain.

A tool result is also an event. One tool can wait for approval while other submitted tools execute. An early result can drive the next step; a later approval or result re-enters through the system or tool path.

### Durable

The journal is an append-only record of execution facts. Inputs, tool state, execution ownership and outbound events are persisted through Storage. A transactional outbox connects committed state to queue delivery, while a fenced lease prevents an expired Worker from committing as the current owner.

Durability does not make arbitrary external effects exactly-once. If a tool may have changed a remote system before timing out, the runtime cannot infer the outcome from local records alone. Non-repeatable tools still need idempotency or reconciliation.

### Supervised

The Supervisor is a separate observer of durable pending work. It periodically checks for work and sends `system.invoke` when needed. An empty buffer does not trigger a model call.

Process restart belongs to Docker or another deployment manager. Trace-aware diagnosis and model-assisted repair remain future work.

<EventJourney />

## How one input advances

1. Gateway accepts a user command. ACK means durable acceptance, not a completed model response.
2. Intake claims a fixed batch from the relevant buffer and creates a bounded Step.
3. Manager grants a Worker a lease. The Worker prepares a frozen model request and calls the model.
4. The model may submit tools. Each invocation has an identity, deadline, approval state and immutable terminal result.
5. Tool results return to the tool queue and can drive a subsequent model step.
6. Output becomes durable events. Each client receives and acknowledges events from its own cursor.

Completing a Step must not remove input that arrived while it ran. Brain does not consume queues itself, and users do not own permanent Worker threads.

## Service responsibilities

| Service or module | Owns |
| --- | --- |
| Gateway / outbound | Client commands, persisted delivery and independent client cursors |
| Consumers / Intake | Queue admission, durable buffers and fixed input batches |
| Manager / Workers | Leases, scheduling and a bounded Worker pool |
| Brain | Context, frozen model requests and postprocessing |
| Tool system | Invocation identity, approvals, deadlines and terminal results |
| Storage | SQLite transactions, execution state and the journal |
| Queue | RabbitMQ delivery, confirmations and outbox relay |
| Supervisor | Pending-work checks and `system.invoke` |
| Biz | HTTP trace, CLI and application-event interfaces |

These modules collaborate through explicit contracts. Application capabilities belong in Tool, CLI and Skill extensions; Core does not depend on a specific product.

## Build an integration

| Goal | Next step |
| --- | --- |
| Run Oath locally | [Install & run](./getting-started) |
| Connect your client | [WebSocket & HTTP](./protocol) |
| Add a tool, CLI command or skill | [Extensions](./extensions) |
| Configure models, prompts and auth | [Runtime configuration](./configuration) |
| Delegate bounded subtasks | [Subagents & application events](./delegation) |

A common startup looks like:

```sh
oath start \
  --system-prompt ./prompts/assistant.md \
  --skill ./skills \
  --tool ./tools \
  --cli ./cli
```

Clients send `user.message` through Gateway and receive events. Biz exposes trace queries and application commands. Keep business validation, user authorization and durable business state in the application, then expose bounded Tool or CLI adapters to the agent.

## Current boundaries

The default deployment is single-host Docker Compose with one SQLite owner, one RabbitMQ node and one Vault node. Service boundaries support further evolution, but automatic database failover and broker clustering are not included.

The default trusted access mode and allow-all tool policy suit local and controlled environments. Configure authentication and execution isolation before admitting untrusted callers.

The full execution contract is [Distributed personal-agent execution](https://github.com/HymioSpace/Oath/blob/main/spec/feature-distributed-personal-agent.md).
