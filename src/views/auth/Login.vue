<template>
  <div class="h-screen overflow-hidden bg-sky-500 flex items-center justify-center px-4">
    <div class="relative w-full max-w-[350px]">
      <div class="absolute left-1/2 -top-10 -translate-x-1/2 z-20 w-20 h-20 rounded-full bg-[#f2f2f2] shadow-lg flex items-center justify-center">
        <img
          src="../../assets/logo.svg"
          alt="CrystalBubble Logo"
          class="w-16 h-16 object-contain"
        />
      </div>

      <div class="bg-[#f8f8f8] rounded-[32px] shadow-2xl pt-16 pb-8 px-7">
        <h1 class="text-center text-3xl font-semibold text-gray-400 mb-6">
          Crystal Bubble Laundry
        </h1>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="relative">
            <input
              v-model="username"
              type="text"
              placeholder="Username..."
              class="w-full rounded-full bg-[#ececec] py-3 px-4 text-sm text-gray-500 placeholder-gray-400 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div class="relative">
            <input
              v-model="password"
              type="password"
              placeholder="Password..."
              class="w-full rounded-full bg-[#ececec] py-3 px-4 text-sm text-gray-500 placeholder-gray-400 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <button
            type="submit"
            class="w-full rounded-full bg-sky-500 py-3 text-white text-xl font-medium shadow-md transition hover:bg-sky-600"
          >
            Log in
          </button>

          <p v-if="errorMessage" class="text-center text-sm text-red-500">
            {{ errorMessage }}
          </p>

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
import { useRouter } from 'vue-router'
import { users } from '../../data/users'

const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = () => {
  const foundUser = users.find(
    (user) =>
      user.username === username.value &&
      user.password === password.value
  )

  if (!foundUser) {
    errorMessage.value = 'Invalid username or password'
    return
  }

  localStorage.setItem('loggedInUser', JSON.stringify(foundUser))

  if (foundUser.role === 'customer') {
    router.push('/customer/dashboard')
  } else if (foundUser.role === 'staff') {
    router.push('/staff/dashboard')
  } else if (foundUser.role === 'admin') {
    router.push('/admin/dashboard')
  }
}
</script>