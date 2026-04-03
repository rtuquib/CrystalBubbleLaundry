<template>
  <header class="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
    
    <!-- Left Side -->
    <div>
      <p class="text-sm text-slate-400">Welcome,</p>
      <h2 class="text-2xl font-semibold text-slate-700">{{ userName }}</h2>
    </div>

    <!-- Right Side -->
    <div class="flex items-center gap-6 relative">
      <!-- Time and Date -->
      <div class="text-right">
        <p class="text-lg font-semibold text-slate-700">{{ currentTime }}</p>
        <p class="text-sm text-slate-400">{{ currentDate }}</p>
      </div>

      <!-- Profile Circle -->
      <div class="relative">
        <button
          @click="toggleDropdown"
          class="w-11 h-11 rounded-full bg-sky-500 text-white flex items-center justify-center font-semibold uppercase shadow-md hover:bg-sky-600 transition"
        >
          {{ initial }}
        </button>

        <!-- Dropdown -->
        <div
          v-if="showDropdown"
          class="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50"
        >
          <button
            @click="logout"
            class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  userName: {
    type: String,
    default: 'User',
  },
})

const showDropdown = ref(false)
const currentTime = ref('')
const currentDate = ref('')

const initial = computed(() => {
  return props.userName ? props.userName.charAt(0) : 'U'
})

const updateDateTime = () => {
  const now = new Date()

  currentTime.value = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  currentDate.value = now.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const logout = () => {
  alert('Logout clicked')
}

let timer = null

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>