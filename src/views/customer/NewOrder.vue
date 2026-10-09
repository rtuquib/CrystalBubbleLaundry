<template>
  <div>
    <div class="mb-5">
      <h1 class="text-2xl sm:text-3xl font-semibold text-slate-700">New order</h1>
      <p class="text-slate-400 mt-1">
        Choose a laundry shop, pick a service, add items, then review pricing before you submit.
      </p>
    </div>

    <ol class="mb-5 grid grid-cols-2 lg:grid-cols-4 gap-2">
      <li
        v-for="(step, index) in steps"
        :key="step"
        class="rounded-xl border px-3 py-2 text-xs sm:text-sm font-medium"
        :class="index === 0 && !storeId ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-600'"
      >
        <span class="text-slate-400 mr-1">{{ index + 1 }}.</span>{{ step }}
      </li>
    </ol>

    <form class="space-y-5" @submit.prevent="submit">
      <ShopPicker
        title="Laundry shop"
        description="This order is saved to the shop you select here. Changing your preferred shop later will not move past orders."
        :shops="stores"
        :selected-id="storeId"
        :loading="shopsLoading"
        :error="shopsError"
        hint="Please choose a laundry shop before submitting this order."
        @select="onSelectShop"
      />

      <div class="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-slate-100">
        <h2 class="text-lg font-semibold text-slate-700 mb-1">Service or package</h2>
        <p class="text-sm text-slate-400 mb-4">Select the laundry work you need for this order.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <label
            v-for="key in serviceKeys"
            :key="key"
            class="flex items-center gap-2 rounded-xl border px-4 py-3 cursor-pointer"
            :class="services[key] ? 'border-sky-300 bg-sky-50' : 'border-slate-200 hover:bg-slate-50'"
          >
            <input v-model="services[key]" type="checkbox" class="rounded border-slate-300" />
            <span class="text-sm text-slate-700">{{ serviceLabels[key] }}</span>
          </label>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-slate-100">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Laundry details</h2>
        <div class="space-y-3">
          <div
            v-for="(row, idx) in lineItems"
            :key="idx"
            class="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            <div class="md:col-span-8">
              <label class="block text-xs text-slate-500 mb-1">Description</label>
              <input
                v-model="row.description"
                type="text"
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div class="md:col-span-3">
              <label class="block text-xs text-slate-500 mb-1">Weight (kg)</label>
              <input
                v-model.number="row.weightKg"
                type="number"
                min="0"
                step="0.1"
                class="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div class="md:col-span-1 flex justify-end">
              <button
                v-if="lineItems.length > 1"
                type="button"
                class="text-sm text-red-500 hover:underline action-btn"
                @click="removeLine(idx)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="mt-4 text-sm font-medium text-sky-600 hover:underline action-btn"
          @click="addLine"
        >
          + Add item
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-slate-100">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Scent & detergent</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-slate-500 mb-2">Detergent</label>
            <select
              v-model="detergentId"
              class="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option v-for="d in detergents" :key="d.id" :value="d.id">
                {{ d.name }}{{ d.addOnPhp ? ` (+${formatPhp(d.addOnPhp)})` : '' }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-slate-500 mb-2">Scent</label>
            <select
              v-model="scentId"
              class="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option v-for="s in scents" :key="s.id" :value="s.id">
                {{ s.name }}{{ s.addOnPhp ? ` (+${formatPhp(s.addOnPhp)})` : '' }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-slate-100">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Pickup</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-slate-500 mb-2">Pickup date</label>
            <input
              v-model="pickupDate"
              type="date"
              class="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div>
            <label class="block text-sm text-slate-500 mb-2">Time</label>
            <input
              v-model="pickupTimeSlot"
              type="time"
              class="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm text-slate-500 mb-2">Notes (optional)</label>
            <textarea
              v-model="notes"
              rows="2"
              class="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>
      </div>

      <div class="bg-sky-50 rounded-2xl border border-sky-100 p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-sm text-slate-500">Order summary</p>
          <p class="text-sm font-medium text-slate-700 mt-1">
            {{ selectedStoreName }} · {{ selectedServiceSummary }}
          </p>
          <p class="text-2xl font-bold text-sky-700 mt-1">{{ formatPhp(preview.total) }}</p>
          <p class="text-xs text-slate-400 mt-1">
            Weight {{ formatPhp(preview.weightTotal) }} + services {{ formatPhp(preview.serviceTotal) }} + add-ons
            {{ formatPhp(preview.catalogAddOn) }}
          </p>
        </div>
        <button
          type="submit"
          class="px-8 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition action-btn"
        >
          Submit order
        </button>
      </div>

      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ShopPicker from '../../components/ShopPicker.vue'
import {
  DETERGENT_OPTIONS,
  SCENT_OPTIONS,
  SERVICE_TYPES,
  SERVICE_LABELS,
} from '../../constants/laundry.js'
import { computeOrderTotals } from '../../services/pricing.js'
import { createOrder, getAccountById, getStore } from '../../services/laundryDb.js'
import { usePreferredStore } from '../../composables/usePreferredStore.js'
import { formatPhp, summarizeServices } from '../../utils/format.js'

const router = useRouter()
const route = useRoute()
const detergents = DETERGENT_OPTIONS
const scents = SCENT_OPTIONS
const serviceKeys = SERVICE_TYPES
const serviceLabels = SERVICE_LABELS
const { shops, shopsLoading, shopsError, preferredStoreId, loadShops, selectShop } = usePreferredStore()

const stores = shops
const storeId = ref('')
const lineItems = ref([{ description: 'Mixed garments', weightKg: 3 }])
const services = reactive({ wash: true, dry: true, fold: true, iron: false })
const detergentId = ref(DETERGENT_OPTIONS[0].id)
const scentId = ref(SCENT_OPTIONS[0].id)
const pickupDate = ref('')
const pickupTimeSlot = ref('14:00')
const notes = ref('')
const errorMessage = ref('')
const steps = ['Select shop', 'Select service', 'Laundry details', 'Review & submit']

const preview = computed(() =>
  computeOrderTotals(lineItems.value, services, detergentId.value, scentId.value),
)

const selectedStoreName = computed(() => {
  const store = stores.value.find((s) => s.id === storeId.value)
  return store?.name || 'No shop selected'
})

const selectedServiceSummary = computed(() => summarizeServices(services))

const SERVICE_PRESETS = {
  wash_fold: { wash: true, dry: false, fold: true, iron: false },
  wash_dry: { wash: true, dry: true, fold: false, iron: false },
  ironing: { wash: false, dry: false, fold: false, iron: true },
  full_service: { wash: true, dry: true, fold: true, iron: true },
}

onMounted(() => {
  const raw = localStorage.getItem('loggedInUser')
  if (!raw) {
    router.push('/')
    return
  }
  const u = JSON.parse(raw)
  const acc = getAccountById(u.id)
  loadShops()
  const queryStoreId = typeof route.query.storeId === 'string' ? route.query.storeId : ''
  const queryActive = stores.value.some((s) => s.id === queryStoreId)
  if (queryActive) {
    storeId.value = queryStoreId
    persistPreferred(queryStoreId)
  } else if (preferredStoreId.value) {
    storeId.value = preferredStoreId.value
  } else {
    storeId.value = ''
  }
  if (acc?.preferredDetergentId) detergentId.value = acc.preferredDetergentId
  if (acc?.preferredScentId) scentId.value = acc.preferredScentId
  const t = new Date()
  pickupDate.value = t.toISOString().slice(0, 10)
  applyServicePreset(route.query.service)
})

watch(
  () => route.query.service,
  (value) => {
    applyServicePreset(value)
  },
)

watch(
  () => route.query.storeId,
  (value) => {
    const id = typeof value === 'string' ? value : ''
    if (id && stores.value.some((s) => s.id === id)) {
      storeId.value = id
    }
  },
)

watch(preferredStoreId, (id) => {
  if (id && !storeId.value) storeId.value = id
})

watch(storeId, () => {
  errorMessage.value = ''
})

function persistPreferred(id) {
  try {
    selectShop(id)
  } catch {
    /* validation is shown on submit */
  }
}

function onSelectShop(id) {
  errorMessage.value = ''
  storeId.value = id
  persistPreferred(id)
}

function applyServicePreset(rawCode) {
  const code = String(rawCode || '').trim().toLowerCase()
  const preset = SERVICE_PRESETS[code]
  if (!preset) return
  for (const key of serviceKeys) {
    services[key] = !!preset[key]
  }
}

const addLine = () => {
  lineItems.value.push({ description: 'Garments', weightKg: 1 })
}

const removeLine = (idx) => {
  lineItems.value = lineItems.value.filter((_, i) => i !== idx)
}

const submit = () => {
  errorMessage.value = ''
  const raw = localStorage.getItem('loggedInUser')
  if (!raw) {
    router.push('/')
    return
  }
  if (!storeId.value) {
    errorMessage.value = 'Please choose a laundry shop for this order.'
    return
  }
  const store = getStore(storeId.value)
  if (!store || store.status !== 'active') {
    errorMessage.value = 'Please choose an active laundry shop.'
    return
  }
  if (!serviceKeys.some((key) => services[key])) {
    errorMessage.value = 'Please select at least one laundry service.'
    return
  }
  const u = JSON.parse(raw)
  try {
    persistPreferred(storeId.value)
    createOrder({
      customerId: u.id,
      storeId: storeId.value,
      lineItems: lineItems.value,
      services,
      detergentId: detergentId.value,
      scentId: scentId.value,
      pickupDate: pickupDate.value,
      pickupTimeSlot: pickupTimeSlot.value,
      notes: notes.value,
    })
    router.push('/customer/my-orders')
  } catch (e) {
    errorMessage.value = e.message || 'Could not create order'
  }
}
</script>
