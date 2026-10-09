<template>
  <div class="space-y-4">
    <div
      :class="[
        'text-center font-medium',
        compact
          ? 'grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]'
          : 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs'
      ]"
    >
      <div
        v-for="(st, idx) in statuses"
        :key="st"
        :class="[
          'rounded-xl px-2 py-2.5 border leading-tight break-words',
          idx <= activeIndex
            ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
            : 'bg-slate-50 text-slate-500 border-slate-200',
        ]"
      >
        {{ labels[st] || st }}
      </div>
    </div>
    <p v-if="updatedAt" class="text-xs text-slate-400">
      Last updated: {{ formatDateTime(updatedAt) }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '../constants/laundry.js'
import { formatDateTime } from '../utils/format.js'

const props = defineProps({
  status: { type: String, required: true },
  updatedAt: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})

const statuses = ORDER_STATUSES
const labels = ORDER_STATUS_LABELS

const activeIndex = computed(() => {
  const i = ORDER_STATUSES.indexOf(props.status)
  return i < 0 ? 0 : i
})
</script>
