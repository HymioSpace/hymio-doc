# Tool、Skill 与 CLI

应用通过三类独立挂载的目录扩展 Oath。应用数据、用户授权和外部资源管理留在应用 API 中。

## 加载目录

```sh
oath start \
  --skill ./agent/skills \
  --tool ./agent/tools \
  --cli ./agent/cli
```

参数可重复。Skill 目录包含带 `SKILL.md` 的子目录；Tool 和 CLI 目录包含可加载 Python 模块。内置能力仍会加载，工具或 CLI 名称冲突会启动失败，不静默覆盖。

| 类型 | 加载位置 | 用途 |
| --- | --- | --- |
| Skill | Worker 与 Tools | 模型指引和参考资源 |
| Tool | Tools 服务 | 结构化模型调用操作 |
| CLI | Biz 服务 | 通过 `oath-cli` 调用的 HTTP 命令 |

目录只读挂载。Python 模块属于受信部署代码，在 Oath 服务中执行。额外依赖应打包进镜像，Oath 不会隐式安装任意扩展依赖。

## 最小 Tool

例如保存为 `agent/tools/ping.py`：

```python
from core.protocol.datatype import ToolDefinition, ToolInvocation, ToolResult
from core.protocol.interface import Tool

class PingTool(Tool):
    allow_subagent = True

    @property
    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name="app_ping",
            description="Return a local readiness marker.",
            input_schema={
                "type": "object",
                "properties": {},
                "additionalProperties": False,
            },
        )

    def execute(self, invocation: ToolInvocation) -> ToolResult:
        return ToolResult(content="ready")
```

工具零参数构造，正常返回即成功。执行独立于 Brain，Invocation 身份和终态事件由 Oath 管理。Core 超时不会强制停止 Python 线程，工具内部仍需为网络和子进程设置边界。

子 Agent 不应使用的能力设置 `allow_subagent = False`；注册表和接纳策略都会检查，模型伪造调用也无法绕过。

## Skill 目录

```text
agent/skills/
  reporting/
    SKILL.md
    examples.md
```

```markdown
---
name: reporting
description: Prepare a concise report from verified task findings.
---
Use recorded findings. Separate observed results from assumptions.
```

System prompt 中是简短 Skill 索引，正文按需加载。Skill 提供行为指引，不授予 API 或设备权限。

## CLI 扩展

Biz 通过 `/cli_commands` 暴露声明，通过 `POST /cli/<name>` 执行处理器。Bash 中的 `oath-cli` 可以组合命令，其 scoped user capability 注入执行环境，服务级验证凭据保持私有。

声明模板见[内置 CLI 模块](https://github.com/HymioSpace/Oath/tree/main/extensions/cli)。接入设备感知执行工具时，注册应用 `bash` 前应关闭 `agent.builtin_bash`。

修改加载的扩展或 Skill 后重启。`oath restart` 保留有效目录参数。
