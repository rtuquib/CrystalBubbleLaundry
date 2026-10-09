<template>
  <div class="space-y-4 sm:space-y-5">
    <div class="bg-sky-500 text-white rounded-2xl px-5 py-4 sm:px-6 shadow-sm">
      <h1 class="text-xl sm:text-2xl font-semibold">Customer Dashboard</h1>
      <p class="text-sm text-sky-100 mt-1 max-w-3xl">
        Welcome to CrystalBubble Laundry Shop. Track your orders and manage your account here.
      </p>
    </div>

    <ShopPicker
      title="Preferred Laundry Shop"
      description="Choose the branch for your next order. You can change this anytime before you submit."
      :shops="shops"
      :selected-id="preferredStoreId"
      :loading="shopsLoading"
      :error="shopsError"
      hint="Please choose a laundry shop before placing an order."
      @select="onSelectShop"
    />
    <p v-if="shopMessage" class="text-sm text-red-600">{{ shopMessage }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-1">Active orders</div>
        <div class="text-2xl font-bold text-sky-500">{{ stats.active }}</div>
      </div>
      <div class="bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-1">Ready for pickup</div>
        <div class="text-2xl font-bold text-green-500">{{ stats.ready }}</div>
      </div>
      <div class="bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-1">Outstanding balance</div>
        <div class="text-2xl font-bold text-amber-500">{{ formatPhp(stats.balance) }}</div>
      </div>
      <div class="bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-slate-100">
        <div class="text-sm text-slate-400 mb-1">Completed orders</div>
        <div class="text-2xl font-bold text-sky-600">{{ stats.completed }}</div>
      </div>
    </div>

    <section class="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-slate-900">Popular Services</h2>
        <p class="text-sm text-slate-500 mt-1">
          Choose a frequently selected package and start a new order in one click.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <article
          v-for="service in popularServiceCards"
          :key="service.code"
          class="rounded-2xl border border-slate-200 p-4 flex flex-col"
          :class="service.cardTone"
        >
          <div class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl" :class="service.accentBadge">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
              <path stroke-linecap="round" stroke-linejoin="round" :d="service.iconPath" />
            </svg>
          </div>
          <h3 class="text-base font-semibold text-slate-900">{{ service.label }}</h3>
          <p class="mt-1 text-sm text-slate-500 flex-1">{{ service.description }}</p>
          <div class="mt-4 flex items-center justify-between gap-3">
            <div>
              <p class="text-[11px] uppercase tracking-wide text-slate-400">Usage count</p>
              <p class="text-sm font-semibold text-slate-800">{{ service.usageCount }}</p>
            </div>
            <button
              type="button"
              class="rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-700 action-btn"
              @click="selectPopularService(service.code)"
            >
              Select Service
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
      <div class="mb-4">
        <h2 class="text-lg font-semibold text-slate-900">Recent Laundry Orders</h2>
        <p class="text-sm text-slate-500 mt-1">Latest transactions and the shop that handled each order</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-sm">
          <thead>
            <tr class="text-left text-slate-500 border-b border-slate-100">
              <th class="py-3 pr-4 font-semibold">Order ID</th>
              <th class="py-3 pr-4 font-semibold">Shop</th>
              <th class="py-3 pr-4 font-semibold">Service Type</th>
              <th class="py-3 pr-4 font-semibold">Amount</th>
              <th class="py-3 pr-4 font-semibold">Payment Status</th>
              <th class="py-3 pr-4 font-semibold">Order Status</th>
              <th class="py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in recentOrders"
              :key="order.id"
              class="border-b border-slate-100 last:border-b-0"
            >
              <td class="py-3 pr-4 font-semibold text-slate-800">{{ order.code }}</td>
              <td class="py-3 pr-4 text-slate-700">{{ order.shopName }}</td>
              <td class="py-3 pr-4 text-slate-700">{{ order.serviceType }}</td>
              <td class="py-3 pr-4 text-slate-700">{{ formatPhp(order.amount) }}</td>
              <td class="py-3 pr-4">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="paymentStatusClass(order.paymentStatus)"
                >
                  {{ toTitleCase(order.paymentStatus) }}
                </span>
              </td>
              <td class="py-3 pr-4">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="orderStatusClass(order.orderStatus)"
                >
                  {{ formatOrderStatus(order.orderStatus) }}
                </span>
              </td>
              <td class="py-3 text-slate-700">{{ formatDate(order.date) }}</td>
            </tr>
            <tr v-if="recentOrders.length === 0">
              <td colspan="7" class="py-8 text-center text-slate-500">
                No recent orders found yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ShopPicker from '../../components/ShopPicker.vue'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { usePreferredStore } from '../../composables/usePreferredStore.js'
import { useToast } from '../../composables/useToast.js'
import { formatPhp, formatDate, summarizeServices } from '../../utils/format.js'

const router = useRouter()
const toast = useToast()
const { state, db } = useLaundryDb()
const { shops, shopsLoading, shopsError, preferredStoreId, loadShops, selectShop } = usePreferredStore()
const customerId = ref(null)
const shopMessage = ref('')

const POPULAR_SERVICE_ORDER = ['wash_fold', 'wash_dry', 'ironing', 'full_service']

const POPULAR_SERVICE_LOOKUP = {
  wash_fold: {
    label: 'Wash & Fold',
    description: 'Everyday garments washed and neatly folded for pickup.',
    iconPath: 'M6 4h12l1 4v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8l1-4Zm3 6h6M9 13h6M9 16h4',
    accentBadge: 'bg-sky-100 text-sky-700',
    cardTone: 'bg-sky-50/70',
  },
  wash_dry: {
    label: 'Wash & Dry',
    description: 'Quick wash cycle with complete machine drying service.',
    iconPath: 'M5 4h14v16H5zM8 8h8M12 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    accentBadge: 'bg-indigo-100 text-indigo-700',
    cardTone: 'bg-indigo-50/70',
  },
  ironing: {
    label: 'Ironing',
    description: 'Wrinkle-free finishing for uniforms and delicate clothing.',
    iconPath: 'M4 14h10c2 0 3-1 3-3V8l3 4v6H4v-4Zm4-2h5M7 18v2m5-2v2',
    accentBadge: 'bg-amber-100 text-amber-700',
    cardTone: 'bg-amber-50/70',
  },
  full_service: {
    label: 'Full Service',
    description: 'Complete package: wash, dry, fold, and iron in one plan.',
    iconPath: 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Zm-3 9 2 2 4-4',
    accentBadge: 'bg-emerald-100 text-emerald-700',
    cardTone: 'bg-emerald-50/70',
  },
}

onMounted(() => {
  const raw = localStorage.getItem('loggedInUser')
  if (!raw) {
    router.push('/')
    return
  }
  customerId.value = JSON.parse(raw).id
  loadShops()
})

function onSelectShop(storeId) {
  shopMessage.value = ''
  try {
    const account = selectShop(storeId)
    const shop = shops.value.find((s) => s.id === storeId)
    toast.push(`Preferred shop set to ${shop?.name || account?.preferredStoreId || 'selected branch'}.`)
  } catch (e) {
    shopMessage.value = e.message || 'Unable to select this laundry shop.'
  }
}

const customerOrders = computed(() => {
  const id = customerId.value
  if (!id) return []
  return state.value.orders.filter((o) => o.customerId === id)
})

const usageOrders = computed(() => {
  const selected = preferredStoreId.value
  if (!selected) return customerOrders.value
  return customerOrders.value.filter((o) => o.storeId === selected)
})

const popularServiceCards = computed(() => {
  const counts = {
    wash_fold: 0,
    wash_dry: 0,
    ironing: 0,
    full_service: 0,
  }

  for (const o of usageOrders.value) {
    const s = o.services || {}
    const wash = !!s.wash
    const dry = !!s.dry
    const fold = !!s.fold
    const iron = !!s.iron
    if (wash && fold) counts.wash_fold += 1
    if (wash && dry) counts.wash_dry += 1
    if (iron) counts.ironing += 1
    if (wash && dry && fold && iron) counts.full_service += 1
  }

  return POPULAR_SERVICE_ORDER.map((code) => ({
    code,
    usageCount: counts[code],
    ...POPULAR_SERVICE_LOOKUP[code],
  }))
})

function selectPopularService(serviceCode) {
  const query = { service: serviceCode }
  if (preferredStoreId.value) query.storeId = preferredStoreId.value
  router.push({ name: 'customer-new-order', query })
}

const stats = computed(() => {
  const orders = customerOrders.value
  const active = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'ready_for_pickup' && o.status !== 'cancelled',
  ).length
  const ready = orders.filter((o) => o.status === 'ready_for_pickup').length
  const completed = orders.filter((o) => o.status === 'completed').length

  let balance = 0
  for (const o of orders) {
    const paid = state.value.payments
      .filter((p) => p.orderId === o.id)
      .reduce((s, p) => s + p.amount, 0)
    balance += Math.max(0, o.total - paid)
  }

  return {
    active,
    ready,
    completed,
    balance: Math.round(balance * 100) / 100,
  }
})

