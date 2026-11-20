# 部署与运维

Nostalgia 是可独立部署的 Python 服务。Hymio 不把它嵌入 Backend 进程，Oath 也不需要安装它的
Python 包。

## 配置

| 环境变量 | 用途 |
| --- | --- |
| `NOSTALGIA_TOKENS_JSON` | 可选的静态 JSON 映射，将至少 16 字符的 Bearer token 映射到稳定 owner ID；保留用于迁移和独立调试，自动接入 Hymio 时不需要 |
| `NOSTALGIA_DATABASE` | SQLite 路径，默认 `data/nostalgia.sqlite3` |
| `NOSTALGIA_HOST`、`NOSTALGIA_PORT` | 由私有部署选择的监听地址与端口 |
| `NOSTALGIA_DREAMING_ENABLED` | 启动定时 dream worker |
| `NOSTALGIA_DREAMING_INTERVAL_SECONDS` | 周期，默认 600，最小 60 |
| `NOSTALGIA_DREAMING_PROVIDER_URL` | 私有 HTTP(S) proposal endpoint |
| `NOSTALGIA_DREAMING_PROVIDER_TOKEN_FILE` | proposal Provider 与 token 开通控制面共用的私有服务凭据文件 |
| `NOSTALGIA_DREAMING_BATCH_MAX_RECORDS` | 单次 dream 最大输入记录数 |
| `NOSTALGIA_DREAMING_BATCH_MAX_CHARS` | 最大序列化输入字符数 |
| `NOSTALGIA_DREAMING_DRAFT_TIMEOUT_SECONDS` | 草稿被视为卡住并放弃的超时 |

默认运行限制包括 256 KiB JSON、10 MiB asset、200 条分页、4,000 单位 index、32 条近期 buffer、
512 单位 preview 和 16,000 单位 injection 响应。

真实 token 不能进入仓库、截图或公开环境变量示例。

## Docker

仓库包含 Dockerfile 与 Compose 配置。持久化数据库卷，只把服务发布到私有接口或私有容器网络。
镜像以非特权用户运行，并提供健康检查。

多服务部署时，Hymio 与 proposal provider 应使用 service DNS，而不是容器自身 loopback。除认证的
运维需要外，不要公开 Nostalgia 端口。

## Hymio 绑定

Hymio Backend 在密码注册、OIDC session exchange 和 refresh 时调用仅服务端可用的
`PUT /v1/admin/tokens/{user_id}`。该操作幂等；Hymio 生成稳定的 per-user 凭据并只保存加密形式，
同时直接把 Hymio `user_id` 作为 Nostalgia namespace。多 Backend worker 会收敛到同一个凭据，
不会因并发创建不同 token 而互相覆盖。

在 `hymio.toml` 设置私有 `nostalgia_url`，并把 Backend 的 `service_token_file` 以
`NOSTALGIA_DREAMING_PROVIDER_TOKEN_FILE` 挂载给 Nostalgia；公网入口仍必须拒绝 `/internal/*`。
Hymio 不会把生成的 Nostalgia token 暴露给客户端、Oath 或模型。

如果开通暂时失败，登录仍然可用并返回 `context_ready=false`。首次记忆操作会自动重试开通，用户
不需要重新注册。现有 per-user JSON 连接文件是迁移和运营兜底，不再是正常账号流程。

没有绑定时返回 “context unavailable”，不能伪装成成功空账号。界面必须把读取失败和确认空账号
区分开。

Dreaming provider 指向 Hymio 私有 proposal endpoint，并携带 Backend internal service token。
公网 HTTPS 入口必须拒绝 `/internal/*`。

## 备份与恢复

数据库使用 WAL。使用 SQLite online backup API，或停止服务后复制完整数据目录；如果存在 WAL/SHM
也要一起保留。只复制运行中的主数据库可能丢失已提交数据。Hymio 的 `hymio.context.key` 必须与
Backend SQLite 数据库一起备份；缺少该密钥时，加密的 per-user Context 绑定无法恢复。

恢复数据库后再启动替代服务。Token 映射单独保持私有。恢复后至少验证：

- health 成功；
- 正确所有者可以精确读取一条记录；
- 另一个所有者无法读取；
- 当前 `_index` 与 `_core` 可读；
- `/v1/events` 能从消费者已保存 checkpoint 继续；
- 旧草稿不会阻塞下一轮调度。
- 新注册的 Hymio 账号无需手工创建 token，就能写入并读取第一条 Nostalgia 记录。

## 健康与管理

`GET /healthz` 验证进程可访问存储，不返回私人内容。`GET /v1/operations/status` 需要所有者认证，
返回有界计数与最近 dreaming / opportunity 事件。

Hymio 管理台通过服务端凭据读取状态、prompt hash、原始 / 派生数据和待处理机会；支持有界浏览、
显式追加纠正和接受 / 忽略机会。管理台不能绕过 dream / commit 生命周期。

## 保留与恢复

- 默认保留当前发布及前四份，共 5 份。
- Prune 清理旧 detail 快照，不删除原始 record、幂等回执或任务终态证据。
- Rollback 恢复上一保留版本，并让之后的记录重新待处理。
- 超时草稿会被放弃，崩溃的模型调用不能永久阻塞后续周期。
- Provider 失败后下一轮可创建新草稿重试；失败提案不会部分发布卡片。

## 扩容边界

当前实现有意使用单 SQLite 服务，适合当前单主机产品拓扑，不适合多写实例、跨区域故障切换或
租户级大规模图分析。修改存储前必须保留来源身份、ETag、快照游标、原子发布和至少一次事件的
精确 API 语义。

## 验证

在 Nostalgia 仓库运行：

```sh
uv run ruff check nostalgia tests scripts
uv run pytest -q
uv run python scripts/smoke.py
docker build -t nostalgia:mvp .
uv run python scripts/smoke.py --docker
```

HTTP smoke 覆盖追加、草稿、提交、回滚、延后删除与进程重启。Provider 凭据和物理连接器权限仍需
分别做部署验证。
