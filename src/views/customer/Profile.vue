<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-semibold text-slate-800">Profile</h1>
      <p class="text-slate-500 mt-1">
        Manage your personal information, contact details, and preferred laundry settings.
      </p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <div class="flex flex-col items-center text-center">
          <div
            class="w-24 h-24 rounded-full bg-sky-500 text-white flex items-center justify-center text-3xl font-bold mb-4"
          >
            {{ initials }}
          </div>
          <h2 class="text-xl font-semibold text-slate-800">
            {{ profileForm.name || 'Customer' }}
          </h2>
          <p class="text-sm text-slate-500">Customer</p>
        </div>
        <div class="mt-4 border-t border-slate-100 pt-4 space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Email</span>
            <span class="font-medium text-slate-800 truncate max-w-[160px] text-right">{{
              profileForm.email || '—'
            }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Contact</span>
            <span class="font-medium text-slate-800 truncate max-w-[160px] text-right">{{
              profileForm.phone || '—'
            }}</span>
          </div>
        </div>
      </div>

      <div class="xl:col-span-2 space-y-6">
        <!-- Personal info + preferences -->
        <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div class="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 class="text-lg font-semibold text-slate-800">Personal information</h3>
              <p class="text-xs text-slate-500">
                This information appears on your pickup tickets and receipts.
              </p>
            </div>
            <span
              v-if="dirtyProfile"
              class="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-100"
            >
              Unsaved changes
            </span>
          </div>

          <form class="space-y-5" @submit.prevent="saveProfile">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Full name</label>
                <input
                  v-model.trim="profileForm.name"
                  type="text"
                  class="w-full border rounded-xl px-4 py-2.5 text-sm"
                  :class="fieldClass(profileErrors.name)"
                  autocomplete="name"
                />
                <p v-if="profileErrors.name" class="text-xs text-red-600 mt-1">
                  {{ profileErrors.name }}
                </p>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input
                  v-model.trim="profileForm.email"
                  type="email"
                  class="w-full border rounded-xl px-4 py-2.5 text-sm"
                  :class="fieldClass(profileErrors.email)"
                  autocomplete="email"
                />
                <p v-if="profileErrors.email" class="text-xs text-red-600 mt-1">
                  {{ profileErrors.email }}
                </p>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Contact number</label>
                <input
                  v-model.trim="profileForm.phone"
                  type="tel"
                  class="w-full border rounded-xl px-4 py-2.5 text-sm"
                  :class="fieldClass(profileErrors.phone)"
                  autocomplete="tel"
                />
                <p v-if="profileErrors.phone" class="text-xs text-red-600 mt-1">
                  {{ profileErrors.phone }}
                </p>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Address</label>
                <input
                  v-model.trim="profileForm.address"
                  type="text"
                  class="w-full border rounded-xl px-4 py-2.5 text-sm"
                  autocomplete="street-address"
                />
              </div>
            </div>

            <div class="border-t border-slate-100 pt-4 mt-2">
              <h4 class="text-sm font-semibold text-slate-800 mb-3">Laundry preferences</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">
                    Preferred detergent
                  </label>
                  <select
                    v-model="profileForm.preferredDetergentId"
                    class="w-full border rounded-xl px-4 py-2.5 text-sm"
                  >
                    <option v-for="d in detergents" :key="d.id" :value="d.id">
                      {{ d.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-600 mb-1">
                    Preferred scent
                  </label>
                  <select
                    v-model="profileForm.preferredScentId"
                    class="w-full border rounded-xl px-4 py-2.5 text-sm"
                  >
                    <option v-for="s in scents" :key="s.id" :value="s.id">
                      {{ s.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <p v-if="profileError" class="text-xs text-red-500">
              {{ profileError }}
            </p>

            <div class="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                class="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-700"
                :disabled="savingProfile || !dirtyProfile"
                @click="resetProfile"
              >
                Reset
              </button>
              <button
                type="submit"
                class="px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-60"
                :disabled="savingProfile || !dirtyProfile"
              >
                {{ savingProfile ? 'Saving…' : 'Update profile' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DETERGENT_OPTIONS, SCENT_OPTIONS } from '../../constants/laundry.js'
import {
  updateAccountProfile,
  getAccountById,
  accountToSession,
  updateAccount,
  authenticate,
} from '../../services/laundryDb.js'
import { useToast } from '../../composables/useToast.js'
import { minLength, optionalEmail, optionalPhonePh, required } from '../../utils/validation.js'

const router = useRouter()
const toast = useToast()

const detergents = DETERGENT_OPTIONS
const scents = SCENT_OPTIONS

const accountId = ref('')

const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  preferredDetergentId: DETERGENT_OPTIONS[0].id,
  preferredScentId: SCENT_OPTIONS[0].id,
})

const originalProfile = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  preferredDetergentId: DETERGENT_OPTIONS[0].id,
  preferredScentId: SCENT_OPTIONS[0].id,
})

const profileErrors = reactive({
  name: '',
  email: '',
  phone: '',
})

const profileError = ref('')
const savingProfile = ref(false)

const initials = computed(() => {
  const n = profileForm.name || 'C'
  return n
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const dirtyProfile = computed(
  () =>
    profileForm.name !== originalProfile.name ||
    profileForm.email !== originalProfile.email ||
    profileForm.phone !== originalProfile.phone ||
    profileForm.address !== originalProfile.address ||
    profileForm.preferredDetergentId !== originalProfile.preferredDetergentId ||
    profileForm.preferredScentId !== originalProfile.preferredScentId,
)

function fieldClass(errorText) {
  return errorText ? 'border-red-300 bg-red-50/50' : 'border-slate-300'
}

function clearProfileErrors() {
  profileErrors.name = ''
  profileErrors.email = ''
  profileErrors.phone = ''
}


onMounted(() => {
  const raw = localStorage.getItem('loggedInUser')
  if (!raw) {
    router.push('/')
    return
  }
  const u = JSON.parse(raw)
  const acc = getAccountById(u.id)
  if (!acc) return
  accountId.value = acc.id
  originalProfile.name = acc.name || ''
  originalProfile.email = acc.email || ''
  originalProfile.phone = acc.phone || ''
  originalProfile.address = acc.address || ''
  originalProfile.preferredDetergentId = acc.preferredDetergentId || DETERGENT_OPTIONS[0].id
  originalProfile.preferredScentId = acc.preferredScentId || SCENT_OPTIONS[0].id
  Object.assign(profileForm, originalProfile)
})

function validateProfile() {
  clearProfileErrors()
  profileError.value = ''
  let ok = true
  const n = required(profileForm.name, 'Full name')
  if (n) {
    profileErrors.name = n
    ok = false
  }
  const e = optionalEmail(profileForm.email)
  if (e) {
    profileErrors.email = e
    ok = false
  }
  const p = optionalPhonePh(profileForm.phone)
  if (p) {
    profileErrors.phone = p
    ok = false
  }
  return ok
}

function resetProfile() {
  Object.assign(profileForm, originalProfile)
  clearProfileErrors()
  profileError.value = ''
}

function saveProfile() {
  if (!accountId.value) return
  if (!validateProfile()) return
  savingProfile.value = true
  try {
    updateAccountProfile(accountId.value, {
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      address: profileForm.address,
      preferredDetergentId: profileForm.preferredDetergentId,
      preferredScentId: profileForm.preferredScentId,
    })
    const acc = getAccountById(accountId.value)
    if (acc) {
      localStorage.setItem('loggedInUser', JSON.stringify(accountToSession(acc)))
    }
    Object.assign(originalProfile, profileForm)
    toast.push('Profile saved.')
  } catch (e) {
    profileError.value = e.message || 'Could not save profile.'
    toast.push(profileError.value, 'error')
  } finally {
    savingProfile.value = false
  }
}

</script>
