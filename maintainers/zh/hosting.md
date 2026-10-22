# 给文档一个长期的地址

**推荐 VitePress + Cloudflare Pages，使用 `docs.hymio.top`。** 文档是静态网站，不需要 Hymio 后端、模型密钥、数据库或 ECS。

这是部署建议，尚未发布这个地址。域名配置与托管账号授权需要在正式发布时完成。调研日期：2026 年 10 月 22 日。

## 开源项目通常怎么做

[VitePress](https://vitepress.dev/guide/what-is-vitepress) 被 Vite、Rollup、Pinia、Vitest 等项目用于文档；Vue 也使用定制 VitePress 主题。正文用 Markdown，交互解释用 Vue 组件。

[Docusaurus](https://docusaurus.io/docs) 基于 React，版本化文档、双语和搜索能力成熟；[Starlight](https://starlight.astro.build/guides/i18n/) 基于 Astro，也提供多语言路由。这两种都可行。本次先做双语指南与品牌首页，VitePress 用较少的定制代码就能满足需要。

## 免费托管选择

| 方案 | 免费地址 | 适合的情况 |
| --- | --- | --- |
| **Cloudflare Pages** | `项目名.pages.dev` | Git 集成、预览部署、自定义域名 |
| **GitHub Pages** | `hymiospace.github.io/hymio-doc/` | 希望所有发布操作都留在 GitHub Actions |

免费项目名是否可用，需要创建时确认。独立域名和托管平台无关，域名注册费也不包含在免费托管里。建议正式地址用 `docs.hymio.top`，临时地址可以争取 `hymio.pages.dev`。

Cloudflare Free 当前允许每月 500 次构建和 20,000 个站点文件，足够本次草稿。GitHub Free 的公开仓库可使用 Pages，并绑定自定义域名。发布前可再次核对 [Cloudflare 限制](https://developers.cloudflare.com/pages/platform/limits/)和 [GitHub Pages 说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)。访问速度仍需要从实际读者所在地区测试。

## Cloudflare Pages 发布步骤

1. 把审核后的文档推到 GitHub，在 Cloudflare Pages 连接仓库。
2. 生产分支选 `main`，Node.js 22，构建命令 `npm ci && npm run check && npm run build`，输出目录 `docs/.vitepress/dist`。
3. 根路径部署不设置 `DOCS_BASE`。
4. 先在 Pages 项目的 **Custom domains** 添加 `docs.hymio.top`。
5. 在 DNS 服务商添加 Cloudflare 给出的 CNAME。仅使用子域名时，可以保留现有 DNS，无需迁移整个域名的 nameserver。
6. 等待域名验证与 HTTPS 完成，测试 `/` 和 `/zh/`。

详见[官方自定义域名步骤](https://developers.cloudflare.com/pages/configuration/custom-domains/)。仅添加 DNS 记录，而不在 Pages 项目关联域名，不足以完成配置。

## GitHub Pages 发布步骤

仓库包含手动触发的发布工作流，草稿推送不会自动上线。

1. 仓库 **Settings → Pages**，来源选择 **GitHub Actions**。
2. 手动运行 **Deploy documentation**，项目地址使用 base path `/hymio-doc/`。
3. 如果在 Pages 中绑定独立域名，改用 base path `/` 重新运行。
4. 证书就绪后启用 HTTPS。

`DOCS_BASE` 在构建时应用到导航与资源。路径错误会导致脚本或图片无法加载。如果希望使用组织根地址 `hymiospace.github.io`，仓库名应为 `HymioSpace.github.io`，base 为 `/`。

更多细节见 [VitePress 部署说明](https://vitepress.dev/guide/deploy)。
