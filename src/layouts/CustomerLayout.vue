<template>
  <div class="h-screen w-screen overflow-hidden flex bg-slate-100">
    <!-- Sidebar -->
    <CustomerSidebar />

    <!-- Right Side -->
    <div class="flex-1 flex flex-col bg-slate-50">
      <!-- Header -->
      <AppHeader :userName="loggedInUser.name" />

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CustomerSidebar from '../components/CustomerSidebar.vue'
import AppHeader from '../components/AppHeader.vue'

const loggedInUser = ref({
  name: 'User',
})

onMounted(() => {
  const storedUser = localStorage.getItem('loggedInUser')

  if (storedUser) {
    loggedInUser.value = JSON.parse(storedUser)
  }
})
</script>