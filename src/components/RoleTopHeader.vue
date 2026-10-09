<template>
  <header
    class="sticky top-0 z-30 h-20 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
  >
    <div class="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="$emit('toggle-sidebar')"
          class="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          aria-label="Toggle sidebar"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="min-w-0">
          <p class="text-xs sm:text-sm text-slate-500">Welcome back, {{ firstName }}</p>
          <div class="mt-0.5 flex items-center gap-2 min-w-0">
            <h1
              v-if="showStoreName"
              class="text-lg sm:text-xl font-semibold text-slate-900 truncate"
            >
              {{ storeName || 'CrystalBubble Laundry Shop' }}
            </h1>
            <span
              class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs sm:text-sm font-semibold text-blue-700"
            >
              {{ roleLabel }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 sm:gap-4">
        <div class="hidden md:block text-right">
          <p class="text-sm font-semibold text-slate-800">{{ currentTime }}</p>
          <p class="text-xs text-slate-500">{{ currentDate }}</p>
        </div>

        <div class="relative">
          <button
            data-notification-button
            @click="toggleNotifications"
            class="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            aria-label="Notifications"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
              />
            </svg>
            <span
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] leading-[18px] font-semibold"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- Notification Dropdown -->
          <div 
            v-if="showNotifications" 
            data-notification-area
            class="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg z-50"
          >
            <div class="p-4 border-b border-slate-200">
              <h3 class="text-sm font-semibold text-slate-900">Notifications</h3>
              <p class="text-xs text-slate-500 mt-1">{{ unreadCount }} unread notifications</p>
            </div>
            <div class="max-h-96 overflow-y-auto">
              <div v-if="notifications.length === 0" class="p-4 text-center text-slate-500 text-sm">
                No notifications
              </div>
              <div v-else>
                <div 
                  v-for="notification in notifications" 
                  :key="notification.id"
                  class="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  @click="markAsRead(notification.id)"
                >
                  <div class="flex items-start gap-3">
                    <div 
                      class="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      :class="notification.read ? 'bg-transparent' : 'bg-blue-600'"
                    ></div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-slate-900">{{ notification.title }}</p>
                      <p class="text-xs text-slate-600 mt-1">{{ notification.message }}</p>
                      <p class="text-xs text-slate-500 mt-2">{{ formatTime(notification.createdAt) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="p-3 border-t border-slate-200">
              <button 
                @click="markAllAsRead"
                class="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>

        <div class="relative">
          <button
            data-dropdown-button
            @click="toggleDropdown"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 hover:bg-slate-50 transition action-btn"
            style="pointer-events: auto !important; cursor: pointer !important; position: relative; z-index: 10000;"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
              {{ initial }}
            </span>
            <span class="hidden sm:block text-sm font-medium text-slate-700">{{ firstName }}</span>
            <svg class="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div v-if="showDropdown" data-dropdown-area class="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            <router-link
              :to="profilePath"
              class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              @click="showDropdown = false"
              style="pointer-events: auto; cursor: pointer; text-decoration: none;"
            >
              My Profile
            </router-link>
            <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 action-btn" style="pointer-events: auto !important; cursor: pointer !important; position: relative; z-index: 10000;">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  userName: {
    type: String,
    default: 'User',
  },
  roleLabel: {
    type: String,
    default: 'Workspace',
  },
  storeName: {
    type: String,
    default: '',
  },
  showStoreName: {
    type: Boolean,
    default: true,
  },
  profilePath: {
    type: String,
    default: '/profile',
  },
  notificationCount: {
    type: Number,
    default: 0,
  },
  alerts: {
    type: Array,
    default: null,
  },
})

defineEmits(['toggle-sidebar'])

const router = useRouter()
const showDropdown = ref(false)
const showNotifications = ref(false)
const currentTime = ref('')
const currentDate = ref('')

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) showNotifications.value = false
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) showDropdown.value = false
}

const fallbackNotifications = ref([
  {
    id: 1,
    title: 'New Order Received',
    message: 'Order CB-1005 has been placed by John Doe',
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: 2,
    title: 'Order Status Update',
    message: 'Order CB-1003 is now ready for pickup',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: 3,
    title: 'Payment Received',
    message: 'Payment of PHP 450 received for order CB-1002',
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
  },
  {
    id: 4,
    title: 'Low Stock Alert',
    message: 'Detergent stock is running low (5 units remaining)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
  },
])

const notifications = computed(() =>
  Array.isArray(props.alerts) ? props.alerts : fallbackNotifications.value,
)

const unreadCount = computed(() => {
  const fromList = notifications.value.filter((n) => !n.read).length
  if (Array.isArray(props.alerts)) return fromList
  return props.notificationCount || fromList
})

const firstName = computed(() => (props.userName || 'User').trim().split(' ')[0])
const initial = computed(() => firstName.value.charAt(0).toUpperCase() || 'U')

function updateDateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  currentDate.value = now.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function handleLogout() {
  try {
    console.log('Logout button clicked')
    // Clear all session data
    localStorage.removeItem('loggedInUser')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userSession')
    console.log('Session cleared, redirecting to login')
    // Force redirect to login page
    router.push('/').then(() => {
      console.log('Redirect to login completed')
    }).catch(err => {
      console.error('Redirect error:', err)
      // Fallback redirect
      window.location.href = '/'
    })
  } catch (error) {
    console.error('Logout error:', error)
    // Force logout even if there's an error
    localStorage.clear()
    window.location.href = '/'
  }
}

function formatTime(date) {
  const now = new Date()
  const parsed = date instanceof Date ? date : new Date(date)
  const diff = now - parsed
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return `${days} day${days > 1 ? 's' : ''} ago`
}

function markAsRead(notificationId) {
  const list = Array.isArray(props.alerts) ? props.alerts : fallbackNotifications.value
  const notification = list.find((n) => n.id === notificationId)
  if (notification) notification.read = true
}

function markAllAsRead() {
  const list = Array.isArray(props.alerts) ? props.alerts : fallbackNotifications.value
  list.forEach((notification) => {
    notification.read = true
  })
  showNotifications.value = false
}

// Close dropdowns when clicking outside
onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
  
  const handleClickOutside = (event) => {
    // Close notifications if clicking outside notification area
    const notificationInside = event.target.closest('[data-notification-area],[data-notification-button]')
    if (!notificationInside && showNotifications.value) {
      showNotifications.value = false
    }
    
    // Close user dropdown if clicking outside dropdown area
    const dropdownInside = event.target.closest('[data-dropdown-area],[data-dropdown-button]')
    if (!dropdownInside && showDropdown.value) {
      showDropdown.value = false
    }
  }
  const handleEscape = (event) => {
    if (event.key !== 'Escape') return
    showNotifications.value = false
    showDropdown.value = false
  }
  
  // Close notifications on route navigation
  const handleRouteChange = () => {
    showNotifications.value = false
    showDropdown.value = false
  }
  
  // Add event listeners
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
  
  // Listen for navigation changes
  window.addEventListener('popstate', handleRouteChange)
  
  // Store cleanup functions
  window._notificationCleanup = () => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscape)
    window.removeEventListener('popstate', handleRouteChange)
  }
})

let timer = null
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  
  // Clean up event listeners
  if (window._notificationCleanup) {
    window._notificationCleanup()
    delete window._notificationCleanup
  }
})
</script>
