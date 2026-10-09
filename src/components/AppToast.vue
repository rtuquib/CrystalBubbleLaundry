<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="t in items"
          :key="t.id"
          class="pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg flex items-start justify-between gap-3"
          :class="toastClass(t.type)"
          role="status"
        >
          <span>{{ t.message }}</span>
          <button
            type="button"
            class="shrink-0 text-slate-500 hover:text-slate-800 text-xs font-medium"
            @click="dismiss(t.id)"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast.js'

const { items, dismiss } = useToast()

function toastClass(type) {
  if (type === 'error') return 'border-red-200 bg-red-50 text-red-900'
  if (type === 'info') return 'border-sky-200 bg-sky-50 text-sky-900'
  return 'border-emerald-200 bg-emerald-50 text-emerald-900'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.22s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
