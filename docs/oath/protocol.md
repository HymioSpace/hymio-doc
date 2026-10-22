# WebSocket & HTTP

Gateway uses protocol v2. Every command carries a version, stable command ID, type and payload. Reuse an ID only for the same command content.

## Attach

In remote or static authentication mode, the first frame supplies the product credential and a stable client identity:

```json
{"v":2,"id":"attach-demo-1","type":"agent.attach","payload":{"credential":"USER_ACCESS_TOKEN","client_id":"web-demo-window"}}
```

Gateway resolves the credential to an external `user_id`. Trusted mode instead allows an explicit external user ID; keep that mode within a trusted network. Attachment associates a connection with an existing application identity; it does not create an account or a conversation session.

## Send input

```json
{"v":2,"id":"message-demo-1","type":"user.message","payload":{"content":"Prepare a short packing list.","user_context":{"locale":"en"}}}
```

An optional `model` must be in the configured model registry. An ACK means durable acceptance, not completed reasoning. `user_context` merges by key with update timestamps; keys expire after 24 hours.

## Receive and acknowledge

An event envelope includes `event_seq`, `event_type`, `payload` and occurrence time:

```json
{"v":2,"type":"event","user_id":"example-user","event_seq":12,"event_type":"assistant.message","payload":{"step_id":"example-step","content":"Here is your list."},"occur_dt":"2026-01-01T09:00:00Z"}
```

After saving or displaying the event, acknowledge its sequence:

```json
{"v":2,"id":"ack-demo-12","type":"event.ack","payload":{"cursor":12}}
```

Deduplicate by `user_id + event_seq`, not by text. Each client identity has its own cursor. Reusing one client ID across independent windows can make their delivery progress interfere.

## Reconnect

Offline replay is bracketed by `offline.start` and `offline.end`, followed by the live stream. Preserve these boundaries in the UI so a newly delivered scheduled message does not merge an earlier final reply into the wrong work group.

## Controls

| Command type | Payload |
| --- | --- |
| `permission.decide` | `invocation_id`, `status: approved/denied` |
| `run.cancel` | Optional `run_id`; current run when omitted |
| `step.retry` | Empty object; explicit failed/paused step recovery |
| `agent.status` | Empty object |
| `ping` | Empty object |

## Biz HTTP

Biz uses HTTP port `8766` by default. Set `OATH_BIZ_URL` to the actual Biz origin supplied by your operator, without a trailing slash. Under authenticated modes, use the same user bearer credential as the WebSocket.

```sh
curl -H "Authorization: Bearer $OATH_USER_TOKEN" \
  "$OATH_BIZ_URL/list_traces?limit=10"
```

`GET /query_trace?trace_id=...` reads one trace. `/cli_commands` lists application commands; `POST /cli/<name>` executes one using its declared JSON arguments. A scoped CLI capability is not a general user credential and cannot query traces.

Hymio clients use the product gateway and proxy addresses supplied by Backend rather than these private upstream addresses. See [the product API map](../hymio/api).
