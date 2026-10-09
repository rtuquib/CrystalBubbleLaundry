<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">Manage staff</h1>
      <p class="text-sm text-slate-500 mt-2">Create shop floor accounts, update contact info, and remove leavers — with validation and confirmations.</p>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          v-model="query"
          type="search"
          placeholder="Search staff…"
          class="md:col-span-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
        />
        <button
          type="button"
          class="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium"
          @click="openAddStaffConfirm"
        >
          New staff
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
                <th class="py-3 px-3">Email</th>
                <th class="py-3 px-3">Phone</th>
                <th class="py-3 px-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in staffRows"
                :key="row.id"
                class="border-b border-slate-100 cursor-pointer hover:bg-slate-50"
                :class="selectedId === row.id ? 'bg-blue-50' : ''"
                @click="select(row)"
              >
                <td class="py-3 px-3 font-medium">{{ row.name }}</td>
                <td class="py-3 px-3">{{ row.username }}</td>
                <td class="py-3 px-3">{{ row.email || '—' }}</td>
                <td class="py-3 px-3">{{ row.phone || '—' }}</td>
                <td class="py-3 px-3" @click.stop>
                  <button
                    type="button"
                    class="text-xs rounded-lg border border-slate-300 px-2 py-1 hover:bg-white"
                    @click="select(row)"
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
          ref="staffFormRef"
          class="rounded-xl border border-slate-200 p-4 space-y-3"
          @submit.prevent="saveStaff"
        >
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-slate-900">{{ form.id ? 'Edit staff' : 'Add staff' }}</h3>
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
            />
            <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Username</label>
            <input
              v-model.trim="form.username"
              type="text"
              class="w-full rounded-lg border px-3 py-2 text-sm"
              :class="fieldClass('username')"
              :disabled="!!form.id"
            />
            <p v-if="errors.username" class="text-xs text-red-600 mt-1">{{ errors.username }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              v-model.trim="form.email"
              type="email"
              class="w-full rounded-lg border px-3 py-2 text-sm"
              :class="fieldClass('email')"
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
            />
            <p v-if="errors.phone" class="text-xs text-red-600 mt-1">{{ errors.phone }}</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Address</label>
            <input
              v-model.trim="form.address"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <input
              v-model="form.password"
              type="password"
              class="w-full rounded-lg border px-3 py-2 text-sm"
              :class="fieldClass('password')"
              :placeholder="form.id ? 'New password (optional)' : 'Initial password'"
            />
            <p v-if="errors.password" class="text-xs text-red-600 mt-1">{{ errors.password }}</p>
          </div>

          <p v-if="error" class="text-xs text-red-600">{{ error }}</p>

          <div class="flex flex-wrap gap-2">
            <button type="submit" class="flex-1 min-w-[120px] rounded-lg bg-blue-600 text-white py-2 text-sm font-medium">
              {{ form.id ? 'Save changes' : 'Create staff' }}
            </button>
            <button
              v-if="form.id"
              type="button"
              class="flex-1 min-w-[120px] rounded-lg border border-red-300 text-red-700 py-2 text-sm font-medium"
              @click="requestDelete"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </section>

    <ConfirmDialog
      v-model="confirmAddOpen"
      title="Add New Staff"
      message="Are you sure you want to add a new staff member?"
      confirm-label="Proceed"
      cancel-label="Cancel"
      :confirm-danger="false"
      @confirm="proceedAddStaff"
    />

    <ConfirmDialog
      v-model="confirmDeleteOpen"
      title="Remove staff account?"
      :message="deleteMessage"
      confirm-label="Delete staff"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import { useToast } from '../../composables/useToast.js'
import { createAccount, deleteAccount, searchStaff, updateAccount } from '../../services/laundryDb.js'
import { minLength, optionalEmail, optionalPhonePh, required } from '../../utils/validation.js'

const toast = useToast()

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
const staffFormRef = ref(null)
const showForm = ref(false)

const staffRows = computed(() => searchStaff(query.value))

const deleteMessage = computed(() => {
  const n = form.name || 'this staff member'
  return `Remove ${n} from the team? Assigned orders will be unassigned.`
})

function clearErrors() {
  errors.name = ''
  errors.username = ''
  errors.email = ''
  errors.phone = ''
  errors.password = ''
}

function fieldClass(key) {
  return errors[key] ? 'border-red-300 bg-red-50/50' : 'border-slate-300'
}

function validate() {
  clearErrors()
  let ok = true
  const n = required(form.name, 'Name')
  if (n) {
    errors.name = n
    ok = false
  }
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

function select(row) {
  showForm.value = true
  selectedId.value = row.id
  form.id = row.id
  form.username = row.username
  form.password = ''
  form.name = row.name || ''
  form.email = row.email || ''
  form.phone = row.phone || ''
  form.address = row.address || ''
  error.value = ''
  clearErrors()
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
  clearErrors()
}

function hideForm() {
  showForm.value = false
  resetForm()
}

function openAddStaffConfirm() {
  confirmAddOpen.value = true
}

async function proceedAddStaff() {
  confirmAddOpen.value = false
  resetForm()
  showForm.value = true
  await nextTick()
  staffFormRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
}

function saveStaff() {
  error.value = ''
  if (!validate()) return
  try {
    if (form.id) {
      updateAccount(form.id, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password,
      })
      toast.push('Staff profile updated.')
    } else {
      createAccount({
        role: 'staff',
        username: form.username,
        password: form.password,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      })
      toast.push('Staff account created.')
    }
    hideForm()
  } catch (e) {
    error.value = e.message || 'Unable to save staff'
    toast.push(error.value, 'error')
  }
}

function requestDelete() {
  if (!form.id) return
  confirmDeleteOpen.value = true
}

function confirmDelete() {
  error.value = ''
  try {
    deleteAccount(form.id)
    toast.push('Staff account removed.')
    confirmDeleteOpen.value = false
    hideForm()
  } catch (e) {
    error.value = e.message || 'Unable to delete staff'
    toast.push(error.value, 'error')
    confirmDeleteOpen.value = false
  }
}
</script>
