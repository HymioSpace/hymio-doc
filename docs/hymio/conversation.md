# Conversation & clients

One user has one continuing agent conversation. You can leave a client and return from another supported client without creating a new conversation.


## Real case: continue a phone packing-list conversation

After starting a two-day packing list in native iOS, we opened Web with the same account and asked to shorten the previous list to four lines of no more than twelve Chinese characters each. The original request, reply, Web follow-up and shorter result appear in the same conversation and synchronize back to iPhone.

<DocGallery :images='[{"src": "/screenshots/hymio-ios-chat.png", "label": "iOS", "caption": "Native iOS: the packing-list conversation can continue on another client."}, {"src": "/screenshots/hymio-conversation.png", "label": "Web", "caption": "Original Web conversation capture: a demo account requests a packing list from the model."}, {"src": "/screenshots/hymio-web-continuity.png", "label": "Web · continuity", "caption": "This two-client case: Web restores the same request and reply initiated on iPhone."}]' />

This is the running native application rather than a narrow Web viewport. iOS and Web render the same server content in their own interfaces. See the [cross-device walkthrough](./ios#real-case-start-a-packing-list-on-iphone-refine-it-on-web).

## Send and follow a message

Type in the composer, attach files if needed, and send. A local pending message appears before backend acceptance. Acknowledgment means the input was accepted; it does not mean the model has finished processing it.

Assistant output streams progressively. Working details group intermediate text, reasoning content exposed by the provider, and tool activity. Expand them when you need to inspect the process. Final replies stay outside the completed work group.

## Connection and execution are independent

Closing Web, Desktop or iOS does not cancel work accepted by Oath. When reconnecting, the client resumes after its own acknowledged event cursor. Offline boundaries distinguish replayed progress from live output.

If a message failed to send, inspect its send state before trying again. A lost connection after acceptance is different from a rejected message. Stable command identities let the protocol recognize a retry without treating it as a new request.

## History and rendering

Recent conversation loads from a snapshot, earlier messages load on demand, and live events start after the snapshot checkpoint. Each client window keeps its own delivery progress.

Incoming live text first enters a small display buffer; its visual rate is independent of transport chunk size. History is rendered immediately. This buffer changes presentation only, not event persistence, ACKs or task state.

## Platform differences

| Client | Interaction |
| --- | --- |
| Web / Desktop | Sidebar navigation, keyboard composer, screenshot paste, wider task views |
| iOS | Native tabs, streaming chat, Hymio UI cards, photo and file input, and image viewing |
| Operator console | Separate login surface and resource administration; not a conversation client |

For a real iPhone-to-Web walkthrough, see [Cross-device continuity](./ios).

## Inspect a problem

Open the separate Trace page to inspect an execution. It is a technical view; local synchronized events are not the complete server journal. A task's status and a tool's terminal result are separate: a successful tool can still be followed by a failed agent continuation.
