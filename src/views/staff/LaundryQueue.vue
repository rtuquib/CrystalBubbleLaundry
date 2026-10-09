<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Laundry queue</h1>
      <p class="text-slate-400 mt-1">Real-time board by production stage (updates when orders change).</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <div v-for="col in columns" :key="col.title" class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">{{ col.title }}</h2>
        <div class="space-y-3">
          <div
            v-for="o in col.orders"
            :key="o.id"
            class="rounded-xl bg-slate-50 p-4 text-sm border border-slate-100"
          >
            <div class="font-semibold text-slate-800">{{ o.code }}</div>
            <div class="text-slate-500">{{ customerName(o.customerId) }}</div>
            <div class="text-xs text-slate-400 mt-1">{{ labels[o.status] }}</div>
          </div>
          <p v-if="!col.orders.length" class="text-sm text-slate-400">Empty</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { ORDER_STATUS_LABELS } from '../../constants/laundry.js'

const { state } = useLaundryDb()
const labels = ORDER_STATUS_LABELS

const columns = computed(() => {
  const orders = state.value.orders.filter((o) => o.status !== 'completed')
  const inList = (o, statuses) => statuses.includes(o.status)
  return [
    {
      title: 'Wash',
      orders: orders.filter((o) => inList(o, ['received', 'processing', 'washing'])),
    },
    {
      title: 'Dry',
      orders: orders.filter((o) => o.status === 'drying'),
    },
    {
      title: 'Fold & QA',
      orders: orders.filter((o) => inList(o, ['folding', 'quality_check'])),
    },
    {
      title: 'Ready for pickup',
      orders: orders.filter((o) => o.status === 'ready_for_pickup'),
    },
  ]
})

function customerName(id) {
  const a = state.value.accounts.find((x) => x.id === id)
  return a ? a.name : '—'
}
</script>
