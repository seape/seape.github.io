<template>
  <div class="di-list">
    <div class="di-layout-toggle">
      <button :class="['di-layout-btn', { active: layout === 'side' }]" @click="layout = 'side'" title="Side by side">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="1" y="2" width="6" height="12" rx="1" /><rect x="9" y="2" width="6" height="12" rx="1" />
        </svg>
      </button>
      <button :class="['di-layout-btn', { active: layout === 'stack' }]" @click="layout = 'stack'" title="Stacked">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="1" width="12" height="6" rx="1" /><rect x="2" y="9" width="12" height="6" rx="1" />
        </svg>
      </button>
    </div>
    <div v-for="q in questions" :key="q.num" class="di-question">
      <h3>{{ q.num }}. {{ q.title }}{{ q.tags ? ' ' + q.tags : '' }}</h3>
      <div :class="['di-flex', layout]">
        <div class="di-col">
          <img v-if="q.src" :src="q.src" :alt="q.title" loading="lazy" />
        </div>
        <div class="di-col" v-html="q.description"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  questions: {
    type: Array,
    required: true,
  },
});

const layout = ref('side');
</script>

<style>
.di-list .di-layout-toggle {
  display: flex;
  gap: 4px;
  margin-bottom: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 0.5rem 0;
}
.di-list .di-layout-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}
.di-list .di-layout-btn:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}
.di-list .di-layout-btn.active {
  background: #374151;
  color: #fff;
  border-color: #374151;
}
.di-list .di-flex {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.di-list .di-flex.stack {
  flex-direction: column;
}
.di-list .di-col {
  flex: 1;
  min-width: 0;
}
.di-list .di-col img {
  max-width: 100%;
  height: auto;
}
.di-list .di-question {
  color: #1e293b;
}
.di-list .di-question .hi {
  color: orange;
  font-weight: bold;
}

/* Dark mode */
.dark .di-list .di-question {
  color: #e2e8f0;
}
.dark .di-list .di-layout-btn {
  background: #1f2937;
  border-color: #4b5563;
  color: #d1d5db;
}
.dark .di-list .di-layout-btn:hover {
  border-color: #6b7280;
  background: #374151;
}
.dark .di-list .di-layout-btn.active {
  background: #e5e7eb;
  color: #1f2937;
  border-color: #e5e7eb;
}
</style>
