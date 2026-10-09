<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Order history</h1>
      <p class="text-slate-400 mt-1">Completed orders and past service details.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <input
          v-model="search"
          type="text"
          placeholder="Search order code or services..."
          class="w-full md:w-80 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div class="space-y-4">
        <div
          v-for="o in filtered"
          :key="o.id"
          class="border border-slate-100 rounded-2xl p-5"
        >
          <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h3 class="font-semibold text-slate-700">Order #{{ o.code }}</h3>
            <span class="px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">Completed</span>
          </div>
          <p class="text-sm text-slate-500">
            {{ shopName(o) }} · {{ summarizeServices(o.services) }} ·
            {{ formatDateOnly(o.updatedAt || o.createdAt) }} · {{ formatPhp(o.total) }}
          </p>
        </div>
        <p v-if="!filtered.length" class="text-center text-slate-400 py-8">No completed orders yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { summarizeServices } from '../../utils/format.js'
import { formatPhp, formatDateOnly } from '../../utils/format.js'

const router = useRouter()
const { state, db } = useLaundryDb()
const customerId = ref(null)
const search = ref('')

function shopName(order) {
  return db.getOrderShopName(order)
}

onMounted(() => {
  const raw = localStorage.getItem('loggedInUser')
  if (!raw) {
    router.push('/')
    return
  }
  customerId.value = JSON.parse(raw).id
})

const completed = computed(() => {
  const id = customerId.value
  if (!id) return []
  return state.value.orders
    .filter((o) => o.customerId === id && o.status === 'completed')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return completed.value
  return completed.value.filter(
    (o) =>
      o.code.toLowerCase().includes(q) ||
      summarizeServices(o.services).toLowerCase().includes(q),
  )
})
</script>
