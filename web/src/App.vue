<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/ToastContainer.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

onMounted(() => {
  appStore.fetchTheme()
})
</script>

<template>
  <div class="h-screen w-screen overflow-hidden" :style="{ background: 'var(--theme-bg)', color: 'var(--theme-text)' }">
    <RouterView />
    <ToastContainer />
  </div>
</template>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: 'DM Sans', sans-serif;
}

/* Color theme variables */
::root {
  --theme-bg: #f8fafc;
  --theme-text: #334155;
  --theme-primary: #3b82f6;
  --theme-secondary: #2563eb;
  --theme-gradient: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

/* Override fixed background colors with theme colors */
.bg-white {
  background-color: var(--theme-bg) !important;
}

.dark .bg-gray-800,
.dark .bg-gray-900 {
  background-color: var(--theme-bg) !important;
}

.bg-gray-50 {
  background-color: color-mix(in srgb, var(--theme-bg) 95%, transparent) !important;
}

.dark .bg-gray-700 {
  background-color: color-mix(in srgb, var(--theme-bg) 85%, transparent) !important;
}

/* Use CSS variables for theme colors */
.btn-primary {
  background: var(--theme-gradient);
  border-color: var(--theme-primary);
}

.btn-primary:hover {
  background: var(--theme-secondary);
}

.text-primary {
  color: var(--theme-primary);
}

.bg-primary {
  background-color: var(--theme-primary);
}

.border-primary {
  border-color: var(--theme-primary);
}

.bg-gradient-primary {
  background: var(--theme-gradient);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--theme-primary);
  border-radius: 4px;
  opacity: 0.5;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--theme-secondary);
  opacity: 0.8;
}
</style>
