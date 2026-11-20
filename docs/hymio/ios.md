# Cross-device continuity

Start work on iPhone and continue on your computer. Change a model on your phone and Web reads the same preference. Hymio keeps conversations, tasks and account settings in one backend, with interfaces suited to each device.

The current iPhone shell has three primary destinations: **Today**, **Chat** and **My**. Tasks,
memory, connections, devices and settings sit under My rather than expanding the bottom bar.

## Real case: start a packing list on iPhone, refine it on Web

For a two-day trip, we used an isolated demonstration account in the native iOS application, then signed into Web with the same account.

1. **Start on iPhone:** request four packing categories: documents, clothes, toiletries and chargers. The native app displays the actual model's Chinese reply.
2. **Continue on Web:** open the same conversation and ask to shorten that list into four lines, each no longer than twelve Chinese characters.
3. **Return to iPhone:** the Web follow-up and shorter answer arrive without copying text or starting a new conversation.

<DocGallery :images='[{"src": "/screenshots/hymio-ios-chat.png", "label": "iOS", "caption": "Native iOS: request and receive a four-category packing list."}, {"src": "/screenshots/hymio-web-continuity.png", "label": "Web", "caption": "Web under the same demo account: restore the phone request and reply."}]' />

These captures come from a running application and actual model response, not a documentation mockup. The account and travel material are for demonstration.

## Real case: select a model on iPhone, read it on Web

In iPhone's account screen, change the conversation model from `MiniMax-M2.7` to `MiniMax-M3`, then open the Web account screen. Both showed `MiniMax-M3` in this check, with the conversation preserved. The choice affects future messages, not previous replies or the separate media provider.

<DocGallery :images='[{"src": "/screenshots/hymio-ios-models.png", "label": "iOS", "caption": "Native iOS: model preference and online clients."}, {"src": "/screenshots/hymio-web-models.png", "label": "Web", "caption": "Web under the same account: reading the same model selection."}]' />

See [Models & attachments](./media) for the complete model and input-material cases.

## What follows you between devices

| Feature | On iPhone | Back on Web / Desktop |
| --- | --- | --- |
| Continuing conversation | Send messages, read streaming replies and history | Follow up in the same conversation |
| Model preference | Choose a conversation model in your account | Read the same account choice |
| Tasks | Open from My; inspect progress, results and optional calendar views | Manage the same task records in the Web task panel |
| Attachments | Native photo-library and file inputs; camera when available | Files and conversation results belong to the same account |
| Hymio UI | Native cards, choices and inputs | Web components interpret the same UI data |
| Execution records | Open the relevant task or diagnostics view | Inspect the same execution |

## After you leave the screen

Switching apps or closing a browser does not cancel accepted server work. Returning to the foreground refreshes credentials, restores the iOS cache and synchronizes events. Each installation tracks its own received position.

Distinguish pending messages from accepted work. Pending input waits for connectivity; accepted work
advances on the server. Push notifications and one aggregate Live Activity can reconnect the user
when work starts, needs attention or completes. This still does not run the Agent continuously on
the phone. Completion and failure are terminal: the client stops the elapsed timer and ends the Live
Activity immediately instead of leaving a completed activity visible.

## Before using it

Connect iPhone and Web to the same deployment and sign into the same account. Different backends or
accounts are not automatically merged. The native app supports account-password login and APNs when
the deployment is configured. Browser OIDC login, voice input and full native phone control remain
future work.

## Material 3 shell

The native app uses a Material 3 convergence layer: color roles, tonal surfaces, compact card
hierarchy and a standard three-destination navigation bar. Hymio keeps SF Pro and SF Symbols as
platform-native exceptions; navigation geometry, selected indicators, spacing and state behavior
follow the Material system.

<DocGallery :images='[{"src": "/screenshots/hymio-material-home.png", "label": "Material shell", "caption": "Compact Material navigation bar with a tonal selected indicator."}, {"src": "/screenshots/hymio-material-my.png", "label": "My", "caption": "List-based grouping, muted section labels and tonal surfaces replace stacked heavy cards."}]' />

Start with [Install & start](./getting-started), or see [LAN configuration](./configuration#lan-and-ios) for an existing deployment.
