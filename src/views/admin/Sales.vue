<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">Sales Monitoring</h1>
      <p class="text-sm text-slate-500 mt-2">
        Review daily, weekly, and monthly sales with filters, summaries, and printable output.
      </p>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-end gap-3 mb-5">
        <div>
          <label class="block text-xs text-slate-500 mb-1">Period</label>
          <select v-model="filters.period" class="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1">Base date</label>
          <input v-model="filters.baseDate" type="date" class="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1">Payment method</label>
          <select v-model="filters.method" class="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="all">All</option>
            <option value="cash">Cash</option>
            <option value="digital">Digital</option>
          </select>
        </div>
        <button type="button" class="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition" @click="printReport" style="pointer-events: auto; cursor: pointer;">
          Print Report
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div class="rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-500">Total Sales</p>
          <p class="text-2xl font-semibold text-slate-900 mt-1">{{ formatPhp(report.summary.totalSales) }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-500">Transactions</p>
          <p class="text-2xl font-semibold text-slate-900 mt-1">{{ report.summary.transactionCount }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 p-4">
          <p class="text-xs text-slate-500">Average Ticket</p>
          <p class="text-2xl font-semibold text-slate-900 mt-1">{{ formatPhp(report.summary.averageTicket) }}</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-500 border-b border-slate-200">
              <th class="py-2">Receipt</th>
              <th class="py-2">Order</th>
              <th class="py-2">Customer</th>
              <th class="py-2">Method</th>
              <th class="py-2">Date</th>
              <th class="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in report.paymentRows" :key="row.id" class="border-b border-slate-100">
              <td class="py-3">{{ row.receiptNumber }}</td>
              <td class="py-3">{{ row.orderCode }}</td>
              <td class="py-3">{{ row.customerName }}</td>
              <td class="py-3 capitalize">{{ row.method }}</td>
              <td class="py-3">{{ formatDateTime(row.createdAt) }}</td>
              <td class="py-3 text-right font-medium">{{ formatPhp(row.amount) }}</td>
            </tr>
            <tr v-if="!report.paymentRows.length">
              <td colspan="6" class="py-8 text-center text-slate-400">No sales records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { getSalesReport } from '../../services/laundryDb.js'
import { formatPhp } from '../../utils/format.js'

const filters = reactive({
  period: 'daily',
  baseDate: new Date().toISOString().slice(0, 10),
  method: 'all',
})

const report = computed(() => getSalesReport(filters))

function formatDateTime(value) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function printReport() {
  // Add a small delay to ensure any reactive updates are complete
  setTimeout(() => {
    window.print()
  }, 100)
}
</script>
