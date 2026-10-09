<template>
  <div>
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-semibold text-slate-700">My orders</h1>
          <p class="text-slate-400 mt-1">View and track all your laundry orders in one place.</p>
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <div
            class="w-2 h-2 rounded-full"
            :class="isPolling ? 'bg-green-500 animate-pulse' : 'bg-slate-300'"
          />
          <span>{{ isPolling ? 'Live updates' : 'Offline' }}</span>
          <button
            @click="forceUpdate"
            class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition action-btn"
            title="Refresh orders"
            style="pointer-events: auto; cursor: pointer;"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-5 mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <input
        v-model="search"
        type="text"
        placeholder="Search order code..."
        class="w-full md:w-80 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
      />

      <div class="flex flex-wrap gap-3">
        <button
          v-for="opt in filterOptions"
          :key="opt.key"
          :class="[
            'px-4 py-2 rounded-xl text-sm font-medium transition filter-btn',
            filter === opt.key ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600',
          ]"
          @click="filter = opt.key"
          style="pointer-events: auto; cursor: pointer;"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- View Toggle -->
    <div class="mb-6 flex justify-end">
      <div class="inline-flex rounded-lg border border-slate-200 bg-white p-1">
        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition tab-btn',
            viewMode === 'cards' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:text-slate-800',
          ]"
          @click="viewMode = 'cards'"
          style="pointer-events: auto; cursor: pointer;"
        >
          Cards
        </button>
        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-md text-sm font-medium transition tab-btn',
            viewMode === 'timeline' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:text-slate-800',
          ]"
          @click="viewMode = 'timeline'"
          style="pointer-events: auto; cursor: pointer;"
        >
          Timeline
        </button>
      </div>
    </div>

    <!-- Cards View -->
    <div v-if="viewMode === 'cards'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="o in filteredOrders"
        :key="o.id"
        class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <!-- Order Header -->
        <div class="p-6 border-b border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-slate-700">Order #{{ o.code }}</h2>
            <span
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="statusClass(o.status)"
            >
              {{ labels[o.status] || o.status }}
            </span>
          </div>

          <div class="space-y-2 text-sm text-slate-500">
            <p>
              <span class="font-medium text-slate-700">Shop:</span>
              {{ shopName(o) }}
            </p>
            <p>
              <span class="font-medium text-slate-700">Services:</span>
              {{ summarizeServices(o.services) }}
            </p>
            <p>
              <span class="font-medium text-slate-700">Weight:</span>
              {{ totalKg(o) }} kg
            </p>
            <p>
              <span class="font-medium text-slate-700">Pickup:</span>
              {{ formatDateOnly(o.pickupDate) }} · {{ o.pickupTimeSlot }}
            </p>
            <p><span class="font-medium text-slate-700">Total:</span> {{ formatPhp(o.total) }}</p>
          </div>
        </div>

        <!-- Inline Status Progress -->
        <div class="p-6 bg-slate-50">
          <div class="mb-3">
            <h3 class="text-sm font-semibold text-slate-700 mb-2">Order Progress</h3>
            <div class="flex items-center gap-2">
              <div
                v-for="(step, index) in getStatusSteps(o.status)"
                :key="step.status"
                class="flex items-center"
              >
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors"
                  :class="step.completed ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'
                "
                >
                  {{ index + 1 }}
                </div>
                <div
                  v-if="index < getStatusSteps(o.status).length - 1"
                  class="w-8 h-0.5 transition-colors"
                  :class="getStatusSteps(o.status)[index + 1].completed ? 'bg-sky-500' : 'bg-slate-200'"
                />
              </div>
            </div>
            <div class="flex justify-between mt-2 text-xs text-slate-500">
              <span>Received</span>
              <span>Completed</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              @click="toggleOrderDetail(o.id)"
              class="px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition action-btn"
              style="pointer-events: auto; cursor: pointer;"
            >
              {{ expandedOrders.includes(o.id) ? 'Hide Details' : 'View Details' }}
            </button>
            <router-link
              :to="`/customer/track-orders?order=${o.id}`"
              class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
            >
              Full Tracking
            </router-link>
          </div>
        </div>

        <!-- Expandable Details -->
        <div
          v-if="expandedOrders.includes(o.id)"
          class="border-t border-slate-100 p-6 bg-white"
        >
          <h3 class="text-sm font-semibold text-slate-700 mb-3">Order Details</h3>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-slate-500">Created:</span>
                <p class="font-medium text-slate-700">{{ formatDate(o.createdAt) }}</p>
              </div>
              <div>
                <span class="text-slate-500">Last Updated:</span>
                <p class="font-medium text-slate-700">{{ formatDate(o.updatedAt) }}</p>
              </div>
            </div>
            <div>
              <span class="text-slate-500 text-sm">Items:</span>
              <div class="mt-2 space-y-1">
                <div
                  v-for="item in o.lineItems"
                  :key="item.id"
                  class="flex justify-between text-sm py-2 border-b border-slate-100"
                >
                  <span class="text-slate-700">{{ item.description }}</span>
                  <span class="text-slate-600">{{ item.quantity }}x · {{ item.weightKg }}kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p v-if="!filteredOrders.length" class="text-slate-500 col-span-full text-center py-12">
        No orders match your filters.
      </p>
    </div>

    <!-- Timeline View -->
    <div v-else class="space-y-6">
      <div
        v-for="o in filteredOrders"
        :key="o.id"
        class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100"
      >
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-semibold text-slate-700">Order #{{ o.code }}</h2>
            <p class="text-sm text-slate-500">{{ formatDate(o.createdAt) }}</p>
          </div>
          <span
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="statusClass(o.status)"
          >
            {{ labels[o.status] || o.status }}
          </span>
        </div>

        <OrderStatusTimeline :status="o.status" :updated-at="o.updatedAt" compact />

        <div class="mt-6 pt-6 border-t border-slate-100">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-slate-500">Shop</span>
              <p class="font-medium text-slate-700">{{ shopName(o) }}</p>
            </div>
            <div>
              <span class="text-slate-500">Services</span>
              <p class="font-medium text-slate-700">{{ summarizeServices(o.services) }}</p>
            </div>
            <div>
              <span class="text-slate-500">Weight</span>
              <p class="font-medium text-slate-700">{{ totalKg(o) }} kg</p>
            </div>
            <div>
              <span class="text-slate-500">Pickup</span>
              <p class="font-medium text-slate-700">{{ formatDateOnly(o.pickupDate) }}</p>
            </div>
            <div>
              <span class="text-slate-500">Total</span>
              <p class="font-medium text-slate-700">{{ formatPhp(o.total) }}</p>
            </div>
          </div>
        </div>
      </div>

      <p v-if="!filteredOrders.length" class="text-slate-500 text-center py-12">
        No orders match your filters.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import OrderStatusTimeline from '../../components/OrderStatusTimeline.vue'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { useRealTimeUpdates } from '../../composables/useRealTimeUpdates.js'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from '../../constants/laundry.js'
