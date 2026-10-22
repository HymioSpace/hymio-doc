<script setup>
import { computed, ref, watch } from "vue";
import { useData } from "vitepress";
const { lang } = useData();
const zh = computed(() => lang.value.startsWith("zh"));
const duration = ref(1);
const focus = ref(zh.value ? "散步" : "walking");
const submitted = ref("");
const durations = computed(() => zh.value ? ["15 分钟", "30 分钟", "1 小时"] : ["15 minutes", "30 minutes", "1 hour"]);
const activity = computed(() => focus.value);
const prompt = computed(() => zh.value
  ? `请帮我安排${durations.value[duration.value]}的${activity.value}，先给出建议，不要直接创建日程。`
  : `Help me plan ${durations.value[duration.value]} for ${activity.value}. Suggest a plan first; do not create a calendar event.`);
const spec = computed(() => ({
  root: "plan",
  elements: {
    plan: { type: "Card", props: { title: zh.value ? "留一点时间给自己" : "Make time for yourself", subtitle: zh.value ? "先选节奏，再安排今天。" : "Choose a pace for today." }, children: ["duration", "focus", "continue"] },
    duration: { type: "Choice", props: { label: zh.value ? "空闲时间" : "Free time", options: durations.value, value: durations.value[1] } },
    focus: { type: "Input", props: { label: zh.value ? "想做点什么" : "Activity", placeholder: zh.value ? "散步、阅读，或只是休息" : "Walking, reading, or a rest", value: zh.value ? "散步" : "walking" } },
    continue: { type: "Button", props: { label: zh.value ? "一起安排" : "Plan together", prompt: zh.value ? "请帮我安排{{duration}}的{{focus}}，先给出建议，不要直接创建日程。" : "Help me plan {{duration}} for {{focus}}. Suggest a plan first; do not create a calendar event." } },
  },
}));
const source = computed(() => '```hymio-ui\n' + JSON.stringify(spec.value) + '\n```');
watch(zh, () => { focus.value = zh.value ? "散步" : "walking"; duration.value = 1; });
watch([duration, focus, zh], () => { submitted.value = ""; });
</script>

<template>
  <div class="ui-example">
    <div class="ui-example-label">{{ zh ? "交互示例 · 文档演示" : "INTERACTIVE EXAMPLE · DOCUMENTATION DEMO" }}</div>
    <form class="ui-example-card" @submit.prevent="submitted = prompt">
      <h3>{{ spec.elements.plan.props.title }}</h3>
      <p>{{ spec.elements.plan.props.subtitle }}</p>
      <label for="doc-ui-duration">{{ spec.elements.duration.props.label }}
        <select id="doc-ui-duration" v-model="duration">
          <option v-for="(text, index) in durations" :key="index" :value="index">{{ text }}</option>
        </select>
      </label>
      <label for="doc-ui-focus">{{ spec.elements.focus.props.label }}
        <input id="doc-ui-focus" v-model="focus" :placeholder="spec.elements.focus.props.placeholder" maxlength="2000" />
      </label>
      <button type="submit">{{ spec.elements.continue.props.label }} <span aria-hidden="true">→</span></button>
    </form>
    <div class="ui-example-output" role="status" aria-live="polite">
      <span>{{ zh ? "按钮会生成这样的用户消息" : "The button produces this user message" }}</span>
      <p>{{ submitted || (zh ? "修改选项后，点击「一起安排」查看。" : 'Edit the fields, then click “Plan together”.') }}</p>
    </div>
    <p class="ui-example-note">{{ zh ? "这里只演示输入值替换，不连接模型、不发送消息、不创建日程。实际客户端会把这条消息放进可见对话，再交给 Agent 处理。" : "This demo substitutes field values locally. It does not contact a model, send a message or create an event. The real client sends the resulting message visibly in chat for the agent to handle." }}</p>
    <details>
      <summary>{{ zh ? "查看这个例子的完整协议数据" : "View the full protocol data for this example" }}</summary>
      <pre><code>{{ source }}</code></pre>
    </details>
  </div>
</template>
