# Hymio

Hymio is a personal Agent application built around one continuing conversation. Tasks continue on
the server, personal memory remains attributable to its sources, and a selected device can carry out
tool work without becoming a new chat session.

Hymio owns the product: accounts, authorization, connectors, attachments, device grants, product
APIs and UI. [Oath](../oath/) owns durable task and Agent execution.
[Nostalgia](../nostalgia/) owns personal-context records, publication and retrieval.

<DocGallery :images='[{"src": "/screenshots/hymio-material-home.png", "label": "iOS · Today", "caption": "The compact Material shell keeps one current focus and collapses absent modules."}, {"src": "/screenshots/hymio-material-my.png", "label": "iOS · My", "caption": "Tasks, memory, connections and settings are grouped as list destinations."}]' />

## Start from a real flow

| What you want to do | Read |
| --- | --- |
| Install Hymio and reach the first reply | [Install & start](./getting-started) |
| Continue one conversation across iPhone, Web and Desktop | [Conversation & clients](./conversation) |
| Follow a durable task, Agent Team or workflow | [Tasks, agents & calendar](./tasks) |
| Add files, choose a model, or inspect generated images | [Models & attachments](./media) |
| Review footprints and published understanding | [Nostalgia overview](../nostalgia/) |
| Import email, tasks, calendar or health summaries | [Connections & devices](./devices) |
| Connect a personal Mac or Android device | [Devices & administration](./devices) |
| Operate accounts, providers, traces and Context | [Operator console](./admin) |
| Build against Hymio | [Architecture](./architecture), [HTTP API](./api), [UI/UX](./ui) |

<ProjectOverviewMap kind="hymio" />

## The product shell

The primary interface is intentionally small:

- **iOS** uses Today, Chat and My. Tasks, memory, connections, model preferences, notifications,
  devices and diagnostics live behind My.
- **Web / Desktop** use a labelled navigation rail and a wider content workspace. Tasks open in a
  list and detail inspector rather than competing with the conversation.
- **HymioDevice** is an outbound companion for a personal Mac or Android phone. It is an execution
  target, not another conversation client.

The product removes the old separate Memory tab from the iOS primary bar. A memory list, source
filter or generated illustration is never inserted as fake content when the account is empty.

## Conversation behavior

One user has one continuing conversation, not one chat session per client. Sending a message:

1. writes a pending item locally;
2. submits a stable command identity to Backend/Oath;
3. treats ACK as durable acceptance, not task completion;
4. follows the real last visible content after the keyboard closes;
5. keeps expanded working details anchored to their row and lets them grow downward.

The conversation must not create a large blank area above the latest message. A completion layout
change, keyboard dismissal and a working-detail expansion are handled without competing scroll
timers. History remains stable while the new tail streams.

## Tasks are not cron entries

The task screen is the durable work inventory. It separates:

| Concept | Meaning |
| --- | --- |
| Time scope | Temporary one-off work or ongoing tracking/recurrence |
| Execution mode | Deterministic program, parallel Subagents, Agent Team or Dynamic Workflow |
| Task | The durable intent and requirements |
| Run | One execution attempt with a checkpoint and result |
| TaskAgent | The Agent bound to one Agent-backed Run |

Schedules and reminders are optional triggers. They do not define the task system, and not every
task needs a schedule. A cancelled task leaves the current list and is not counted as successful.

## Memory is a service boundary

Nostalgia is implemented and integrated when the user has a private binding. Hymio's Memory surface
shows:

- **Footprints** — original records and their actual source;
- **Remembered understanding** — published cards with evidence;
- provider-specific chips such as Gmail or Dida only after records from that source exist;
- separate loading, unavailable and confirmed-empty states.

Connector provider names such as Gmail or Dida are not built-in memory categories. They appear only
after a user connects the provider and records arrive. A read failure never turns into a fabricated
empty account.

## Current boundaries

| Area | Current status |
| --- | --- |
| Web, Desktop, iOS | Available |
| Personal Mac and Android execution | Available through HymioDevice, subject to OS permissions |
| Managed cloud desktops | Available when an operator grants a provider |
| Gmail, Dida, Calendar, Health connectors | Read-only foundation; private/deployment validation still required |
| Chrome extension | Responsibility scaffold |
| Apple Watch, user-facing Android app | Not shipped |
| Cloud phone and manual takeover | Not shipped |
| Kits and generated application runtime | Retired |

The authoritative cross-project status is on the [status page](../status).
