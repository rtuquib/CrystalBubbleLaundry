<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">{{ pageTitle }}</h1>
      <p class="text-sm text-slate-500 mt-2">{{ pageSubtitle }}</p>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          v-model="query"
          type="text"
          placeholder="Search customer..."
          class="md:col-span-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
        />
        <button
          v-if="canManageAccounts"
          type="button"
          class="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium"
          @click="openAddCustomerConfirm"
        >
          New customer
        </button>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div
          class="overflow-x-auto rounded-xl border border-slate-100"
          :class="showForm ? 'xl:col-span-2' : 'xl:col-span-3'"
        >
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-slate-500 border-b border-slate-200 bg-slate-50/80">
                <th class="py-3 px-3">Name</th>
                <th class="py-3 px-3">Username</th>
                <th class="py-3 px-3">Contact</th>
                <th class="py-3 px-3 text-right">Orders</th>
                <th class="py-3 px-3 text-right">Value</th>
                <th v-if="canManageAccounts" class="py-3 px-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in customerRows"
                :key="row.account.id"
                class="border-b border-slate-100 cursor-pointer hover:bg-slate-50"
                :class="selectedId === row.account.id ? 'bg-blue-50' : ''"
                @click="select(row.account)"
              >
                <td class="py-3 px-3 font-medium">{{ row.account.name }}</td>
                <td class="py-3 px-3">{{ row.account.username }}</td>
                <td class="py-3 px-3">
                  <p>{{ row.account.email || '-' }}</p>
                  <p class="text-xs text-slate-500">{{ row.account.phone || '-' }}</p>
                </td>
                <td class="py-3 px-3 text-right">{{ row.orders }}</td>
                <td class="py-3 px-3 text-right">{{ formatPhp(row.spend) }}</td>
                <td v-if="canManageAccounts" class="py-3 px-3" @click.stop>
                  <button
                    type="button"
                    class="text-xs rounded-lg border border-slate-300 px-2 py-1 hover:bg-white"
                    @click="select(row.account)"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <form
          v-if="showForm"
          ref="customerFormRef"
          class="rounded-xl border border-slate-200 p-4 space-y-3"
          @submit.prevent="saveCustomer"
        >
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-slate-900">{{ form.id ? 'Edit Customer' : 'Add Customer' }}</h3>
            <button
              type="button"
              class="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              @click="hideForm"
            >
              Close
            </button>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Full name</label>
            <input
              v-model.trim="form.name"
              type="text"
              class="w-full rounded-lg border px-3 py-2 text-sm"
              :class="fieldClass('name')"
              autocomplete="name"
            />
            <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name }}</p>
          </div>

          <div v-if="canManageAccounts">
            <label class="block text-xs font-medium text-slate-600 mb-1">Username</label>
            <input
              v-model.trim="form.username"
              type="text"
              class="w-full rounded-lg border px-3 py-2 text-sm"
              :class="fieldClass('username')"
              :disabled="!!form.id"
              autocomplete="username"
            />
            <p v-if="errors.username" class="text-xs text-red-600 mt-1">{{ errors.username }}</p>
          </div>
          <p v-else-if="form.id" class="text-xs text-slate-500">
            Username: <span class="font-medium text-slate-700">{{ form.username }}</span>
          </p>

          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              v-model.trim="form.email"
              type="email"
              class="w-full rounded-lg border px-3 py-2 text-sm"
              :class="fieldClass('email')"
              autocomplete="email"
            />
            <p v-if="errors.email" class="text-xs text-red-600 mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Phone</label>
            <input
              v-model.trim="form.phone"
              type="tel"
              class="w-full rounded-lg border px-3 py-2 text-sm"
              :class="fieldClass('phone')"
              autocomplete="tel"
            />
            <p v-if="errors.phone" class="text-xs text-red-600 mt-1">{{ errors.phone }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Service address</label>
            <input
              v-model.trim="form.address"
              type="text"
              class="w-full rounded-lg border px-3 py-2 text-sm"
              :class="fieldClass('address')"
              autocomplete="street-address"
            />
          </div>

          <div v-if="canManageAccounts">
            <label class="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="w-full rounded-lg border px-3 py-2 text-sm"
              :class="fieldClass('password')"
              :placeholder="form.id ? 'New password (optional)' : 'Password'"
              :autocomplete="form.id ? 'new-password' : 'new-password'"
            />
            <p v-if="errors.password" class="text-xs text-red-600 mt-1">{{ errors.password }}</p>
          </div>

          <p v-if="error" class="text-xs text-red-600">{{ error }}</p>

          <div class="flex flex-wrap gap-2">
            <button type="submit" class="flex-1 min-w-[120px] rounded-lg bg-blue-600 text-white py-2 text-sm font-medium">
              {{ form.id ? 'Save changes' : 'Create customer' }}
            </button>
            <button
              v-if="form.id && canManageAccounts"
              type="button"
              class="flex-1 min-w-[120px] rounded-lg border border-red-300 text-red-700 py-2 text-sm font-medium"
              @click="requestDeleteCustomer"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </section>

    <ConfirmDialog
      v-model="confirmAddOpen"
      title="Add New Customer"
      message="Are you sure you want to add a new customer?"
      confirm-label="Proceed"
      cancel-label="Cancel"
      :confirm-danger="false"
      @confirm="proceedAddCustomer"
    />

    <ConfirmDialog
      v-model="confirmDeleteOpen"
      title="Delete customer?"
      :message="deleteMessage"
      confirm-label="Delete customer"
      cancel-label="Keep"
      @confirm="confirmDeleteCustomer"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import { useRoleAccess } from '../../composables/useRoleAccess.js'
import { useToast } from '../../composables/useToast.js'
import {
  createAccount,
  deleteAccount,
  getCustomerServiceHistory,
  searchCustomers,
  updateAccount,
} from '../../services/laundryDb.js'
import { formatPhp } from '../../utils/format.js'
import { minLength, optionalEmail, optionalPhonePh, required } from '../../utils/validation.js'

const { canManageAccounts } = useRoleAccess()
const toast = useToast()

const pageTitle = computed(() => (canManageAccounts.value ? 'Manage Customers' : 'Customers'))
const pageSubtitle = computed(() =>
  canManageAccounts.value
    ? 'Full customer records: create, read, update, and delete with validation.'
    : 'Search and update contact details for daily service. Account creation and removal are limited to administrators.',
)

const query = ref('')
const selectedId = ref('')
const error = ref('')
const errors = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  password: '',
})
const form = reactive({ id: '', username: '', password: '', name: '', email: '', phone: '', address: '' })

