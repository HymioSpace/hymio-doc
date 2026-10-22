# Configuration, authentication & models

Oath's runtime input is separate from an application's product configuration. The default file is `~/.oath/oath.toml`; `oath start --config PATH` selects another one.

## Model provider and Vault

```toml
[agent.provider]
model = "gpt-4o-mini"
api_base = "https://api.openai.com/v1"
credential = "model/openai"
import_env = "OPENAI_API_KEY"
timeout_seconds = 60
```

`credential` is a Vault alias, not a key. On first startup, `import_env` names the host environment variable used for import. Worker obtains credentials through its Vault identity. Back up Vault data and private recovery files together.

## Model choices

`agent.selectable_models` lists additional model IDs using the default provider. A separate `agent.model_providers.<choice>` entry supplies its own endpoint, model ID, credential alias and parameters.

Choices are validated before admission and persisted per user. A prepared step keeps its model during tool continuation and retries. Clients cannot submit arbitrary provider endpoints or credentials.

## Application instructions

```sh
oath start --system-prompt ./prompts/assistant.md
```

This replaces application instructions with a read-only UTF-8 Markdown file. Alternatively use `agent.system_prompt_file` relative to the TOML location and remove inline `system_prompt`.

Keep role, style and capability guidance stable. Oath appends the actual workspace and Skill index; changing runtime facts belong in later inputs. Restart to reload instructions. Already frozen requests retain their prepared contents.

## Authentication modes

| Mode | Identity source |
| --- | --- |
| Default trusted | Caller-supplied external user ID |
| `--auth-mode remote` | Application credential verified by a remote endpoint |
| `--auth-mode static` | Token table in `services.users` |

Authentication mode is a startup option, not a TOML field. For remote verification:

```sh
oath start --auth-mode remote \
  --auth-url http://application-backend:8080/internal/auth/verify \
  --auth-token-file /private/verifier-service-token
```

The verifier receives a service-authenticated POST with `{"credential":"USER_ACCESS_TOKEN"}`. It returns the authoritative user and expiry:

```json
{"user_id":"example-user","expires_at":1893456000}
```

Rejected, expired or unavailable verification denies access. Gateway rechecks live connections within 30 seconds and at credential expiry; Biz checks each request. Authentication expiry does not cancel already-accepted work. Only Gateway and Biz mount verifier credentials.

## Execution settings

| Setting | Purpose |
| --- | --- |
| `agent.max_tool_only_steps` | Persisted consecutive tool-only budget; default 100 |
| `agent.builtin_bash` | Disable when replacing host Bash with device-aware execution |
| `agent.workspace_root` | Default execution workspace |
| `agent.skill_index_tokens` | Prompt budget for Skill index |
| `services.workers` | Shared Worker pool size |
| `services.lease_seconds` | Execution ownership lease |
| `supervisor.invoke_interval_seconds` | Pending-work observation interval |

Use [the example TOML](https://github.com/HymioSpace/Oath/blob/main/oath.example.toml) and [prompt/budget contract](https://github.com/HymioSpace/Oath/blob/main/spec/feature-prompt-and-tool-budget.md) for current defaults and constraints.
