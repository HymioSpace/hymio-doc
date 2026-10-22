# Operator console

The console is a separate Web application for Hymio deployment administrators. It grants cloud-computer access, shows capacity and manages device lifecycle. Regular users chat in the main application.

## Real case: grant one user cloud-computer access

A user can chat on iPhone but cannot yet use a cloud computer. The operator grants resource access rather than sharing provider credentials.

This walkthrough uses the actual Backend and console with an isolated test database and a travel-demo user. It does not change live users' permissions or provision a paid computer.

1. Sign in with the product account configured as an administrator in the test environment.
2. Find the travel-demo user under user permissions, initially without access.
3. Select configured Daytona and grant access.
4. The console reports the update, marks the user authorized and records a `grant` audit entry.
5. Confirm the cloud-computer count is still zero: permission is saved, but no environment has been created.

<DocFigure src="/screenshots/hymio-admin-grant.png" caption="Actual console statistics: one authorized user, zero computers, with account identifiers outside the capture." />

The user can next request remote work from iPhone or Web. Allocation still checks capacity and provider availability. Authorized is not the same as executed.

## Terms used here

| Term | Meaning |
| --- | --- |
| Administrator | A product account whose user ID is in the private `admin_user_ids` configuration. No separate administrator password is created. |
| Resource grant | Permission for a user to use a cloud-computer provider. Device allocation requires this grant. |
| Capacity | Device allocation limits and occupied slots; provider quotas still apply separately. |
| Device lifecycle | Allocation, pause, resume and confirmed release. Pausing does not release capacity. |

## Access the console

Use the site address supplied by your deployment operator, followed by `/admin/`. This is an application route, not a route on this documentation site.

For local development, start Hymio Backend, then run this in the Hymio repository:

```sh
pnpm --filter @hymio/admin dev
```

Use the address printed in the startup log and its `/admin/` path. The development server proxies `/auth` and `/admin/api` to Backend. Starting only the frontend is insufficient for sign-in and management.

## First sign-in and access grant

1. Register a product account in the main application and obtain its product user ID.
2. Add the administrator's ID to private `admin_user_ids`, then restart as described in [Configuration & deployment](./configuration).
3. Sign into the console with that same product account.
4. Grant the intended user access to a provider, then let the user request a device.

Backend checks every management operation. Frontend identity display cannot replace server authorization. Provider credentials stay in private operator configuration rather than ordinary user chat.

## Managing devices

- Paused devices and allocations with unknown outcomes still occupy capacity.
- After a timeout, query the existing operation before creating another computer.
- Releasing a hosted sandbox may delete files. A detached self-managed VM may keep running and needs maintenance outside Hymio.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Connection fails | Console service availability and the operator-provided address. |
| Page loads but sign-in fails | Backend, identity service, development proxy or same-origin cloud routing. |
| Signed in without admin access | The current product user ID must appear in the effective `admin_user_ids`. |
| User cannot get a device | Provider grant, remaining capacity and provider configuration. |

See [Admin API](./api#operator-api) and [Devices & administration](./devices).
