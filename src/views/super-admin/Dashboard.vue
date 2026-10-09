<template>
  <div class="space-y-6 lg:space-y-8">
    <section class="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
      <p class="text-sm text-slate-300">System Overview</p>
      <h2 class="text-2xl sm:text-3xl font-semibold mt-1">Laundry Business Management</h2>
      <p class="mt-3 text-sm text-slate-300 max-w-3xl">
        Administer the Laundry Management System: onboard independent laundry shops, review platform activity, and manage registered accounts. Each shop keeps its own business identity, including CrystalBubble and other registered stores.
      </p>
      <div class="mt-5 flex flex-wrap gap-3">
        <router-link
          to="/super-admin/stores"
          class="inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          Manage laundry shops
        </router-link>
        <router-link
          to="/super-admin/accounts"
          class="inline-flex rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
        >
          Account management
        </router-link>
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

    <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div class="flex items-center justify-between gap-3 mb-4">
        <h3 class="text-lg font-semibold text-slate-900">Registered laundry shops</h3>
        <router-link to="/super-admin/stores" class="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View all
        </router-link>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="text-xs uppercase text-slate-500">
            <tr>
              <th class="p-2">Store</th>
              <th class="p-2">Status</th>
              <th class="p-2">Admins</th>
              <th class="p-2">Staff</th>
              <th class="p-2">Customers</th>
              <th class="p-2">Orders</th>
              <th class="p-2">Sales</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in storeRows" :key="row.store.id" class="border-t border-slate-100">
              <td class="p-2">
                <router-link
                  :to="`/super-admin/stores/${row.store.id}`"
                  class="font-medium text-slate-800 hover:text-blue-700"
                >
                  {{ row.store.name }}
                </router-link>
                <p class="text-xs text-slate-500">{{ row.store.code }}</p>
              </td>
              <td class="p-2">
                <span
                  class="rounded-full px-2 py-1 text-xs font-medium"
                  :class="row.store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ row.store.status }}
                </span>
              </td>
              <td class="p-2">{{ row.admins }}</td>
              <td class="p-2">{{ row.staff }}</td>
              <td class="p-2">{{ row.customers }}</td>
              <td class="p-2">{{ row.orders }}</td>
              <td class="p-2">₱{{ Number(row.sales).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { getPlatformSummary, getStoreMetrics, listStores } from '../../services/laundryDb.js'

const { tick } = useLaundryDb()

const summary = computed(() => {
  tick.value
  return getPlatformSummary()
})

const storeRows = computed(() => {
  tick.value
  return listStores()
    .map((store) => getStoreMetrics(store.id))
    .filter(Boolean)
})

const statCards = computed(() => {
  const s = summary.value
  return [
    { label: 'Laundry shops', value: s.stores, note: `${s.active} active · ${s.suspended} suspended` },
    { label: 'Shop administrators', value: s.admins, note: 'Across registered businesses' },
    { label: 'Staff', value: s.staff, note: 'Across registered businesses' },
    { label: 'Recorded payments', value: `₱${Number(s.sales).toLocaleString()}`, note: `${s.orders} total orders` },
  ]
})
</script>
