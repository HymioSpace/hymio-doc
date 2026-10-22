# 任务与调度

Task 记录想达成的目标，Run 记录一次执行尝试。定时调度可以启动尝试，正在进行的对话工作也可以被记录为任务。


## 真实案例：在 iPhone 创建出发前核对任务

我们在原生 iOS「任务」中点击「安排一件事」，实际创建了 `Weekend packing check`。目标是整理身份证、充电器、雨伞和酒店寄存行李的核对事项，要求用中文给出结果，不操作云电脑。

1. **交代目标**：填写标题、希望完成什么，选择「现在」，提交任务。
2. **接纳与同步**：iPhone 列表先显示“已安排”；Web 同一账号也能打开这项任务和它的一次执行记录。
3. **查看成果**：任务完成后，iPhone 的「已有结果 → 任务详情」显示三类核对事项，并保留需要本人联系酒店确认的内容。

<DocGallery :images='[{"src": "/screenshots/hymio-ios-task.png", "label": "iOS · 已安排", "caption": "原生 iOS 实录：任务提交后进入“已安排”。"}, {"src": "/screenshots/hymio-ios-task-result.png", "label": "iOS · 已完成", "caption": "同一任务的真实完成结果：成果、未确认项与工作记录。"}, {"src": "/screenshots/hymio-tasks.png", "label": "Web · 原图例", "caption": "保留的 Web 任务详情图例：通过产品数据层建立的演示任务。"}]' />

这次实际完成的是“整理核对清单”，并不是替用户核验了酒店政策。“已安排”也不表示“已完成”，应以该次执行的状态和成果为准。

## 使用任务

在对话里交代一件有明确结果的事，或在任务页创建。说明目标与完成条件，在详情里查看当前阶段、最新进展、下一步与最终结果。

比较方案、准备文档、一次性提醒都可以是任务。问候或尚未决定的想法，不必自动生成任务。

## 两套状态

| 记录 | 状态 |
| --- | --- |
| Task | `active`、`paused`、`cancelled`、`archived` |
| Run | `scheduled`、`delivering`、`ready`、`running`、`blocked`、`succeeded`、`failed`、`cancelled`、`expired` |

Task 可以仍是 `active`，而最近一次 Run 已成功。周期任务在当前 Run 结束后安排下一次执行。某次工具成功，不代表整个任务已经完成。

暂停阻止待执行的计划进入运行。取消还会终止关联委派；但已经分发的外部操作，不能靠修改任务状态撤销。

## 调度契约

支持 `now`、`once`、`daily` 和 `weekly`。定时计划必须带 IANA 时区；一次性 `at` 必须带偏移量；每周计划以星期一为 0。

```json
{
  "action": "create",
  "title": "回顾本周计划",
  "objective": "查看未完成事项并提出下一步建议",
  "success_criteria": "在对话里发送简短回顾",
  "schedule": {
    "mode": "weekly",
    "timezone": "Asia/Shanghai",
    "weekday": 0,
    "time": "09:00",
    "grace_seconds": 900,
    "run_timeout_seconds": 3600
  }
}
```

使用用户 Bearer Token 把这个请求发给 `POST /tasks`。Backend 通过 due time 索引和有界调度循环工作，不需要每日 cron 预排。到期时投递 `app.task.due`，Run ID 保持稳定；开始前再次校验 Task generation 与状态，拒绝过时投递。

逾期任务会依据宽限期对账。超出窗口后可以进入 `expired`，避免补执行失去时效的提醒。周期计划最多补一次，不会突发执行所有错过的周期。

## 对话提取与委派

内部 `capture` 动作记录已被对话接纳的工作，不再发送到期事件；稳定的 `intent_key` 防止重复提取。普通客户端不能调用 capture。

正在运行的任务可以用 Run ID 作为请求身份关联一个有界 Oath 子 Agent。Backend 把中间发现和终态同步到任务历史。Oath 管子 Agent 执行，Hymio 管任务业务状态。

实现说明见[任务规范](https://github.com/HymioSpace/Hymio/blob/main/spec/feature23-tasks-and-delegation.md)。
