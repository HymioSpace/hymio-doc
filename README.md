# Hymio documentation

English-first user guides and developer documentation, organized into three sections:

- **Hymio:** installation, clients, conversation, tasks, media, devices, configuration, product API and Hymio UI.
- **Oath:** runtime installation, architecture, WebSocket/HTTP, extensions, authentication, model configuration and subagents.
- **Nostalgia:** scope and draft Context contracts. No service implementation yet.

## Preview

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4178. English is at `/`; Simplified Chinese is at `/zh/`.

```sh
npm run check
npm run build
npm run preview
```

## Maintain

Pages live under `docs/{hymio,oath,nostalgia}/`, with the same paths under `docs/zh/`.
Navigation lives in `docs/.vitepress/config.mts`, shared styling and interactive components in
`docs/.vitepress/theme/`. Check the owning project's source before changing technical claims.
Keep draft contracts explicitly marked. Examples and screenshots must use synthetic data.

`ASSETS.md` records image provenance. Hosting and brand exploration notes belong in
`maintainers/`, outside the built site and search index.

## Publish

Cloudflare Pages: Node.js 22, build `npm ci && npm run check && npm run build`, output
`docs/.vitepress/dist`. Root deployments use `DOCS_BASE=/` (the default).
GitHub Pages: enable Actions as the Pages source and manually run **Deploy documentation**.
Choose `/hymio-doc/` for the project address or `/` for a custom domain.

Detailed maintainer instructions: [English](maintainers/en/hosting.md) / [中文](maintainers/zh/hosting.md).
A build or ordinary push does not trigger the GitHub Pages deployment workflow.
