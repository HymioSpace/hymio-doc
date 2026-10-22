# Devices & administration

Hymio distinguishes a **client** from an **execution device**. Web and iPhone carry a conversation. An authorized cloud desktop gives the agent somewhere to run Bash, use a browser and interact with a desktop.

## Real case: iPhone and Web are online, but there is no cloud computer

The same demo account signs into iPhone and Web. Both installations appear online, while Web explains that no cloud computer is assigned and an operator must grant access. Chat continues normally. Account login and message sync do not mean an execution environment has been allocated.

<DocGallery :images='[{"src": "/screenshots/hymio-ios-models.png", "label": "iOS", "caption": "Native iOS: iPhone and Web are online, with no cloud computer."}, {"src": "/screenshots/hymio-web-models.png", "label": "Web", "caption": "Web: conversation continues without an allocated cloud computer."}]' />

The phone can still discuss a packing list and read replies. Remote browser or desktop work first needs a resource grant, followed by a device request.

## Real case: grant permission without creating a computer

We ran the actual Backend and console with an isolated test database and granted Daytona access to a travel-demo user. The console changed to authorized, while cloud-computer count stayed at zero. Granting access did not provision a computer.

<DocFigure src="/screenshots/hymio-admin-grant.png" caption="Actual persisted grant: one authorized user, zero cloud computers. Account identifiers are outside the capture." />

Next, a user can request remote-environment work from iPhone or Web. The server checks access and capacity before preparing an environment. A successfully prepared computer then appears in the device list. This case verifies the saved grant; it does not claim an unexecuted cloud task succeeded.

See the [operator walkthrough](./admin#real-case-grant-one-user-cloud-computer-access).

## One environment, three interfaces

Bash, browser automation and computer use target the same device ID, filesystem and desktop environment. Browser screenshots identify a page; desktop screenshots capture the visible screen. A machine's address is private provider configuration, not something the user pastes into a chat.

| Provider | Current allocation limit | Integration |
| --- | --- | --- |
| Daytona | 10 | Hosted sandbox API / SDK |
| E2B | 20 | Existing-provider compatibility |
| Operator-managed ECS | 1 | Host-side HTTPS device API |
| Cloud phone | Disabled | Reserved for future integration |

These are Hymio's configured allocation limits, not provider pricing or account entitlements. Billing and provider-side limits still apply.

## Permission before allocation

New registrations receive no cloud devices. Operators allow an account to use a provider; a later device request allocates or resumes the environment. Disabling access stops future use without deleting files.

Paused environments and uncertain allocations still occupy capacity. Confirmed release is a separate operation. Releasing a hosted sandbox can delete its data; detaching an operator-managed VM leaves the VM running outside Hymio.

## A separate operator console

The console lives at `/admin/`, independently of the user application. It manages access, capacity and lifecycle. Every operation is authorized by the backend using the private `admin_user_ids` configuration.

For local console development:

```sh
# From the Hymio repository, with Backend running
pnpm --filter @hymio/admin dev
```

After startup, use the console address printed in the terminal and its `/admin/` path. For a cloud deployment, use the operator-provided site address followed by `/admin/`. This documentation site does not host a console. See the local [Operator console guide](./admin) for sign-in, access grants and troubleshooting.

## Recovery should preserve trust

A timeout does not prove an action failed. Hymio records uncertain outcomes and preserves reservations rather than repeatedly creating computers. The agent should report a permission or capacity limit, not loop trying to repair credentials.

Native Mac control and cloud phones remain future integrations. Their ownership and allocation should fit the same resource-management model.
