# Models & attachments

Text generation, media understanding and image generation are configured separately. Selecting a conversation model does not change the media provider automatically.

## Real case: choose a model on iPhone, continue on Web

We changed `MiniMax-M2.7` to `MiniMax-M3` in the native iOS account screen, then opened the same demonstration account on Web. Both read `MiniMax-M3`, while the packing-list conversation remained intact.

<DocGallery :images='[{"src": "/screenshots/hymio-ios-models.png", "label": "iOS", "caption": "Native iOS: select MiniMax-M3 while preserving the conversation."}, {"src": "/screenshots/hymio-web-models.png", "label": "Web", "caption": "Web: read the MiniMax-M3 preference just saved on iPhone."}]' />

To reproduce, choose an allowed model on iPhone and inspect Web account settings. The next message uses the selection; existing replies are not regenerated. Available model names depend on your deployment.

## Real case: supply a travel note as an attachment

The uploaded demonstration file, `trip-notes.txt`, describes two people, one night, train travel, a reserved hotel and an unresolved luggage-storage question. It contains no private travel information.

1. Choose the file using Web chat's attachment control and wait for its name and size.
2. Ask the assistant to read it and list three things to check before departure.
3. View the attachment message and reply on iPhone using the same account, then follow up.

<DocGallery :images='[{"src": "/screenshots/hymio-ios-attachment.png", "label": "iOS", "caption": "Native iOS: the attachment message and three checks grounded in the travel note."}, {"src": "/screenshots/hymio-web-attachment.png", "label": "Web", "caption": "Web: three checks based on the uploaded travel note."}]' />

**Observed result:** the reply covers essential items, outbound and return tickets, and hotel check-in and luggage storage. It does not claim the unresolved hotel policy has been confirmed.

In this run, Web uploads the file and iPhone receives and continues the conversation. Native iOS also provides photo-library and file inputs, plus camera capture when available. An attachment control alone does not prove a deployment's vision provider is configured.

[Download the demonstration note](/examples/trip-notes.txt) to reproduce the case on your own deployment.

## Select a model

Settings displays Backend's ordered `model_options` allowlist. The selected preference is saved per user and shared across clients. Backend adds it when forwarding messages; Oath independently validates the choice and freezes it for each step.

```http
GET /settings/models
Authorization: Bearer USER_ACCESS_TOKEN
```

```json
{"models":["MiniMax-M2.7","MiniMax-M3"],"selected":"MiniMax-M3"}
```

Use `POST /settings/models` with `{"model":"MiniMax-M3"}` to change it. Backend's list must match deployed Oath choices. Endpoint and credential selection stay in server configuration.

## Upload flow

1. Upload bytes to authenticated `POST /attachments` with a URL-encoded `X-File-Name` header.
2. Wait for a completed upload and retain its attachment ID.
3. Include the attachment reference when sending the user message.
4. Read the file through authenticated `GET /attachments/{attachment_id}`.

The original bytes do not travel as a base64 WebSocket frame. Image loading uses authentication headers; credentials are not appended to image URLs.

| Limit | Value |
| --- | --- |
| Per file | 20 MiB |
| References per message | 8 |
| Per-user attachment storage | 256 MiB |
| Normalized image maximum edge | 4096 pixels |

Supported inputs include images, PDF, Office documents, common text formats and MP3/WAV/M4A/OGG/FLAC. Video, arbitrary archives and executables are rejected. Conversion runs with deadlines and bounded output. An empty scanned-PDF extraction is not proof of visual understanding.

## Agent-facing media tools

`multimodal_understand` resolves the owner's attachment or device-screenshot IDs. Responses retain whether the source was an attachment or screenshot. Documents use MarkItDown; vision and audio depend on configured provider access.

`image_generate` creates a private attachment. The current MiniMax character-reference interface supports reference-based generation; it is not a general arbitrary-pixel editing API. An interrupted paid generation remains uncertain until reconciled and should not be blindly repeated.

Source: [media specification](https://github.com/HymioSpace/Hymio/blob/main/spec/feature22-models-and-media.md).
