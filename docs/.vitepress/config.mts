import { defineConfig } from "vitepress";
const base = process.env.DOCS_BASE || "/";
function config(zh = false) {
  const p = zh ? "/zh/" : "/";
  const section = (name, items) => ({
    text: name,
    items: items.map(([text, path]) => ({ text, link: p + path })),
  });
  const hymio = [
    section(zh ? "使用 Hymio" : "Using Hymio", [
      [zh ? "概览与术语" : "Overview & terms", "hymio/"],
      [zh ? "多端互通" : "Cross-device continuity", "hymio/ios"],
      [zh ? "安装与启动" : "Install & start", "hymio/getting-started"],
      [zh ? "对话与客户端" : "Conversation & clients", "hymio/conversation"],
      [zh ? "任务与调度" : "Tasks & scheduling", "hymio/tasks"],
      [zh ? "模型与附件" : "Models & attachments", "hymio/media"],
      [zh ? "云设备与管理" : "Devices & administration", "hymio/devices"],
      [zh ? "管理平台" : "Operator console", "hymio/admin"],
    ]),
    section(zh ? "开发与部署" : "Development & deployment", [
      [zh ? "架构与目录" : "Architecture & repository", "hymio/architecture"],
      [zh ? "配置与部署" : "Configuration & deployment", "hymio/configuration"],
      [zh ? "HTTP API" : "HTTP API", "hymio/api"],
      [zh ? "A2UI：示例与协议" : "A2UI: examples & protocol", "hymio/ui"],
    ]),
  ];
  const oath = [
    section(zh ? "Oath Runtime" : "Oath runtime", [
      [zh ? "概览与术语" : "Overview & terms", "oath/"],
      [zh ? "安装与运行" : "Install & run", "oath/getting-started"],
      [zh ? "架构与执行语义" : "Architecture & execution", "oath/architecture"],
      [zh ? "WebSocket 与 HTTP" : "WebSocket & HTTP", "oath/protocol"],
      [zh ? "Tool、Skill 与 CLI" : "Tools, skills & CLI", "oath/extensions"],
      [
        zh ? "配置、鉴权与模型" : "Configuration, auth & models",
        "oath/configuration",
      ],
      [
        zh ? "子 Agent 与应用事件" : "Subagents & application events",
        "oath/delegation",
      ],
    ]),
  ];
  const nostalgia = [
    section("Nostalgia", [
      [zh ? "概览、术语与状态" : "Overview, terms & status", "nostalgia/"],
      [
        zh ? "Context 与接口草案" : "Context & draft contracts",
        "nostalgia/contracts",
      ],
    ]),
  ];
  return {
    nav: [
      { text: "Hymio", link: p + "hymio/", activeMatch: p + "hymio/" },
      { text: "Oath", link: p + "oath/", activeMatch: p + "oath/" },
      {
        text: "Nostalgia",
        link: p + "nostalgia/",
        activeMatch: p + "nostalgia/",
      },
    ],
    sidebar: {
      [p + "hymio/"]: hymio,
      [p + "oath/"]: oath,
      [p + "nostalgia/"]: nostalgia,
    },
    outline: { label: zh ? "本页内容" : "On this page" },
    docFooter: {
      prev: zh ? "上一篇" : "Previous page",
      next: zh ? "下一篇" : "Next page",
    },
    lastUpdated: { text: zh ? "更新于" : "Last updated" },
    editLink: {
      pattern: "https://github.com/HymioSpace/hymio-doc/edit/main/docs/:path",
      text: zh ? "在 GitHub 上编辑此页" : "Edit this page on GitHub",
    },
  };
}
export default defineConfig({
  title: "Hymio Docs",
  description:
    "User guides and developer documentation for Hymio, Oath and Nostalgia.",
  base,
  cleanUrls: true,
  lastUpdated: true,
  head: [
    [
      "link",
      { rel: "icon", type: "image/svg+xml", href: `${base}brand/hymio.svg` },
    ],
    ["meta", { name: "theme-color", content: "#f8f7f3" }],
  ],
  locales: {
    root: { label: "English", lang: "en", themeConfig: config() },
    zh: {
      label: "简体中文",
      lang: "zh-CN",
      description: "Hymio、Oath 与 Nostalgia 的用户手册和开发者文档。",
      themeConfig: config(true),
    },
  },
  themeConfig: {
    logo: "/brand/hymio.svg",
    siteTitle: "hymio / docs",
    socialLinks: [{ icon: "github", link: "https://github.com/HymioSpace" }],
    search: {
      provider: "local",
      options: {
        locales: {
          zh: {
            translations: {
              button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
              modal: {
                noResultsText: "没有找到结果",
                resetButtonTitle: "清除搜索",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                  closeText: "关闭",
                },
              },
            },
          },
        },
      },
    },
    footer: {
      message: "HymioSpace documentation",
      copyright: "Hymio · Oath · Nostalgia",
    },
  },
});
