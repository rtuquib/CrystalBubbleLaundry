<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">New order</h1>
      <p class="text-slate-400 mt-1">
        Choose a store, add items, select services, scent and detergent, then schedule pickup.
      </p>
    </div>

    <form class="space-y-6" @submit.prevent="submit">
      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 class="text-lg font-semibold text-slate-700 mb-1">Store</h2>
        <p class="text-sm text-slate-400 mb-4">Which CrystalBubble store are you ordering from?</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            v-for="store in stores"
            :key="store.id"
            class="flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition"
            :class="
              storeId === store.id
                ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-200'
                : 'border-slate-200 hover:bg-slate-50'
            "
          >
            <input v-model="storeId" type="radio" :value="store.id" class="mt-1 border-slate-300 text-sky-600" />
            <span>
              <span class="block text-sm font-semibold text-slate-800">{{ store.name }}</span>
              <span class="mt-0.5 block text-xs text-slate-500">{{ store.code }} · {{ store.address }}</span>
            </span>
          </label>
        </div>
        <p v-if="!stores.length" class="text-sm text-amber-600">No active stores are available right now.</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Line items</h2>
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
                style="pointer-events: auto; cursor: pointer;"
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
          style="pointer-events: auto; cursor: pointer;"
        >
          + Add item
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <h2 class="text-lg font-semibold text-slate-700 mb-4">Services</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label
            v-for="key in serviceKeys"
            :key="key"
            class="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50"
          >
            <input v-model="services[key]" type="checkbox" class="rounded border-slate-300" />
            <span class="text-sm text-slate-700">{{ serviceLabels[key] }}</span>
          </label>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
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

      <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
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

      <div class="bg-sky-50 rounded-2xl border border-sky-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-sm text-slate-500">Estimated total</p>
          <p class="text-2xl font-bold text-sky-700">{{ formatPhp(preview.total) }}</p>
          <p class="text-xs text-slate-400 mt-1">
            Weight {{ formatPhp(preview.weightTotal) }} + services {{ formatPhp(preview.serviceTotal) }} + add-ons
            {{ formatPhp(preview.catalogAddOn) }}
          </p>
        </div>
        <button
          type="submit"
          class="px-8 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition action-btn"
          style="pointer-events: auto; cursor: pointer;"
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
import {
  DETERGENT_OPTIONS,
  SCENT_OPTIONS,
  SERVICE_TYPES,
  SERVICE_LABELS,
} from '../../constants/laundry.js'
import { computeOrderTotals } from '../../services/pricing.js'
import { createOrder, getAccountById, listActiveStores } from '../../services/laundryDb.js'
import { formatPhp } from '../../utils/format.js'

const router = useRouter()
const route = useRoute()
const detergents = DETERGENT_OPTIONS
const scents = SCENT_OPTIONS
const serviceKeys = SERVICE_TYPES
const serviceLabels = SERVICE_LABELS

const stores = ref([])
const storeId = ref('')
const lineItems = ref([{ description: 'Mixed garments', weightKg: 3 }])
const services = reactive({ wash: true, dry: true, fold: true, iron: false })
const detergentId = ref(DETERGENT_OPTIONS[0].id)
const scentId = ref(SCENT_OPTIONS[0].id)
const pickupDate = ref('')
const pickupTimeSlot = ref('14:00')
const notes = ref('')
const errorMessage = ref('')

const preview = computed(() =>
  computeOrderTotals(lineItems.value, services, detergentId.value, scentId.value),
)

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
  stores.value = listActiveStores()
  const preferredStoreId = typeof route.query.storeId === 'string' ? route.query.storeId : ''
  const preferredActive = stores.value.some((s) => s.id === preferredStoreId)
  if (preferredActive) {
    storeId.value = preferredStoreId
  } else if (acc?.storeId && stores.value.some((s) => s.id === acc.storeId)) {
    storeId.value = acc.storeId
  } else {
    storeId.value = stores.value[0]?.id || ''
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
    errorMessage.value = 'Please choose a store for this order.'
    return
  }
  const u = JSON.parse(raw)
  try {
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
