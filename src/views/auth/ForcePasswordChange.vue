<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-slate-100">
    <section class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Laundry Management System</p>
      <h1 class="mt-1 text-2xl font-semibold text-slate-900">Set a new password</h1>
      <p class="mt-2 text-sm text-slate-500">
        An administrator assigned a temporary password. Choose a new password to continue. Your previous password is never shown.
      </p>
      <form class="mt-5 space-y-4" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-500">Temporary / current password</label>
          <input
            v-model="current"
            type="password"
            required
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-500">New password</label>
          <input
            v-model="next"
            type="password"
            required
            minlength="6"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-500">Confirm new password</label>
          <input
            v-model="confirm"
            type="password"
            required
            minlength="6"
            class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
          />
        </div>
        <p v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
        <button type="submit" class="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          Update password
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { changeOwnPassword } from '../../services/laundryDb.js'
import { getSession, homePathForRole } from '../../router/guards.js'

const router = useRouter()
const current = ref('')
const next = ref('')
const confirm = ref('')
const error = ref('')

function submit() {
  error.value = ''
  if (next.value !== confirm.value) {
    error.value = 'New passwords do not match.'
    return
  }
  try {
    const updated = changeOwnPassword(current.value, next.value)
    const session = getSession()
    if (session) {
      localStorage.setItem(
        'loggedInUser',
        JSON.stringify({ ...session, mustChangePassword: false, status: updated.status }),
      )
    }
    router.replace(homePathForRole(session?.role))
  } catch (e) {
    error.value = e.message || 'Unable to update password.'
  }
}
</script>
