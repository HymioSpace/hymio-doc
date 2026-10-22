<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useData, withBase } from "vitepress";
const { lang } = useData();
const zh = computed(() => lang.value.startsWith("zh"));
const running = ref(false),
  current = ref(0),
  selected = ref("backend"),
  reduced = ref(false);
let timer, observer, motion, cleanupMotion;
let visible = false,
  manualPause = false;
const nodes = computed(() => [
  {
    id: "models",
    x: 741,
    y: 20,
    w: 149,
    h: 82,
    title: zh.value ? "模型服务" : "Model services",
    label: "MODEL / MEDIA",
    icon: "✳",
    lines: [zh.value ? "对话 / 视觉 / 图像" : "Chat / Vision / Images"],
    chips: [],
    doc: "hymio/media",
  },
  {
    id: "clients",
    x: 10,
    y: 55,
    w: 170,
    h: 180,
    title: zh.value ? "多端入口" : "Clients",
    label: "01 / INTERFACE",
    icon: "⌘",
    platforms: [
      {
        label: zh.value ? "现在" : "NOW",
        names: ["Web", "Desktop", "iOS"],
        planned: false,
      },
      {
        label: zh.value ? "未来" : "NEXT",
        names: [
          zh.value ? "浏览器扩展" : "Extension",
          "Apple Watch",
          "Android",
        ],
        planned: true,
      },
    ],
    chips: [],
    doc: "hymio/conversation",
  },
  {
    id: "backend",
    x: 205,
    y: 40,
    w: 205,
    h: 210,
    title: "Hymio Backend",
    label: "02 / APPLICATION",
    icon: "h",
    lines: [
      zh.value
        ? "身份与授权 · 任务与调度"
        : "Identity & auth · Tasks & schedules",
      zh.value ? "附件与媒体 · 设备与配额" : "Attachments & media · Devices",
    ],
    chips: ["HTTP / WS", "Product SQLite"],
    doc: "hymio/architecture",
  },
  {
    id: "oath",
    x: 445,
    y: 32,
    w: 260,
    h: 225,
    title: "Oath",
    label: "03 / RUNTIME",
    icon: "↗",
    lines: [
      zh.value ? "接纳输入 → 推理 → 分发工具" : "Intake → Brain → Tools",
      zh.value ? "事件驱动 · 持久化 · 独立监督" : "Events · Durable · Supervised",
    ],
    chips: ["Gateway / Biz", "Storage / Queue"],
    doc: "oath/architecture",
  },
  {
    id: "devices",
    x: 741,
    y: 117,
    w: 149,
    h: 140,
    title: zh.value ? "云设备" : "Cloud devices",
    label: "04 / EXECUTION",
    icon: "▣",
    lines: [
      "Bash · Browser · CUA",
      zh.value ? "明确的 device_id" : "Explicit device_id",
    ],
    chips: ["Provider API"],
    doc: "hymio/devices",
  },
  {
    id: "admin",
    x: 205,
    y: 265,
    w: 205,
    h: 72,
    title: zh.value ? "管理平台" : "Operator console",
    label: "/admin/",
    icon: "⊞",
    lines: [
      zh.value ? "授权 / 容量 / 生命周期" : "Grants / Capacity / Lifecycle",
    ],
    chips: [],
    doc: "hymio/devices",
  },
  {
    id: "nostalgia",
    x: 445,
    y: 265,
    w: 260,
    h: 72,
    title: "Nostalgia",
    label: zh.value ? "规划 · 个人上下文" : "PLANNED · PERSONAL CONTEXT",
    icon: "◷",
    lines: [
      zh.value ? "来源 / 修订 / 检索" : "Provenance / Revisions / Retrieval",
    ],
    chips: [],
    doc: "nostalgia/",
    planned: true,
  },
  {
    id: "kits",
    x: 741,
    y: 265,
    w: 149,
    h: 72,
    title: "Kits",
    label: zh.value ? "规划 · 应用能力" : "PLANNED · APPLICATIONS",
    icon: "◇",
    lines: [
      zh.value ? "业务 API / 交互界面" : "Business APIs / User interfaces",
    ],
    chips: [],
    doc: "hymio/architecture",
    planned: true,
  },
]);
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 360;
function nodeStyle(node) {
  return {
    left: `${(node.x / CANVAS_WIDTH) * 100}%`,
    top: `${(node.y / CANVAS_HEIGHT) * 100}%`,
    width: `${(node.w / CANVAS_WIDTH) * 100}%`,
    height: `${(node.h / CANVAS_HEIGHT) * 100}%`,
  };
}
const paths = [
  {
    id: "model",
    d: "M705 105 H732 V61 H741",
  },
  {
    id: "media",
    d: "M307 40 V18 H733 V61 H741",
    label: "Media API",
    x: 575,
    y: 10,
  },
  {
    id: "client",
    d: "M180 145 H205",
    label: "API",
    x: 192,
    y: 134,
  },
  { id: "agent", d: "M410 145 H445", label: "WS", x: 427, y: 134 },
  {
    id: "tools",
    d: "M565 257 V250 H365 V250 H410",
    label: "Hymio extensions",
    x: 548,
    y: 270,
  },
  {
    id: "device",
    d: "M410 205 H732 V195 H741",
  },
  { id: "admin", d: "M307 265 V250" },
  { id: "context", d: "M250 250 V302 H445", planned: true },
  { id: "kit", d: "M365 250 V336 H815 V337", planned: true },
];
const stages = computed(() =>
  zh.value
    ? [
        {
          name: "接纳请求",
          text: "Web、Desktop 或 iOS 把消息送到 Hymio Backend。后端验证用户身份、模型与附件归属，再转发给 Oath。",
          node: "backend",
          edge: "client",
          principle: null,
        },
        {
          name: "推进 Agent",
          text: "Oath 先持久接纳输入，再由 Intake 认领固定批次并交给 Worker。客户端 ACK 与执行生命周期彼此独立。",
          node: "oath",
          edge: "agent",
          principle: "durable",
        },
        {
          name: "提交工具",
          text: "Oath 把工具调用作为事件分发。工具通过产品 API 执行动作，账号、权限与资源规则仍由 Backend 校验。",
          node: "oath",
          edge: "tools",
          principle: "event",
        },
        {
          name: "操作设备",
          text: "Backend 使用 Provider API 调用指定云电脑。同一 device_id 共享 Bash、浏览器、桌面与文件系统。",
          node: "devices",
          edge: "device",
          principle: null,
        },
        {
          name: "结果唤醒",
          text: "工具结果经扩展回到独立 tool queue，推动后续步骤。模型或工具仍在执行时，新输入照常进入自己的路径。",
          node: "oath",
          edge: "tools",
          reverse: true,
          principle: "event",
        },
        {
          name: "监督与重连",
          text: "Supervisor 检查持久待办；输出经 Backend 投递，各客户端独立确认游标，离线重连后补发未确认事件。",
          node: "clients",
          edge: "client",
          reverse: true,
          principle: "supervision",
        },
      ]
    : [
        {
          name: "Accept input",
          text: "Web, Desktop or iOS sends a message to Hymio Backend. It checks identity, model selection and attachment ownership before forwarding to Oath.",
          node: "backend",
          edge: "client",
          principle: null,
        },
        {
          name: "Advance the agent",
          text: "Oath first persists the input, then Intake claims a fixed batch for a Worker. Client delivery remains independent of execution.",
          node: "oath",
          edge: "agent",
          principle: "durable",
        },
        {
          name: "Dispatch tools",
          text: "Oath dispatches extension tools as events. Product API calls still pass Backend identity, authorization and resource checks.",
          node: "oath",
          edge: "tools",
          principle: "event",
        },
        {
          name: "Use a device",
          text: "Backend calls a selected cloud computer through its provider API. One explicit device_id shares Bash, browser, desktop and filesystem.",
          node: "devices",
          edge: "device",
          principle: null,
        },
        {
          name: "Wake on results",
          text: "Tool results return through the extension into a separate tool queue and drive subsequent steps. New input follows its own path while work is pending.",
          node: "oath",
          edge: "tools",
          reverse: true,
          principle: "event",
        },
        {
          name: "Supervise & reconnect",
          text: "A Supervisor checks durable pending work. Outbound events reach clients through Backend; each cursor replays independently after reconnecting.",
          node: "clients",
          edge: "client",
          reverse: true,
          principle: "supervision",
        },
      ],
);
const descriptions = computed(() =>
  zh.value
    ? {
        models:
          "Oath 调用对话模型，Backend 接入媒体理解与图片生成。API Endpoint 和凭据由服务端配置，客户端不能任意指定。",
        clients:
          "当前主客户端为 Web、Desktop 与原生 iOS，共用账号与事件协议，各自维护接收游标。浏览器扩展目前是能力脚手架；Apple Watch 与 Android 属于后续规划。",
        backend:
          "产品边界：登录、授权、任务业务状态、附件、设备归属与资源配额。它不拥有 Oath 的执行数据库。",
        oath: "执行边界：以事件驱动（分路接纳与唤醒）、持久化（Journal、Outbox、租约）和独立监督（Supervisor）为基础，管理输入、模型步骤、工具生命周期与事件投递。",
        devices:
          "实际副作用发生的环境。Hymio 只通过 API 接入 Provider，新用户默认没有云设备。",
        admin:
          "独立运营入口。管理员配置哪些用户能使用云资源；不直接操作 Agent 执行状态。",
        nostalgia:
          "设计中：定义个人上下文的来源、版本和检索契约。目前没有服务实现，也未接入当前运行链路。",
        kits: "规划中的应用扩展：通过业务 API 提供能力与用户界面。通用 Kit 生态尚未实现。",
      }
    : {
        models:
          "Oath calls conversation models; Backend integrates media understanding and image generation. Endpoints and credentials are configured server-side.",
        clients:
          "Web, Desktop and native iOS are current clients sharing one account and event contract, each with its own cursor. The browser extension is a capability scaffold; Apple Watch and Android are planned.",
        backend:
          "The product boundary: login, authorization, task business state, attachments, device ownership and quotas. Oath’s execution database is separate.",
        oath: "The execution boundary: event-driven intake and wake-ups, durable journal/outbox/leases, and independent supervision shape input, model steps, tools and event delivery.",
        devices:
          "The environment where external effects happen. Hymio integrates through provider APIs. New accounts have no cloud devices by default.",
        admin:
          "A separate operator entry point for resource entitlements and lifecycle. It does not own agent execution state.",
        nostalgia:
          "Planned personal-context contracts for provenance, revisions and retrieval. No service implementation or current runtime integration.",
        kits: "Planned application extensions with business APIs and user interfaces. The general Kit ecosystem is not implemented yet.",
      },
);
const stage = computed(() => stages.value[current.value]);
const node = computed(() => nodes.value.find((n) => n.id === selected.value));
function stop() {
  clearInterval(timer);
  running.value = false;
}
function next() {
  current.value = (current.value + 1) % stages.value.length;
  selected.value = stage.value.node;
}
function start() {
  if (running.value) return;
  running.value = true;
  timer = setInterval(next, 3400);
}
function toggle() {
  manualPause = running.value;
  if (running.value) stop();
  else start();
}
function choose(id) {
  manualPause = true;
  stop();
  selected.value = id;
}
function setStage(i) {
  manualPause = true;
  stop();
  current.value = i;
  selected.value = stage.value.node;
}
function syncPlayback() {
  if (visible && !manualPause && !reduced.value && !document.hidden) start();
  else stop();
}
onMounted(() => {
  motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const update = () => {
    reduced.value = motion.matches;
    syncPlayback();
  };
  update();
  motion.addEventListener("change", update);
  cleanupMotion = () => motion.removeEventListener("change", update);
  document.addEventListener("visibilitychange", syncPlayback);
  observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    },
    { threshold: 0.1 },
  );
  const el = document.getElementById("system-architecture");
  if (el) observer.observe(el);
});
onUnmounted(() => {
  stop();
  observer?.disconnect();
  cleanupMotion?.();
  document.removeEventListener("visibilitychange", syncPlayback);
});
</script>
<template>
  <section
    id="system-architecture"
    class="system-architecture"
    :class="{ 'is-running': running && !reduced }"
    :aria-label="zh ? 'Hymio 整体模块关系' : 'Hymio system architecture'"
  >
    <header class="architecture-heading">
      <div>
        <p class="eyebrow">SYSTEM / ARCHITECTURE</p>
        <h2>{{ zh ? "系统结构" : "System architecture" }}</h2>
        <p>
          {{
            zh
              ? "客户端把输入交给 Hymio Backend，Oath 负责执行，结果和进度作为事件返回。点击模块查看职责。"
              : "Clients send input through Hymio Backend. Oath executes it, and results return as events. Select a module to inspect its role."
          }}
        </p>
      </div>
      <div class="architecture-actions">
        <a :href="withBase((zh ? '/zh/' : '/') + 'oath/architecture')">
          {{ zh ? "理解执行机制" : "How execution works" }} →
        </a>
        <button class="architecture-play" @click="toggle" :aria-pressed="running">
          {{ running ? "Ⅱ" : "▷" }}
          <span>{{
            running ? (zh ? "暂停" : "Pause") : zh ? "播放流程" : "Play flow"
          }}</span>
        </button>
      </div>
    </header>
    <div
      class="architecture-scroll"
      tabindex="0"
      role="region"
      :aria-label="
        zh ? '可横向滚动的架构图' : 'Scrollable architecture diagram'
      "
    >
      <div class="architecture-canvas">
        <svg
          class="architecture-wires"
          :viewBox="`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="arch-arrow"
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
            v-for="path in paths"
            :key="path.id"
            :class="[
              'architecture-edge',
              {
                'edge-active':
                  stage.edge === path.id ||
                  (current === 5 && path.id === 'agent') ||
                  (current === 1 && path.id === 'model') ||
                  (current === 0 && path.id === 'media'),
                'edge-planned': path.planned,
                'edge-reverse':
                  stage.reverse &&
                  (stage.edge === path.id ||
                    (current === 5 && path.id === 'agent')),
              },
            ]"
          >
            <path :d="path.d" marker-end="url(#arch-arrow)" class="wire-base" />
            <path v-if="!path.planned" :d="path.d" class="wire-signal" />
            <text
              v-if="path.label"
              :x="path.x"
              :y="path.y"
              text-anchor="middle"
            >
              {{ path.label }}
            </text>
          </g>
          <text x="10" y="350" class="diagram-caption">
            {{
              zh
                ? "实线：当前调用关系 · 虚线：规划集成"
                : "SOLID: CURRENT INTERFACES · DASHED: PLANNED INTEGRATIONS"
            }}
          </text>
        </svg>
        <button
          v-for="n in nodes"
          :key="n.id"
          :style="nodeStyle(n)"
          :class="[
            'architecture-node',
            'node-' + n.id,
            {
              'node-selected': selected === n.id,
              'node-current': stage.node === n.id,
              'node-planned': n.planned,
            },
          ]"
          @click="choose(n.id)"
          :aria-pressed="selected === n.id"
        >
          <span class="architecture-node-label">{{ n.label }}</span
          ><strong
            ><span class="architecture-node-icon" aria-hidden="true">{{
              n.icon
            }}</span
            >{{ n.title }}</strong
          ><span
            v-if="n.platforms"
            class="architecture-platforms"
            ><span
              v-for="group in n.platforms"
              :key="group.label"
              class="architecture-platform-group"
              ><small>{{ group.label }}</small
              ><span class="architecture-platform-chips"
                ><span
                  v-for="name in group.names"
                  :key="name"
                  :class="{ 'platform-planned': group.planned }"
                  >{{ name }}</span
                ></span
              ></span
            ></span
          ><span
            v-for="line in n.lines || []"
            :key="line"
            class="architecture-node-line"
            >{{ line }}</span
          ><span v-if="n.chips.length" class="architecture-chips"
            ><span v-for="chip in n.chips" :key="chip">{{ chip }}</span></span
          >
        </button>
      </div>
    </div>
    <div
      class="architecture-mobile-flow"
      :aria-label="zh ? '移动端架构流程' : 'Mobile architecture flow'"
    >
      <button
        class="architecture-mobile-node"
        :class="{
          'mobile-current': stage.node === 'clients',
          'mobile-selected': selected === 'clients',
        }"
        @click="choose('clients')"
      >
        <span class="architecture-mobile-index">01 / INTERFACE</span>
        <strong>{{ zh ? "多端入口" : "Clients" }}</strong>
        <small>Web · Desktop · iOS</small>
      </button>
      <span class="architecture-mobile-arrow" aria-hidden="true">↓</span>
      <button
        class="architecture-mobile-node"
        :class="{
          'mobile-current': stage.node === 'backend',
          'mobile-selected': selected === 'backend',
        }"
        @click="choose('backend')"
      >
        <span class="architecture-mobile-index">02 / APPLICATION</span>
        <strong>Hymio Backend</strong>
        <small>{{
          zh ? "身份 · 任务 · 设备与配额" : "Identity · Tasks · Devices"
        }}</small>
      </button>
      <span class="architecture-mobile-arrow" aria-hidden="true">↓</span>
      <button
        class="architecture-mobile-node architecture-mobile-runtime"
        :class="{
          'mobile-current': stage.node === 'oath',
          'mobile-selected': selected === 'oath',
        }"
        @click="choose('oath')"
      >
        <span class="architecture-mobile-index">03 / RUNTIME</span>
        <strong>Oath</strong>
        <small>{{
          zh
            ? "事件驱动 · 持久化 · 独立监督"
            : "Event-driven · Durable · Supervised"
        }}</small>
      </button>
      <span class="architecture-mobile-arrow" aria-hidden="true">↓</span>
      <button
        class="architecture-mobile-node"
        :class="{
          'mobile-current': stage.node === 'devices',
          'mobile-selected': selected === 'devices',
        }"
        @click="choose('devices')"
      >
        <span class="architecture-mobile-index">04 / EXECUTION</span>
        <strong>{{ zh ? "模型、工具与设备" : "Models, tools & devices" }}</strong>
        <small>{{
          zh
            ? "结果作为事件返回客户端"
            : "Results return to clients as events"
        }}</small>
      </button>
      <p class="architecture-mobile-planned">
        {{
          zh
            ? "规划中：浏览器扩展、Apple Watch、Android · Nostalgia · Kits"
            : "Planned: Extension, Apple Watch, Android · Nostalgia · Kits"
        }}
      </p>
    </div>
    <p class="architecture-pan-hint">
      {{
        zh
          ? "小屏可左右滑动查看完整图。"
          : "On small screens, scroll sideways to explore the diagram."
      }}
    </p>
    <div class="architecture-details">
      <div class="architecture-stage">
        <span class="eyebrow"
          >{{ zh ? "当前步骤" : "FLOW STEP" }} {{ "0" + (current + 1) }}</span
        >
        <h3>{{ stage.name }}</h3>
        <p>{{ stage.text }}</p>
      </div>
      <div class="architecture-selection">
        <span class="eyebrow">{{ zh ? "选中模块" : "SELECTED MODULE" }}</span>
        <h3>{{ node.title }}</h3>
        <p>{{ descriptions[selected] }}</p>
        <a :href="withBase((zh ? '/zh/' : '/') + node.doc)"
          >{{ zh ? "阅读对应文档" : "Read the documentation" }} →</a
        >
      </div>
    </div>
    <p class="architecture-footnote">
      {{
        zh
          ? "这是概念关系示意，不是实时拓扑。Oath 的队列、持久化与监督机制见执行架构文档。"
          : "This is a conceptual map, not a live topology. Queueing, durability and supervision are explained in the execution architecture."
      }}
    </p>
  </section>
</template>
