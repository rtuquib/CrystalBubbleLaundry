<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Reports & analytics</h1>
      <p class="text-slate-400 mt-1">
        Daily sales, monthly revenue, customer analytics, order volume, and service popularity.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-700 mb-2">Daily sales summary</h2>
        <p class="text-sm text-slate-500 mb-4">{{ reports.dailySalesSummary.date }}</p>
        <p class="text-3xl font-bold text-sky-600">{{ formatPhp(reports.dailySalesSummary.recordedPaymentsPhp) }}</p>
        <p class="text-sm text-slate-500 mt-2">Orders created today: {{ reports.dailySalesSummary.orderCount }}</p>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-700 mb-2">Monthly revenue (payments recorded)</h2>
        <p class="text-sm text-slate-500 mb-4">{{ reports.monthlyRevenue.month }}</p>
        <p class="text-3xl font-bold text-emerald-600">{{ formatPhp(reports.monthlyRevenue.recordedPaymentsPhp) }}</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
      <h2 class="text-lg font-semibold text-slate-700 mb-4">Customer analytics</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400 border-b border-slate-100">
              <th class="pb-3">Customer</th>
              <th class="pb-3">Orders</th>
              <th class="pb-3">Spend</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in reports.customerAnalytics" :key="c.accountId" class="border-b border-slate-100">
              <td class="py-3">{{ c.name }}</td>
              <td>{{ c.orders }}</td>
              <td>{{ formatPhp(c.spendPhp) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Order volume by status</h2>
        <ul class="space-y-2 text-sm text-slate-600">
          <li class="flex justify-between">
            <span>Total orders</span><span class="font-semibold">{{ reports.orderVolume.total }}</span>
          </li>
          <li
            v-for="st in statuses"
            :key="st"
            class="flex justify-between border-t border-slate-100 pt-2"
          >
            <span>{{ labels[st] }}</span>
            <span>{{ reports.orderVolume.byStatus[st] || 0 }}</span>
          </li>
        </ul>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Service popularity</h2>
        <p class="text-sm text-slate-500 mb-3">Count of orders including each service.</p>
        <ul class="space-y-2 text-sm">
          <li v-for="key in serviceKeys" :key="key" class="flex justify-between">
            <span>{{ serviceLabels[key] }}</span>
            <span class="font-semibold text-sky-600">{{ reports.servicePopularity[key] || 0 }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h2 class="text-lg font-semibold text-slate-700 mb-2">System logs (recent)</h2>
      <div class="max-h-56 overflow-y-auto text-sm space-y-2">
        <div v-for="log in recentLogs" :key="log.id" class="border-b border-slate-50 pb-2">
          <span class="text-xs text-slate-400">{{ formatDateTime(log.createdAt) }}</span>
          <span class="ml-2 text-slate-700">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { getReports } from '../../services/laundryDb.js'
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  SERVICE_TYPES,
  SERVICE_LABELS,
} from '../../constants/laundry.js'
import { formatPhp, formatDateTime } from '../../utils/format.js'

const { state } = useLaundryDb()

const reports = computed(() => getReports())

const statuses = ORDER_STATUSES
const labels = ORDER_STATUS_LABELS
const serviceKeys = SERVICE_TYPES
const serviceLabels = SERVICE_LABELS

const recentLogs = computed(() => state.value.systemLogs.slice(0, 25))
</script>
