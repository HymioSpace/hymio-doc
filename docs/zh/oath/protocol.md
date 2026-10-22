# WebSocket 与 HTTP

Gateway 使用 v2 协议。每条命令带版本、稳定 command ID、type 与 payload。同一个 ID 只能用于相同内容的重试。

## Attach

Remote 或 static 鉴权模式下，连接第一帧提供产品凭据与稳定的客户端身份：

```json
{"v":2,"id":"attach-demo-1","type":"agent.attach","payload":{"credential":"USER_ACCESS_TOKEN","client_id":"web-demo-window"}}
```

Gateway 把凭据解析成外部 `user_id`；trusted 模式允许直接声明外部用户 ID，需限制在受信网络内。Attach 是把连接关联到已有应用身份，不创建账号或对话 session。

## 发送输入

```json
{"v":2,"id":"message-demo-1","type":"user.message","payload":{"content":"准备一份简短打包清单。","user_context":{"locale":"zh-CN"}}}
```

可选 `model` 必须位于配置的模型注册表。ACK 代表持久接纳，不代表推理完成。`user_context` 按 key 合并并记录更新时间，24 小时后失效。

## 接收与确认

事件 envelope 包括 `event_seq`、`event_type`、`payload` 与发生时间：

```json
{"v":2,"type":"event","user_id":"example-user","event_seq":12,"event_type":"assistant.message","payload":{"step_id":"example-step","content":"清单如下。"},"occur_dt":"2026-01-01T09:00:00Z"}
```

保存或展示事件后，确认对应序号：

```json
{"v":2,"id":"ack-demo-12","type":"event.ack","payload":{"cursor":12}}
```

按 `user_id + event_seq` 去重，不按正文去重。每个客户端身份拥有独立游标，不同窗口复用同一个 client ID 会干扰投递进度。

## 重连

离线重放位于 `offline.start` 与 `offline.end` 之间，随后进入实时流。UI 应保留边界，避免新投递的定时消息把上一条最终回复合并进错误的工作过程。

## 控制命令

| Type | Payload |
| --- | --- |
| `permission.decide` | `invocation_id`、`status: approved/denied` |
| `run.cancel` | 可选 `run_id`，省略时为当前 Run |
| `step.retry` | 空对象，显式恢复失败 / 暂停步骤 |
| `agent.status` | 空对象 |
| `ping` | 空对象 |

## Biz HTTP

Biz 默认使用 HTTP 端口 `8766`。示例中的 `OATH_BIZ_URL` 需设置为部署者提供的实际 Biz 入口，不要包含末尾斜杠。鉴权模式下使用与 WebSocket 相同的用户 Bearer 凭据。

```sh
curl -H "Authorization: Bearer $OATH_USER_TOKEN" \
  "$OATH_BIZ_URL/list_traces?limit=10"
```

`GET /query_trace?trace_id=...` 读取一条 Trace。`/cli_commands` 列举应用命令，`POST /cli/<name>` 按命令声明的 JSON 参数执行。Scoped CLI capability 不是通用用户凭据，不能查询 Trace。

Hymio 客户端使用 Backend 返回的产品网关与代理地址，不直接填写私有上游。见[产品 API 索引](../hymio/api)。