const confirmAddOpen = ref(false)
const confirmDeleteOpen = ref(false)
const customerFormRef = ref(null)
const showForm = ref(false)

const customerRows = computed(() =>
  searchCustomers(query.value).map((account) => {
    const history = getCustomerServiceHistory(account.id)
    return {
      account,
      orders: history.length,
      spend: history.reduce((sum, row) => sum + (row.total || 0), 0),
    }
  }),
)

const deleteMessage = computed(() => {
  const name = form.name || 'this customer'
  return `This will remove ${name} and their orders from the local shop database. This cannot be undone.`
})

function clearFieldErrors() {
  errors.name = ''
  errors.username = ''
  errors.email = ''
  errors.phone = ''
  errors.password = ''
}

function fieldClass(key) {
  return errors[key] ? 'border-red-300 bg-red-50/50' : 'border-slate-300'
}

function validateForm() {
  clearFieldErrors()
  let ok = true
  const n = required(form.name, 'Name')
  if (n) {
    errors.name = n
    ok = false
  }
  if (canManageAccounts.value) {
    const u = required(form.username, 'Username')
    if (u) {
      errors.username = u
      ok = false
    }
    if (!form.id) {
      const p = minLength(form.password, 6, 'Password')
      if (p) {
        errors.password = p
        ok = false
      }
    } else if (form.password && String(form.password).length < 6) {
      errors.password = 'Password must be at least 6 characters'
      ok = false
    }
  }
  const em = optionalEmail(form.email)
  if (em) {
    errors.email = em
    ok = false
  }
  const ph = optionalPhonePh(form.phone)
  if (ph) {
    errors.phone = ph
    ok = false
  }
  return ok
}

function select(account) {
  showForm.value = true
  selectedId.value = account.id
  form.id = account.id
  form.username = account.username
  form.password = ''
  form.name = account.name || ''
  form.email = account.email || ''
  form.phone = account.phone || ''
  form.address = account.address || ''
  error.value = ''
  clearFieldErrors()
}

function resetForm() {
  selectedId.value = ''
  form.id = ''
  form.username = ''
  form.password = ''
  form.name = ''
  form.email = ''
  form.phone = ''
  form.address = ''
  error.value = ''
  clearFieldErrors()
}

function hideForm() {
  showForm.value = false
  resetForm()
}

function openAddCustomerConfirm() {
  confirmAddOpen.value = true
}

async function proceedAddCustomer() {
  confirmAddOpen.value = false
  resetForm()
  showForm.value = true
  await nextTick()
  customerFormRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
}

function saveCustomer() {
  error.value = ''
  if (!validateForm()) return
  if (!form.id && !canManageAccounts.value) {
    error.value = 'Only administrators can create customer accounts.'
    return
  }
  try {
    if (form.id) {
      if (canManageAccounts.value) {
        updateAccount(form.id, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          password: form.password,
        })
      } else {
        updateAccount(form.id, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
        })
      }
      toast.push('Customer updated successfully.')
    } else {
      createAccount({
        role: 'customer',
        username: form.username,
        password: form.password,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      })
      toast.push('Customer created successfully.')
    }
    hideForm()
  } catch (e) {
    error.value = e.message || 'Unable to save customer'
    toast.push(error.value, 'error')
  }
}

function requestDeleteCustomer() {
  if (!form.id || !canManageAccounts.value) return
  confirmDeleteOpen.value = true
}

function confirmDeleteCustomer() {
  error.value = ''
  try {
    deleteAccount(form.id)
    toast.push('Customer removed from the system.')
    confirmDeleteOpen.value = false
    hideForm()
  } catch (e) {
    error.value = e.message || 'Unable to delete customer'
    toast.push(error.value, 'error')
    confirmDeleteOpen.value = false
  }
}
</script>
