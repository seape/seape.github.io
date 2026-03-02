<template>
  <div
    class="di-viewer"
    tabindex="0"
    ref="container"
    @keydown="handleKeydown"
  >
    <div class="di-viewer-toolbar">
      <div class="di-viewer-filters">
        <button
          v-for="f in filters"
          :key="f.value"
          :class="['di-filter-btn', { active: activeFilter === f.value }]"
          @click="setFilter(f.value)"
        >{{ f.label }} <span class="di-filter-count">{{ f.count }}</span></button>
      </div>
      <div class="di-viewer-actions">
        <button :class="['di-action-btn', { active: randomMode }]" @click="toggleRandom" aria-label="Toggle random mode" title="Toggle Random Mode">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          Random
        </button>
        <button class="di-action-btn" @click="toggleFullscreen" aria-label="Toggle fullscreen" title="Toggle Fullscreen">
          <svg v-if="!isFullscreen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9" /><line x1="14" y1="10" x2="21" y2="3" />
            <polyline points="9 21 3 21 3 15" /><line x1="10" y1="14" x2="3" y2="21" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 14 10 14 10 20" /><line x1="3" y1="21" x2="10" y2="14" />
            <polyline points="20 10 14 10 14 4" /><line x1="21" y1="3" x2="14" y2="10" />
          </svg>
          {{ isFullscreen ? 'Exit' : 'Fullscreen' }}
        </button>
      </div>
    </div>
    <div class="di-viewer-header">
      <span class="di-viewer-counter">{{ currentDisplayIndex + 1 }} / {{ filteredImages.length }}</span>
      <h3 class="di-viewer-title">{{ currentImage.title }}</h3>
    </div>
    <div class="di-viewer-stage" @click="handleStageClick">
      <button class="di-viewer-nav di-viewer-nav--left" @click.stop="prev" aria-label="Previous image" title="Previous (←)">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <img
        :src="currentImage.src"
        :alt="currentImage.title"
        class="di-viewer-img"
      />
      <button class="di-viewer-nav di-viewer-nav--right" @click.stop="next" aria-label="Next image" title="Next (→)">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
    <div v-if="currentImage.description" class="di-viewer-desc-wrapper">
      <button class="di-desc-toggle" @click="showDesc = !showDesc" title="Toggle Answer (Space / ↑ / ↓)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {{ showDesc ? 'Hide' : 'Show' }} Answer
        <svg :class="['di-desc-chevron', { open: showDesc }]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <transition name="di-desc-slide">
        <div v-show="showDesc" class="di-viewer-desc" v-html="currentImage.description"></div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
});

const activeFilter = ref('all');
const currentDisplayIndex = ref(0);
const container = ref(null);
const isFullscreen = ref(false);
const randomMode = ref(false);
const showDesc = ref(false);

watch(currentDisplayIndex, () => {
  showDesc.value = false;
});

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'graph', label: 'Graph' },
  { value: 'flowchart', label: 'Flowchart' },
  { value: 'map', label: 'Map' },
  { value: 'image', label: 'Image' },
];

const filteredImages = computed(() => {
  if (activeFilter.value === 'all') return props.images;
  return props.images.filter(img => img.category === activeFilter.value);
});

const filters = computed(() =>
  CATEGORIES.map(c => ({
    ...c,
    count: c.value === 'all' ? props.images.length : props.images.filter(img => img.category === c.value).length,
  }))
);

const currentImage = computed(() => filteredImages.value[currentDisplayIndex.value]);

function setFilter(value) {
  activeFilter.value = value;
  currentDisplayIndex.value = 0;
}

function pickRandom() {
  const len = filteredImages.value.length;
  if (len <= 1) return;
  let idx;
  do {
    idx = Math.floor(Math.random() * len);
  } while (idx === currentDisplayIndex.value);
  currentDisplayIndex.value = idx;
}

function next() {
  if (randomMode.value) { pickRandom(); return; }
  currentDisplayIndex.value = (currentDisplayIndex.value + 1) % filteredImages.value.length;
}

function prev() {
  if (randomMode.value) { pickRandom(); return; }
  currentDisplayIndex.value = (currentDisplayIndex.value - 1 + filteredImages.value.length) % filteredImages.value.length;
}

function toggleRandom() {
  randomMode.value = !randomMode.value;
}

function handleStageClick(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  if (x < rect.width / 2) {
    prev();
  } else {
    next();
  }
}

function handleKeydown(e) {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prev();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    next();
  } else if (e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    showDesc.value = !showDesc.value;
  } else if (e.key === 'Escape' && isFullscreen.value) {
    // browser handles Escape for exiting fullscreen, but we sync state via the listener
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    container.value?.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
  // Re-focus so arrow keys keep working after fullscreen toggle
  if (container.value) container.value.focus();
}

onMounted(() => {
  container.value?.focus();
  document.addEventListener('fullscreenchange', onFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange);
});
</script>

<style scoped>
.di-viewer {
  outline: none;
  max-width: 900px;
  margin: 1rem auto;
}

.di-viewer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.di-viewer-filters {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.di-filter-btn {
  padding: 0.3rem 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #4b5563;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1.4;
}

.di-filter-btn:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.di-filter-btn.active {
  background: #374151;
  color: #fff;
  border-color: #374151;
}

.di-filter-count {
  font-size: 0.72rem;
  opacity: 0.7;
  margin-left: 0.15rem;
}

.di-viewer-actions {
  display: flex;
  gap: 0.35rem;
}

.di-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #4b5563;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1.4;
}

