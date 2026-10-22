# 子 Agent 与应用事件

子 Agent 在自己的上下文、Journal、工具和执行租约内完成有界工作。它与主 Agent 归属同一用户，主 Agent 可以继续接收输入。

## 创建与查询

Biz 提供鉴权后的 action 接口：

| Endpoint | 输入 |
| --- | --- |
| `POST /subagents/spawn` | `request_id`、`title`、`objective`、`success_criteria`；可选 `model`、`max_steps`、`timeout_seconds` |
| `POST /subagents/get` | `agent_id` 或原 `request_id` |
| `POST /subagents/list` | 当前用户近期执行 |
| `POST /subagents/cancel` | 子 Agent 身份 |

创建 body 示例：

```json
{
  "request_id": "research-example-1",
  "title": "比较文档转换工具",
  "objective": "比较输入格式与部署需求",
  "success_criteria": "返回带来源的简短对比表",
  "max_steps": 20,
  "timeout_seconds": 600
}
```

响应丢失后复用相同 `request_id`，不要因传输超时再创建一个孩子。资源归属来自鉴权；`agent_id` 选择委派执行，不是另一个账号身份。

## 执行限制

- 子 Agent 不能再次委派，也不能调用任务管理工具。
- 独立上下文，不复制父对话历史。
- 初始接纳之后，只接受工具结果唤醒，不绑定用户 / 系统队列。
- 存在歧义或需要审批时报告 blocker，不无限等待用户。
- 无新工具调用的最终回复，需等之前未消费结果进入上下文后才结束。
- 取消阻止后续 Brain 提交和排队工具；已经运行的外部副作用仍可能完成。

默认 40 步、15 分钟，最大 100 步 / 1 小时。每用户最多 8 个运行中的孩子；最多 100 条、每条 4,000 字符的中间发现，最终结果最多 16,000 字符。

## 进展与完成

`subagent_notify` 向父 Agent system 路径发送中间 `subagent.progress`，终态产生 `subagent.completed`。终态与父通知同事务提交，用户不在线也不会丢掉这个事件。

客户端通过 `subagent.status` 接收状态。应用可用工具 Invocation ID 调用 `POST /executions/get` 对账主 Agent 续行；工具成功本身不表示续行已经结束。

## 应用事件

应用通过鉴权的 `POST /events` 提交语义输入：

```json
{"event_id":"example-due-1","type":"app.example.due","payload":{"item_id":"example-item"}}
```

类型必须位于 `app.*` 下，该接口不接受 runtime 控制指令。用户来自凭据，稳定 `event_id` 支持幂等投递。Hymio 通过这种方式调度任务，任务业务状态仍归 Hymio。

详见[有界委派契约](https://github.com/HymioSpace/Oath/blob/main/spec/feature-subagents.md)。
