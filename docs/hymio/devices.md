# Connections & devices

Hymio distinguishes four things that often share a settings screen but have different trust and
execution semantics:

| Object | Purpose |
| --- | --- |
| Conversation client | Web, Desktop or iPhone reading chat and receiving events |
| Connection | A Gmail, Dida, Calendar or Health source authorized for read-only context |
| Personal execution device | A Mac or Android running HymioDevice |
| Cloud computer | A provider-managed desktop allocated under operator policy |

An iPhone does not need to be added again as a “device” merely because it is a client. The iOS
device page lists Mac, Android and cloud execution targets; the current conversation client is
already authenticated.

## Connections

Open **My → Connections**. The page is a grouped list:

- **Cloud services** contains providers such as Gmail and Dida;
- **This iPhone** contains Apple Calendar and Apple Health;
- each provider uses one row and one detail page rather than a provider-specific hero layout;
- status, coverage, last success, pending delivery and actions live in that detail.

Provider registration is deployment-specific. An unavailable provider says that the operator has
not configured it; it does not show a broken “Connect” button or fabricated account.

### What each source does

| Source | Initial collection | Permission boundary |
| --- | --- | --- |
| Gmail | A bounded recent inbox and later history pages | Read-only; no send, edit or delete |
| Dida | Bounded project/task pages and recent completed work | Read-only; no complete or modify |
| Apple Calendar | Selected calendars from the previous 7 to next 30 days | Hymio reads only; Apple grants full calendar access |
| Apple Health | Daily steps and active energy, up to 7 summarized days | No clinical records, no health writes |

Cloud tokens are encrypted with a key stored beside the Backend database. Disconnect stops new
collection and removes local provider credentials. Previously delivered context remains until a
separate data policy removes it.

Native upload requires explicit consent to send selected summaries to Hymio and configured AI
models. OS permission alone is not that consent. HealthKit may return no readable samples even when
permission exists; “no data” is not the same as zero activity or a refused prompt.

## Personal Mac and Android

### Pair

1. Open **My → Devices → Connect Mac or Android**.
2. Generate a five-minute, single-use code.
3. Enter the Hymio server address and code in HymioDevice.
4. Grant the OS permissions needed for the capabilities you choose.

The device connects to Backend through outbound WSS, so no inbound home-network port is required.
Each account may bind one Mac and one Android execution device. Device credentials stay in
Keychain/Keystore; Backend stores only a digest.

### Capabilities

| Device | Capabilities | Important limit |
| --- | --- | --- |
| Personal Mac | Bash when explicitly enabled, browser and desktop control | Screen Recording and Accessibility permissions are local; Shell is off by default |
| Personal Android | Screenshot, tap, swipe, text, back/home/recents | No Bash; unlocked device and screen-sharing consent required |

Pause and revoke stop future commands. They cannot undo a click, shell command or external side
effect that already ran. A disconnected or timed-out uncertain command is not automatically
replayed.

## Cloud computers

Cloud providers are separate from personal devices. New accounts have no cloud resource until an
operator grants a provider. Provisioning may continue in the background after the API returns
`preparing`.

| Provider | Allocation model |
| --- | --- |
| Daytona | Hosted sandbox API |
| Compatible E2B | Existing-provider compatibility |
| Operator-managed Linux | Host-side HTTPS device API |

Configured Hymio limits are not provider pricing or entitlement. Paused/uncertain environments can
still consume capacity. Releasing a hosted sandbox can delete its data; detaching a self-managed VM
does not shut that VM down.

## Operator grant example

<DocFigure src="/screenshots/hymio-admin-grant.png" caption="A persisted provider grant with zero cloud computers: permission and allocation are separate." />

The screenshot uses an isolated database and synthetic user. The operator granted Daytona access;
Hymio did not provision a paid desktop.

## Current boundaries

- Cloud phone execution and manual takeover are not shipped.
- Chrome extension capture is still a scaffold.
- Connector write actions are not included in the read-only foundation.
- Gmail restricted-scope verification and physical Apple permissions require real deployment
  acceptance.

See [Operator console](./admin) for grants, monitoring and device lifecycle.