const recentOrders = computed(() => {
  return customerOrders.value
    .map((order) => {
      const payments = state.value.payments.filter((p) => p.orderId === order.id)
      const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
      let paymentStatus = 'unpaid'
      if (paidAmount >= order.total || paidAmount >= order.amount) paymentStatus = 'paid'
      else if (paidAmount > 0) paymentStatus = 'partial'

      return {
        id: order.id,
        code: order.code || `#${order.id}`,
        shopName: db.getOrderShopName(order),
        serviceType: summarizeServices(order.services) || order.serviceType || 'Laundry Service',
        amount: order.total ?? order.amount ?? 0,
        paymentStatus,
        orderStatus: order.status || order.orderStatus || 'pending',
        date: order.createdAt || order.date || new Date().toISOString(),
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)
})

function formatOrderStatus(status) {
  return String(status || '')
    .split('_')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

function toTitleCase(value) {
  if (!value) return 'N/A'
  return String(value)[0].toUpperCase() + String(value).slice(1)
}

function paymentStatusClass(status) {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-700'
  if (status === 'partial') return 'bg-amber-100 text-amber-700'
  return 'bg-rose-100 text-rose-700'
}

function orderStatusClass(status) {
  if (status === 'completed') return 'bg-sky-100 text-sky-700'
  if (status === 'ready_for_pickup') return 'bg-violet-100 text-violet-700'
  return 'bg-slate-100 text-slate-700'
}
</script>
