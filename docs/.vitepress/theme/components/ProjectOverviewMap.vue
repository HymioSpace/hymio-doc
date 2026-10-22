<script setup>
import { computed } from "vue";
import { useData } from "vitepress";
const props = defineProps({ kind: { type: String, default: "hymio" } });
const { lang } = useData();
const zh = computed(() => lang.value.startsWith("zh"));
const context = computed(() => props.kind === "nostalgia");
const title = computed(() => context.value
  ? (zh.value ? "Nostalgia：上下文的来源、管理与使用" : "Nostalgia: context sources, management and use")
  : (zh.value ? "Hymio：从客户端到 Agent 执行" : "Hymio: from clients to agent execution"));
const nodes = computed(() => context.value ? [
  { x: 16, y: 48, w: 148, h: 88, title: zh.value ? "文件与外部应用" : "Files & applications", lines: [zh.value ? "笔记、计划、资料" : "Notes, plans, documents"] },
  { x: 204, y: 48, w: 148, h: 88, title: zh.value ? "应用连接器" : "App connector", lines: [zh.value ? "读取与同步来源" : "Read and sync sources"] },
  { x: 392, y: 48, w: 148, h: 88, title: "Nostalgia", lines: [zh.value ? "组织 Context" : "Organize context", zh.value ? "记录来源与修订" : "Sources and revisions"], accent: true },
  { x: 580, y: 48, w: 148, h: 88, title: "Agent", lines: [zh.value ? "检索资料与背景" : "Retrieve information", zh.value ? "参考内容推进工作" : "Use it to inform work"] },
  { x: 342, y: 205, w: 248, h: 68, title: zh.value ? "来源 · 版本 · 派生关系" : "Sources · revisions · provenance", lines: [zh.value ? "让检索结果可以追溯" : "Keep retrieved content attributable"] },
] : [
  { x: 16, y: 48, w: 148, h: 88, title: zh.value ? "客户端" : "Clients", lines: ["Web · Desktop · iOS", zh.value ? "对话与进展展示" : "Chat and progress"] },
  { x: 204, y: 48, w: 148, h: 88, title: "Hymio Backend", lines: [zh.value ? "账号与权限校验" : "Identity and permissions", zh.value ? "产品 API 与网关" : "Product API and gateway"], accent: true },
  { x: 392, y: 48, w: 148, h: 88, title: "Oath", lines: [zh.value ? "Agent 执行框架" : "Agent harness", zh.value ? "推进工作、保存进度" : "Run work, save progress"], accent: true },
  { x: 580, y: 48, w: 148, h: 88, title: zh.value ? "模型与工具" : "Models & tools", lines: [zh.value ? "模型推理、能力调用" : "Reasoning and actions"] },
  { x: 174, y: 205, w: 208, h: 68, title: zh.value ? "Hymio 产品能力" : "Hymio product services", lines: [zh.value ? "任务、附件、设备授权" : "Tasks, files, device grants"] },
  { x: 540, y: 205, w: 188, h: 68, title: zh.value ? "已授权的云电脑" : "Authorized computer", lines: [zh.value ? "经 Backend 分配与访问" : "Allocated through Backend"] },
]);
const edges = computed(() => [
  { d: "M164 92 H204", x: 184, y: 76, label: context.value ? (zh.value ? "导入" : "import") : (zh.value ? "请求" : "request") },
  { d: "M352 92 H392", x: 372, y: 76, label: context.value ? (zh.value ? "整理" : "supply") : (zh.value ? "执行" : "run") },
  { d: "M540 92 H580", x: 560, y: 76, label: context.value ? (zh.value ? "检索" : "retrieve") : (zh.value ? "调用" : "call") },
  ...(context.value ? [{ d: "M466 136 V205", x: 490, y: 176, label: zh.value ? "保留" : "retain" }]
    : [{ d: "M278 136 V205", x: 302, y: 176, label: zh.value ? "管理" : "manage" },
       { d: "M654 136 V168 H334 V136", x: 480, y: 160, label: zh.value ? "应用工具回调 Backend" : "App tools call Backend" },
       { d: "M382 239 H540", x: 461, y: 227, label: zh.value ? "授权访问" : "authorized access" }]),
]);
</script>

<template>
  <figure class="project-overview-map">
    <div class="oath-overview-scroll" role="region" :aria-label="title" tabindex="0">
      <svg class="project-overview-canvas" viewBox="0 0 744 300" role="img" :aria-label="title">
        <title>{{ title }}</title>
        <desc>{{ context
          ? (zh ? "应用连接器将外部内容交给 Nostalgia，保留来源和修订，再为 Agent 提供可检索上下文。全部为设计流程。" : "Connectors supply external content to Nostalgia, which preserves sources and revisions for agent retrieval. This is a planned flow.")
          : (zh ? "客户端连接 Hymio Backend，Backend 管理账号、任务、附件和设备，并通过 Oath 调用模型与工具。设备工具通过 Backend 访问已授权的云电脑。" : "Clients connect to Hymio Backend, which manages identity, tasks, files and devices and uses Oath for models and tools. Device tools access authorized computers through Backend.") }}</desc>
        <defs><marker :id="`project-arrow-${kind}`" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--vp-c-text-2)" /></marker></defs>
        <g v-for="edge in edges" :key="edge.d" class="oath-map-edge">
          <path :d="edge.d" :marker-end="`url(#project-arrow-${kind})`" />
          <text :x="edge.x" :y="edge.y" text-anchor="middle">{{ edge.label }}</text>
        </g>
        <g v-for="node in nodes" :key="node.title" class="oath-map-node" :class="{ 'oath-map-worker': node.accent }">
          <rect :x="node.x" :y="node.y" :width="node.w" :height="node.h" rx="10" />
          <text :x="node.x + node.w / 2" :y="node.y + 27" text-anchor="middle" class="oath-map-title">{{ node.title }}</text>
          <text v-for="(line, i) in node.lines" :key="line" :x="node.x + node.w / 2" :y="node.y + 47 + i * 17" text-anchor="middle" class="oath-map-line">{{ line }}</text>
        </g>
      </svg>
    </div>
    <figcaption>{{ context
      ? (zh ? "设计流程：连接器收集来源，Nostalgia 整理上下文；尚未实现服务或 Hymio 集成。" : "Planned flow: connectors collect sources; Nostalgia organizes context. No service or Hymio integration exists yet.")
      : (zh ? "Hymio 组合产品能力，Oath 推进 Agent 执行。设备调用经过 Backend 的授权边界。" : "Hymio integrates product capabilities; Oath advances agent execution. Device calls pass through Backend authorization.") }}</figcaption>
  </figure>
</template>
