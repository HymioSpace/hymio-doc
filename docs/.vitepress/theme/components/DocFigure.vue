<script setup>
import { withBase } from "vitepress";
defineProps({
  src: { type: String, required: true },
  caption: { type: String, required: true },
  variant: { type: String, default: "desktop" },
});
</script>

<template>
  <figure class="doc-figure" :class="{ 'doc-figure-phone': variant === 'phone' }">
    <a :href="withBase(src)" target="_blank" rel="noreferrer" :aria-label="caption">
      <img :src="withBase(src)" :alt="caption" loading="lazy" />
    </a>
    <figcaption>{{ caption }}</figcaption>
  </figure>
</template>
