# Deployment and operations

Nostalgia is a separately deployable Python service. Hymio does not embed it in the Backend process,
and Oath does not need its Python package.

## Configuration

| Variable | Purpose |
| --- | --- |
| `NOSTALGIA_TOKENS_JSON` | Optional static JSON object mapping bearer tokens of at least 16 characters to stable owner IDs. It remains for migration and standalone testing; automatic Hymio provisioning does not require it. |
| `NOSTALGIA_DATABASE` | SQLite path; default `data/nostalgia.sqlite3`. |
| `NOSTALGIA_HOST`, `NOSTALGIA_PORT` | Listener address and port selected by the private deployment. |
| `NOSTALGIA_DREAMING_ENABLED` | Starts the scheduled dream worker. |
| `NOSTALGIA_DREAMING_INTERVAL_SECONDS` | Cycle interval; default 600, minimum 60. |
| `NOSTALGIA_DREAMING_PROVIDER_URL` | Private HTTP(S) proposal endpoint. |
| `NOSTALGIA_DREAMING_PROVIDER_TOKEN_FILE` | Shared private service credential for the proposal provider and the token-provisioning control plane. |
| `NOSTALGIA_DREAMING_BATCH_MAX_RECORDS` | Maximum input records in one dream. |
| `NOSTALGIA_DREAMING_BATCH_MAX_CHARS` | Maximum serialized input characters. |
| `NOSTALGIA_DREAMING_DRAFT_TIMEOUT_SECONDS` | Age after which a stuck draft is aborted. |

Default runtime limits include 256 KiB JSON requests, 10 MiB assets, 200-item pages, a 4,000-unit
index budget, 32 recent buffer items, 512-unit previews and a 16,000-unit injection response.

Never put real tokens in a repository, screenshot or public environment example.

## Docker

The repository includes a Dockerfile and Compose file. Persist the database volume and publish the
service only to a private interface or private container network. The image runs as an unprivileged
user and exposes a health check.

In a multi-service deployment, use service DNS rather than loopback for Hymio and the proposal
provider. Keep the Nostalgia port private unless an authenticated operator explicitly needs it.

## Hymio binding

Hymio's Backend calls the service-only
`PUT /v1/admin/tokens/{user_id}` endpoint during password registration, OIDC session exchange and
refresh. The operation is idempotent. Hymio derives a stable per-user credential, stores only its
encrypted form, and uses the same Hymio `user_id` as the Nostalgia namespace. Multiple Backend
workers converge on the same credential instead of racing to create different tokens.

Set `nostalgia_url` in `hymio.toml` to the private service URL. Mount the Backend
`service_token_file` into Nostalgia as `NOSTALGIA_DREAMING_PROVIDER_TOKEN_FILE`; the public edge must
still reject `/internal/*`. Hymio does not expose the generated Nostalgia token to clients, Oath or
the model.

If provisioning is temporarily down, login remains usable and returns `context_ready=false`. The
first memory operation retries provisioning, so the user never needs to register again. The current
per-user JSON connection file is a migration and operator fallback, not the normal account flow.
When an existing static binding is first used, Hymio provisions that same legacy token into the
dynamic digest table and stores the URL/token as an encrypted binding. The JSON file can then be
retired without invalidating existing accounts.

An absent binding returns “context unavailable”, not an empty successful memory. The UI must keep
read failure distinct from a confirmed empty account.

The dreaming provider points to Hymio's private proposal endpoint and uses the Backend internal
service token. The public HTTPS edge must reject `/internal/*`.

## Backup and restore

The database uses WAL. Use SQLite's online backup API or stop the service and copy the complete data
directory, including WAL/SHM files when present. Copying only the running main database can lose
committed data. Back up Hymio's `hymio.context.key` together with its SQLite database; without that
key, encrypted per-user context bindings cannot be recovered.

Restore the database before starting the replacement service. Keep the token mapping outside the
database private. After restoring, verify:

- health succeeds;
- one exact record read succeeds under the correct owner;
- a second owner cannot read it;
- the current `_index` and `_core` are readable;
- `/v1/events` resumes from the consumer's stored checkpoint;
- no older draft blocks the next scheduled cycle.
- a newly registered Hymio account can write and read its first Nostalgia record without manual
  token creation.

## Health and administration

`GET /healthz` verifies the process can access storage without exposing private content.
`GET /v1/operations/status` requires owner authentication and returns bounded counts plus recent
dreaming and opportunity events.

Hymio's operator console reads the status, prompt hash, original/derived data and pending
opportunities through server-side credentials. It supports bounded browsing, explicit correction
append and opportunity accept/dismiss. It does not bypass the dream/commit lifecycle.

## Retention and recovery

- Keep the current publication plus the configured number of predecessors; default retention is 5.
- Pruning removes old detail snapshots, not original records, idempotency receipts or terminal task
  evidence.
- Rolling back restores the previous retained version and makes later records pending again.
- A timed-out draft is aborted so a crashed model call cannot block future progress indefinitely.
- If a provider fails, the next interval may retry with a new draft. A failed proposal never
  half-publishes cards.

## Scaling boundary

The current implementation is intentionally a single SQLite service. It is suitable for the
current single-host product topology, not for horizontal writers, multi-region failover or
tenant-scale graph analytics. Before changing storage, preserve the exact API semantics for source
identity, ETags, snapshot cursors, atomic publication and at-least-once events.

## Verification

From the Nostalgia repository:

```sh
uv run ruff check nostalgia tests scripts
uv run pytest -q
uv run python scripts/smoke.py
docker build -t nostalgia:mvp .
uv run python scripts/smoke.py --docker
```

The HTTP smoke path covers append, draft, commit, rollback, delayed deletion and process restart.
Provider credentials and physical connector permissions require separate deployment verification.
