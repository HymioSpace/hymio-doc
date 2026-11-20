# HTTP 契约

Nostalgia 的已实现协议位于 `/v1`。服务在 `/openapi.json` 发布自动生成的 Schema，在 `/docs`
提供交互文档。本页解释稳定语义；字段的精确约束以部署版 OpenAPI 为准。

## 公共规则

- 所有业务请求使用 `Authorization: Bearer <token>`。
- 一个 token 映射一个所有者；`user_id` 从 token 得出，不接受正文声明身份。
- 所有写请求必须携带 `Idempotency-Key`（1–200 字符）。
- 同 key、同语义请求返回原结果；同 key、不同内容返回 `409`。
- 修改 artifact / record 使用 `ETag` 与 `If-Match`；创建使用 `If-None-Match: *`。
- 列表返回 `items`、`next_cursor` 和 `visible_through_id`。
- 分页游标带签名并绑定查询与发布视图；视图变化后必须从第一页重新读取。
- 成功写响应可以携带 `ETag`。`201` 表示可靠保存，不表示 command 要求的效果已执行。
- 除原始 asset 上传外，请求体使用 JSON。
- 响应带 `Cache-Control: no-store` 与 `X-Content-Type-Options: nosniff`。

错误格式：

```json
{"error":{"code":"invalid_reference","message":"Reference is outside this dream's input","retryable":false}}
```

常见状态码：`400` 无效输入、`401/403` 身份、`404` 不存在或不可见、`409` 生命周期或幂等冲突、
`412` 前置条件 / 来源冲突、`413` 大小超限、`415` 类型不支持、`422` 引用 / 提交错误，
`503` 临时存储或 Provider 失败。

## 发现与健康

| 路由 | 用途 |
| --- | --- |
| `GET /healthz` | 无需认证的进程 / 存储健康检查 |
| `GET /v1/capabilities` | 认证后读取协议版本、图限制、检索方式、请求 / 页面 / 历史 / buffer 上限与 dreaming 配置 |

当前 capability 只声明 `filter` 与 `text`，并明确 text 是不区分大小写的子串扫描，按稳定 ID
顺序返回。

## 原始记录

| 路由 | 用途 |
| --- | --- |
| `POST /v1/records` | 追加 context 或 command |
| `GET /v1/records` | 按 root、来源、类型、状态、时间和 ID 窗口分页筛选 |
| `GET /v1/records/{id}` | 精确读取；可用 `dream_id` 查看草稿视角 |
| `PATCH /v1/records/{id}?dream_id=...` | 在可编辑草稿中保存 Agent 的处理 / 状态结论 |

原始记录不可修改。同一外部对象变化时，使用 `root_id` 和最新 `expected_record_id` 追加新记录。
未知 command type 保留为显式数据，不能默认为删除或更新。

Context 的定义使用 `processing_state=applied|noop|needs_input`；`noop` 与 `needs_input` 必须
带 reason。Context 的内容状态是 `pending|active|obsolete|deleted`；command 使用处理状态而不是
内容状态。因此“等待用户澄清”可以被审阅并提交，但不能伪装成已执行。

## Artifact 与检索

| 路由 | 用途 |
| --- | --- |
| `GET /v1/artifacts/{id}` | 读取已发布卡片或草稿视角 |
| `PUT /v1/artifacts/{id}?dream_id=...` | 在草稿中创建 / 替换卡片 |
| `DELETE /v1/artifacts/{id}?dream_id=...` | 从草稿删除非索引卡片 |
| `POST /v1/search` | 在权威快照中搜索 / 筛选 record、artifact 或二者 |
| `POST /v1/graph/query` | 读取有界邻域或最近变化图 |
| `POST /v1/retrieve` | 字面种子搜索加有界关系扩展，面向 Agent |
| `PUT /v1/relations?dream_id=...` | 在草稿中创建 / 替换显式关系 |

Artifact ID 跨发布保持稳定。`_index` 不能删除，必须替换并显式确认。普通卡片至少需要一条精确
原始记录引用。

`POST /v1/search` 支持：

- `target=records|artifacts|all`；
- `mode=filter|text`；请求 `semantic` 会明确报错；
- root、来源、类型、状态、时间、topic、artifact type 过滤；
- `cursor` 与有界 `limit`。

当前结果返回 `search_method=authoritative_scan`、`index_through_id` 和 `partial=false`。截断
preview 不能替代精确读取。

`POST /v1/retrieve` 是 Agent 使用的有界路径，返回 nodes、可见 edges、snapshot、
`bounded=true` 和 `literal-plus-relations` 方法。

## Dream 生命周期

| 路由 | 用途 |
| --- | --- |
| `POST /v1/dreams` | 为当前用户创建 / 恢复唯一的活动草稿 |
| `GET /v1/dreams/{id}` | 读取固定输入范围、状态、已处理数量、ETag 和保留状态 |
| `POST /v1/dreams/{id}/commit` | 校验并原子发布草稿 |
| `POST /v1/dreams/{id}/abort` | 放弃草稿，不改变生效版本 |
| `POST /v1/dreams/rollback` | 恢复上一份保留发布 |

每用户最多一个未结束草稿。提交使用整个草稿的 ETag，而不是单张卡片 ETag。提交失败后草稿仍可
修改；成功则关闭。Abort 幂等。Rollback 只能在无活动草稿时使用当前 `view_token`。

## Assembly、注入与事件

| 路由 | 用途 |
| --- | --- |
| `GET /v1/assembly` | 稳定 `_core` / cache key 与动态 injection |
| `GET /v1/injection` | `_index`、近期 pending 记录、数量、截断和 view token |
| `GET /v1/events?after=...&limit=...` | 按用户隔离的事件重放 |
| `GET /v1/operations/status` | 当前用户的计数与最近 dreaming / opportunity 事件 |

事件至少投递一次。消费者只有在接纳整批后保存 `next_after`，并按 event ID 去重。事件 payload
应被当作失效通知：读取当前有权限的对象，不信任过期 preview。

Opportunity 事件包含稳定提案 ID、标题、目标、成功标准、原因和证据 record ID。每轮最多三个。
它是建议，不是创建任务或执行动作的授权。

## Asset

| 路由 | 用途 |
| --- | --- |
| `POST /v1/assets` | 用有界 `Content-Type` 上传二进制 asset |
| `GET /v1/assets/{id}` | 按所有者读取 asset，不暴露存储路径 |

当前 SQLite 适配器把 asset 保存在持久数据库中。Asset 不自动等于个人事实；record 通过 ID 引用它。

## 示例：保存、发布与读取

```json
{
  "item_type": "context",
  "context_type": "text",
  "context": {"text": "我更喜欢午饭后喝茶。"},
  "source": {
    "kind": "user",
    "namespace": "hymio.saved",
    "external_id": "synthetic-note-1"
  }
}
```

把这个请求体以新的稳定幂等键发到 `POST /v1/records`。记录被接纳后立即可读。随后开始 dream、
把记录标记为 `applied/active`、创建带精确引用的卡片、保存 `_index`，再用当前 ETag 提交草稿。
只有提交后，新卡片才进入普通已读视图。

## 兼容性

新增字段保持兼容；客户端可以忽略未知响应字段，但不能猜未知 command、未支持检索方式或过期游标
的语义。破坏性变化需要新的 API 主版本。
