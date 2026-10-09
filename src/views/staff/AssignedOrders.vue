<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Assigned orders</h1>
      <p class="text-slate-400 mt-1">Advance each order through washing, drying, folding, QA, and pickup-ready stages.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400 border-b border-slate-100">
              <th class="pb-3">Order</th>
              <th class="pb-3">Customer</th>
              <th class="pb-3">Services</th>
              <th class="pb-3">Status</th>
              <th class="pb-3">Action</th>
            </tr>
          </thead>

          <tbody class="text-slate-600">
            <tr v-for="o in openOrders" :key="o.id" class="border-b border-slate-100">
              <td class="py-4 font-medium">{{ o.code }}</td>
              <td>{{ customerName(o.customerId) }}</td>
              <td>{{ summarizeServices(o.services) }}</td>
              <td>
                <span class="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
                  {{ labels[o.status] || o.status }}
                </span>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <select
                    :value="o.status"
                    class="border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
                    @change="setExplicitStatus(o.id, $event.target.value)"
                  >
                    <option v-for="st in statuses" :key="st" :value="st">{{ labels[st] }}</option>
                  </select>
                  <button
                    type="button"
                    class="px-3 py-2 rounded-lg bg-sky-500 text-white text-xs hover:bg-sky-600 transition disabled:opacity-40"
                    :disabled="o.status === 'completed'"
                    @click="advance(o.id)"
                  >
                    Advance
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!openOrders.length">
              <td colspan="5" class="py-8 text-center text-slate-400">No active orders.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { ORDER_STATUS_LABELS } from '../../constants/laundry.js'
import { advanceOrderStatus, setOrderStatus } from '../../services/laundryDb.js'
import { summarizeServices } from '../../utils/format.js'

const { state } = useLaundryDb()
const labels = ORDER_STATUS_LABELS
const statuses = ['processing', 'washing', 'drying', 'folding', 'quality_check', 'ready_for_pickup', 'completed']

const staffId = (() => {
  try {
    return JSON.parse(localStorage.getItem('loggedInUser') || '{}').id || ''
  } catch {
    return ''
  }
})()

const openOrders = computed(() =>
  state.value.orders
    .filter((o) => o.status !== 'completed' && (o.assignedStaffId ? o.assignedStaffId === staffId : true))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
)

function customerName(id) {
  const a = state.value.accounts.find((x) => x.id === id)
  return a ? a.name : '—'
}

function advance(id) {
  try {
    advanceOrderStatus(id)
  } catch (e) {
    console.error(e)
  }
}

function setExplicitStatus(id, status) {
  try {
    setOrderStatus(id, status)
  } catch (e) {
    console.error(e)
  }
}
</script>