import { summarizeServices, formatPhp, formatDateOnly, formatDate } from '../../utils/format.js'

const router = useRouter()
const { state, db } = useLaundryDb()
const { isPolling, lastUpdate, forceUpdate } = useRealTimeUpdates()
const customerId = ref(null)
const search = ref('')
const filter = ref('all')
const viewMode = ref('cards')
const expandedOrders = ref([])

const labels = ORDER_STATUS_LABELS
const statusSteps = ORDER_STATUS_STEPS

const filterOptions = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending Pickup' },
]

onMounted(() => {
  const raw = localStorage.getItem('loggedInUser')
  if (!raw) {
    router.push('/')
    return
  }
  customerId.value = JSON.parse(raw).id
})

const myOrders = computed(() => {
  const id = customerId.value
  if (!id) return []
  return state.value.orders
    .filter((o) => o.customerId === id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
})

const filteredOrders = computed(() => {
  let list = myOrders.value
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((o) => o.code.toLowerCase().includes(q))
  
  if (filter.value === 'active') {
    list = list.filter((o) => o.status !== 'completed' && o.status !== 'ready_for_pickup')
  } else if (filter.value === 'completed') {
    list = list.filter((o) => o.status === 'completed')
  } else if (filter.value === 'pending') {
    list = list.filter((o) => o.status === 'ready_for_pickup')
  }
  
  return list
})

function shopName(order) {
  return db.getOrderShopName(order)
}

function totalKg(o) {
  return o.lineItems.reduce((s, l) => s + (Number(l.weightKg) || 0), 0)
}

function statusClass(status) {
  if (status === 'completed') return 'bg-green-100 text-green-700'
  if (status === 'ready_for_pickup') return 'bg-emerald-100 text-emerald-700'
  if (status === 'washing' || status === 'drying') return 'bg-amber-100 text-amber-700'
  if (status === 'folding' || status === 'quality_check') return 'bg-blue-100 text-blue-700'
  return 'bg-sky-100 text-sky-700'
}

function getStatusSteps(currentStatus) {
  const currentIndex = statusSteps.findIndex(step => step.status === currentStatus)
  return statusSteps.map((step, index) => ({
    ...step,
    completed: index <= currentIndex
  }))
}

function toggleOrderDetail(orderId) {
  const index = expandedOrders.value.indexOf(orderId)
  if (index > -1) {
    expandedOrders.value.splice(index, 1)
  } else {
    expandedOrders.value.push(orderId)
  }
}
</script>
