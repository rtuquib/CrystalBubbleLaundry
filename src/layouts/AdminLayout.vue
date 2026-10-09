<template>
  <div class="min-h-screen bg-slate-100">
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
      @click="isSidebarOpen = false"
    />

    <div class="fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 lg:translate-x-0" :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">
      <RoleSidebar
        :panelLabel="ui.panelLabel"
        :navItems="navItems"
        @close="isSidebarOpen = false"
      />
    </div>

    <div class="min-h-screen lg:pl-72 flex flex-col">
      <RoleTopHeader
        :userName="loggedInUser.name"
        :roleLabel="ui.roleLabel"
        :storeName="loggedInUser.storeName || ''"
        profilePath="/admin/profile"
        :notificationCount="notificationCount"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      />

      <main class="flex-1 p-4 sm:p-6 lg:p-8 main-content relative z-10">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import RoleSidebar from '../components/RoleSidebar.vue'
import RoleTopHeader from '../components/RoleTopHeader.vue'
import { ROLE_UI } from '../constants/roleUi.js'
import { useLaundryDb } from '../composables/useLaundryDb.js'
import { getAccountById, accountToSession, getTenantState, getUnreadMessageCount } from '../services/laundryDb.js'

const { tick } = useLaundryDb()
const ui = ROLE_UI.admin
const loggedInUser = ref({ name: 'Admin User' })
const isSidebarOpen = ref(false)

const navItems = computed(() => {
  tick.value
  return ui.navItems.map((item) =>
    item.to === '/admin/messaging'
      ? {
          ...item,
          badge: loggedInUser.value.id ? getUnreadMessageCount(loggedInUser.value.id) : 0,
        }
      : item,
  )
})

const notificationCount = computed(() => {
  tick.value
  const state = getTenantState()
  const pendingPayments = state.orders.filter((o) => o.status !== 'completed').length
  const lowStockItems = state.inventory.filter((item) => item.quantity <= item.lowStockThreshold).length
  const unreadMessages = loggedInUser.value.id ? getUnreadMessageCount(loggedInUser.value.id) : 0
  return pendingPayments + lowStockItems + unreadMessages
})

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