# Hymio

Hymio is a personal-assistant application built on Oath. It provides clients, accounts, a continuing conversation, tasks, attachments and access to execution devices.

Start with the concepts below, then choose a guide for using or extending the application. To embed Oath in another application, start with the [Oath documentation](../oath/).

<DocGallery :images='[{"src": "/screenshots/hymio-ios-chat.png", "label": "iOS", "caption": "Native iOS: a demo account receives an actual packing-list reply."}, {"src": "/screenshots/hymio-home.png", "label": "Web", "caption": "Original Web home example: an isolated demo account and synthetic tasks."}]' />

## Real cases to start with

- [Cross-device continuity](./ios): request a packing list on iPhone, refine it on Web and receive the result back on the phone.
- [Models & attachments](./media): synchronize a preference, upload a travel note and read its actual summary on iPhone.
- [Tasks & scheduling](./tasks): create a task in native iOS and inspect its actual completed result.
- [A2UI](./ui): interact with a model-generated native card and inspect the ordinary message its button sends.
- [Devices](./devices) and [the console](./admin): distinguish online clients, permission grants and allocation using an actual persisted grant.

## See the overall structure

<ProjectOverviewMap kind="hymio" />

You send a request through a client. Hymio checks identity and permissions, then Oath advances agent execution. Accepted work can continue on the server after the client closes. Nostalgia is a planned context component and is not integrated into this flow yet.

## Terms used in this section

| Term | Meaning here |
| --- | --- |
| Agent | An AI-driven assistant that can use tools to complete work. |
| Client | The Web, desktop or iOS interface where you send requests and read progress. |
| Backend | Hymio's server: accounts, permissions, product data and the connection to Oath. |
| Oath / harness | The execution framework that connects models and tools and saves progress; [read its overview](../oath/). |
| Task | A goal and its completion criteria, such as a weekly review of pending work. |
| Run | One execution attempt. A recurring task has multiple runs; completing one does not cancel its schedule. |
| Attachment | A file stored under your account for the agent to read; supplied through Web / Desktop or native iOS attachment controls. |
| Execution device / cloud computer | A remote environment used by the agent, separate from the device where you read chat. |
| Provider | An external model or cloud-computer service configured by the operator. |
| Operator console | A separate interface for granting resource access, viewing capacity and managing devices. |
| Hymio UI / A2UI | A restricted protocol for cards, choices and forms in assistant replies; [try an example](./ui#try-an-example). |
| Kit | A planned application capability module, not integrated yet. |
| ACK / cursor / trace | Input acceptance, a client's received-event position, and a technical execution record. An ACK does not mean the task is complete. |

## Choose a starting point

| Goal | Read |
| --- | --- |
| Run the application locally | [Install & start](./getting-started) |
| Continue a conversation across clients | [Conversation & clients](./conversation) |
| Track work or schedule a reminder | [Tasks & scheduling](./tasks) |
| Upload a file or choose a model | [Models & attachments](./media) |
| Enable a cloud computer or manage access | [Devices & administration](./devices), [Operator console](./admin) |
| Use an iPhone | [Cross-device continuity](./ios) |
| Configure LAN or cloud access | [Configuration & deployment](./configuration) |
| Develop an integration | [Architecture](./architecture), [HTTP API](./api), [UI protocol](./ui) |

## Product boundaries

Hymio owns identity, authorization, task state, uploads and device allocation. Oath owns agent execution and event delivery. Nostalgia is a separate personal-context design project and is not integrated yet.

Web and Tauri share a React frontend. iOS is a native SwiftUI client using the same backend and event contracts. The operator console is a separate application at `/admin/`. Chrome extension structure exists; it does not currently match the main clients' capabilities.

## Current limitations

This is an evolving MVP. Cloud devices require explicit operator access. Native control of a user's Mac and cloud-phone execution are not available. Kits and Nostalgia integration remain future work.
