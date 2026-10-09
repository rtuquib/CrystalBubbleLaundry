<template>
  <div class="space-y-6 lg:space-y-8">
    <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h2 class="text-xl font-semibold text-slate-900">Laundry shops</h2>
      <p class="mt-1 text-sm text-slate-500">
        Onboard independent laundry businesses onto the Laundry Management System. Each shop keeps its own name, admin, staff, and customers.
      </p>

      <div class="mt-5 overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="text-xs uppercase text-slate-500">
            <tr>
              <th class="p-2">Store</th>
              <th class="p-2">Store logins</th>
              <th class="p-2">Status</th>
              <th class="p-2">Accounts</th>
              <th class="p-2">Orders</th>
              <th class="p-2">Sales</th>
              <th class="p-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in storeRows" :key="row.store.id" class="border-t border-slate-100">
              <td class="p-2">
                <router-link
                  :to="storePath(row.store.id)"
                  class="font-medium text-slate-800 hover:text-blue-700 hover:underline"
                >
                  {{ row.store.name }}
                </router-link>
                <p class="text-xs text-slate-500">{{ row.store.code }} · {{ row.store.contactEmail || 'No contact email' }}</p>
              </td>
              <td class="p-2">
                <div class="flex flex-wrap gap-2">
                  <router-link
                    :to="loginLink(row.store.id, 'admin')"
                    class="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Admin
                  </router-link>
                  <router-link
                    :to="loginLink(row.store.id, 'staff')"
                    class="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-100"
                  >
                    Staff
                  </router-link>
                  <router-link
                    :to="loginLink(row.store.id, 'customer')"
                    class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    User
                  </router-link>
                </div>
              </td>
              <td class="p-2">
                <span
                  class="rounded-full px-2 py-1 text-xs font-medium"
                  :class="row.store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ row.store.status }}
                </span>
              </td>
              <td class="p-2">{{ row.admins }} admins · {{ row.staff }} staff · {{ row.customers }} customers</td>
              <td class="p-2">{{ row.orders }}</td>
              <td class="p-2">₱{{ Number(row.sales).toLocaleString() }}</td>
              <td class="p-2 text-right space-x-3 whitespace-nowrap">
                <router-link
                  :to="storePath(row.store.id)"
                  class="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Details
                </router-link>
                <button
                  type="button"
                  class="font-semibold text-slate-600 hover:text-slate-900 underline"
                  @click="toggleStatus(row.store)"
                >
                  {{ row.store.status === 'active' ? 'Suspend' : 'Reactivate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900">Onboard a laundry shop</h3>
      <p class="mt-1 text-sm text-slate-500">Creates a registered business and its first shop administrator account.</p>

      <form class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Store name</label>
          <input v-model.trim="form.name" required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Contact email</label>
          <input v-model.trim="form.contactEmail" type="email" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Address</label>
          <input v-model.trim="form.address" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Phone (optional)</label>
          <input v-model.trim="form.phone" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Hours (optional)</label>
          <input v-model.trim="form.hours" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Admin name</label>
          <input v-model.trim="form.adminName" required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Admin email</label>
          <input v-model.trim="form.adminEmail" type="email" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Admin username</label>
          <input v-model.trim="form.adminUsername" required class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Admin password</label>
          <input v-model="form.adminPassword" type="password" required minlength="6" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <p v-if="error" class="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ error }}
        </p>
        <p v-if="success" class="sm:col-span-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {{ success }}
        </p>
        <div class="sm:col-span-2">
          <button type="submit" class="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">
            Create store and administrator
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { createStore, getStoreMetrics, listStores, setStoreStatus } from '../../services/laundryDb.js'

const { tick, refresh } = useLaundryDb()
const error = ref('')
const success = ref('')

const form = reactive({
  name: '',
  address: '',
  contactEmail: '',
  phone: '',
  hours: '',
  adminName: '',
  adminEmail: '',
  adminUsername: '',
  adminPassword: '',
})

const storeRows = computed(() => {
  tick.value
  return listStores()
    .map((store) => getStoreMetrics(store.id))
    .filter(Boolean)
})

function storePath(storeId) {
  return `/super-admin/stores/${storeId}`
}

function loginLink(storeId, role) {
  return {
    path: `/login/${role}`,
    query: { storeId },
  }
}

function toggleStatus(store) {
  error.value = ''
  success.value = ''
  try {
    setStoreStatus(store.id, store.status === 'active' ? 'suspended' : 'active')
    refresh()
  } catch (e) {
    error.value = e.message || 'Unable to update store status'
  }
}

function submit() {
  error.value = ''
  success.value = ''
  try {
    const result = createStore({ ...form })
    success.value = `Created ${result.store.name}. Admin login: ${result.admin.username}`
    form.name = ''
    form.address = ''
    form.contactEmail = ''
    form.phone = ''
    form.hours = ''
    form.adminName = ''
    form.adminEmail = ''
    form.adminUsername = ''
    form.adminPassword = ''
    refresh()
  } catch (e) {
    error.value = e.message || 'Unable to create store'
  }
}
</script>
