# Install & run

Use Oath directly when you are building your own application or testing the runtime. For the full Hymio product, use [Hymio installation](../hymio/getting-started).

## Install the command

With Python 3.11+, uv, Docker and Compose available:

```sh
git clone https://github.com/HymioSpace/Oath.git
cd Oath
bash scripts/oath-install
```

The command reads `~/.oath/oath.toml` by default. Edit `[agent.provider]` to set `model`, `api_base`, a Vault `credential` alias, and the `import_env` variable name. Do not put an API key in TOML.

```sh
oath start
oath status
```

Startup imports a missing model credential from the configured host environment variable or prompts using hidden input. Worker reads the credential through Vault. Model keys do not enter the model context or the agent-service environment.

## Local endpoints

| Endpoint | Purpose |
| --- | --- |
| Gateway · WebSocket · `8765` | Gateway WebSocket |
| Biz · HTTP · `8766` | Biz HTTP: trace and CLI APIs |

Use the address reported by your running environment. By default these ports are reachable only on the machine running the service; the documentation does not host them. Trusted mode accepts an external user ID. Set an [authentication mode](./configuration) before exposing these interfaces outside a trusted boundary.

The repository includes a debug client:

```sh
.venv/bin/python scripts/terminal_client.py
```

It supports `/status`, `/retry`, `/cancel`, `/approve ID`, `/deny ID`, `/quit`, and `--json` for raw frames.

## Lifecycle

```sh
oath restart  # reuses the last effective startup arguments
oath stop     # preserves data volumes
```

Use `--config PATH` for another configuration and `--name NAME` for a distinct local deployment. Startup records update after successful health checks. A failed start is not a guaranteed rollback; inspect the Compose service state.

Keep the installation source directory: current images are built from the installed command's source. Back up both persistent volumes and the private Vault recovery material, including `~/.oath/data/private/vault-bootstrap.json`.
