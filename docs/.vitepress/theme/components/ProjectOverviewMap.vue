<script setup>
import { computed } from "vue";
import { useData } from "vitepress";
const props = defineProps({ kind: { type: String, default: "hymio" } });
const { lang } = useData();
const zh = computed(() => lang.value.startsWith("zh"));
const context = computed(() => props.kind === "nostalgia");
const title = computed(() => context.value
  ? (zh.value ? "Nostalgia：从来源到可追溯的个人理解" : "Nostalgia: from sources to attributable personal context")
  : (zh.value ? "Hymio：从客户端到 Agent 执行" : "Hymio: from clients to agent execution"));
const nodes = computed(() => context.value ? [
  { x: 16, y: 48, w: 148, h: 88, title: zh.value ? "真实来源" : "Real sources", lines: [zh.value ? "对话 · 手记 · 连接器" : "Chat · notes · connectors"] },
  { x: 204, y: 48, w: 148, h: 88, title: zh.value ? "Hymio 采集" : "Hymio ingestion", lines: [zh.value ? "授权、解析与幂等写入" : "Consent, parsing, retry"] },
  { x: 392, y: 48, w: 148, h: 88, title: "Nostalgia", lines: [zh.value ? "原文、发布与回滚" : "Originals and publication", zh.value ? "Dreaming 与事件" : "Dreaming and events"], accent: true },
  { x: 580, y: 48, w: 148, h: 88, title: zh.value ? "Oath Agent" : "Oath Agent", lines: [zh.value ? "稳定装配与 recall" : "Stable assembly & recall", zh.value ? "证据不授予权限" : "Evidence grants no authority"] },
  { x: 342, y: 205, w: 248, h: 68, title: zh.value ? "已发布理解 · 关系 · 回执" : "Published understanding · relations · receipts", lines: [zh.value ? "同一事务提交，可追溯、可回滚" : "Atomic, attributable and reversible"] },
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
          ? (zh ? "Hymio 在用户授权后将真实来源幂等写入 Nostalgia；Nostalgia 原子发布整理结果，并为 Oath Agent 提供稳定装配和有界检索。" : "After user consent, Hymio writes source material to Nostalgia. Nostalgia publishes attributable understanding atomically and serves bounded retrieval to the Oath Agent.")
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
      ? (zh ? "当前实现：采集、版本化发布和 Agent 检索已接入；检索仍是权威扫描，语义召回与大图谱不在当前范围。" : "Current implementation: ingestion, versioned publication and agent retrieval are integrated. Retrieval remains an authoritative scan; semantic recall and large-graph indexing are out of scope.")
      : (zh ? "Hymio 组合产品能力，Oath 推进 Agent 执行。设备调用经过 Backend 的授权边界。" : "Hymio integrates product capabilities; Oath advances agent execution. Device calls pass through Backend authorization.") }}</figcaption>
  </figure>
</template>
