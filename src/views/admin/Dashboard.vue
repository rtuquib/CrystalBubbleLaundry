<template>
  <div class="space-y-6 lg:space-y-8">
    <section class="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8 text-white shadow-lg">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <p class="text-sm text-blue-100">Business Overview</p>
          <h2 class="text-2xl sm:text-3xl font-semibold mt-1">CrystalBubble Laundry Shop Dashboard</h2>
          <p class="mt-3 text-sm text-blue-100 max-w-3xl">
            Track customer management, order and payment processing, inventory, sales reporting, and service preferences in one command center.
          </p>
        </div>
        <div class="rounded-2xl bg-white/15 border border-white/20 px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-blue-100">Monthly Net</p>
          <p class="text-2xl font-semibold">{{ formatPhp(monthlyNetRevenue) }}</p>
          <p class="text-xs text-blue-100 mt-1">Revenue minus recorded expenses</p>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      <article
        v-for="card in statCards"
        :key="card.label"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p class="text-sm text-slate-500">{{ card.label }}</p>
        <p class="text-2xl font-semibold text-slate-900 mt-1">{{ card.value }}</p>
        <p class="text-xs text-slate-500 mt-2">{{ card.note }}</p>
      </article>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div class="flex items-start justify-between gap-2 mb-4">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Monthly income</h3>
            <p class="text-sm text-slate-500 mt-0.5">Recorded payments by month (PHP)</p>
          </div>
        </div>
        <div class="flex items-end justify-between gap-2 min-h-[11rem] px-1">
          <div
            v-for="(m, i) in dashboardCharts.months"
            :key="'inc-' + m.key"
            class="flex-1 flex flex-col items-center justify-end gap-2 min-w-0 h-full"
          >
            <span class="text-[10px] sm:text-xs text-slate-600 tabular-nums truncate w-full text-center">
              {{ formatPhp(dashboardCharts.incomePhp[i]) }}
            </span>
            <div class="flex-1 w-full max-w-[2.5rem] mx-auto flex flex-col justify-end min-h-[6rem]">
              <div
                class="w-full rounded-t-md bg-gradient-to-t from-blue-700 to-blue-500 transition-all min-h-[3px]"
                :style="{ height: barHeightPx(dashboardCharts.incomePhp, i) + 'px' }"
                role="img"
                :aria-label="`${m.shortLabel}: ${formatPhp(dashboardCharts.incomePhp[i])}`"
              />
            </div>
            <span class="text-[10px] sm:text-xs text-slate-500 font-medium">{{ m.shortLabel }}</span>
          </div>
        </div>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-slate-900">Monthly sales</h3>
          <p class="text-sm text-slate-500 mt-0.5">Order revenue by month (PHP)</p>
        </div>
        <div class="flex items-end justify-between gap-2 min-h-[11rem] px-1">
          <div
            v-for="(m, i) in dashboardCharts.months"
            :key="'sales-' + m.key"
            class="flex-1 flex flex-col items-center justify-end gap-2 min-w-0 h-full"
          >
            <span class="text-[10px] sm:text-xs text-slate-600 tabular-nums truncate w-full text-center">
              {{ formatPhp(dashboardCharts.salesPhp[i]) }}
            </span>
            <div class="flex-1 w-full max-w-[2.5rem] mx-auto flex flex-col justify-end min-h-[6rem]">
              <div
                class="w-full rounded-t-md bg-gradient-to-t from-emerald-700 to-emerald-500 transition-all min-h-[3px]"
                :style="{ height: barHeightPx(dashboardCharts.salesPhp, i) + 'px' }"
                role="img"
                :aria-label="`${m.shortLabel} sales: ${formatPhp(dashboardCharts.salesPhp[i])}`"
              />
            </div>
            <span class="text-[10px] sm:text-xs text-slate-500 font-medium">{{ m.shortLabel }}</span>
          </div>
        </div>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-slate-900">Popular services</h3>
          <p class="text-sm text-slate-500 mt-0.5">Orders including each service</p>
        </div>
        <div v-if="popularServicesMax > 0" class="space-y-4">
          <div
            v-for="row in dashboardCharts.popularServices"
            :key="row.id"
            class="space-y-1.5"
          >
            <div class="flex items-center justify-between text-sm gap-2">
              <span class="font-medium text-slate-800 truncate">{{ row.label }}</span>
              <span class="text-slate-600 tabular-nums shrink-0">{{ row.count }}</span>
            </div>
            <div class="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                class="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all"
                :style="{ width: popularServiceBarWidth(row.count) }"
              />
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-slate-500 py-6 text-center">No order data yet.</p>
      </article>
    </section>

    <section class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <article class="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-900">Quick Actions</h3>
          <span class="text-xs text-slate-500">Operations shortcuts</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <router-link
            v-for="action in quickActions"
            :key="action.label"
            :to="action.to"
            class="rounded-xl border border-slate-200 px-4 py-3 hover:border-blue-300 hover:bg-blue-50/50 transition"
          >
            <p class="text-sm font-semibold text-slate-800">{{ action.label }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ action.description }}</p>
          </router-link>
        </div>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Low Stock Alerts</h3>
        <div v-if="lowStockItems.length" class="space-y-3">
          <div
            v-for="item in lowStockItems.slice(0, 5)"
            :key="item.id"
            class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2"
          >
            <p class="text-sm font-medium text-amber-900">{{ item.name }}</p>
            <p class="text-xs text-amber-700 mt-1">
              Remaining: {{ item.quantity }} {{ item.unit }} (threshold: {{ item.lowStockThreshold }})
            </p>
          </div>
        </div>
        <p v-else class="text-sm text-emerald-700 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          Inventory levels are healthy.
        </p>
      </article>
    </section>

    <section class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <article class="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-900">Recent Orders</h3>
          <router-link to="/admin/orders" class="text-sm text-blue-600 hover:text-blue-700">View all</router-link>
        </div>
        
        <!-- Filter Controls -->
        <div class="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs text-slate-600 mb-1">From Date</label>
              <input 
                v-model="orderFilters.fromDate" 
                type="date" 
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label class="block text-xs text-slate-600 mb-1">To Date</label>
              <input 
                v-model="orderFilters.toDate" 
                type="date" 
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label class="block text-xs text-slate-600 mb-1">Status</label>
              <select 
                v-model="orderFilters.status" 
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Statuses</option>
                <option v-for="(label, status) in ORDER_STATUS_LABELS" :key="status" :value="status">
                  {{ label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-slate-600 mb-1">Customer</label>
              <select 
                v-model="orderFilters.customerId" 
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Customers</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="flex gap-2 mt-3">
            <button 
              @click="applyFilters" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
            <button 
              @click="clearFilters" 
              class="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
            >
              Clear
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-slate-500 border-b border-slate-200">
                <th class="py-2 font-medium">Order</th>
                <th class="py-2 font-medium">Customer</th>
                <th class="py-2 font-medium">Status</th>
                <th class="py-2 font-medium">Pickup</th>
                <th class="py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id" class="border-b border-slate-100">
                <td class="py-3 font-semibold text-slate-800">{{ order.code }}</td>
                <td class="py-3 text-slate-700">{{ order.customerName }}</td>
                <td class="py-3">
                  <span class="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                    {{ order.status }}
                  </span>
                </td>
                <td class="py-3 text-slate-600">{{ order.pickupDate }} {{ order.pickupTimeSlot }}</td>
                <td class="py-3 text-right font-medium text-slate-900">{{ formatPhp(order.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <ul class="space-y-3">
          <li
            v-for="log in recentActivity"
            :key="log.id"
            class="rounded-xl border border-slate-200 px-3 py-2"
          >
            <p class="text-sm text-slate-800">{{ log.message }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ formatDateTime(log.createdAt) }}</p>
          </li>
        </ul>
      </article>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">Customer Analytics</h3>
        <p class="text-sm text-slate-500 mt-1">Top customers by order count and spend.</p>
        <div class="mt-4 space-y-3">
          <div
            v-for="customer in topCustomers"
            :key="customer.accountId"
            class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
          >
            <div>
              <p class="text-sm font-medium text-slate-800">{{ customer.name }}</p>
              <p class="text-xs text-slate-500">{{ customer.orders }} orders</p>
            </div>
            <p class="text-sm font-semibold text-slate-900">{{ formatPhp(customer.spendPhp) }}</p>
          </div>
        </div>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">Service Preferences</h3>
        <p class="text-sm text-slate-500 mt-1">Detergent and scent preference support.</p>
        <div class="mt-4 space-y-3">
          <div class="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2">
            <p class="text-xs uppercase tracking-wide text-blue-700">Top Detergent</p>
            <p class="text-sm font-semibold text-blue-900 mt-1">{{ topDetergent }}</p>
          </div>
          <div class="rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-2">
            <p class="text-xs uppercase tracking-wide text-indigo-700">Top Scent</p>
            <p class="text-sm font-semibold text-indigo-900 mt-1">{{ topScent }}</p>
          </div>
        </div>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-slate-900">Reports & Analytics</h3>
        <p class="text-sm text-slate-500 mt-1">
          Charts above summarize the last six months. Open consolidated reports for filters and exports.
        </p>
        <router-link
          to="/admin/consolidated-report"
          class="mt-4 inline-flex rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-800 hover:bg-blue-100 transition"
        >
          View consolidated report
        </router-link>
      </article>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900 mb-2">Data Integrity</h3>
      <p v-if="integrity.ok" class="text-sm text-emerald-700">All foreign-key references are valid.</p>
      <ul v-else class="text-sm text-red-600 list-disc pl-5 space-y-1">
        <li v-for="(issue, i) in integrity.issues" :key="i">{{ issue }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { DETERGENT_OPTIONS, ORDER_STATUS_LABELS, SCENT_OPTIONS } from '../../constants/laundry.js'
import { validateDataIntegrity, getReports, getInventoryAlerts } from '../../services/laundryDb.js'
import { formatPhp } from '../../utils/format.js'

const { state } = useLaundryDb()

// Filter state
const orderFilters = reactive({
  fromDate: '',
  toDate: '',
  status: '',
  customerId: ''
})

const reports = computed(() => getReports())
const dashboardCharts = computed(() => reports.value.dashboardCharts)
const integrity = computed(() => validateDataIntegrity())
const lowStockItems = computed(() => getInventoryAlerts())

const popularServicesMax = computed(() =>
  Math.max(...dashboardCharts.value.popularServices.map((r) => r.count), 0),
)

const BAR_CHART_MAX_PX = 104

function barHeightPx(series, index, maxPx = BAR_CHART_MAX_PX) {
  const max = Math.max(...series, 1)
  return Math.round((series[index] / max) * maxPx)
}

function popularServiceBarWidth(count) {
  const max = popularServicesMax.value || 1
  return `${Math.round((count / max) * 100)}%`
}

const customers = computed(() => state.value.accounts.filter((a) => a.role === 'customer'))
const todayOrders = computed(() => reports.value.dailySalesSummary.orderCount)
const monthlyRevenue = computed(() => reports.value.monthlyRevenue.recordedPaymentsPhp)
const monthlyNetRevenue = computed(() => monthlyRevenue.value - reports.value.expensesTotal)

const inProgressOrders = computed(
  () => state.value.orders.filter((o) => o.status !== 'completed').length,
)

const recentOrders = computed(() => {
  const customersById = new Map(customers.value.map((c) => [c.id, c.name]))
  let filteredOrders = [...state.value.orders]
  
  // Apply filters
  if (orderFilters.fromDate) {
    filteredOrders = filteredOrders.filter(order => 
      order.createdAt && order.createdAt >= orderFilters.fromDate
    )
  }
  
  if (orderFilters.toDate) {
    filteredOrders = filteredOrders.filter(order => 
      order.createdAt && order.createdAt <= orderFilters.toDate + 'T23:59:59'
    )
  }
  
  if (orderFilters.status) {
    filteredOrders = filteredOrders.filter(order => order.status === orderFilters.status)
  }
  
  if (orderFilters.customerId) {
    filteredOrders = filteredOrders.filter(order => order.customerId === orderFilters.customerId)
  }
  
  return filteredOrders
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 6)
    .map((order) => ({
      ...order,
      customerName: customersById.get(order.customerId) || 'Unknown Customer',
      status: ORDER_STATUS_LABELS[order.status] || order.status,
    }))
})

const recentActivity = computed(() => state.value.systemLogs.slice(0, 6))

const topCustomers = computed(() =>
  [...reports.value.customerAnalytics].sort((a, b) => b.orders - a.orders).slice(0, 4),
)

const topDetergent = computed(() => {
  const count = {}
  for (const o of state.value.orders) count[o.detergentId] = (count[o.detergentId] || 0) + 1
  const topId = Object.keys(count).sort((a, b) => count[b] - count[a])[0]
  return DETERGENT_OPTIONS.find((d) => d.id === topId)?.name || 'No data yet'
})

const topScent = computed(() => {
  const count = {}
  for (const o of state.value.orders) count[o.scentId] = (count[o.scentId] || 0) + 1
  const topId = Object.keys(count).sort((a, b) => count[b] - count[a])[0]
  return SCENT_OPTIONS.find((s) => s.id === topId)?.name || 'No data yet'
})

const statCards = computed(() => [
  {
    label: 'Total Customers',
    value: customers.value.length,
    note: 'Customer management records',
  },
  {
    label: 'Orders in Progress',
    value: inProgressOrders.value,
    note: 'Order processing and status tracking',
  },
  {
    label: 'Payments Today',
    value: formatPhp(reports.value.dailySalesSummary.recordedPaymentsPhp),
    note: 'Payment processing updates',
  },
  {
    label: 'Orders Today',
    value: todayOrders.value,
    note: 'Daily order intake',
  },
])

const quickActions = [
  { label: 'New Customer Profile', to: '/admin/manage-customers', description: 'Create and update customer accounts' },
  { label: 'Process Orders', to: '/admin/orders', description: 'Manage sorting, washing, and release flow' },
  { label: 'Record Payment', to: '/admin/payment', description: 'Post cash and digital transactions' },
  { label: 'Inventory Tracking', to: '/admin/inventory', description: 'Monitor detergent, scent, and packaging stock' },
  { label: 'Sales & Reporting', to: '/admin/consolidated-report', description: 'Review financial and operational reports' },
  { label: 'Customer Analytics', to: '/admin/reports', description: 'Inspect customer trends and service usage' },
]

function applyFilters() {
  // Filters are applied reactively through the computed property
  // This function can be used to trigger any additional actions
  console.log('Filters applied:', orderFilters)
}

function clearFilters() {
  orderFilters.fromDate = ''
  orderFilters.toDate = ''
  orderFilters.status = ''
  orderFilters.customerId = ''
}

function formatDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

</script>
