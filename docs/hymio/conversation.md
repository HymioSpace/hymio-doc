# Conversation & clients

One user has one continuing agent conversation. You can leave a client and return from another
supported client without creating a new conversation.

## Where the conversation lives

iOS has three primary destinations: **Today**, **Chat** and **My**. Tasks, memory, connections,
settings, devices and diagnostics are subpages of My. Web and Desktop use a labelled navigation rail
with a wider content area. The exact navigation surface differs by platform; the conversation,
account and business records do not.


## Real case: continue a phone packing-list conversation

After starting a two-day packing list in native iOS, we opened Web with the same account and asked to shorten the previous list to four lines of no more than twelve Chinese characters each. The original request, reply, Web follow-up and shorter result appear in the same conversation and synchronize back to iPhone.

<DocGallery :images='[{"src": "/screenshots/hymio-ios-chat.png", "label": "iOS", "caption": "Native iOS: the packing-list conversation can continue on another client."}, {"src": "/screenshots/hymio-conversation.png", "label": "Web", "caption": "Original Web conversation capture: a demo account requests a packing list from the model."}, {"src": "/screenshots/hymio-web-continuity.png", "label": "Web · continuity", "caption": "This two-client case: Web restores the same request and reply initiated on iPhone."}]' />

This is the running native application rather than a narrow Web viewport. iOS and Web render the same server content in their own interfaces. See the [cross-device walkthrough](./ios#real-case-start-a-packing-list-on-iphone-refine-it-on-web).

## Send and follow a message

Type in the composer, attach files if needed, and send. A local pending message appears before
backend acceptance. Acknowledgment means the input was accepted; it does not mean the model has
finished processing it. On iOS, sending dismisses the keyboard.

Assistant output streams progressively. Working details group intermediate text, provider-exposed
reasoning and tool activity. Expand them when you need to inspect the process. Final replies stay
outside the completed work group.

### Anchoring and blank space

The scroll target is a one-point invisible marker at the end of the transcript; it never creates a
visible blank region. Content growth, keyboard changes and shell safe-area changes are corrected only
after layout instead of storing a scroll offset that can become stale. Expanding working details
pauses automatic following while the details grow downward from their row. Only a real user drag
pauses following; system layout changes do not.

The user can scroll away from the tail. New tokens then update the existing message without pulling
the viewport back. Returning to the bottom resumes following. While a local message is waiting for
its first reply, that sent message must remain visible. iOS must not show an empty transcript or jump
when the keyboard closes or working details grow.

## Connection and execution are independent

Closing Web, Desktop or iOS does not cancel work accepted by Oath. When reconnecting, the client resumes after its own acknowledged event cursor. Offline boundaries distinguish replayed progress from live output.

If a message failed to send, inspect its send state before trying again. A lost connection after acceptance is different from a rejected message. Stable command identities let the protocol recognize a retry without treating it as a new request.

## History and rendering

Recent conversation loads from a snapshot, earlier messages load on demand, and live events start after the snapshot checkpoint. Each client window keeps its own delivery progress.

Incoming live text first enters a small display buffer; its visual rate is independent of transport
chunk size. History is rendered immediately. This buffer changes presentation only, not event
persistence, ACKs or task state.

### Tool activity

The default working view shows what the Agent says it is doing. Every Oath tool call must include a
semantic `description`; clients use that sentence first, with the tool name as a short secondary
label. Generic labels such as “run command” or raw JSON do not replace a supplied description.

Tapping into an Agent or trace can reveal the tool, status and bounded result. Raw arguments and
technical payloads remain a deeper inspection surface.

## Platform differences

| Client | Interaction |
| --- | --- |
| Web / Desktop | Labelled rail, keyboard composer, screenshot paste and wider task inspector |
| iOS | Today / Chat / My, streaming chat, Hymio UI cards, photo/file input and image viewing |
| Operator console | Separate login surface and resource administration; not a conversation client |

For a real iPhone-to-Web walkthrough, see [Cross-device continuity](./ios).

## Inspect a problem

Open the separate Trace page to inspect an execution. The list title comes from the first input
body instead of a raw trace ID; the execution ID stays inside a disclosure in the detail. Events use
their real order, showing both local wall-clock time and elapsed time from the trace start. LLM
requests expose their message count and readable context, while responses show text or tool calls.
This remains a technical view: local synchronized events are not the complete server journal. A
task's status and a tool's terminal result are separate too; a successful tool can still be followed
by a failed agent continuation.

Expanding an LLM request first lists messages by `system / user / assistant / tool`. Each message
shows a two-line preview and reveals its body only on demand. Raw attributes and oversized JSON live
in a separate height-bounded disclosure, so one request cannot turn into a blank full screen.
Escaped line breaks and Markdown are decoded before visible rendering.
