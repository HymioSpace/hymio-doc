# HTTP API

Backend authenticates user APIs with a product access token. User ownership comes from that token; a client cannot change ownership by passing another `user_id`.

```sh
curl -H "Authorization: Bearer $HYMIO_ACCESS_TOKEN" \
  "$HYMIO_BACKEND/auth/me"
```

The variables above represent your existing private configuration, not literal credentials to place in scripts. This page is an endpoint map, not a versioned OpenAPI specification.

## Real case: a model preference agrees across clients

In the [model case](./media#real-case-choose-a-model-on-iphone-continue-on-web), native iOS saved `MiniMax-M3` and Web under the same account read that selection. Both clients use Backend `/settings/models` rather than unrelated frontend switches.

These requests reproduce that API boundary. Variables refer to your deployment and demo-account credentials, not a public documentation endpoint:

```sh
curl -X POST "$HYMIO_BACKEND/settings/models" \
  -H "Authorization: Bearer $HYMIO_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model":"MiniMax-M3"}'
curl "$HYMIO_BACKEND/settings/models" \
  -H "Authorization: Bearer $HYMIO_ACCESS_TOKEN"
```

The returned `selected` should match the saved choice. Available models depend on deployment configuration. Saving a preference does not verify inference availability for every configured model.

## Authentication

| Endpoint | Input / behavior |
| --- | --- |
| `GET /auth/options` | Login presentation and available account options |
| `POST /auth/account` | `action: login/signup`, username, password, `invitation_code` when required |
| `POST /auth/start` | Start OIDC redirect flow with `return_uri` |
| `POST /auth/exchange` | Exchange `flow_id` and `login_code` |
| `POST /auth/refresh` | Rotate using `refresh_token` |
| `POST /auth/logout` | Revoke the current login |
| `GET /auth/me` | Verified identity |

Backend issues the application credentials accepted by product APIs and Oath's remote verifier. Casdoor owns password verification. Refresh/logout are application-session operations; they do not cancel accepted background work.

## Product operations

| Endpoint | Behavior |
| --- | --- |
| `GET /tasks` | List the owner's tasks |
| `POST /tasks` | `list`, `get`, `pause`, `resume` or `cancel`; creation and requirement edits remain Agent-managed |
| `GET/POST /settings/models` | Model allowlist, preference read/update |
| `POST /attachments` | Raw bytes with encoded `X-File-Name` |
| `GET /attachments/{id}` | Authenticated private content |
| `GET /devices` | List owned conversation channels and execution devices |
| `POST /devices/ensure` | Ensure an entitled user's computer; may return preparing |
| `POST /devices/execute` | Explicit device ID, invocation ID, capability and arguments |
| `GET /devices/{id}/commands/{invocation_id}` | Query a prior result without repeating effects |
| `POST /devices/{id}/pause`, `/resume`, `/revoke` | Lifecycle operations |
| `POST /devices/link/pairings`, `/claim` | Create or consume a personal-device pairing |
| `/devices/link/ws` | Outbound personal-device Link WebSocket |
| `GET /agent/traces`, `/agent/traces/{id}` | Owner-scoped Oath trace queries |

The public task surface intentionally cannot create arbitrary internal pending/completed states.
Creation, requirement changes, continuation and Agent completion reports go through Oath tools.
See [tasks](./tasks) for state semantics.

## Connections

| Endpoint | Behavior |
| --- | --- |
| `GET /connectors` | Provider catalog plus owned connection state; never returns credentials |
| `POST /connectors` | Create a connection after explicit consent |
| `POST /connectors/{id}` | `sync`, `pause`, `resume` or `disconnect` |
| `POST /connectors/{id}/authorize` | Begin a short-lived OAuth flow |
| `POST /connectors/{id}/ingest` | Installation-bound native Calendar/Health snapshot |
| `GET /connectors/oauth/{provider}/callback` | Single-use provider callback |

Only closed provider IDs and registered scopes are accepted. A missing provider registration returns
a deployment error; it does not create an empty source.

## Context and memory

| Endpoint | Behavior |
| --- | --- |
| `GET /context/assembly` | Stable `_core` plus dynamic summary; returns `available=false` when unbound |
| `GET /context/events` | Owner-scoped durable context event replay |
| `POST /context/browse` | Paged product projection for Footprints and published understanding |
| `GET /context/records` | Paged original-record proxy |
| `GET /context/records/{id}` | Exact original record and evidence |
| `GET /context/artifacts/{id}` | Exact published understanding card |
| `POST /context/saves` | User-authored footprint with source stamping |
| `POST /context/corrections` | Append a correction as new pending evidence |
| `POST /context/search`, `/retrieve`, `/graph` | Bounded retrieval proxy |
| `GET /context/injection` | `_index`, pending buffer and truncation metadata |

Backend resolves the Nostalgia endpoint and token by authenticated user. Clients never submit a
context host or credential.

## Notifications and policy

| Endpoint | Behavior |
| --- | --- |
| `GET/POST /notifications` | Device registration, delivery policy and authenticated notification actions |
| `GET/POST /settings/tool-authorization` | Effective tool policy |
| `GET/POST /settings/tool-authorization/rules` | User-managed exact rules |

Notification settings decide whether an eligible delivery class may reach APNs and whether lock
screen content is shown. They do not let the server impersonate the Agent's semantic message or
invent a task event.

## Operator API

The independent console is served at `/admin/`; its backend API uses `/admin/api/*`:

- `GET /admin/api/me`
- `GET /admin/api/resources`
- `POST /admin/api/resources/grants`
- `POST /admin/api/resources/devices/{device_id}`
- `GET/POST /admin/api/nostalgia`
- `GET /admin/api/monitoring/*`

These require a normal product session whose user ID is in `admin_user_ids`. Service credentials and client-provided role flags do not grant console access.

## Internal interfaces

`/internal/auth/verify`, `/internal/agent/context`, `/internal/dreaming/propose`,
`/internal/context/*`, `/internal/connectors/*`, `/internal/devices/*`, `/internal/media/*` and
`/internal/tool-authorization/check` are service-authenticated operations. Their credentials remain
on the server. The public HTTPS edge must return 404 for `/internal/*`.

`GET /health` and authenticated product metrics support liveness/observability. Health proves that a
process responds; it does not prove model inference, provider quota or physical-device permissions.

For WebSocket envelopes, see [Oath protocol](../oath/protocol). The Hymio public connection goes through `/agent/ws` and enforces product identity and model/attachment rules.

## Errors and retries

Interpret both HTTP status and the JSON `error` code. Authentication, origin checks, validation, capacity and provider availability can fail independently. Reuse the original invocation identity when reconciling a possibly dispatched operation. An HTTP timeout is not proof that a paid generation or desktop action did not happen.
