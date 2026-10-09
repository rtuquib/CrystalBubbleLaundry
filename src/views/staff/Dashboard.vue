<template>
  <div class="space-y-6 lg:space-y-8">
    <section class="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8 text-white shadow-lg">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <p class="text-sm text-blue-100">Staff Operations</p>
          <h2 class="text-2xl sm:text-3xl font-semibold mt-1">Laundry Floor Dashboard</h2>
          <p class="mt-3 text-sm text-blue-100 max-w-3xl">
            Monitor assigned workload, update order statuses, and coordinate releases. Financial and administrative modules remain restricted to Admin.
          </p>
        </div>
        <div class="rounded-2xl bg-white/15 border border-white/20 px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-blue-100">Queue Throughput</p>
          <p class="text-2xl font-semibold">{{ counts.inProgress }}</p>
          <p class="text-xs text-blue-100 mt-1">Orders currently in progress</p>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      <article
        v-for="card in cards"
        :key="card.label"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p class="text-sm text-slate-500">{{ card.label }}</p>
        <p class="text-2xl font-semibold text-slate-900 mt-1">{{ card.value }}</p>
        <p class="text-xs text-slate-500 mt-2">{{ card.note }}</p>
      </article>
    </section>

    <section class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <article class="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-900">Daily Work Queue</h3>
          <router-link to="/staff/laundry-queue" class="text-sm text-blue-600 hover:text-blue-700">Open queue</router-link>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-slate-500 border-b border-slate-200">
                <th class="py-2 font-medium">Order</th>
                <th class="py-2 font-medium">Stage</th>
                <th class="py-2 font-medium">Pickup</th>
                <th class="py-2 font-medium text-right">Weight</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in activeOrders" :key="order.id" class="border-b border-slate-100">
                <td class="py-3 font-semibold text-slate-800">{{ order.code }}</td>
                <td class="py-3 text-slate-700">{{ order.label }}</td>
                <td class="py-3 text-slate-600">{{ order.pickupDate }} {{ order.pickupTimeSlot }}</td>
                <td class="py-3 text-right text-slate-900">{{ order.weightKg }} kg</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Permission Scope</h3>
        <ul class="space-y-3 text-sm">
          <li class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
            Can update order status and release workflow.
          </li>
          <li class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
            Can access assigned orders and laundry queue.
          </li>
          <li class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
            Cannot access customer account administration.
          </li>
          <li class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
            Cannot edit sales, expenses, and consolidated reports.
          </li>
        </ul>
      </article>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-start gap-6">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">Quick Actions</h3>
        <div class="mt-4 space-y-3">
          <router-link
            v-for="action in quickActions"
            :key="action.to"
            :to="action.to"
            class="block rounded-xl border border-slate-200 px-3 py-2 hover:border-blue-300 hover:bg-blue-50/50 transition"
          >
            <p class="text-sm font-semibold text-slate-800">{{ action.label }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ action.description }}</p>
          </router-link>
        </div>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">Release Readiness</h3>
        <p class="text-sm text-slate-500 mt-1">Orders ready for customer pickup.</p>
        <p class="text-3xl font-semibold text-slate-900 mt-4">{{ counts.ready }}</p>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-lg font-semibold text-slate-900">Operations Analytics</h3>
          <span class="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            Live
          </span>
        </div>
        <p class="text-sm text-slate-500 mt-2">
          Real-time floor metrics based on current queue and pickup schedule.
        </p>

        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p class="text-xs text-slate-500">Today pickups</p>
            <p class="mt-1 text-xl font-semibold text-slate-900">{{ analytics.todayPickups }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p class="text-xs text-slate-500">Avg order weight</p>
            <p class="mt-1 text-xl font-semibold text-slate-900">{{ analytics.avgWeightKg }} kg</p>
          </div>
        </div>

        <div class="mt-4 space-y-3">
          <div v-for="row in analytics.stageUtilization" :key="row.label">
            <div class="mb-1 flex items-center justify-between text-xs">
              <span class="text-slate-600">{{ row.label }}</span>
              <span class="font-medium text-slate-700">{{ row.count }}</span>
            </div>
            <div class="h-2 rounded-full bg-slate-100">
              <div
                class="h-2 rounded-full bg-blue-500"
                :style="{ width: `${row.percent}%` }"
              />
            </div>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ORDER_STATUS_LABELS } from '../../constants/laundry.js'
import { useLaundryDb } from '../../composables/useLaundryDb.js'

const { state } = useLaundryDb()

const counts = computed(() => {
  const orders = state.value.orders
  const inProgress = orders.filter((o) => o.status !== 'completed').length
  const washDry = orders.filter((o) => o.status === 'washing' || o.status === 'drying').length
  const ready = orders.filter((o) => o.status === 'ready_for_pickup').length
  const completed = orders.filter((o) => o.status === 'completed').length
  return { inProgress, washDry, ready, completed }
})

const activeOrders = computed(() =>
  state.value.orders
    .filter((o) => o.status !== 'completed')
    .slice(0, 7)
    .map((order) => ({
      ...order,
      label: ORDER_STATUS_LABELS[order.status] || order.status,
      weightKg: order.lineItems.reduce((sum, row) => sum + (Number(row.weightKg) || 0), 0),
    })),
)

const analytics = computed(() => {
  const orders = state.value.orders || []
  const today = new Date().toISOString().slice(0, 10)
  const active = orders.filter((o) => o.status !== 'completed')
  const todayPickups = orders.filter((o) => o.pickupDate === today).length
  const avgWeightRaw =
    active.reduce(
      (sum, order) =>
        sum + order.lineItems.reduce((w, row) => w + (Number(row.weightKg) || 0), 0),
      0,
    ) / (active.length || 1)
  const avgWeightKg = (Math.round(avgWeightRaw * 10) / 10).toFixed(1)

  const stageKeys = ['received', 'washing', 'drying', 'ready_for_pickup']
  const stageUtilization = stageKeys.map((key) => {
    const count = orders.filter((o) => o.status === key).length
    const base = orders.length || 1
    const percent = Math.max(8, Math.round((count / base) * 100))
    return {
      label: ORDER_STATUS_LABELS[key] || key,
      count,
      percent,
    }
  })

  return { todayPickups, avgWeightKg, stageUtilization }
})

const cards = computed(() => [
  { label: 'In Progress', value: counts.value.inProgress, note: 'Total active floor workload' },
  { label: 'Washing / Drying', value: counts.value.washDry, note: 'Core machine processing stage' },
  { label: 'Ready For Release', value: counts.value.ready, note: 'Pending customer pickup handoff' },
  { label: 'Completed', value: counts.value.completed, note: 'Closed and released orders' },
])

const quickActions = [
  {
    label: 'Assigned Orders',
    to: '/staff/assigned-orders',
    description: 'Review and update assigned job statuses',
  },
  {
    label: 'Laundry Queue',
    to: '/staff/laundry-queue',
    description: 'Manage queue flow and processing priority',
  },
  {
    label: 'Release Orders',
    to: '/staff/release-orders',
    description: 'Confirm release and customer pickup',
  },
]
</script>
