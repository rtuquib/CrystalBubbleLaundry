<template>
  <Teleport to="body">
    <Transition name="cbl-modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        @click.self="onCancel"
      >
        <div
          class="cbl-modal-panel w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          @click.stop
        >
          <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
          <p class="mt-2 text-sm text-slate-600 whitespace-pre-line">{{ message }}</p>
          <div class="mt-6 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              @click="onCancel"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="rounded-xl px-4 py-2 text-sm font-medium text-white"
              :class="confirmDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
              :disabled="loading"
              @click="onConfirm"
            >
              {{ loading ? 'Please wait...' : confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  confirmDanger: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function onCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}

function onConfirm() {
  emit('confirm')
}

function onEscape(e) {
  if (e.key === 'Escape' && props.modelValue) {
    onCancel()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = open ? 'hidden' : ''
    if (typeof window !== 'undefined') {
      if (open) window.addEventListener('keydown', onEscape)
      else window.removeEventListener('keydown', onEscape)
    }
  },
  { flush: 'sync' },
)
</script>

<style scoped>
.cbl-modal-enter-active,
.cbl-modal-leave-active {
  transition: opacity 0.2s ease;
}

.cbl-modal-enter-active .cbl-modal-panel,
.cbl-modal-leave-active .cbl-modal-panel {
  transition:
    transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.2s ease;
}

.cbl-modal-enter-from,
.cbl-modal-leave-to {
  opacity: 0;
}

.cbl-modal-enter-from .cbl-modal-panel,
.cbl-modal-leave-to .cbl-modal-panel {
  transform: scale(0.96);
  opacity: 0;
}
</style>
