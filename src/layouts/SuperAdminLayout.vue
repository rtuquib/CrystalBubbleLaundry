<template>
  <div class="min-h-screen bg-slate-100">
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
      @click="isSidebarOpen = false"
    />

    <div
      class="fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 lg:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <RoleSidebar
        :brandTitle="ui.brandTitle || 'Laundry MS'"
        :panelLabel="ui.panelLabel"
        :navItems="ui.navItems"
        @close="isSidebarOpen = false"
      />
    </div>

    <div class="min-h-screen lg:pl-72 flex flex-col">
      <RoleTopHeader
        :userName="loggedInUser.name"
        :roleLabel="ui.roleLabel"
        storeName="Laundry Management System"
        profilePath="/super-admin/dashboard"
        :notificationCount="0"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      />

      <main class="flex-1 p-4 sm:p-6 lg:p-8 main-content relative z-10">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import RoleSidebar from '../components/RoleSidebar.vue'
import RoleTopHeader from '../components/RoleTopHeader.vue'
import { ROLE_UI } from '../constants/roleUi.js'
import { useLaundryDb } from '../composables/useLaundryDb.js'
import { getAccountById, accountToSession } from '../services/laundryDb.js'

const { tick } = useLaundryDb()
const ui = ROLE_UI.super_admin
const loggedInUser = ref({ name: 'Super Admin' })
const isSidebarOpen = ref(false)

function loadUser() {
  const storedUser = localStorage.getItem('loggedInUser')
  if (!storedUser) return
  const parsed = JSON.parse(storedUser)
  const acc = getAccountById(parsed.id)
  loggedInUser.value = acc ? accountToSession(acc) : parsed
}

onMounted(loadUser)
watch(tick, loadUser)
</script>
