# A home for the documentation

**Recommended: VitePress on Cloudflare Pages, with `docs.hymio.top`.** The documentation is a static website. It needs no Hymio backend, model key, database, or ECS instance.

This is a deployment proposal, not an already-published address. Domain setup and provider authorization remain operator steps. Research checked on October 22, 2026.

## How other projects do it

[VitePress](https://vitepress.dev/guide/what-is-vitepress) powers the documentation for Vite, Rollup, Pinia, Vitest and others; Vue uses a customized VitePress theme. Markdown stays close to code, while Vue components support interactive explanations.

[Docusaurus](https://docusaurus.io/docs) is a strong React-based option with built-in versioning, localization and search. [Starlight](https://starlight.astro.build/guides/i18n/) offers Astro-based documentation with multilingual routing. Both are credible choices. For this first bilingual guide, VitePress gives us the capabilities we need with a small amount of custom UI.

## Free hosting options

| Option | Free address | Why choose it |
| --- | --- | --- |
| **Cloudflare Pages** | `PROJECT.pages.dev` | Git integration, preview deployments, custom domains |
| **GitHub Pages** | `hymiospace.github.io/hymio-doc/` | Repository-native publication using GitHub Actions |

Project-name availability is not guaranteed. A custom domain is independent of the hosting platform; the domain registration itself is not included in free hosting. `docs.hymio.top` is the recommended public identity, while `hymio.pages.dev` would be a good temporary name if available.

Cloudflare's Free plan currently permits 500 builds per month and 20,000 site files, ample for this draft. GitHub Pages is available for public repositories on GitHub Free and supports custom domains. Consult the [Cloudflare limits](https://developers.cloudflare.com/pages/platform/limits/) and [GitHub Pages documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages) before publication; plans can change. Network quality should be tested from the audience's actual regions.

## Publish with Cloudflare Pages

1. Push the reviewed documentation to GitHub, then connect the repository in Cloudflare Pages.
2. Choose `main` as the production branch, Node.js 22, build command `npm ci && npm run check && npm run build`, and output directory `docs/.vitepress/dist`.
3. Leave `DOCS_BASE` unset for a root-level site.
4. In the Pages project's **Custom domains**, add `docs.hymio.top` first.
5. Add the CNAME record shown by Cloudflare at your DNS provider. A subdomain can use external DNS; moving the entire domain's nameservers is not required for this setup.
6. Wait for domain verification and HTTPS, then test both `/` and `/zh/`.

Follow the [custom domain instructions](https://developers.cloudflare.com/pages/configuration/custom-domains/). Adding only a DNS record without associating the domain with the Pages project is insufficient.

## Publish with GitHub Pages

The repository includes a manually triggered Pages workflow, so a draft push does not unexpectedly publish a site.

1. In repository **Settings → Pages**, select **GitHub Actions** as the source.
2. Run the **Deploy documentation** workflow with base path `/hymio-doc/` for the project address.
3. If you configure a custom domain in Pages settings, rerun with base path `/` instead.
4. Enable HTTPS after the certificate is ready.

`DOCS_BASE` is applied to navigation and assets at build time. A wrong base path produces missing scripts or images, so build for the address you intend to serve. For an organization-root `hymiospace.github.io` site, use a repository named `HymioSpace.github.io` and base `/`.

See [VitePress deployment](https://vitepress.dev/guide/deploy) for the underlying build model.
