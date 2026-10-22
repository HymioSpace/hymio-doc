# Application architecture

Hymio is a modular application monorepo. Oath remains an independent runtime. Clients use product APIs and an authenticated gateway rather than owning runtime deployment.

## Real case: one travel file appears across two clients

The [attachment case](./media#real-case-supply-a-travel-note-as-an-attachment) uploaded `trip-notes.txt` from Web. Backend stored the account-owned attachment; a user message referenced it; Oath advanced the model and required tools; the reply appeared in Web and native iOS through the event path.

The phone did not upload a second file or run a local parsing service. This reproducible case separates client input, product-file ownership, agent execution and presentation across devices.

## Request path

<ProjectOverviewMap kind="hymio" />

The public WebSocket entry is Backend's `/agent/ws`; Oath addresses are private upstream configuration. The same product user ID scopes tasks, attachments, devices and the continuing conversation.

## Client scope

| Client | Status | Notes |
| --- | --- | --- |
| Web / Desktop | Current | Shared React frontend using product APIs and `/agent/ws` through Backend |
| iOS | Current | Native SwiftUI using the same backend and event contract |
| Browser extension | Scaffold | Responsibility directory exists; page capture and full client capabilities are still in progress |
| Apple Watch | Planned | Intended for quick input, notifications and task status |
| Android | Planned | Will reuse the backend, authentication and event protocol |

Clients share product identity and state, but each maintains its own event cursor. Closing a client does not cancel work already accepted by Oath.

## Repository map

| Directory | Responsibility |
| --- | --- |
| `apps/client` | React Web / Tauri client |
| `apps/ios` | Native SwiftUI client |
| `apps/admin` | Independent operator console |
| `packages/client`, `packages/protocol` | Client transport and shared contracts |
| `packages/ui` | Shared visual tokens and Web components |
| `backend/hymio_backend` | Authentication, tasks, media, devices, gateway |
| `extensions/{skills,tools,cli}` | Application capabilities loaded by Oath |
| `deploy` | Local and cloud composition |

## State ownership

Backend uses its product SQLite database for account mappings, hashed credentials, tasks, attachments and device-operation records. Oath owns its separate execution database through Storage. Sharing a product identity does not require sharing database tables.

User tokens are checked at the Backend boundary. Service-authenticated internal routes receive authoritative user context from trusted callers. CLI and tool adapters do not implement their own account or quota database.

## Implement an application capability

Keep validation and business state in a Backend service. Expose a bounded authenticated operation, then add a small Tool or CLI adapter and a Skill explaining when to use it. UI actions use the same authorization and business rules.

Nostalgia and Kits are not running dependencies of this installation. Their planned integration should use public contracts rather than copying core implementations into Hymio.
