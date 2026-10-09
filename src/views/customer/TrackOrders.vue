<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Track orders</h1>
      <p class="text-slate-400 mt-1">Follow each stage from received through washing, drying, folding, QA, and pickup.</p>
    </div>

    <!-- Order Selection and Filtering -->
    <div class="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-slate-100">
      <div class="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div class="flex-1">
          <label class="block text-sm text-slate-500 mb-2">Select order to track</label>
          <select
            v-model="selectedId"
            class="w-full max-w-md border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400 bg-white"
          >
            <option value="">Choose an order...</option>
            <optgroup v-if="activeOrders.length" label="Active Orders">
              <option v-for="o in activeOrders" :key="o.id" :value="o.id">
                {{ o.code }} — {{ labels[o.status] || o.status }}
              </option>
            </optgroup>
            <optgroup v-if="completedOrders.length" label="Completed Orders">
              <option v-for="o in completedOrders" :key="o.id" :value="o.id">
                {{ o.code }} — {{ labels[o.status] || o.status }}
              </option>
            </optgroup>
          </select>
        </div>
        
        <div class="flex gap-2">
          <button
            v-for="filter in filterOptions"
            :key="filter.key"
            type="button"
            :class="[
              'px-4 py-2 rounded-xl text-sm font-medium transition filter-btn',
              viewFilter === filter.key ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600',
            ]"
            @click="viewFilter = filter.key"
            style="pointer-events: auto; cursor: pointer;"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Selected Order Details -->
    <div v-if="current" class="space-y-6">
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <div class="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h2 class="text-xl font-semibold text-slate-700">Order #{{ current.code }}</h2>
            <p class="text-sm text-slate-500">{{ formatDate(current.createdAt) }}</p>
          </div>
          <span
            class="px-3 py-1 rounded-full text-sm font-medium"
            :class="statusClass(current.status)"
          >
            {{ labels[current.status] || current.status }}
          </span>
        </div>

        <OrderStatusTimeline :status="current.status" :updated-at="current.updatedAt" />

        <div class="mt-6 pt-6 border-t border-slate-100">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Order Information</h3>
              <div class="space-y-3 text-sm">
                <div>
                  <span class="text-slate-500">Laundry shop:</span>
                  <p class="font-medium text-slate-700">{{ shopName(current) }}</p>
                </div>
                <div>
                  <span class="text-slate-500">Services:</span>
                  <p class="font-medium text-slate-700">{{ summarizeServices(current.services) }}</p>
                </div>
                <div>
                  <span class="text-slate-500">Weight:</span>
                  <p class="font-medium text-slate-700">{{ totalKg(current) }} kg</p>
                </div>
                <div>
                  <span class="text-slate-500">Total Amount:</span>
                  <p class="font-medium text-slate-700">{{ formatPhp(current.total) }}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Pickup Information</h3>
              <div class="space-y-3 text-sm">
                <div>
                  <span class="text-slate-500">Pickup Date:</span>
                  <p class="font-medium text-slate-700">{{ formatDateOnly(current.pickupDate) }}</p>
                </div>
                <div>
                  <span class="text-slate-500">Pickup Time:</span>
                  <p class="font-medium text-slate-700">{{ current.pickupTimeSlot }}</p>
                </div>
                <div>
                  <span class="text-slate-500">Branch:</span>
                  <p class="font-medium text-slate-700">{{ shopName(current) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div v-if="current.lineItems && current.lineItems.length" class="mt-6 pt-6 border-t border-slate-100">
          <h3 class="text-lg font-semibold text-slate-700 mb-4">Order Items</h3>
          <div class="space-y-2">
            <div
              v-for="item in current.lineItems"
              :key="item.id"
              class="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-lg text-sm"
            >
              <div>
                <p class="font-medium text-slate-700">{{ item.description }}</p>
                <p class="text-slate-500">{{ item.quantity }}x · {{ item.weightKg }}kg</p>
              </div>
              <span class="font-medium text-slate-700">{{ formatPhp(item.lineAmount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Orders State -->
    <div v-else class="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 text-center text-slate-500">
      <div v-if="!allOrders.length">
        No orders found. <router-link to="/customer/new-order" class="text-sky-600 font-medium">Create an order</router-link>
      </div>
      <div v-else>
        Please select an order to track from the dropdown above.
      </div>
    </div>

    <!-- Quick Access to All Orders -->
    <div v-if="viewFilter !== 'selected' && filteredOrders.length" class="mt-8">
      <h3 class="text-lg font-semibold text-slate-700 mb-4">
        {{ viewFilter === 'active' ? 'Active Orders' : viewFilter === 'completed' ? 'Completed Orders' : 'All Orders' }}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="order in filteredOrders.slice(0, 6)"
          :key="order.id"
          @click="selectedId = order.id"
          class="bg-white rounded-xl shadow-sm p-4 border border-slate-100 cursor-pointer hover:border-sky-300 hover:shadow-md transition action-btn"
          style="pointer-events: auto; cursor: pointer;"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-semibold text-slate-700">{{ order.code }}</h4>
            <button
              @click.stop="toggleOrderDetail(order.id)"
              class="px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition action-btn"
              style="pointer-events: auto; cursor: pointer;"
            >
              {{ expandedOrders.includes(order.id) ? 'Hide Details' : 'View Details' }}
            </button>
          </div>
          <p class="text-sm text-slate-500">{{ formatDateOnly(order.pickupDate) }}</p>
          <p class="text-sm font-medium text-slate-700">{{ formatPhp(order.total) }}</p>
        </div>
      </div>
      <div v-if="filteredOrders.length > 6" class="text-center mt-4">
        <router-link to="/customer/my-orders" class="text-sky-600 font-medium text-sm">
          View all orders →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import OrderStatusTimeline from '../../components/OrderStatusTimeline.vue'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { ORDER_STATUS_LABELS } from '../../constants/laundry.js'
import { summarizeServices, formatPhp, formatDateOnly, formatDate } from '../../utils/format.js'

const router = useRouter()
const route = useRoute()
const { state, db } = useLaundryDb()
const customerId = ref(null)
const selectedId = ref('')
const viewFilter = ref('selected')
const labels = ORDER_STATUS_LABELS

const filterOptions = [
  { key: 'selected', label: 'Selected' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' },
]

onMounted(() => {
  const raw = localStorage.getItem('loggedInUser')
  if (!raw) {
    router.push('/')
    return
  }
  customerId.value = JSON.parse(raw).id
  
  // Check if order ID is passed in query params
  if (route.query.order) {
    selectedId.value = route.query.order
  }
})

const allOrders = computed(() => {
  const id = customerId.value
  if (!id) return []
  return state.value.orders
    .filter((o) => o.customerId === id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
})

const activeOrders = computed(() => {
  return allOrders.value.filter((o) => o.status !== 'completed')
})

const completedOrders = computed(() => {
  return allOrders.value.filter((o) => o.status === 'completed')
})

const current = computed(() => {
  if (!selectedId.value) return null
  return state.value.orders.find((o) => o.id === selectedId.value) || null
})

const filteredOrders = computed(() => {
  if (viewFilter.value === 'active') return activeOrders.value
  if (viewFilter.value === 'completed') return completedOrders.value
  if (viewFilter.value === 'all') return allOrders.value
  return current.value ? [current.value] : []
})

function shopName(order) {
  return db.getOrderShopName(order)
}

function totalKg(order) {
  return order.lineItems.reduce((s, l) => s + (Number(l.weightKg) || 0), 0)
}

function statusClass(status) {
  if (status === 'completed') return 'bg-green-100 text-green-700'
  if (status === 'ready_for_pickup') return 'bg-emerald-100 text-emerald-700'
  if (status === 'washing' || status === 'drying') return 'bg-amber-100 text-amber-700'
  if (status === 'folding' || status === 'quality_check') return 'bg-blue-100 text-blue-700'
  return 'bg-sky-100 text-sky-700'
}

watch(
  activeOrders,
  (list) => {
    if (list.length && !selectedId.value && !route.query.order) {
      selectedId.value = list[0].id
    }
  },
  { immediate: true },
)
</script>
