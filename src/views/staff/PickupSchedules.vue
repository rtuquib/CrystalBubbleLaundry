<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">Pickup Schedules</h1>
      <p class="text-sm text-slate-500 mt-2">View assigned pickup dates and times.</p>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label class="block text-xs text-slate-500 mb-1">Date filter</label>
          <input v-model="dateFilter" type="date" class="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-500 border-b border-slate-200">
              <th class="py-2">Order</th>
              <th class="py-2">Customer</th>
              <th class="py-2">Pickup Date</th>
              <th class="py-2">Pickup Time</th>
              <th class="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in schedules" :key="row.id" class="border-b border-slate-100">
              <td class="py-3 font-medium text-slate-800">{{ row.code }}</td>
              <td class="py-3 text-slate-700">{{ customerName(row.customerId) }}</td>
              <td class="py-3 text-slate-700">{{ row.pickupDate || '-' }}</td>
              <td class="py-3 text-slate-700">{{ row.pickupTimeSlot || '-' }}</td>
              <td class="py-3 text-slate-700 capitalize">{{ row.status }}</td>
            </tr>
            <tr v-if="!schedules.length">
              <td colspan="5" class="py-8 text-center text-slate-400">No pickup schedules found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { getPickupSchedules } from '../../services/laundryDb.js'

const { state } = useLaundryDb()
const dateFilter = ref('')

const staffId = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('loggedInUser') || '{}').id || ''
  } catch {
    return ''
  }
})

const schedules = computed(() =>
  getPickupSchedules({ date: dateFilter.value, staffId: staffId.value }),
)

function customerName(id) {
  return state.value.accounts.find((a) => a.id === id)?.name || 'Unknown'
}
</script>
