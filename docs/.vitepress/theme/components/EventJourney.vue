<script setup>
import { computed, ref, onUnmounted } from "vue";
import { useData } from "vitepress";
const { lang } = useData();
const zh = computed(() => lang.value.startsWith("zh"));
const step = ref(0),
  connected = ref(true),
  playing = ref(false),
  seen = ref(0);
let timer;
const stages = computed(() =>
  zh.value
    ? [
        "接纳输入",
        "认领批次",
        "模型 / 工具",
        "工具结果",
        "监督待办",
        "投递事件",
      ]
    : [
        "Input accepted",
        "Batch claimed",
        "Model / tool",
        "Tool result",
        "Supervision",
        "Event delivered",
      ],
);
const caption = computed(() =>
  zh.value
    ? [
        "输入先持久保存，ACK 只表示已接纳，不代表推理完成。",
        "Intake 从对应的持久 buffer 取出固定批次，交给一个 Worker。",
        "Worker 准备模型请求；工具调用被提交后，不必阻塞整条连接。",
        "工具结果是一条新事件，进入 tool queue，可以推动后续步骤。",
        "Supervisor 独立检查持久待办；空 buffer 不触发模型调用。",
        "输出写入持久事件。各客户端按自己的 cursor 确认和补发。",
      ][step.value]
    : [
        "Input is persisted first. ACK means accepted, not completed.",
        "Intake claims a fixed batch from the relevant durable buffer for a Worker.",
        "The Worker prepares a model request. Submitted tools do not block the connection.",
        "A tool result is a new event in the tool queue and can drive another step.",
        "An independent Supervisor checks durable pending work; an empty buffer makes no model call.",
        "Output is stored as durable events. Each client tracks its own cursor.",
      ][step.value],
);
const foundations = computed(() =>
  zh.value
    ? [
        ["event", "事件驱动"],
        ["durable", "持久化"],
        ["supervision", "独立监督"],
      ]
    : [
        ["event", "Event-driven"],
        ["durable", "Durable"],
        ["supervision", "Supervised"],
      ],
);
const activeFoundation = computed(
  () =>
    ["durable", "event", "event", "event", "supervision", "durable"][
      step.value
    ],
);
function advance() {
  if (step.value < 5) {
    step.value++;
    if (connected.value) seen.value = step.value;
  } else stop();
}
function stop() {
  clearInterval(timer);
  playing.value = false;
}
function play() {
  if (playing.value) {
    stop();
    return;
  }
  if (step.value === 5) {
    step.value = 0;
    seen.value = 0;
  }
  playing.value = true;
  timer = setInterval(advance, 2100);
}
function toggle() {
  connected.value = !connected.value;
  if (connected.value) seen.value = step.value;
}
function reset() {
  stop();
  step.value = 0;
  seen.value = 0;
  connected.value = true;
}
onUnmounted(stop);
</script>
<template>
  <section
    class="journey"
    :aria-label="zh ? '通信与执行分离演示' : 'Communication and execution demo'"
  >
    <div class="journey-heading">
      <span class="eyebrow">{{
        zh ? "01 / 一个可交互的解释" : "01 / AN INTERACTIVE EXPLANATION"
      }}</span
      ><span class="demo-tag">{{
        zh ? "机制示意 · 非实时服务" : "Illustration · not a live service"
      }}</span>
    </div>
    <h2>
      {{
        zh
          ? "跟踪一个输入：从接纳到重新连接"
          : "Follow one input from acceptance to reconnect"
      }}
    </h2>
    <p class="journey-intro">
      {{
        zh
          ? "播放时可以随时断开客户端。Oath 的步骤继续推进，重新连接后按 cursor 接收遗漏的事件。"
          : "You can disconnect while the demo is playing. Oath keeps advancing; reconnect to receive events after your cursor."
      }}
    </p>
    <div class="journey-foundations">
      <span
        v-for="[id, title] in foundations"
        :key="id"
        :class="{ active: activeFoundation === id }"
        >{{ title }}</span
      >
    </div>
    <div class="flow-grid">
      <div class="flow-client" :class="{ offline: !connected }">
        <div class="mini-icon">↗</div>
        <strong>{{ zh ? "你的客户端" : "Your client" }}</strong
        ><span class="connection"
          ><i :class="{ off: !connected }"></i
          >{{
            connected
              ? zh
                ? "已连接"
                : "Connected"
              : zh
                ? "已断开"
                : "Disconnected"
          }}</span
        ><small
          >{{ zh ? "已接收事件" : "Received events" }} · {{ seen }}/5</small
        ><button @click="toggle">
          {{
            connected
              ? zh
                ? "断开客户端"
                : "Disconnect client"
              : zh
                ? "重新连接"
                : "Reconnect"
          }}
        </button>
      </div>
      <div class="flow-bridge" aria-hidden="true">
        <span :class="{ muted: !connected }">⟷</span
        ><small>{{ zh ? "通信" : "transport" }}</small>
      </div>
      <div class="flow-runtime">
        <div class="runtime-title">
          <span class="mini-icon">h</span>
          <div>
            <strong>Oath</strong
            ><small>{{ zh ? "执行与状态" : "Execution & state" }}</small>
          </div>
          <span class="runtime-status">{{
            step === 5
              ? zh
                ? "已完成"
                : "Complete"
              : playing
                ? zh
                  ? "工作中"
                  : "Working"
                : zh
                  ? "已暂停演示"
                  : "Demo paused"
          }}</span>
        </div>
        <div class="event-routes" :aria-label="zh ? '三类输入' : 'Three input paths'">
          <span :class="{ active: step <= 1 }">User</span>
          <span :class="{ active: step >= 3 && step !== 4 }">Tool</span>
          <span :class="{ active: step === 4 }">System</span>
        </div>
        <ol class="event-steps">
          <li
            v-for="(title, i) in stages"
            :key="title"
            :class="{ reached: step >= i, current: step === i }"
          >
            <span>{{ step > i ? "✓" : "0" + (i + 1) }}</span
            >{{ title }}
          </li>
        </ol>
        <div class="event-rail">
          <div :style="{ width: (step / 5) * 100 + '%' }"></div>
        </div>
      </div>
    </div>
    <div class="journey-bottom">
      <p aria-live="polite">{{ caption }}</p>
      <div>
        <button class="play-button" @click="play">
          {{
            playing
              ? zh
                ? "暂停"
                : "Pause"
              : step === 5
                ? zh
                  ? "再看一次"
                  : "Replay"
                : zh
                  ? "播放"
                  : "Play"
          }}</button
        ><button @click="advance" :disabled="step === 5 || playing">
          {{ zh ? "下一步" : "Step" }}</button
        ><button @click="reset">{{ zh ? "重置" : "Reset" }}</button>
      </div>
    </div>
  </section>
</template>
