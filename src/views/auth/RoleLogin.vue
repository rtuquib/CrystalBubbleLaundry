<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-sky-200 via-blue-100 to-cyan-100">
    <div class="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.85),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_70%_85%,rgba(56,189,248,0.16),transparent_35%)]" />
    <div class="absolute inset-0 bg-blue-500/20" />

    <section class="relative z-10 w-full max-w-[430px] rounded-2xl border border-white/60 bg-white px-6 py-7 shadow-[0_24px_48px_-12px_rgba(37,99,235,0.35)] sm:px-7">
      <div class="flex justify-center mb-3">
        <div class="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
          <img src="../../assets/logo.svg" :alt="config.logoAlt" class="h-8 w-8" />
        </div>
      </div>

      <h1 class="text-center text-4xl font-semibold tracking-tight text-blue-700">{{ config.title }}</h1>
      <p class="mt-2 text-center text-sm text-slate-500">
        <template v-if="store">{{ config.title }} login for <span class="font-semibold text-slate-700">{{ store.name }}</span></template>
        <template v-else>{{ config.subtitle }}</template>
      </p>

      <form @submit.prevent="handleLogin" class="mt-5 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Username or Email</label>
          <input
            v-model.trim="identity"
            type="text"
            :placeholder="config.placeholder"
            class="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1.5">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="w-full rounded-full border border-slate-300 bg-white px-4 py-3 pr-16 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
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

        <div class="flex items-center justify-between text-sm">
          <label class="inline-flex items-center gap-2 text-slate-700 cursor-pointer select-none">
            <input v-model="rememberMe" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-300" />
            <span>Remember me</span>
          </label>
          <button type="button" class="font-semibold text-blue-600 hover:text-blue-700">Forgot password?</button>
        </div>

        <p v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="w-full rounded-md bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-white text-lg font-semibold shadow-md transition hover:from-blue-700 hover:to-blue-800"
        >
          Login
        </button>

        <div class="pt-1">
          <div class="h-px w-full bg-slate-200" />
        </div>
        <p class="text-center text-sm text-slate-500">
          <router-link to="/" class="font-semibold text-blue-600 hover:text-blue-700">← Back to Sign in</router-link>
        </p>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  authenticate,
  ensureDemoCredentials,
  getStore,
} from '../../services/laundryDb.js'
import { homePathForRole, normalizeRole, roleAllowedForPath } from '../../router/guards.js'

const route = useRoute()

const identity = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(true)
const errorMessage = ref('')

const ROLE_CONFIG = {
  super_admin: {
    title: 'Platform Administration',
    subtitle: 'Sign in to the Laundry Management System',
    placeholder: 'Username or Email',
    expectedRole: 'super_admin',
    logoAlt: 'Laundry Management System',
  },
  admin: {
    title: 'Admin',
    subtitle: 'Sign in to your laundry shop admin portal',
    placeholder: 'Username or Email',
    expectedRole: 'admin',
    logoAlt: 'Laundry shop administrator',
  },
  staff: {
    title: 'Staff',
    subtitle: 'Sign in to your store operations portal',
    placeholder: 'Username or Email',
    expectedRole: 'staff',
    logoAlt: 'Laundry shop staff',
  },
  customer: {
    title: 'Customer',
    subtitle: 'Sign in to track orders and payments',
    placeholder: 'Username or Email',
    expectedRole: 'customer',
    logoAlt: 'Customer portal',
  },
}

const roleKey = computed(() => normalizeRole(route.meta.loginRole) || 'admin')
const config = computed(() => ROLE_CONFIG[roleKey.value] || ROLE_CONFIG.admin)
const storeId = computed(() => (typeof route.query.storeId === 'string' ? route.query.storeId : ''))
const store = computed(() => (storeId.value ? getStore(storeId.value) : null))

onMounted(() => {
  ensureDemoCredentials()
})

function handleLogin() {
  errorMessage.value = ''
  ensureDemoCredentials()

  if (storeId.value && !store.value) {
    errorMessage.value = 'Store not found.'
    return
  }
  if (store.value?.status === 'suspended') {
    errorMessage.value = 'This store is suspended. Contact the platform administrator.'
    return
  }

  let session
  try {
    session = authenticate(identity.value, password.value)
  } catch (e) {
    errorMessage.value = e.message || 'Unable to sign in.'
    return
  }
  if (!session) {
    errorMessage.value = `Invalid username/email or password for ${config.value.title}.`
    return
  }

  const sessionRole = normalizeRole(session.role)
  if (sessionRole !== config.value.expectedRole) {
    errorMessage.value = `This page is for ${config.value.title} accounts only.`
    return
  }

  if (storeId.value && session.storeId !== storeId.value) {
    errorMessage.value = `That account does not belong to ${store.value?.name || 'this store'}.`
    return
  }

  localStorage.setItem('loggedInUser', JSON.stringify({ ...session, role: sessionRole }))

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  const home = homePathForRole(sessionRole)
  const target =
    redirect.startsWith('/') && !redirect.startsWith('//') && roleAllowedForPath(sessionRole, redirect)
      ? redirect
      : home

  window.location.assign(target)
}
</script>
