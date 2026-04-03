<template>
  <aside class="w-64 h-screen bg-sky-700 text-white flex flex-col shadow-xl">
    <!-- Brand -->
    <div class="h-20 border-b border-white/20 flex items-center justify-center px-4">
      <div class="text-center">
        <div class="text-xl font-semibold">CrystalBubble</div>
        <div class="text-xs text-sky-100">Staff Panel</div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-2">
      <router-link
        to="/staff/dashboard"
        active-class="bg-white/20"
        class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition"
      >
        <div>🏠</div>
        <div>Dashboard</div>
      </router-link>

      <router-link
        to="/staff/assigned-orders"
        active-class="bg-white/20"
        class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition"
      >
        <div>🧺</div>
        <div>Assigned Orders</div>
      </router-link>

      <router-link
        to="/staff/laundry-queue"
        active-class="bg-white/20"
        class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition"
      >
        <div>🫧</div>
        <div>Laundry Queue</div>
      </router-link>

      <router-link
        to="/staff/release-orders"
        active-class="bg-white/20"
        class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition"
      >
        <div>📦</div>
        <div>Release Orders</div>
      </router-link>

      <router-link
        to="/staff/profile"
        active-class="bg-white/20"
        class="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition"
      >
        <div>👤</div>
        <div>Profile</div>
      </router-link>
    </nav>

    <!-- Logout -->
    <div class="p-4 border-t border-white/20">
      <button
        @click="handleLogout"
        class="w-full rounded-xl bg-white text-sky-700 py-3 text-sm font-semibold hover:bg-sky-100 transition"
      >
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('loggedInUser')
  router.push('/')
}
</script>