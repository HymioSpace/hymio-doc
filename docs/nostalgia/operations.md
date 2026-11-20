# Deployment and operations

Nostalgia is a separately deployable Python service. Hymio does not embed it in the Backend process,
and Oath does not need its Python package.

## Configuration

| Variable | Purpose |
| --- | --- |
| `NOSTALGIA_TOKENS_JSON` | JSON object mapping bearer tokens of at least 16 characters to stable owner IDs. |
| `NOSTALGIA_DATABASE` | SQLite path; default `data/nostalgia.sqlite3`. |
| `NOSTALGIA_HOST`, `NOSTALGIA_PORT` | Listener address and port selected by the private deployment. |
| `NOSTALGIA_DREAMING_ENABLED` | Starts the scheduled dream worker. |
| `NOSTALGIA_DREAMING_INTERVAL_SECONDS` | Cycle interval; default 600, minimum 60. |
| `NOSTALGIA_DREAMING_PROVIDER_URL` | Private HTTP(S) proposal endpoint. |
| `NOSTALGIA_DREAMING_PROVIDER_TOKEN_FILE` | Optional bearer token file for that provider. |
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

Hymio uses a private per-user JSON file whose entries contain the Nostalgia base URL and a token-file
reference. The token file resolves relative to that JSON file unless absolute. The Backend loads the
binding for the authenticated Hymio user and proxies the request; clients and Oath never receive the
Nostalgia token.

An absent binding returns “context unavailable”, not an empty successful memory. The UI must keep
read failure distinct from a confirmed empty account.

The dreaming provider points to Hymio's private proposal endpoint and uses the Backend internal
service token. The public HTTPS edge must reject `/internal/*`.

## Backup and restore

The database uses WAL. Use SQLite's online backup API or stop the service and copy the complete data
directory, including WAL/SHM files when present. Copying only the running main database can lose
committed data.

Restore the database before starting the replacement service. Keep the token mapping outside the
database private. After restoring, verify:

- health succeeds;
- one exact record read succeeds under the correct owner;
- a second owner cannot read it;
- the current `_index` and `_core` are readable;
- `/v1/events` resumes from the consumer's stored checkpoint;
- no older draft blocks the next scheduled cycle.

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
