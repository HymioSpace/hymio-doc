# 配置、鉴权与模型

Oath 的运行时配置独立于应用产品配置。默认文件为 `~/.oath/oath.toml`，用 `oath start --config PATH` 指定其他文件。

## 模型 Provider 与 Vault

```toml
[agent.provider]
model = "gpt-4o-mini"
api_base = "https://api.openai.com/v1"
credential = "model/openai"
import_env = "OPENAI_API_KEY"
timeout_seconds = 60
```

`credential` 是 Vault 别名，不是密钥。首次启动时，`import_env` 指定导入用的宿主机环境变量。Worker 经自身 Vault 身份读取凭据。Vault 数据与私有恢复文件应共同备份。

## 模型选择

`agent.selectable_models` 声明使用默认 Provider 的其他模型 ID；独立的 `agent.model_providers.<choice>` 可以指定自己的 Endpoint、模型 ID、凭据别名和参数。

模型选择在接纳前校验，按用户持久化。已准备的步骤在工具续行、重试期间保留模型。客户端不能提交任意 Endpoint 或凭据。

## 应用指令

```sh
oath start --system-prompt ./prompts/assistant.md
```

用只读 UTF-8 Markdown 替换应用指令。也可设置相对 TOML 路径的 `agent.system_prompt_file`，并移除 inline `system_prompt`。

角色、风格与能力指引保持静态；Oath 追加实际工作区和 Skill 索引，变化中的运行事实放进后续输入。重启后重新加载，已固定的请求保留原准备内容。

## 鉴权模式

| 模式 | 身份来源 |
| --- | --- |
| 默认 trusted | 调用方提供的外部用户 ID |
| `--auth-mode remote` | 远程接口验证应用凭据 |
| `--auth-mode static` | `services.users` Token 表 |

鉴权模式是启动参数，不是 TOML 字段。远程验证示例：

```sh
oath start --auth-mode remote \
  --auth-url http://application-backend:8080/internal/auth/verify \
  --auth-token-file /private/verifier-service-token
```

Verifier 接收带服务鉴权的 POST `{"credential":"USER_ACCESS_TOKEN"}`，返回权威用户与过期时间：

```json
{"user_id":"example-user","expires_at":1893456000}
```

拒绝、过期或校验服务不可用都会拒绝接入。Gateway 在 30 秒内及凭据过期时复验，Biz 每个请求验证。凭据失效不取消已接纳的工作，验证服务凭据仅挂给 Gateway 与 Biz。

## 执行配置

| 配置 | 用途 |
| --- | --- |
| `agent.max_tool_only_steps` | 持久的连续纯工具预算，默认 100 |
| `agent.builtin_bash` | 用设备工具替换宿主 Bash 时关闭 |
| `agent.workspace_root` | 默认执行工作区 |
| `agent.skill_index_tokens` | Skill 索引 Prompt 预算 |
| `services.workers` | 共享 Worker 池大小 |
| `services.lease_seconds` | 执行归属租约 |
| `supervisor.invoke_interval_seconds` | 待处理工作观察周期 |

当前默认值和约束见[示例 TOML](https://github.com/HymioSpace/Oath/blob/main/oath.example.toml)与 [Prompt / 预算契约](https://github.com/HymioSpace/Oath/blob/main/spec/feature-prompt-and-tool-budget.md)。
