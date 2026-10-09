<template>
  <div v-if="metrics" class="space-y-6 lg:space-y-8">
    <section class="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
      <router-link to="/super-admin/stores" class="text-sm text-slate-300 hover:text-white">← All stores</router-link>
      <h2 class="mt-2 text-2xl sm:text-3xl font-semibold">{{ metrics.store.name }}</h2>
      <p class="mt-2 text-sm text-slate-300">
        {{ metrics.store.code }} · {{ metrics.store.address || 'No address' }} · {{ metrics.store.contactEmail || 'No contact email' }}
      </p>
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <span
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="metrics.store.status === 'active' ? 'bg-green-400/20 text-green-200' : 'bg-red-400/20 text-red-200'"
        >
          {{ metrics.store.status }}
        </span>
        <button
          type="button"
          class="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25"
          @click="toggleStatus"
        >
          {{ metrics.store.status === 'active' ? 'Suspend store' : 'Reactivate store' }}
        </button>
      </div>
    </section>

    <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <article v-for="card in cards" :key="card.label" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-slate-500">{{ card.label }}</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ card.value }}</p>
      </article>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">Store accounts</h3>
      <div class="mt-4 overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="text-xs uppercase text-slate-500">
            <tr>
              <th class="p-2">Name</th>
              <th class="p-2">Username</th>
              <th class="p-2">Email</th>
              <th class="p-2">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="account in metrics.accounts" :key="account.id" class="border-t border-slate-100">
              <td class="p-2 font-medium text-slate-800">{{ account.name }}</td>
              <td class="p-2 text-slate-600">{{ account.username }}</td>
              <td class="p-2 text-slate-600">{{ account.email || '—' }}</td>
              <td class="p-2">
                <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{{ account.role }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
  <div v-else class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
    Store not found.
    <div class="mt-3">
      <router-link to="/super-admin/stores" class="font-semibold text-blue-600">Back to stores</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { getStoreMetrics, setStoreStatus } from '../../services/laundryDb.js'

const route = useRoute()
const { tick, refresh } = useLaundryDb()

const metrics = computed(() => {
  tick.value
  return getStoreMetrics(route.params.storeId)
})

const cards = computed(() => {
  const m = metrics.value
  if (!m) return []
  return [
    { label: 'Admins', value: m.admins },
    { label: 'Staff', value: m.staff },
    { label: 'Customers', value: m.customers },
    { label: 'Sales', value: `₱${Number(m.sales).toLocaleString()}` },
  ]
})

function toggleStatus() {
  const store = metrics.value?.store
  if (!store) return
  setStoreStatus(store.id, store.status === 'active' ? 'suspended' : 'active')
  refresh()
}
</script>
