<template>
  <div class="space-y-6">
    <section class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-semibold text-slate-800">Staff profile</h1>
        <p class="text-slate-500 mt-1">
          Keep your staff account details up to date for smooth daily operations.
        </p>
      </div>
      <div class="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2.5">
        <div class="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold">
          {{ initials }}
        </div>
        <div class="text-xs">
          <p class="font-semibold text-slate-800">{{ profileForm.name || 'Staff' }}</p>
          <p class="text-slate-500">Signed in as {{ profileForm.username || 'staff' }}</p>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      <!-- Overview -->
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 space-y-4">
        <div class="flex flex-col items-center text-center">
          <div
            class="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-sky-600 text-white flex items-center justify-center text-3xl font-semibold mb-4"
          >
            {{ initials }}
          </div>
          <h2 class="text-xl font-semibold text-slate-800">
            {{ profileForm.name || 'Staff user' }}
          </h2>
          <p class="text-sm text-slate-500">Staff</p>
        </div>
        <div class="border-t border-slate-100 pt-4 space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Username</span>
            <span class="font-medium text-slate-800 truncate max-w-[160px] text-right">
              {{ profileForm.username || '—' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Email</span>
            <span class="font-medium text-slate-800 truncate max-w-[160px] text-right">
              {{ profileForm.email || '—' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Contact</span>
            <span class="font-medium text-slate-800 truncate max-w-[160px] text-right">
              {{ profileForm.phone || '—' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Forms -->
      <div class="xl:col-span-2 space-y-6">
        <!-- Staff details -->
        <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div class="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 class="text-lg font-semibold text-slate-800">Staff information</h3>
              <p class="text-xs text-slate-500">
                Your details are used on job tickets, pickup schedules, and internal notes.
              </p>
            </div>
            <span
              v-if="dirtyProfile"
              class="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-100"
            >
              Unsaved changes
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Full name</label>
              <input
                v-model.trim="profileForm.name"
                type="text"
                class="w-full rounded-xl border px-3 py-2.5 text-sm"
                :class="fieldClass(profileErrors.name)"
                autocomplete="name"
              />
              <p v-if="profileErrors.name" class="text-xs text-red-600 mt-1">
                {{ profileErrors.name }}
              </p>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Email address</label>
              <input
                v-model.trim="profileForm.email"
                type="email"
                class="w-full rounded-xl border px-3 py-2.5 text-sm"
                :class="fieldClass(profileErrors.email)"
                autocomplete="email"
              />
              <p v-if="profileErrors.email" class="text-xs text-red-600 mt-1">
                {{ profileErrors.email }}
              </p>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Username</label>
              <input
                v-model.trim="profileForm.username"
                type="text"
                class="w-full rounded-xl border px-3 py-2.5 text-sm"
                :class="fieldClass(profileErrors.username)"
                autocomplete="username"
              />
              <p v-if="profileErrors.username" class="text-xs text-red-600 mt-1">
                {{ profileErrors.username }}
              </p>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Contact number</label>
              <input
                v-model.trim="profileForm.phone"
                type="tel"
                class="w-full rounded-xl border px-3 py-2.5 text-sm"
                :class="fieldClass(profileErrors.phone)"
                autocomplete="tel"
              />
              <p v-if="profileErrors.phone" class="text-xs text-red-600 mt-1">
                {{ profileErrors.phone }}
              </p>
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-xs font-medium text-slate-600 mb-1">Address</label>
            <input
              v-model.trim="profileForm.address"
              type="text"
              class="w-full rounded-xl border px-3 py-2.5 text-sm"
              autocomplete="street-address"
            />
          </div>

          <p v-if="profileError" class="mt-3 text-xs text-red-600">
            {{ profileError }}
          </p>

          <div class="mt-5 flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              class="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-700"
              :disabled="savingProfile || !dirtyProfile"
              @click="resetProfile"
            >
              Reset
            </button>
            <button
              type="button"
              class="rounded-xl bg-emerald-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
              :disabled="savingProfile || !dirtyProfile"
              @click="saveProfile"
            >
              {{ savingProfile ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
        </div>

        <!-- Security -->
        <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div class="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 class="text-lg font-semibold text-slate-800">Security</h3>
              <p class="text-xs text-slate-500">
                Update your password used to sign in to the operations workspace.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Current password</label>
              <input
                v-model="securityForm.currentPassword"
                type="password"
                class="w-full rounded-xl border px-3 py-2.5 text-sm"
                :class="fieldClass(securityErrors.currentPassword)"
                autocomplete="current-password"
              />
              <p v-if="securityErrors.currentPassword" class="text-xs text-red-600 mt-1">
                {{ securityErrors.currentPassword }}
              </p>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">New password</label>
              <input
                v-model="securityForm.newPassword"
                type="password"
                class="w-full rounded-xl border px-3 py-2.5 text-sm"
                :class="fieldClass(securityErrors.newPassword)"
                autocomplete="new-password"
              />
              <p v-if="securityErrors.newPassword" class="text-xs text-red-600 mt-1">
                {{ securityErrors.newPassword }}
              </p>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Confirm password</label>
              <input
                v-model="securityForm.confirmPassword"
                type="password"
                class="w-full rounded-xl border px-3 py-2.5 text-sm"
                :class="fieldClass(securityErrors.confirmPassword)"
                autocomplete="new-password"
              />
              <p v-if="securityErrors.confirmPassword" class="text-xs text-red-600 mt-1">
                {{ securityErrors.confirmPassword }}
              </p>
            </div>
          </div>

          <p v-if="securityError" class="mt-3 text-xs text-red-600">
            {{ securityError }}
          </p>

          <div class="mt-5 flex justify-end">
            <button
              type="button"
              class="rounded-xl bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-black disabled:opacity-60"
              :disabled="savingSecurity"
              @click="changePassword"
            >
              {{ savingSecurity ? 'Updating…' : 'Update password' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../../composables/useToast.js'
import { getAccountById, updateAccount, authenticate, accountToSession } from '../../services/laundryDb.js'
import { minLength, optionalEmail, optionalPhonePh, required } from '../../utils/validation.js'

const router = useRouter()
const toast = useToast()

const accountId = ref('')
const originalProfile = reactive({
  name: '',
  email: '',
  username: '',
  phone: '',
  address: '',
})

const profileForm = reactive({
  name: '',
  email: '',
  username: '',
  phone: '',
  address: '',
})

const profileErrors = reactive({
  name: '',
  email: '',
  username: '',
  phone: '',
})

const securityForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const securityErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const profileError = ref('')
const securityError = ref('')
const savingProfile = ref(false)
const savingSecurity = ref(false)

const initials = computed(() => {
  const name = profileForm.name || profileForm.username || 'S'
  const parts = String(name).trim().split(/\s+/)
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
  return letters || 'S'
})

const dirtyProfile = computed(
  () =>
    profileForm.name !== originalProfile.name ||
    profileForm.email !== originalProfile.email ||
    profileForm.username !== originalProfile.username ||
    profileForm.phone !== originalProfile.phone ||
    profileForm.address !== originalProfile.address,
)

function fieldClass(errorText) {
  return errorText ? 'border-red-300 bg-red-50/50' : 'border-slate-300'
}

function clearProfileErrors() {
  profileErrors.name = ''
  profileErrors.email = ''
  profileErrors.username = ''
  profileErrors.phone = ''
}

function clearSecurityErrors() {
  securityErrors.currentPassword = ''
  securityErrors.newPassword = ''
  securityErrors.confirmPassword = ''
}

function loadFromSession() {
  const raw = localStorage.getItem('loggedInUser')
  if (!raw) {
    router.push('/')
    return
  }
  try {
    const session = JSON.parse(raw)
    if (!session?.id || session.role !== 'staff') return
    const acc = getAccountById(session.id)
    if (!acc) return
    accountId.value = acc.id
    originalProfile.name = acc.name || ''
    originalProfile.email = acc.email || ''
    originalProfile.username = acc.username || ''
    originalProfile.phone = acc.phone || ''
    originalProfile.address = acc.address || ''
    Object.assign(profileForm, originalProfile)
  } catch {
    /* ignore */
  }
}

function resetProfile() {
  Object.assign(profileForm, originalProfile)
  clearProfileErrors()
  profileError.value = ''
}

function validateProfile() {
  clearProfileErrors()
  profileError.value = ''
  let ok = true

  const n = required(profileForm.name, 'Full name')
  if (n) {
    profileErrors.name = n
    ok = false
  }
  const u = required(profileForm.username, 'Username')
  if (u) {
    profileErrors.username = u
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

async function saveProfile() {
  if (!accountId.value) return
  if (!validateProfile()) return
  savingProfile.value = true
  try {
    updateAccount(accountId.value, {
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      address: profileForm.address,
      username: profileForm.username,
    })
    Object.assign(originalProfile, profileForm)
    const acc = getAccountById(accountId.value)
    if (acc) {
      localStorage.setItem('loggedInUser', JSON.stringify(accountToSession(acc)))
    }
    toast.push('Profile updated.')
  } catch (e) {
    profileError.value = e.message || 'Unable to update profile.'
    toast.push(profileError.value, 'error')
  } finally {
    savingProfile.value = false
  }
}

function validateSecurity() {
  clearSecurityErrors()
  securityError.value = ''
  let ok = true
  const cur = required(securityForm.currentPassword, 'Current password')
  if (cur) {
    securityErrors.currentPassword = cur
    ok = false
  }
  const np = minLength(securityForm.newPassword, 6, 'New password')
  if (np) {
    securityErrors.newPassword = np
    ok = false
  }
  if (securityForm.newPassword !== securityForm.confirmPassword) {
    securityErrors.confirmPassword = 'Passwords do not match'
    ok = false
  }
  return ok
}

async function changePassword() {
  if (!accountId.value) return
  if (!validateSecurity()) return
  savingSecurity.value = true
  try {
    const acc = getAccountById(accountId.value)
    const ok = authenticate(acc.username, securityForm.currentPassword)
    if (!ok) {
      securityErrors.currentPassword = 'Current password is incorrect'
      savingSecurity.value = false
      return
    }
    updateAccount(accountId.value, { password: securityForm.newPassword })
    toast.push('Password updated successfully.')
    securityForm.currentPassword = ''
    securityForm.newPassword = ''
    securityForm.confirmPassword = ''
  } catch (e) {
    securityError.value = e.message || 'Unable to update password.'
    toast.push(securityError.value, 'error')
  } finally {
    savingSecurity.value = false
  }
}

onMounted(loadFromSession)
</script>