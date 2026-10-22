# A2UI: Hymio UI examples & protocol

Hymio UI v1 renders a controlled component tree inside assistant Markdown. Web and iOS interpret the same data using their own renderers. This is a limited Hymio protocol, not a claim of compatibility with every A2UI or json-render feature.

## Real case: tap a model-generated card on iPhone

Start with an ordinary request (the captured conversation is in Chinese):

> I would like to unwind with a walk. Make a simple card with just fifteen or thirty minutes, an editable activity and a “Help me plan” button. Give suggestions after I click; do not create an event yet.

The model turns this request into an interactive card, rendered by native iOS and Web under the same account. Users describe what they want without supplying JSON or component names.

On iPhone, we changed thirty minutes to fifteen, kept walking as the activity and tapped the action. This produced and delivered an ordinary visible user message asking for a fifteen-minute walk suggestion without creating an event or calling tools.

<DocFigure variant="phone" src="/screenshots/hymio-ios-ui-card.png" caption="Native iOS capture: the model-generated card after actually selecting fifteen minutes." />

The selection controls the message this client will send. Draft input state is local interaction state and is not promised to synchronize live between clients. The sent message enters the shared conversation. The documentation demo below lets you try the same interaction without a model connection.

## Terms used here

| Term | Meaning |
| --- | --- |
| A2UI / agent-generated UI | An agent describes an interface as structured data; clients display native components rather than execute generated web pages. This implementation uses the limited Hymio UI v1 catalog. |
| Spec | JSON defining the root, components and parent-child relationships. |
| Element | One component with a stable ID, such as a card or input. |
| Props | Component content and initial values: titles, choices and button labels. |
| Patch | Add, replace or remove a specific node as the reply arrives. |
| Prompt | A button's message template, filled with current input values after a click. |

## Try an example

**Scenario: plan some free time.** Instead of repeating a duration and activity in prose, the user gets a choice and an input. Select “15 minutes”, enter “reading”, then click “Plan together” to inspect the resulting message.

<UiExample />

`Card` supplies the shell, `Choice` selects time, `Input` describes the activity, and `Button` substitutes the current values into a message. Initial values are suggestions; user edits take precedence.

In the real application, the agent receives that message. Creating a task or calendar event requires further handling; clicking the button does not mean it has happened.

## Another example: a plan summary

An information-only card can summarize a comparison without a form. This sample produces a “Weekend plan” card with a duration metric and a note. These are illustrative values, not live query results.

````markdown
```hymio-ui
{"root":"weekend","elements":{"weekend":{"type":"Card","props":{"title":"Weekend plan","subtitle":"Example option"},"children":["time","note"]},"time":{"type":"Metric","props":{"label":"Estimated time","value":"2 hours","detail":"Including travel"}},"note":{"type":"Text","props":{"text":"A morning walk, with the afternoon left free."}}}}
```
````

## Full specification

Put a standalone `hymio-ui` fence in assistant content. Each line is one complete specification or patch. A complete tree has `root` and `elements`:

````markdown
```hymio-ui
{"root":"summary","elements":{"summary":{"type":"Card","props":{"title":"Packing list"},"children":["items"]},"items":{"type":"Text","props":{"text":"Documents, clothes, toiletries, chargers."}}}}
```
````

Elements have stable IDs, a catalog `type`, a `props` object, and optional `children` IDs. Each child has exactly one parent; cycles are rejected.

## Component catalog

| Component | Props | Children |
| --- | --- | --- |
| `Card` | `title`, `subtitle` | Yes |
| `Column`, `Row` | None | Yes |
| `Text` | `text`, optional `tone: muted` | No |
| `Metric` | `label`, `value`, `detail` | No |
| `Badge` | `text` | No |
| `Input` | `label`, `placeholder`, initial `value` | No |
| `Choice` | `label`, `options`, initial `value` | No |
| `Button` | `label`, `prompt` | No |

Props are strings except `Choice.options`, an array of at most 12 strings. Text is literal, not Markdown. User-edited values are not overwritten by later patches carrying initial values.

## Progressive updates

Supported operations are `add`, `replace`, `remove`, restricted to `/root` and `/elements/<id>`. A replace operation replaces the whole node; arbitrary nested JSON pointers are not accepted.

```jsonl
{"op":"add","path":"/root","value":"summary"}
{"op":"add","path":"/elements/summary","value":{"type":"Card","props":{"title":"Packing list"},"children":["items"]}}
{"op":"add","path":"/elements/items","value":{"type":"Text","props":{"text":"Documents, clothes, toiletries, chargers."}}}
```

A partial line keeps the last valid frame. Complete structural records are applied independently of the prose typewriter buffer. Stable IDs preserve input state and avoid remounting unchanged nodes.

## Actions and limits

A Button substitutes current input values in <code v-pre>{{input-id}}</code> placeholders and sends a visible ordinary user message only after a click. It does not execute a tool, approve permission or silently call a business API. Do not use generated fields for secrets: their values become conversation content.

Each block is limited to 64 KiB, 64 nodes, depth 12, and 2,000 characters per field. IDs use `[A-Za-z0-9_-]{1,64}`; reserved prototype-related IDs are rejected. Raw HTML, scripts, CSS and arbitrary networking are not supported. Cross-message surface updates and arbitrary chart/canvas components are not implemented.

The model-facing catalog lives in [the Hymio UI Skill](https://github.com/HymioSpace/Hymio/blob/main/extensions/skills/hymio-ui/SKILL.md). It is loaded through the application's Skill directory.
