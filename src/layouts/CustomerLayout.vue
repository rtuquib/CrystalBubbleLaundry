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
        :panelLabel="ui.panelLabel"
        :navItems="navItems"
        @close="isSidebarOpen = false"
      />
    </div>

    <div class="min-h-screen lg:pl-72 flex flex-col">
      <RoleTopHeader
        :userName="loggedInUser.name || 'Customer'"
        :roleLabel="ui.roleLabel"
        :showStoreName="false"
        storeName=""
        profilePath="/customer/profile"
        :notificationCount="notificationCount"
        :alerts="customerAlerts"
        @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
      />

      <main class="flex-1 p-4 sm:p-5 lg:p-6 main-content relative z-10">
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
import {
  getAccountById,
  accountToSession,
  getTenantState,
  getUnreadMessageCount,
  getOrderShopName,
} from '../services/laundryDb.js'

const { tick } = useLaundryDb()
const ui = ROLE_UI.customer
const loggedInUser = ref({ name: 'User' })
const isSidebarOpen = ref(false)

const navItems = computed(() => {
  tick.value
  return ui.navItems.map((item) =>
    item.to === '/customer/messaging'
      ? {
          ...item,
          badge: loggedInUser.value.id ? getUnreadMessageCount(loggedInUser.value.id) : 0,
        }
      : item,
  )
})

const customerAlerts = computed(() => {
  tick.value
  const accountId = loggedInUser.value.id
  if (!accountId) return []
  const state = getTenantState()
  const alerts = []
  for (const order of state.orders) {
    if (order.status !== 'ready_for_pickup') continue
    alerts.push({
      id: `ready-${order.id}`,
      title: 'Ready for pickup',
      message: `Order ${order.code} is ready at ${getOrderShopName(order)}.`,
      createdAt: new Date(order.updatedAt || order.createdAt),
      read: false,
    })
  }
  const unreadMessages = getUnreadMessageCount(accountId)
  if (unreadMessages > 0) {
    alerts.push({
      id: 'unread-messages',
      title: 'New messages',
      message: `You have ${unreadMessages} unread message${unreadMessages === 1 ? '' : 's'}.`,
      createdAt: new Date(),
      read: false,
    })
  }
  return alerts.slice(0, 8)
})

const notificationCount = computed(() => customerAlerts.value.filter((n) => !n.read).length)

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