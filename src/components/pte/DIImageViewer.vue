<template>
  <div
    :class="['di-viewer', { 'layout-side': layout === 'side', 'full-page': isFullPage }]"
    tabindex="0"
    ref="container"
    @keydown="handleKeydown"
  >
    <div class="di-viewer-toolbar">
      <div class="di-viewer-filters">
        <button
          :class="['di-filter-btn', { active: activeFilters.size === 0 }]"
          @click="clearFilters"
        >All <span class="di-filter-count">{{ images.length }}</span></button>
        <label
          v-for="f in filters"
          :key="f.value"
          :class="['di-filter-btn', { active: activeFilters.has(f.value) }]"
        >
          <input
            type="checkbox"
            :checked="activeFilters.has(f.value)"
            @change="toggleFilter(f.value)"
            class="di-filter-checkbox"
          />
          {{ f.label }} <span class="di-filter-count">{{ f.count }}</span>
        </label>
      </div>
      <div class="di-viewer-actions">
        <button :class="['di-action-btn', { active: layout === 'side' }]" @click="layout = layout === 'side' ? 'stack' : 'side'" aria-label="Toggle layout" title="Toggle Layout">
          <svg v-if="layout === 'stack'" width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="1" y="2" width="6" height="12" rx="1" /><rect x="9" y="2" width="6" height="12" rx="1" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="1" width="12" height="6" rx="1" /><rect x="2" y="9" width="12" height="6" rx="1" />
          </svg>
        </button>
        <button :class="['di-action-btn', { active: randomMode }]" @click="toggleRandom" aria-label="Toggle random mode" title="Toggle Random Mode">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
        </button>
        <button :class="['di-action-btn', { active: zoomed }]" @click="zoomed = !zoomed" aria-label="Toggle zoom" title="Toggle Zoom">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line v-if="!zoomed" x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button :class="['di-action-btn', { active: isFullPage }]" @click="toggleFullPage" aria-label="Toggle full page" title="Toggle Full Page (F)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <polyline v-if="!isFullPage" points="9 3 9 9 3 9" /><polyline v-if="!isFullPage" points="15 21 15 15 21 15" />
            <polyline v-if="isFullPage" points="9 9 9 3 3 3 3 9" /><polyline v-if="isFullPage" points="15 15 15 21 21 21 21 15" />
          </svg>
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
        </button>
      </div>
    </div>
    <div class="di-viewer-header">
      <span class="di-viewer-counter">{{ currentDisplayIndex + 1 }} / {{ filteredImages.length }}</span>
      <h3 class="di-viewer-title">{{ currentImage.title }}</h3>
    </div>
    <div :class="['di-viewer-body', layout]">
      <div class="di-viewer-stage" @click="handleStageClick">
        <button class="di-viewer-nav di-viewer-nav--left" @click.stop="prev" aria-label="Previous image" title="Previous (←)">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <img
          :src="currentImage.src"
          :alt="currentImage.title"
          :class="['di-viewer-img', { zoomed }]"
        />
        <button class="di-viewer-nav di-viewer-nav--right" @click.stop="next" aria-label="Next image" title="Next (→)">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <div v-if="currentImage.description" class="di-viewer-desc-wrapper">
        <button class="di-desc-toggle" @click="showDesc = !showDesc" title="Toggle Answer (Space / ↑ / ↓)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {{ showDesc ? 'Hide' : 'Show' }}
        </button>
        <div v-if="showDesc" class="di-viewer-desc" v-html="currentImage.description"></div>
        <div v-else class="di-viewer-desc-placeholder"></div>
      </div>
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

const activeFilters = ref(new Set());
const currentDisplayIndex = ref(0);
const container = ref(null);
const isFullPage = ref(false);
const isFullscreen = ref(false);
const layout = ref('stack');
const randomMode = ref(false);
const showDesc = ref(false);
const zoomed = ref(false);



const CATEGORIES = [
  { value: 'important', label: 'Important' },
  { value: 'graph', label: 'Graph' },
  { value: 'flowchart', label: 'Flowchart' },
  { value: 'map', label: 'Map' },
  { value: 'image', label: 'Image' },
];

const filteredImages = computed(() => {
  if (activeFilters.value.size === 0) return props.images;
  return props.images.filter(img =>
    img.categories.some(c => activeFilters.value.has(c))
  );
});

const filters = computed(() =>
  CATEGORIES.map(c => ({
    ...c,
    count: props.images.filter(img => img.categories.includes(c.value)).length,
  }))
);

const currentImage = computed(() => filteredImages.value[currentDisplayIndex.value]);

function toggleFilter(value) {
  const next = new Set(activeFilters.value);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  activeFilters.value = next;
  currentDisplayIndex.value = 0;
}

function clearFilters() {
  activeFilters.value = new Set();
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
  } else if (e.key === 'Escape' && isFullPage.value) {
    isFullPage.value = false;
    document.body.style.overflow = '';
  } else if (e.key === 'Escape' && isFullscreen.value) {
    // browser handles Escape for exiting fullscreen, but we sync state via the listener
  } else if (e.key === 'f' || e.key === 'F') {
    toggleFullPage();
  }
}

function toggleFullPage() {
  isFullPage.value = !isFullPage.value;
  document.body.style.overflow = isFullPage.value ? 'hidden' : '';
  if (container.value) container.value.focus();
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
  document.body.style.overflow = '';
});
</script>

<style>
.di-viewer {
  outline: none;
  max-width: 900px;
  margin: 1rem auto;
  transition: max-width 0.2s ease;
}
.di-viewer.layout-side {
  max-width: 1400px;
}

