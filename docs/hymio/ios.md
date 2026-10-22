# Cross-device continuity

Start work on iPhone and continue on your computer. Change a model on your phone and Web reads the same preference. Hymio keeps conversations, tasks and account settings in one backend, with interfaces suited to each device.

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
| Tasks | Arrange work, inspect progress and results | Manage the same task records |
| Attachments | Native photo-library and file inputs; camera when available | Files and conversation results belong to the same account |
| Hymio UI | Native cards, choices and inputs | Web components interpret the same UI data |
| Execution records | Inspect work records from your account | Inspect the same execution |

## After you leave the screen

Switching apps or closing a browser does not cancel accepted server work. Returning to the foreground refreshes credentials, restores the iOS cache and synchronizes events. Each installation tracks its own received position.

Distinguish pending messages from accepted work. Pending input waits for connectivity; accepted work advances on the server. This is not continuous on-phone background agent execution or push notification support.

## Before using it

Connect iPhone and Web to the same deployment and sign into the same account. Different backends or accounts are not automatically merged. The native app supports account-password login; browser OIDC login, voice input, push delivery and native phone control remain future work.

Start with [Install & start](./getting-started), or see [LAN configuration](./configuration#lan-and-ios) for an existing deployment.
