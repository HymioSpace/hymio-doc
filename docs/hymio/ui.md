# UI/UX and A2UI

Hymio has two UI layers with different responsibilities:

- the **product shell** for Today, Chat, My, tasks, memory and settings;
- the restricted **Hymio UI / A2UI** catalog that renders model-generated cards inside a reply.

Both use the same visual language, but generated assistant UI cannot replace or control the product
shell.

## Product hierarchy

| Window | Primary navigation |
| --- | --- |
| Compact iOS | Bottom navigation with Today, Chat and My |
| Medium/expanded Web or Desktop | Labelled navigation rail and a wider content pane |

Tasks, memory, connections, settings and devices are not additional iOS primary tabs. They open from
My, and each destination keeps the platform back path. Detail pages use progressive disclosure:
summary first, Agent responsibility/result next, raw execution last.

The screen answers the current user question before exposing implementation. A task list shows what
needs attention and what was produced; it does not lead with a scheduler diagram. A memory card
shows the understanding or footprint first; evidence opens on demand.

## Conversation geometry

Scroll anchoring is based on visible message/detail content:

- sending does not leave a fixed blank spacer above the latest row;
- keyboard dismissal does not trigger a competing scroll animation;
- expanding working details grows downward from their row;
- user scrolling away from the bottom detaches following until the user returns;
- completed Markdown must not collapse or replace an existing visible frame in a way that jumps the
  viewport.

Only new streaming text changes on the active tail. History and unchanged message rows keep stable
identity and layout. Semantic tool descriptions are primary copy; command syntax and JSON are deeper
detail.

## Loading, empty and failure

Every list defines those three states separately:

| State | Required behavior |
| --- | --- |
| Loading | Show progress only for the unresolved scope; preserve already-visible content |
| Confirmed empty | Explain what will appear and offer the smallest relevant action |
| Read failure | Say it could not be read and offer retry; never label it “empty” |

An empty memory layer can offer “View footprints” or “Add a memory”. A failed Nostalgia read cannot
claim the account has no memory. A task detail with no selection shows a compact instruction, not a
blank pane.

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

## Material 3 convergence layer

Hymio's iOS and Web surfaces use a Material Design 3 convergence layer while the existing page CSS
is migrated. This is implementation scope, not a claim that every legacy control is pixel-perfect
Material.

### Tokens and surfaces

- Hymio blue is the Material source color.
- Primary/container and on-color roles are paired; raw hex values are not used inside components.
- The app uses `surface`, `surface-container-low`, `surface-container`, and `surface-high` tiers.
- Cards use tonal surfaces and outlines. Shadow is reserved for menus, dialogs and transient bars.
- Chips and selected navigation indicators are fully rounded; ordinary cards use the medium shape.

### Navigation

- Compact iOS uses a three-destination bottom navigation bar rather than a floating capsule.
- Desktop Web uses a navigation rail.
- Selected destinations get a tonal indicator and clear foreground color, not a shadow-heavy card.
- The bottom bar stays edge-aligned and preserves the safe area.
- One destination is not raised or visually detached from the other primary destinations.

### Content hierarchy

- Page-level explanation is kept short.
- Exceptions appear inside the affected task or row.
- Execution-mode descriptions open from a small help affordance.
- Agent communication is written as `Sender → Recipient`.
- Raw traces and tool JSON stay in developer/operator views.

Platform typography and icons remain explicit exceptions: iOS keeps SF Pro/SF Symbols, while layout,
color roles, shape and interaction state follow the Material system.

### Accessibility and states

- New shared shell controls target at least 48pt on iOS and 48px on Web. Platform-native controls
  that have not migrated may still use their existing minimums and are included in migration QA.
- Keyboard focus uses a visible ring on Web.
- Selected, pressed, disabled, loading, empty and error states must be distinguishable without color
  alone.
- Reduced motion and reduced transparency are respected.
