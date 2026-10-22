# Tools, skills & CLI

Applications extend Oath through three independently mounted directory types. Keep application data, user authorization and external resource management behind application APIs.

## Load directories

```sh
oath start \
  --skill ./agent/skills \
  --tool ./agent/tools \
  --cli ./agent/cli
```

Each flag can be repeated. A Skill directory contains subdirectories with `SKILL.md`; Tool and CLI directories contain loadable Python modules. Built-ins remain loaded. Duplicate tool or CLI command names fail startup rather than silently overriding an existing definition.

| Type | Loaded into | Purpose |
| --- | --- | --- |
| Skill | Worker and Tools | Model-facing instructions and reference resources |
| Tool | Tools service | Structured model-callable operation |
| CLI | Biz service | HTTP-backed command callable through `oath-cli` |

Paths are mounted read-only. Python modules are trusted deployment code and run inside Oath services. Package additional dependencies in the image; Oath does not silently install arbitrary extension dependencies.

## Minimal Tool

Save a module such as `agent/tools/ping.py`:

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

Tools are zero-argument constructed. A normal return is success. Tool execution runs independently of Brain; invocation identity and terminal events are managed by Oath. Core timing out does not forcibly stop your Python thread: bound network requests and subprocesses inside the tool.

Set `allow_subagent = False` for capabilities children must not use. The registry and admission policy enforce that restriction even if a model invents a call.

## Skill layout

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

The system prompt contains a compact Skill index; full instructions are loaded when needed. A Skill guides behavior but does not grant permission to an API or device.

## CLI extensions

Biz exposes command declarations through `/cli_commands` and handlers through `POST /cli/<name>`. `oath-cli` composes those commands from Bash; its scoped user capability is injected into the execution environment. Service-level verifier credentials remain private.

For a real declaration template, inspect [built-in CLI modules](https://github.com/HymioSpace/Oath/tree/main/extensions/cli). For device-aware execution, disable `agent.builtin_bash` before registering an application tool named `bash`.

Restart Oath after changing loaded extension modules or Skills. `oath restart` retains the effective directory arguments.
