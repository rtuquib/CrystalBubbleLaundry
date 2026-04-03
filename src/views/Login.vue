<template>
  <div class="h-screen overflow-hidden bg-sky-500 flex items-center justify-center px-4">
    <div class="relative w-full max-w-[350px]">
      <div class="absolute left-1/2 -top-10 -translate-x-1/2 z-20 w-20 h-20 rounded-full bg-[#f2f2f2] shadow-lg flex items-center justify-center">
        <img
    src="../assets/logo.svg"
    alt="CrystalBubble Logo"
    class="w-19 h-19 object-contain"
  />
      </div>

      <div class="bg-[#f8f8f8] rounded-[32px] shadow-2xl pt-16 pb-8 px-7">
        <h1 class="text-center text-3xl font-light text-gray-400 mb-6">Login</h1>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="relative">
            <span class="absolute inset-y-0 left-4 flex items-center text-gray-400">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5Z"/>
              </svg>
            </span>

            <input
              v-model="username"
              type="text"
              placeholder="Username..."
              class="w-full rounded-full bg-[#ececec] py-3 pl-11 pr-4 text-sm text-gray-500 placeholder-gray-400 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div class="relative">
            <span class="absolute inset-y-0 left-4 flex items-center text-gray-400">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                <path d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V6Z"/>
              </svg>
            </span>

            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password..."
              class="w-full rounded-full bg-[#ececec] py-3 pl-11 pr-11 text-sm text-gray-500 placeholder-gray-400 outline-none focus:ring-2 focus:ring-sky-400"
            />

            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-sky-500"
            >
              <svg
                v-if="!showPassword"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-4 h-4"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>

              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-4 h-4"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.477 10.48A2 2 0 0 0 13.52 13.52"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.88 5.09A10.94 10.94 0 0 1 12 5c4.48 0 8.27 2.94 9.54 7a10.94 10.94 0 0 1-4.24 5.27"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.23 6.23A10.94 10.94 0 0 0 2.46 12C3.73 16.06 7.52 19 12 19c1.61 0 3.14-.38 4.5-1.05"/>
              </svg>
            </button>
          </div>

          <button
            type="submit"
            class="w-full rounded-full bg-sky-500 py-3 text-white text-xl font-light shadow-md transition hover:bg-sky-600"
          >
            Sign in
          </button>

          <p class="text-center text-sm text-gray-300">
            Forgot your password?
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const showPassword = ref(false)

const handleLogin = () => {
  console.log(username.value, password.value)
}
</script>