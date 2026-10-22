# 模型与附件

文字生成、媒体理解和图片生成分别配置。切换对话模型，不会自动切换媒体 Provider。

## 真实案例：手机改模型，电脑接着用

我们在原生 iOS「我的 → 对话模型」中把 `MiniMax-M2.7` 切换到 `MiniMax-M3`，再打开同一演示账号的 Web「我的」。两端都读到了 `MiniMax-M3`，刚才的旅行清单对话仍然保留。

<DocGallery :images='[{"src": "/screenshots/hymio-ios-models.png", "label": "iOS", "caption": "原生 iOS 实录：选择 MiniMax-M3，已有对话保留。"}, {"src": "/screenshots/hymio-web-models.png", "label": "Web", "caption": "Web 实录：读到手机刚保存的 MiniMax-M3 偏好。"}]' />

**怎么复现**：在 iPhone 的「我的」选择部署允许的模型，再到 Web 打开账号设置查看。修改在下一条消息生效；已有回复不重算。模型名称以你的部署实际提供的列表为准。

## 真实案例：把行程笔记作为资料发给助手

这次使用一份真实上传的演示文件 `trip-notes.txt`：两人、两天一夜、高铁往返、已订酒店，待确认酒店能否寄存行李。文件不包含私人行程。

1. 在 Web 对话的附件入口选择该文件，等待文件名和大小出现。
2. 发送「请阅读我上传的 trip-notes.txt，用三条短句列出出发前需要核对的事项」。
3. 在 iPhone 同一账号的对话中查看这条带附件的消息和模型回复，再继续追问。

<DocGallery :images='[{"src": "/screenshots/hymio-ios-attachment.png", "label": "iOS", "caption": "原生 iOS 实录：附件消息与基于行程文件的三条核对事项。"}, {"src": "/screenshots/hymio-web-attachment.png", "label": "Web", "caption": "Web 实录：基于已上传行程笔记的三条整理结果。"}]' />

**实际结果**：回复列出了证件与必带物、去返程车票、酒店入住与行李寄存三项；没有把“酒店能否寄存行李”擅自写成已确认。

本轮文件上传由 Web 完成，手机用于接收和继续处理；原生 iOS 也已提供照片图库、文件选择和设备支持时的拍照入口。不要把“界面有附件入口”与“当前部署已配好视觉模型”混为一谈。

[下载这份演示笔记](/examples/trip-notes.txt)，可以在自己的部署复现。

## 选择模型

设置页展示 Backend 的有序 `model_options` 白名单。选择按用户保存，多端共享。Backend 转发消息时加上模型选择，Oath 再次校验，并为每个步骤固定模型。

```http
GET /settings/models
Authorization: Bearer USER_ACCESS_TOKEN
```

```json
{"models":["MiniMax-M2.7","MiniMax-M3"],"selected":"MiniMax-M3"}
```

通过 `POST /settings/models` 与 `{"model":"MiniMax-M3"}` 修改。Backend 列表需要与已部署的 Oath 模型选项一致，Endpoint 和凭据由服务端配置。

## 上传链路

1. 向鉴权后的 `POST /attachments` 上传原始字节，`X-File-Name` 使用 URL 编码文件名。
2. 等待上传完成，保留附件 ID。
3. 发送用户消息时携带附件引用。
4. 通过鉴权后的 `GET /attachments/{attachment_id}` 读取。

原始文件不作为 base64 塞进 WebSocket。图片加载使用鉴权 Header，不把凭据拼进图片 URL。

| 限制 | 值 |
| --- | --- |
| 单文件 | 20 MiB |
| 每条消息附件数 | 8 |
| 每用户附件存储 | 256 MiB |
| 图片标准化后最长边 | 4096 像素 |

支持图片、PDF、Office 文档、常用文本，以及 MP3/WAV/M4A/OGG/FLAC。视频、任意压缩包和可执行文件会被拒绝。转换有 deadline 和输出上限；扫描 PDF 提取为空，不代表视觉理解成功。

## Agent 媒体工具

`multimodal_understand` 读取当前用户的附件或设备截图 ID，返回时保留来源类型。文档使用 MarkItDown，视觉和音频取决于配置的 Provider 能力。

`image_generate` 生成私有附件。当前 MiniMax 人物参考接口支持参考生成，不等同于任意像素编辑。付费生成中断后保留未知状态，不应直接重试。

详见[媒体规范](https://github.com/HymioSpace/Hymio/blob/main/spec/feature22-models-and-media.md)。
