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
      ? "应用集成"
      : "APPLICATION INTEGRATION",
    desc: zh.value
      ? "Hymio 是面向用户的个人 Agent 应用，把对话、任务、模型和设备集成在一起，可从 iOS 开始，并在 Web 或 Desktop 继续。"
      : "Hymio is a personal agent application that brings conversations, tasks, models and devices together, starting on iOS and continuing on Web or Desktop.",
    links: [
      [zh.value ? "概览" : "Overview", "hymio/"],
      [zh.value ? "安装与启动" : "Install & start", "hymio/getting-started"],
      [zh.value ? "任务与调度" : "Tasks & scheduling", "hymio/tasks"],
      [zh.value ? "云设备与管理" : "Devices & administration", "hymio/devices"],
      [zh.value ? "HTTP API" : "HTTP API", "hymio/api"],
      [zh.value ? "A2UI：示例与协议" : "A2UI: examples & protocol", "hymio/ui"],
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
        zh.value ? "子 Agent 与应用事件" : "Subagents & events",
        "oath/delegation",
      ],
    ],
  },
  {
    name: "Nostalgia",
    n: "03",
    status: zh.value ? "草案" : "Draft",
    kind: zh.value
      ? "Context 收集与管理 / 设计草案"
      : "CONTEXT COLLECTION & MANAGEMENT / DRAFT",
    desc: zh.value
      ? "Nostalgia 是设计中的 Context 收集与管理组件。Context（上下文）是供 Agent 参考的资料与背景；它通过应用连接器收集这些信息，记录来源与版本，方便后续检索。"
      : "Nostalgia is a planned context collector and manager. Context means information and background an agent can refer to; application connectors supply it, while Nostalgia tracks sources and versions for later retrieval.",
    links: [
      [zh.value ? "概览、术语与状态" : "Overview, terms & status", "nostalgia/"],
      [
        zh.value ? "Context 与接口草案" : "Context & draft contracts",
        "nostalgia/contracts",
      ],
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
              ? "从这里认识 Hymio 应用、让 Agent 持续运行的 Oath，以及为 Agent 整理上下文的 Nostalgia。"
              : "Meet Hymio, the application; Oath, the framework that keeps agents running; and Nostalgia, the planned context component."
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
        ? "Hymio 把各项能力组合成可使用的应用，当前通过 Oath 运行 Agent；Nostalgia 计划为 Agent 提供可检索的个人上下文，尚未接入 Hymio。下面先认识每个项目，再进入对应文档。"
        : "Hymio brings the capabilities together into an application and uses Oath to run agents. Nostalgia is planned to provide retrievable personal context and is not yet integrated with Hymio. Meet each project below, then follow its documentation." }}</p>
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
        <small v-if="project.name === 'Nostalgia'" class="draft-note">{{
          zh
            ? "尚未实现服务；本文档描述设计草案。"
            : "No service implementation yet. These pages describe draft contracts."
        }}</small>
      </article>
    </section>
  </div>
</template>