.di-viewer .di-viewer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.di-viewer .di-viewer-filters {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.di-viewer .di-filter-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.di-viewer .di-filter-btn {
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

.di-viewer .di-filter-btn:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.di-viewer .di-filter-btn.active {
  background: #374151;
  color: #fff;
  border-color: #374151;
}

.di-viewer .di-filter-count {
  font-size: 0.72rem;
  opacity: 0.7;
  margin-left: 0.15rem;
}

.di-viewer .di-viewer-actions {
  display: flex;
  gap: 0.35rem;
}

.di-viewer .di-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #4b5563;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1.4;
}

.di-viewer .di-action-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #eef2ff;
}

.di-viewer .di-action-btn.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}

.di-viewer .di-action-btn.active:hover {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
}

.di-viewer .di-viewer-header {
  text-align: center;
  margin-bottom: 0.5rem;
}

.di-viewer .di-viewer-counter {
  display: inline-block;
  background: #374151;
  color: #e5e7eb;
  padding: 0.2rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
}

.di-viewer .di-viewer-title {
  margin: 0.25rem 0 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: capitalize;
}

.di-viewer .di-viewer-stage {
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

.di-viewer .di-viewer-img {
  max-width: 95%;
  max-height: 70vh;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  transition: max-width 0.2s ease;
}

.di-viewer .di-viewer-img.zoomed {
  max-width: 100%;
}

.di-viewer .di-viewer-nav {
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

.di-viewer .di-viewer-stage:hover .di-viewer-nav {
  opacity: 1;
}

.di-viewer .di-viewer-nav:hover {
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
}

.di-viewer .di-viewer-nav--left {
  left: 0;
}

.di-viewer .di-viewer-nav--right {
  right: 0;
}

/* Description panel */
.di-viewer .di-viewer-desc-wrapper {
  position: relative;
  margin-top: 0.75rem;
}

.di-viewer .di-desc-toggle {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.65rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  color: #4b5563;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
  backdrop-filter: blur(4px);
}

.di-viewer .di-desc-toggle:hover {
  border-color: #f59e0b;
  color: #d97706;
  background: #fffbeb;
}

.di-viewer .di-desc-chevron {
  transition: transform 0.2s;
}

.di-viewer .di-desc-chevron.open {
  transform: rotate(180deg);
}

.di-viewer .di-viewer-desc {
  padding: 1rem 1.25rem;
  padding-top: 2.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1.1rem;
  line-height: 1.8;
  color: #374151;
}

.di-viewer .di-viewer-desc-wrapper .di-viewer-desc-placeholder {
  min-height: 3rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.di-viewer .di-viewer-desc .hi {
  color: #d97706;
  font-weight: 600;
}

.di-viewer .di-desc-slide-enter-active,
.di-viewer .di-desc-slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.di-viewer .di-desc-slide-enter-from,
.di-viewer .di-desc-slide-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.di-viewer .di-desc-slide-enter-to,
.di-viewer .di-desc-slide-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* Side-by-side layout */
.di-viewer .di-viewer-body.side {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.di-viewer .di-viewer-body.side .di-viewer-stage {
  flex: 1;
  min-width: 0;
  min-height: 200px;
}
.di-viewer .di-viewer-body.side .di-viewer-desc-wrapper {
  flex: 1;
  min-width: 0;
  margin-top: 0;
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
  background: rgba(31, 41, 55, 0.9);
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
.di-viewer:fullscreen .di-viewer-desc-placeholder {
  background: #1f2937;
  border-color: #374151;
}

/* Full-page mode */
.di-viewer.full-page {
  position: fixed;
  inset: 0;
  z-index: 999;
  max-width: none;
  margin: 0;
  padding: 1rem;
  background: #fff;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
.di-viewer.full-page .di-viewer-toolbar {
  flex-shrink: 0;
}
.di-viewer.full-page .di-viewer-header {
  flex-shrink: 0;
}
.di-viewer.full-page .di-viewer-body {
  flex: 1;
  min-height: 0;
}
.di-viewer.full-page .di-viewer-stage {
  min-height: 400px;
}
.di-viewer.full-page .di-viewer-img {
  max-height: calc(100vh - 200px);
}
.dark .di-viewer.full-page {
  background: #111827;
}

/* Dark mode */
.dark .di-viewer .di-viewer-title {
  color: #e5e7eb;
}
.dark .di-viewer .di-viewer-stage {
  background: #1f2937;
}
.dark .di-viewer .di-viewer-counter {
  background: #4b5563;
}
.dark .di-viewer .di-filter-btn {
  background: #1f2937;
  border-color: #4b5563;
  color: #d1d5db;
}
.dark .di-viewer .di-filter-btn:hover {
  border-color: #6b7280;
  background: #374151;
}
.dark .di-viewer .di-filter-btn.active {
  background: #e5e7eb;
  color: #1f2937;
  border-color: #e5e7eb;
}
.dark .di-viewer .di-action-btn {
  background: #1f2937;
  border-color: #4b5563;
  color: #d1d5db;
}
.dark .di-viewer .di-action-btn:hover {
  border-color: #818cf8;
  color: #a5b4fc;
  background: #312e81;
}
.dark .di-viewer .di-action-btn.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}
.dark .di-viewer .di-action-btn.active:hover {
  background: #4f46e5;
  border-color: #4f46e5;
}
.dark .di-viewer .di-desc-toggle {
  background: rgba(31, 41, 55, 0.9);
  border-color: #4b5563;
  color: #d1d5db;
}
.dark .di-viewer .di-desc-toggle:hover {
  border-color: #f59e0b;
  color: #fbbf24;
  background: #422006;
}
.dark .di-viewer .di-viewer-desc {
  background: #1f2937;
  border-color: #374151;
  color: #d1d5db;
}
.dark .di-viewer .di-viewer-desc-placeholder {
  background: #1f2937;
  border-color: #374151;
}
</style>
