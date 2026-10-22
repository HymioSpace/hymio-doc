# Context 与接口草案

::: info 仅设计草案
这里描述预期行为，目前没有部署的 API 或生成的 OpenAPI。
:::

## Context 模型

| 实体 | 含义 |
| --- | --- |
| Space | 归属与授权范围 |
| Context | 一段信息的稳定身份 |
| Revision | 不可变内容版本 |
| Asset | Context 引用的二进制内容 |
| Source | 外部来源身份与版本 |
| Provenance | 派生关系与父版本 |
| Change | 增量消费者使用的有序变更 |

摘要、Chunk 与 Embedding 引用来源 Context 和 Revision。派生索引不成为原始记录，Kit 成功写入的业务事实也不同于用户描述这个动作的一句话。

## HTTP 形态草案

以 `/v1` 为根路径，从鉴权解析主体，不相信 body 自报的 `user_id`。

| 路由类别 | 用途 |
| --- | --- |
| `/capabilities`、`/spaces` | 能力发现与已授权空间 |
| `/spaces/{space}/contexts` | 创建和列表 |
| `/spaces/{space}/contexts/{id}` | 读取、条件更新、tombstone |
| `/spaces/{space}/contexts/{id}/revisions/{revision}` | 固定版本读取 |
| `/spaces/{space}/assets` | 授权的二进制上传 / 读取 |
| `/spaces/{space}/search` | 已声明检索模式与版本化命中 |
| `/spaces/{space}/changes` | 游标形式的有序变更 |

## 读写语义

写入使用按主体、Space、方法、路径划分的 `Idempotency-Key`，回执同时校验请求指纹。同 key 不同内容返回冲突。

更新和删除需要 `If-Match`，缺少前置条件返回 428，版本不匹配返回 412。一次 mutation 必须原子保存 Revision、当前指针、来源身份、幂等回执与 Change。

写 ACK 后精确读取应看到新值。搜索可以延迟，但需报告索引位置或时点。Change cursor 过期后要求重新 Snapshot，不能悄悄从“现在”继续。

## 可替换存储

`ContextStore`、`BlobStore`、`SearchProvider` 是内部 Port。数据库适配器需要提供事务或等价 CAS 语义。自定义 HTTPS Endpoint 实现公开契约，直接连接数据库不等于实现 Endpoint。

参考数据库、索引实现、完整请求 Schema、OpenAPI 与适配器一致性测试仍待决定。实现选择明确后再补充这一部分。
