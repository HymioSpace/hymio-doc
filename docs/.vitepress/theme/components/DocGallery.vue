<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useData, withBase } from "vitepress";
const props = defineProps({ images: { type: Array, required: true } });
const { lang } = useData();
const zh = computed(() => lang.value.startsWith("zh"));
const track = ref(null);
const active = ref(0);
let resizeObserver;
const dragging = ref(false);
let pointerStart = null;
let suppressClick = false;
function onPointerDown(event) {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  suppressClick = false;
  pointerStart = { x: event.clientX, left: track.value.scrollLeft };
}
function onPointerMove(event) {
  if (!pointerStart) return;
  const delta = event.clientX - pointerStart.x;
  if (!dragging.value && Math.abs(delta) < 8) return;
  if (!dragging.value) {
    track.value.style.scrollSnapType = "none";
    track.value.setPointerCapture(event.pointerId);
  }
  dragging.value = true;
  suppressClick = true;
  event.preventDefault();
  track.value.scrollLeft = pointerStart.left - delta;
}
function onPointerUp(event) {
  if (!pointerStart) return;
  const moved = dragging.value;
  pointerStart = null;
  dragging.value = false;
  if (track.value.hasPointerCapture(event.pointerId)) track.value.releasePointerCapture(event.pointerId);
  if (moved) {
    const target = Math.round(track.value.scrollLeft / track.value.clientWidth);
    track.value.style.scrollSnapType = "";
    goTo(target);
  }
}
function onClick(event) {
  if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
}
function goTo(index) {
  const target = Math.max(0, Math.min(props.images.length - 1, index));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  track.value?.scrollTo({ left: target * track.value.clientWidth, behavior: reduce ? "auto" : "smooth" });
}
function onScroll() {
  if (track.value?.clientWidth) active.value = Math.round(track.value.scrollLeft / track.value.clientWidth);
}
onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    if (track.value) track.value.scrollLeft = active.value * track.value.clientWidth;
  });
  if (track.value) resizeObserver.observe(track.value);
});
onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<template>
  <section class="doc-gallery" :aria-label="zh ? '功能截图预览' : 'Feature screenshot gallery'">
    <div class="doc-gallery-toolbar">
      <div class="doc-gallery-tabs" :aria-label="zh ? '选择截图' : 'Choose a screenshot'">
        <button v-for="(item, index) in images" :key="item.src" type="button" :aria-pressed="active === index" @click="goTo(index)">{{ item.label }}</button>
      </div>
      <div class="doc-gallery-controls">
        <span aria-live="polite">{{ active + 1 }} / {{ images.length }}</span>
        <button type="button" :aria-label="zh ? '上一张截图' : 'Previous screenshot'" :disabled="active === 0" @click="goTo(active - 1)">←</button>
        <button type="button" :aria-label="zh ? '下一张截图' : 'Next screenshot'" :disabled="active === images.length - 1" @click="goTo(active + 1)">→</button>
      </div>
    </div>
    <div ref="track" class="doc-gallery-track" :class="{ 'is-dragging': dragging }" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp" @pointercancel="onPointerUp" @click.capture="onClick" tabindex="0" :aria-label="zh ? '左右滑动或使用方向键浏览截图' : 'Swipe or use arrow keys to browse screenshots'" @scroll.passive="onScroll" @keydown.left.prevent="goTo(active - 1)" @keydown.right.prevent="goTo(active + 1)" @keydown.home.prevent="goTo(0)" @keydown.end.prevent="goTo(images.length - 1)">
      <figure v-for="(item, index) in images" :key="item.src" class="doc-gallery-slide" :aria-label="`${index + 1} / ${images.length} · ${item.label}`">
        <a class="doc-gallery-stage" draggable="false" @dragstart.prevent :href="withBase(item.src)" target="_blank" rel="noreferrer" :aria-label="(zh ? '查看原图：' : 'View full image: ') + item.caption">
          <img :src="withBase(item.src)" :alt="item.caption" loading="lazy" draggable="false" />
        </a>
        <figcaption>{{ item.caption }}</figcaption>
      </figure>
    </div>
    <p class="doc-gallery-hint">{{ zh ? '左右滑动浏览 · 点击图片查看原图' : 'Swipe to browse · Select an image to view full size' }}</p>
  </section>
</template>
