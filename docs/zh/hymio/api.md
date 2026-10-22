# HTTP API

Backend 用产品 Access Token 校验用户 API。资源归属从凭据解析，客户端不能通过传入其他 `user_id` 改变操作对象。

```sh
curl -H "Authorization: Bearer $HYMIO_ACCESS_TOKEN" \
  "$HYMIO_BACKEND/auth/me"
```

以上变量代表已有私有配置，不要把真实凭据硬编码到脚本。本页提供 Endpoint 索引，尚不是版本化 OpenAPI。

## 真实案例：模型偏好为什么能在两端一致

在[模型案例](./media#真实案例-手机改模型-电脑接着用)里，原生 iOS 保存 `MiniMax-M3` 后，同一账号的 Web 读取到了相同选择。两端都操作 Backend 的 `/settings/models`，而不是各自保存一个互不相关的前端开关。

下面是复现这个接口边界的请求。变量代表你自己的部署和演示账号凭据，不是文档提供的公共接口：

```sh
curl -X POST "$HYMIO_BACKEND/settings/models" \
  -H "Authorization: Bearer $HYMIO_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model":"MiniMax-M3"}'
curl "$HYMIO_BACKEND/settings/models" \
  -H "Authorization: Bearer $HYMIO_ACCESS_TOKEN"
```

`selected` 应返回已保存的选择；可选模型由部署配置决定。这里展示的是偏好保存，不代表已经验证该供应商的每个模型都能成功推理。

## 身份

| Endpoint | 输入 / 行为 |
| --- | --- |
| `GET /auth/options` | 登录方式和可用账号选项 |
| `POST /auth/account` | `action: login/signup`、用户名、密码，按需携带 `invitation_code` |
| `POST /auth/start` | 用 `return_uri` 开始 OIDC 跳转 |
| `POST /auth/exchange` | 交换 `flow_id` 与 `login_code` |
| `POST /auth/refresh` | 使用 `refresh_token` 轮换凭据 |
| `POST /auth/logout` | 撤销当前登录 |
| `GET /auth/me` | 已验证身份 |

Backend 签发供产品 API 与 Oath 远程校验使用的应用凭据；Casdoor 负责密码验证。刷新和退出操作针对应用登录，不取消已接纳的后台工作。

## 产品操作

| Endpoint | 行为 |
| --- | --- |
| `GET /tasks` | 当前用户任务列表 |
| `POST /tasks` | 按 action 操作 Task 与 Run |
| `GET/POST /settings/models` | 模型白名单与偏好 |
| `POST /attachments` | 原始字节与编码后的 `X-File-Name` |
| `GET /attachments/{id}` | 私有内容鉴权读取 |
| `GET /devices` | 所有自有渠道与执行设备 |
| `POST /devices/ensure` | 为已授权用户准备电脑，可能返回 preparing |
| `POST /devices/execute` | 明确的设备 ID、invocation ID、capability 与参数 |
| `GET /devices/{id}/commands/{invocation_id}` | 查询之前结果，不重复执行 |
| `POST /devices/{id}/pause`、`/resume`、`/revoke` | 生命周期操作 |
| `GET /agent/traces`、`/agent/traces/{id}` | 当前用户 Oath Trace |

Task action 包括 `list/get/create/edit/pause/resume/cancel/delete/start/progress/complete/fail/block/delegate`，状态语义见[任务](./tasks)。`capture` 仅供内部使用。

## 管理 API

独立管理平台位于 `/admin/`，后端接口使用 `/admin/api/*`：

- `GET /admin/api/me`
- `GET /admin/api/resources`
- `POST /admin/api/resources/grants`
- `POST /admin/api/resources/devices/{device_id}`

要求正常产品登录，且用户 ID 位于 `admin_user_ids`。服务凭据和客户端自报 role 不提供管理权限。

## 内部接口

`/internal/auth/verify`、`/internal/tasks`、`/internal/devices/*`、`/internal/media/*` 使用服务鉴权。凭据只在服务端保存，不作为公开用户 API 的访问方式。

WebSocket envelope 见 [Oath 协议](../oath/protocol)。Hymio 的公网连接经过 `/agent/ws`，执行产品身份、模型与附件规则。

## 错误与重试

同时判断 HTTP 状态和 JSON `error`。身份、Origin、校验、配额与 Provider 可用性可能分别失败。核对可能已分发的操作时，复用原 invocation 身份。HTTP 超时不等于付费图片生成或桌面操作没有发生。
