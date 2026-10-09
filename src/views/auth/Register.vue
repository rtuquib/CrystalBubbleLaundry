<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-sky-200 via-blue-100 to-cyan-100">
    <div class="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.85),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_70%_85%,rgba(56,189,248,0.16),transparent_35%)]" />
    <div class="absolute inset-0 bg-blue-500/20" />

    <section class="relative z-10 w-full max-w-[470px] rounded-2xl border border-white/60 bg-white px-6 py-7 shadow-[0_24px_48px_-12px_rgba(37,99,235,0.35)] sm:px-7">
      <div class="flex justify-center mb-3">
        <div class="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
          <img src="../../assets/logo.svg" alt="CrystalBubble Logo" class="h-8 w-8" />
        </div>
      </div>

      <h1 class="text-center text-3xl font-semibold tracking-tight text-blue-700">Create Account</h1>
      <p class="mt-2 text-center text-sm text-slate-500">Create your CrystalBubble Laundry Shop account</p>

      <form @submit.prevent="submit" class="mt-5 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
          <input
            v-model.trim="form.name"
            type="text"
            required
            placeholder="Juan Dela Cruz"
            class="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
          <input
            v-model.trim="form.email"
            type="email"
            required
            placeholder="you@example.com"
            class="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="Password"
                class="w-full rounded-full border border-slate-300 bg-white px-4 py-3 pr-16 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 mb-1.5">Confirm Password</label>
            <div class="relative">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                placeholder="Confirm"
                class="w-full rounded-full border border-slate-300 bg-white px-4 py-3 pr-16 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {{ showConfirmPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>
        </div>

        <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="w-full rounded-md bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-white text-lg font-semibold shadow-md transition hover:from-blue-700 hover:to-blue-800"
        >
          Create account
        </button>

        <div class="pt-1">
          <div class="h-px w-full bg-slate-200" />
        </div>
        <p class="text-center text-sm text-slate-500">
          Already have an account?
          <router-link to="/" class="font-semibold text-blue-600 hover:text-blue-700">Sign in</router-link>
        </p>
      </form>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerCustomer } from '../../services/laundryDb.js'

const router = useRouter()

const form = reactive({
  password: '',
  name: '',
  email: '',
  phone: '',
  address: '',
})

const errorMessage = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

function createUsernameFromEmail(email) {
  const base = String(email || '')
    .toLowerCase()
    .split('@')[0]
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 20) || 'customer'
  return `${base}${Math.floor(Math.random() * 900 + 100)}`
}

function submit() {
  errorMessage.value = ''
  if (form.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters.'
    return
  }
  if (form.password !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }
  try {
    const payload = {
      ...form,
      username: createUsernameFromEmail(form.email),
    }
    const session = registerCustomer(payload)
    localStorage.setItem('loggedInUser', JSON.stringify(session))
    router.push('/customer/dashboard')
  } catch (e) {
    errorMessage.value = e.message || 'Registration failed'
  }
}
</script>
