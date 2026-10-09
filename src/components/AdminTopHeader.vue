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

        <div>
          <p class="text-xs sm:text-sm text-slate-500">Welcome back, {{ firstName }}</p>
          <h1 class="text-lg sm:text-xl font-semibold text-slate-900">CrystalBubble Laundry Shop Admin</h1>
        </div>
      </div>

      <div class="flex items-center gap-3 sm:gap-4">
        <div class="hidden md:block text-right">
          <p class="text-sm font-semibold text-slate-800">{{ currentTime }}</p>
          <p class="text-xs text-slate-500">{{ currentDate }}</p>
        </div>

        <button
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
            v-if="notificationCount > 0"
            class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] leading-[18px] font-semibold"
          >
            {{ notificationCount > 9 ? '9+' : notificationCount }}
          </span>
        </button>

        <div class="relative">
          <button
            @click="showDropdown = !showDropdown"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 hover:bg-slate-50 transition"
          >
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold"
            >
              {{ initial }}
            </span>
            <span class="hidden sm:block text-sm font-medium text-slate-700">{{ firstName }}</span>
            <svg class="h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            v-if="showDropdown"
            class="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            <router-link
              to="/admin/profile"
              class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              @click="showDropdown = false"
            >
              My Profile
            </router-link>
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
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
    default: 'Admin User',
  },
  notificationCount: {
    type: Number,
    default: 0,
  },
})

defineEmits(['toggle-sidebar'])

const router = useRouter()
const showDropdown = ref(false)
const currentTime = ref('')
const currentDate = ref('')

const firstName = computed(() => (props.userName || 'Admin').trim().split(' ')[0])
const initial = computed(() => firstName.value.charAt(0).toUpperCase() || 'A')

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
  localStorage.removeItem('loggedInUser')
  router.push('/')
}

let timer = null
onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
