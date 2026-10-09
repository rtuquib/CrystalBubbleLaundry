<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-2xl font-semibold text-slate-900">Order Tracking</h2>
          <p class="text-sm text-slate-500 mt-2">
            Monitor each laundry order status from received to completed with clear operational tracking.
          </p>
        </div>
        <div class="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
          <p class="text-xs text-slate-500 uppercase tracking-wide">Active orders</p>
          <p class="text-2xl font-semibold text-slate-900">{{ activeOrdersCount }}</p>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">Status Pipeline</h3>
      <p class="text-sm text-slate-500 mt-1">Live order counts per processing stage.</p>
      <div class="mt-4 space-y-3">
        <div
          v-for="row in pipelineRows"
          :key="row.status"
          class="rounded-xl border border-slate-200 p-3"
        >
          <div class="flex items-center justify-between text-sm">
            <p class="font-medium text-slate-800">{{ row.label }}</p>
            <p class="text-slate-600 tabular-nums">{{ row.count }}</p>
          </div>
          <div class="mt-2 h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
              :style="{ width: row.percent + '%' }"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">Tracking Board</h3>
      <p class="text-sm text-slate-500 mt-1">
        Grouped view for queued, in-progress, and ready/completed orders.
      </p>

      <div class="mt-5 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <article
          v-for="column in boardColumns"
          :key="column.key"
          class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold text-slate-900">{{ column.title }}</h4>
            <span class="text-xs rounded-full px-2 py-1 bg-white border border-slate-200 text-slate-700">
              {{ column.orders.length }}
            </span>
          </div>

          <div v-if="column.orders.length" class="space-y-3 max-h-[34rem] overflow-y-auto overflow-x-hidden pr-1">
            <div
              v-for="order in column.orders"
              :key="order.id"
              class="rounded-xl border border-slate-200 bg-white p-3"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ order.code }}</p>
                  <p class="text-xs text-slate-500 mt-0.5">{{ order.customerName }}</p>
                </div>
                <span class="text-xs rounded-full px-2 py-1 bg-sky-100 text-sky-700">
                  {{ order.statusLabel }}
                </span>
              </div>

              <div class="mt-2 text-xs text-slate-600 space-y-1">
                <p>Services: {{ order.servicesSummary }}</p>
                <p>Total: <span class="font-medium text-slate-800">{{ formatPhp(order.total) }}</span></p>
                <p>Pickup: {{ order.pickupText }}</p>
              </div>

              <div class="mt-3">
                <OrderStatusTimeline :status="order.status" :updated-at="order.updatedAt" compact />
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-slate-500 py-8 text-center">
            No orders in this column.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import OrderStatusTimeline from '../../components/OrderStatusTimeline.vue'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '../../constants/laundry.js'
import { formatPhp, summarizeServices } from '../../utils/format.js'

const { state } = useLaundryDb()

const customersById = computed(() => {
  const map = new Map()
  for (const account of state.value.accounts) {
    if (account.role === 'customer') map.set(account.id, account.name)
  }
  return map
})

const trackedOrders = computed(() =>
  [...state.value.orders]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .map((order) => ({
      ...order,
      statusLabel: ORDER_STATUS_LABELS[order.status] || order.status,
      customerName: customersById.value.get(order.customerId) || 'Unknown customer',
      servicesSummary: summarizeServices(order.services),
      pickupText: `${order.pickupDate || '—'} ${order.pickupTimeSlot || ''}`.trim(),
    })),
)

const activeOrdersCount = computed(
  () => trackedOrders.value.filter((o) => o.status !== 'completed').length,
)

const pipelineRows = computed(() => {
  const total = trackedOrders.value.length || 1
  return ORDER_STATUSES.map((status) => {
    const count = trackedOrders.value.filter((o) => o.status === status).length
    return {
      status,
      label: ORDER_STATUS_LABELS[status] || status,
      count,
      percent: Math.round((count / total) * 100),
    }
  })
})

const boardColumns = computed(() => {
  const grouped = {
    queued: trackedOrders.value.filter((o) => ['received', 'processing'].includes(o.status)),
    in_progress: trackedOrders.value.filter((o) =>
      ['washing', 'drying', 'folding', 'quality_check'].includes(o.status),
    ),
    ready: trackedOrders.value.filter((o) => ['ready_for_pickup', 'completed'].includes(o.status)),
  }

  return [
    { key: 'queued', title: 'Queued', orders: grouped.queued },
    { key: 'in_progress', title: 'In Progress', orders: grouped.in_progress },
    { key: 'ready', title: 'Ready / Completed', orders: grouped.ready },
  ]
})

</script>
