<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Release orders</h1>
      <p class="text-slate-400 mt-1">Orders ready for pickup — mark completed after handover.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400 border-b border-slate-100">
              <th class="pb-3">Order</th>
              <th class="pb-3">Customer</th>
              <th class="pb-3">Pickup</th>
              <th class="pb-3">Total</th>
              <th class="pb-3">Action</th>
            </tr>
          </thead>
          <tbody class="text-slate-600">
            <tr v-for="o in ready" :key="o.id" class="border-b border-slate-100">
              <td class="py-4 font-medium">{{ o.code }}</td>
              <td>{{ customerName(o.customerId) }}</td>
              <td>{{ formatDateOnly(o.pickupDate) }} · {{ o.pickupTimeSlot }}</td>
              <td>{{ formatPhp(o.total) }}</td>
              <td>
                <button
                  type="button"
                  class="px-3 py-2 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 transition"
                  @click="complete(o.id)"
                >
                  Mark completed
                </button>
              </td>
            </tr>
            <tr v-if="!ready.length">
              <td colspan="5" class="py-8 text-center text-slate-400">Nothing ready for release.</td>
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
import { setOrderStatus } from '../../services/laundryDb.js'
import { formatPhp, formatDateOnly } from '../../utils/format.js'

const { state } = useLaundryDb()

const ready = computed(() =>
  state.value.orders.filter((o) => o.status === 'ready_for_pickup'),
)

function customerName(id) {
  const a = state.value.accounts.find((x) => x.id === id)
  return a ? a.name : '—'
}

function complete(id) {
  try {
    setOrderStatus(id, 'completed')
  } catch (e) {
    console.error(e)
  }
}
</script>
