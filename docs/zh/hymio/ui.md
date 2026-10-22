# A2UI：Hymio UI 示例与协议

Hymio UI v1 在助手 Markdown 中渲染受限组件树，Web 和 iOS 用各自的渲染器解释同一份数据。这是 Hymio 的有限协议，不代表兼容全部 A2UI 或 json-render 功能。

## 真实案例：在 iPhone 点击模型生成的卡片

先像平常聊天一样提出需求：

> 我想散步放松一下。做张简洁的小卡片：时长只选15分钟或30分钟，活动可以改，点“帮我安排”后再给建议，先别建日程。

模型根据这句话生成可操作的卡片，原生 iOS 和同一账号的 Web 都能显示。用户只需要描述想做什么，不需要提供 JSON 或组件名称。

在 iPhone 将时长从「30 分钟」改为「15 分钟」，保留活动「散步」，再点击「帮我安排」。实际生成并送达的用户消息是：

> 请帮我安排15 分钟的散步，只给建议，不创建日程、不调用工具。

<DocFigure variant="phone" src="/screenshots/hymio-ios-ui-card.png" caption="原生 iOS 实录：模型生成的卡片，已实际切换到“15 分钟”。" />

选项影响的是这台客户端即将发送的消息。输入框编辑值属于本端交互状态，不承诺在不同客户端之间实时同步；发送后的普通消息才进入共享对话。下面的文档演示可以在不连接模型的情况下试同样的操作。

## 先认识这些术语

| 术语 | 含义 |
| --- | --- |
| A2UI / Agent 生成 UI | Agent 用结构化数据描述界面，客户端把它显示为原生组件，而不是运行模型写出的网页。这里实现的是 Hymio UI v1 的有限目录。 |
| Spec / 界面描述 | 一份 JSON，定义根节点、组件和组件之间的父子关系。 |
| Element / 节点 | 界面里的一个组件，用稳定 ID 标识，例如卡片或输入框。 |
| Props / 属性 | 组件的内容与初始值，例如标题、选项、按钮文字。 |
| Patch / 增量更新 | 只增加、替换或移除指定节点，让界面随着回复逐步形成。 |
| Prompt / 按钮消息 | 点击按钮后，把当前输入值填进模板，生成一条普通用户消息。 |

## 先试一个例子

**场景：安排一段空闲时间。** 用户不必反复描述时长和活动，助手给出选项与输入框。试着选择「15 分钟」，填入「阅读」，再点击「一起安排」，即可看到生成的消息。

<UiExample />

数据与效果的对应关系：`Card` 是卡片外壳，`Choice` 是时长选择，`Input` 是活动输入，`Button` 把当前值填进消息。初始值只是建议，用户修改后以当前输入为准。

在真实应用里，这条消息会交给 Agent；是否创建任务或日程仍需后续处理，按钮点击本身不代表已执行。

## 另一个例子：展示方案摘要

比较方案时可以只展示信息，无需表单。下面的演示数据会显示一张「周末安排」卡片，含一个时长指标和补充文字；不是实时查询结果。

````markdown
```hymio-ui
{"root":"weekend","elements":{"weekend":{"type":"Card","props":{"title":"周末安排","subtitle":"示例方案"},"children":["time","note"]},"time":{"type":"Metric","props":{"label":"预计时长","value":"2 小时","detail":"含往返时间"}},"note":{"type":"Text","props":{"text":"上午散步，下午留给自由活动。"}}}}
```
````

## 完整 Spec

在助手正文中使用独立的 `hymio-ui` fence，每行是一个完整 spec 或 patch。完整树包含 `root` 和 `elements`：

````markdown
```hymio-ui
{"root":"summary","elements":{"summary":{"type":"Card","props":{"title":"打包清单"},"children":["items"]},"items":{"type":"Text","props":{"text":"证件、衣物、洗漱、充电用品。"}}}}
```
````

节点包含稳定 ID、目录中的 `type`、`props`，以及可选的 `children` ID。每个子节点只能有一个父节点，循环会被拒绝。

## 组件目录

| 组件 | Props | 子节点 |
| --- | --- | --- |
| `Card` | `title`、`subtitle` | 支持 |
| `Column`、`Row` | 无 | 支持 |
| `Text` | `text`、可选 `tone: muted` | 无 |
| `Metric` | `label`、`value`、`detail` | 无 |
| `Badge` | `text` | 无 |
| `Input` | `label`、`placeholder`、初始 `value` | 无 |
| `Choice` | `label`、`options`、初始 `value` | 无 |
| `Button` | `label`、`prompt` | 无 |

除 `Choice.options` 是最多 12 项的字符串数组，其他属性均为字符串。Text 不解释 Markdown。用户编辑后的输入值，不被后续 patch 的初始值覆盖。

## 渐进更新

支持 `add`、`replace`、`remove`，路径仅限 `/root` 和 `/elements/<id>`。Replace 替换整个节点，不支持任意嵌套 JSON pointer。

```jsonl
{"op":"add","path":"/root","value":"summary"}
{"op":"add","path":"/elements/summary","value":{"type":"Card","props":{"title":"打包清单"},"children":["items"]}}
{"op":"add","path":"/elements/items","value":{"type":"Text","props":{"text":"证件、衣物、洗漱、充电用品。"}}}
```

一行尚未完整时保留最后有效帧。完整结构记录独立于正文打字机缓冲应用，稳定 ID 保留输入状态，避免未变化节点反复挂载。

## 动作与限制

Button 点击后替换 <code v-pre>{{input-id}}</code> 中的当前输入值，发送一条可见的普通用户消息。它不会执行工具、批准权限或隐藏调用业务 API。不要生成密钥输入框，表单内容会进入对话。

每块最多 64 KiB、64 个节点、深度 12，每字段最多 2,000 字符。ID 使用 `[A-Za-z0-9_-]{1,64}`，原型相关保留 ID 会被拒绝。不支持原始 HTML、脚本、CSS 或任意网络请求，也尚未实现跨消息 surface 更新和任意图表 / Canvas。

模型可读的目录位于 [Hymio UI Skill](https://github.com/HymioSpace/Hymio/blob/main/extensions/skills/hymio-ui/SKILL.md)，通过应用 Skill 目录加载。
