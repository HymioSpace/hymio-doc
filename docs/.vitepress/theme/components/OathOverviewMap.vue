<script setup>
import { computed } from "vue";
import { useData } from "vitepress";

const { lang } = useData();
const zh = computed(() => lang.value.startsWith("zh"));

const nodes = computed(() => [
  {
    id: "client",
    x: 12,
    y: 26,
    w: 150,
    h: 82,
    title: zh.value ? "客户端" : "Client",
    lines: ["Web · Desktop · iOS"],
  },
  {
    id: "gateway",
    x: 198,
    y: 20,
    w: 180,
    h: 88,
    title: "Gateway",
    lines: ["WebSocket", zh.value ? "消息与事件" : "messages & events"],
  },
  {
    id: "biz",
    x: 414,
    y: 20,
    w: 180,
    h: 88,
    title: "Biz",
    lines: ["HTTP", "Trace · CLI"],
  },
  {
    id: "storage",
    x: 650,
    y: 20,
    w: 198,
    h: 160,
    title: "Storage",
    lines: [
      "Journal · " + (zh.value ? "执行状态" : "state"),
      "Outbox · cursor",
    ],
  },
  {
    id: "supervisor",
    x: 12,
    y: 138,
    w: 150,
    h: 82,
    title: "Supervisor",
    lines: [zh.value ? "检查待办" : "checks pending work", "system.invoke"],
  },
  {
    id: "queues",
    x: 198,
    y: 138,
    w: 180,
    h: 106,
    title: zh.value ? "输入队列" : "Input queues",
    lines: ["User · Tool · System", zh.value ? "持久 buffer" : "durable buffers"],
  },
  {
    id: "intake",
    x: 414,
    y: 138,
    w: 180,
    h: 82,
    title: "Intake",
    lines: [zh.value ? "认领固定批次" : "claims a fixed batch"],
  },
  {
    id: "manager",
    x: 198,
    y: 286,
    w: 180,
    h: 82,
    title: "Manager",
    lines: ["lease", zh.value ? "调度 Worker" : "schedules Workers"],
  },
  {
    id: "worker",
    x: 414,
    y: 286,
    w: 180,
    h: 82,
    title: "Worker + Brain",
    lines: [zh.value ? "固定模型请求" : "frozen model request"],
  },
  {
    id: "models",
    x: 650,
    y: 220,
    w: 198,
    h: 82,
    title: zh.value ? "模型服务" : "Model service",
    lines: [zh.value ? "对话模型" : "chat model"],
  },
  {
    id: "tools",
    x: 414,
    y: 398,
    w: 180,
    h: 62,
    title: zh.value ? "扩展" : "Extensions",
    lines: ["Tool · CLI · Skill"],
  },
]);

const edges = [
  { id: "client", d: "M162 67 H198" },
  { id: "biz", d: "M162 88 H250 V108 H414" },
  { id: "queue", d: "M288 108 V138" },
  { id: "intake", d: "M378 191 H414" },
  { id: "manager", d: "M504 220 V230 H288 V286" },
  { id: "worker", d: "M378 327 H414" },
  { id: "model", d: "M594 303 H650" },
  { id: "stateWrite", d: "M594 327 H626 V180" },
  { id: "tools", d: "M504 368 V398" },
  {
    id: "storage",
    d: "M650 112 H622 V64 H594",
    label: zh.value ? "持久事件" : "durable events",
    lx: 620,
    ly: 126,
  },
  {
    id: "supervisor",
    d: "M162 178 H198",
    dashed: true,
  },
  {
    id: "toolQueue",
    d: "M594 429 H626 V244 H378 V191",
    dashed: true,
    label: zh.value ? "工具结果" : "tool result",
    lx: 602,
    ly: 446,
  },
];
</script>

<template>
  <figure class="oath-overview-map">
    <div class="oath-overview-scroll">
      <svg
        class="oath-overview-canvas"
        viewBox="0 0 860 475"
        role="img"
        :aria-label="
          zh
            ? 'Oath 架构图：客户端通过 Gateway 发送输入，队列与 Intake 调度 Worker，工具和模型产生事件并由 Storage 保存'
            : 'Oath architecture: clients send input through Gateway, queues and Intake schedule a Worker, tools and models produce events persisted by Storage'
        "
      >
        <defs>
          <marker
            id="oath-map-arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path
              d="M0 0L8 4L0 8"
              fill="none"
              stroke="context-stroke"
              stroke-width="1.5"
            />
          </marker>
        </defs>
        <g
          v-for="edge in edges"
          :key="edge.id"
          :class="['oath-map-edge', { 'oath-map-dashed': edge.dashed }]"
        >
          <path :d="edge.d" marker-end="url(#oath-map-arrow)" />
          <text v-if="edge.label" :x="edge.lx" :y="edge.ly" text-anchor="middle">
            {{ edge.label }}
          </text>
        </g>
        <g
          v-for="node in nodes"
          :key="node.id"
          class="oath-map-node"
          :class="'oath-map-' + node.id"
        >
          <rect
            :x="node.x"
            :y="node.y"
            :width="node.w"
            :height="node.h"
            rx="9"
          />
          <text :x="node.x + 14" :y="node.y + 26" class="oath-map-title">
            {{ node.title }}
          </text>
          <text
            v-for="(line, index) in node.lines"
            :key="line"
            :x="node.x + 14"
            :y="node.y + 47 + index * 17"
            class="oath-map-line"
          >
            {{ line }}
          </text>
        </g>
        <text x="12" y="464" class="oath-map-caption">
          {{
            zh
              ? "概念数据流，不是每次请求的完整 RPC 拓扑"
              : "CONCEPTUAL DATA FLOW, NOT A COMPLETE RPC TOPOLOGY"
          }}
        </text>
      </svg>
    </div>
    <figcaption>
      {{
        zh
          ? "客户端只与 Gateway / Biz 通信。Oath 在内部完成队列、调度、模型与工具执行，并把执行事实写入 Storage。小屏可左右滑动查看完整图。"
          : "Clients talk only to Gateway / Biz. Oath handles queues, scheduling, model and tool execution internally, and records execution facts in Storage. Scroll sideways on small screens."
      }}
    </figcaption>
  </figure>
</template>
