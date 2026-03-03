<template>
  <div>
    <div v-for="q in questions" :key="q.num" class="di-question">
      <h3>{{ q.num }}. {{ q.title }}{{ q.tags ? ' ' + q.tags : '' }}</h3>
      <div class="di-flex">
        <div class="di-col">
          <img v-if="q.src" :src="q.src" :alt="q.title" loading="lazy" />
        </div>
        <div class="di-col" v-html="q.description"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  questions: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped>
.di-flex {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.di-col {
  flex: 1;
  min-width: 0;
}
.di-col img {
  max-width: 100%;
  height: auto;
}
.di-question {
  color: #1e293b;
}
:global(.dark .di-question) {
  color: #e2e8f0;
}
.di-question :deep(.hi) {
  color: orange;
  font-weight: bold;
}
</style>