.di-action-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #eef2ff;
}

.di-action-btn.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}

.di-action-btn.active:hover {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}

.di-viewer-header {
  text-align: center;
  margin-bottom: 0.5rem;
}

.di-viewer-counter {
  display: inline-block;
  background: #374151;
  color: #e5e7eb;
  padding: 0.2rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
}

.di-viewer-title {
  margin: 0.25rem 0 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: capitalize;
}

.di-viewer-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  min-height: 300px;
}

.di-viewer-img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

.di-viewer-nav {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
  z-index: 2;
  padding: 0;
}

.di-viewer-stage:hover .di-viewer-nav {
  opacity: 1;
}

.di-viewer-nav:hover {
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
}

.di-viewer-nav--left {
  left: 0;
}

.di-viewer-nav--right {
  right: 0;
}

/* Description panel */
.di-viewer-desc-wrapper {
  margin-top: 0.75rem;
}

.di-desc-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #4b5563;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
}

.di-desc-toggle:hover {
  border-color: #f59e0b;
  color: #d97706;
  background: #fffbeb;
}

.di-desc-chevron {
  transition: transform 0.2s;
}

.di-desc-chevron.open {
  transform: rotate(180deg);
}

.di-viewer-desc {
  margin-top: 0.5rem;
  padding: 1rem 1.25rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.92rem;
  line-height: 1.75;
  color: #374151;
}

.di-viewer-desc :deep(.hi) {
  color: #d97706;
  font-weight: 600;
}

.di-desc-slide-enter-active,
.di-desc-slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.di-desc-slide-enter-from,
.di-desc-slide-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.di-desc-slide-enter-to,
.di-desc-slide-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Fullscreen mode */
.di-viewer:fullscreen {
  background: #111827;
  display: flex;
  flex-direction: column;
  max-width: none;
  padding: 1rem;
}

.di-viewer:fullscreen .di-viewer-toolbar {
  flex-shrink: 0;
}

.di-viewer:fullscreen .di-viewer-header {
  flex-shrink: 0;
}

.di-viewer:fullscreen .di-viewer-stage {
  flex: 1;
  min-height: 0;
  background: #111827;
}

.di-viewer:fullscreen .di-viewer-img {
  max-height: calc(100vh - 120px);
}

.di-viewer:fullscreen .di-viewer-title {
  color: #e5e7eb;
}

.di-viewer:fullscreen .di-filter-btn {
  background: #1f2937;
  border-color: #4b5563;
  color: #d1d5db;
}

.di-viewer:fullscreen .di-filter-btn:hover {
  border-color: #6b7280;
  background: #374151;
}

.di-viewer:fullscreen .di-filter-btn.active {
  background: #e5e7eb;
  color: #1f2937;
  border-color: #e5e7eb;
}

.di-viewer:fullscreen .di-action-btn {
  background: #1f2937;
  border-color: #4b5563;
  color: #d1d5db;
}

.di-viewer:fullscreen .di-action-btn:hover {
  border-color: #818cf8;
  color: #a5b4fc;
  background: #312e81;
}

.di-viewer:fullscreen .di-action-btn.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}

.di-viewer:fullscreen .di-action-btn.active:hover {
  background: #4f46e5;
  border-color: #4f46e5;
}

.di-viewer:fullscreen .di-desc-toggle {
  background: #1f2937;
  border-color: #4b5563;
  color: #d1d5db;
}

.di-viewer:fullscreen .di-desc-toggle:hover {
  border-color: #f59e0b;
  color: #fbbf24;
  background: #422006;
}

.di-viewer:fullscreen .di-viewer-desc {
  background: #1f2937;
  border-color: #374151;
  color: #d1d5db;
}

@media (prefers-color-scheme: dark) {
  .di-viewer-stage {
    background: #1f2937;
  }
  .di-viewer-counter {
    background: #4b5563;
  }
  .di-filter-btn {
    background: #1f2937;
    border-color: #4b5563;
    color: #d1d5db;
  }
  .di-filter-btn:hover {
    border-color: #6b7280;
    background: #374151;
  }
  .di-filter-btn.active {
    background: #e5e7eb;
    color: #1f2937;
    border-color: #e5e7eb;
  }
  .di-action-btn {
    background: #1f2937;
    border-color: #4b5563;
    color: #d1d5db;
  }
  .di-action-btn:hover {
    border-color: #818cf8;
    color: #a5b4fc;
    background: #312e81;
  }
  .di-action-btn.active {
    background: #6366f1;
    color: #fff;
    border-color: #6366f1;
  }
  .di-action-btn.active:hover {
    background: #4f46e5;
    border-color: #4f46e5;
  }
  .di-desc-toggle {
    background: #1f2937;
    border-color: #4b5563;
    color: #d1d5db;
  }
  .di-desc-toggle:hover {
    border-color: #f59e0b;
    color: #fbbf24;
    background: #422006;
  }
  .di-viewer-desc {
    background: #1f2937;
    border-color: #374151;
    color: #d1d5db;
  }
}
</style>
