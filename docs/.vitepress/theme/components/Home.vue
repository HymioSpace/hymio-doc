<script setup>
import { computed } from "vue";
import { useData, withBase } from "vitepress";
const { lang } = useData();
const zh = computed(() => lang.value.startsWith("zh"));
const link = (s) => withBase((zh.value ? "/zh/" : "/") + s);
const projects = computed(() => [
  {
    name: "Hymio",
    n: "01",
    status: zh.value ? "可用" : "Available",
    kind: zh.value
      ? "个人 Agent 应用"
      : "PERSONAL AGENT APPLICATION",
    desc: zh.value
      ? "Hymio 把持续对话、可恢复任务、个人记忆、连接来源与设备执行组成一个产品；iOS、Web 与 Desktop 共用账号和业务状态。"
      : "Hymio combines one continuing conversation, durable tasks, personal memory, connectors and execution devices. iOS, Web and Desktop share the same account and product state.",
    links: [
      [zh.value ? "概览" : "Overview", "hymio/"],
      [zh.value ? "安装与启动" : "Install & start", "hymio/getting-started"],
      [zh.value ? "任务、Agent 与日历" : "Tasks, agents & calendar", "hymio/tasks"],
      [zh.value ? "个人记忆与 Context" : "Memory & context", "nostalgia/"],
      [zh.value ? "设备与连接" : "Devices & connections", "hymio/devices"],
      [zh.value ? "HTTP API" : "HTTP API", "hymio/api"],
      [zh.value ? "UI/UX 与 A2UI" : "UI/UX & A2UI", "hymio/ui"],
    ],
  },
  {
    name: "Oath",
    n: "02",
    status: zh.value ? "可用" : "Available",
    kind: zh.value
      ? "Agent Harness / 执行框架"
      : "AGENT HARNESS / EXECUTION FRAMEWORK",
    desc: zh.value
      ? "Oath 是 Agent Harness，也就是让 AI Agent 运行起来的执行框架：连接模型与工具、保存执行进度，让任务在你离开对话后也能继续。"
      : "Oath is an agent harness: an execution framework that connects models and tools, saves progress and keeps tasks moving after you leave the conversation.",
    links: [
      [zh.value ? "概览" : "Overview", "oath/"],
      [zh.value ? "安装与运行" : "Install & run", "oath/getting-started"],
      [zh.value ? "执行架构" : "Execution architecture", "oath/architecture"],
      [zh.value ? "WebSocket 与 HTTP" : "WebSocket & HTTP", "oath/protocol"],
      [
        zh.value ? "Tool、Skill 与 CLI" : "Tools, skills & CLI",
        "oath/extensions",
      ],
      [
        zh.value ? "多 Agent 任务与协作" : "Multi-agent tasks & collaboration",
        "oath/delegation",
      ],
    ],
  },
  {
    name: "Nostalgia",
    n: "03",
    status: zh.value ? "可用" : "Available",
    kind: zh.value
      ? "个人 Context 服务"
      : "PERSONAL CONTEXT SERVICE",
    desc: zh.value
      ? "Nostalgia 保存原始资料和可追溯的整理结果，负责版本化发布、有界图检索、定时整理、回滚与任务机会提案；Hymio 负责采集并调用它。"
      : "Nostalgia stores original material and attributable understanding, with versioned publication, bounded graph retrieval, scheduled dreaming, rollback and evidence-grounded opportunity proposals.",
    links: [
      [zh.value ? "概览与边界" : "Overview & boundaries", "nostalgia/"],
      [zh.value ? "架构与发布" : "Architecture & publication", "nostalgia/architecture"],
      [zh.value ? "HTTP 契约" : "HTTP contracts", "nostalgia/contracts"],
      [zh.value ? "部署与运维" : "Deployment & operations", "nostalgia/operations"],
    ],
  },
]);
</script>
<template>
  <div class="home-editorial manual-home">
    <section class="manual-hero">
      <div>
        <p class="eyebrow">HYMIO / DOCUMENTATION</p>
        <h1>{{ zh ? "Hymio 文档" : "Hymio Docs" }}</h1>
        <p class="manual-subtitle">
          {{
            zh
              ? "一个能持续工作的个人 Agent 应用。"
              : "A personal agent that keeps working."
          }}
        </p>
        <p class="manual-description">
          {{
            zh
              ? "从这里认识 Hymio 应用、让 Agent 持续运行的 Oath，以及保存来源、版本与个人理解的 Nostalgia。"
              : "Meet Hymio, the application; Oath, the framework that keeps agents running; and Nostalgia, the service that keeps personal context attributable and useful."
          }}
        </p>
        <div class="manual-hero-actions">
          <a class="primary-link" :href="link('hymio/getting-started')"
            >{{ zh ? "开始使用" : "Get started" }} <span>→</span></a
          >
        </div>
        <ul class="manual-facts">
          <li>{{ zh ? "多端接入" : "Multi-client" }}</li>
          <li>{{ zh ? "后台执行" : "Server-side work" }}</li>
          <li>{{ zh ? "可自托管" : "Self-hostable" }}</li>
        </ul>
      </div>
      <div class="manual-mascot">
        <img
          :src="withBase('/brand/otter.png')"
          :alt="zh ? 'Hymio 小水獭' : 'Hymio otter'"
          width="220"
          height="220"
        />
      </div>
    </section>
    <section class="home-relationship" aria-labelledby="home-relationship-title">
      <p class="eyebrow">{{ zh ? "三个项目，一起理解" : "THREE CONNECTED PROJECTS" }}</p>
      <h2 id="home-relationship-title">{{ zh ? "应用、执行与上下文" : "Application, execution and context" }}</h2>
      <p>{{ zh
        ? "Hymio 负责产品体验与采集，Oath 负责任务和 Agent 执行，Nostalgia 保存可追溯的个人 Context。三者通过 HTTP、工具和事件接入，而不是复制彼此的核心状态。"
        : "Hymio owns the product experience and ingestion, Oath owns task and agent execution, and Nostalgia owns attributable personal context. They connect through HTTP, tools and events without duplicating each other's core state." }}</p>
    </section>
    <section
      class="manual-projects"
      :aria-label="zh ? '项目文档' : 'Project documentation'"
    >
      <article
        v-for="project in projects"
        :key="project.name"
        class="manual-project"
      >
        <div class="project-top">
          <span>{{ project.n }} / {{ project.kind }}</span>
          <span
            class="project-status"
            :class="{ draft: project.status === '草案' || project.status === 'Draft' }"
            >{{ project.status }}</span
          >
        </div>
        <h2>{{ project.name }}</h2>
        <p>{{ project.desc }}</p>
        <ul>
          <li v-for="[title, path] in project.links" :key="path">
            <a :href="link(path)">{{ title }} <span>↗</span></a>
          </li>
        </ul>
      </article>
    </section>
  </div>
</template>
