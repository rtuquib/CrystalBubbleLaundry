<template>
  <div class="space-y-6">
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">Payments</h1>
      <p class="text-slate-400 mt-1">View balances, methods (cash vs digital), official receipts, and payment history.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Total due (all orders)</p>
        <h2 class="text-3xl font-bold text-red-500">{{ formatPhp(totals.due) }}</h2>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Total paid</p>
        <h2 class="text-3xl font-bold text-green-500">{{ formatPhp(totals.paid) }}</h2>
      </div>

      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Balance</p>
        <h2 class="text-3xl font-bold text-sky-500">{{ formatPhp(totals.balance) }}</h2>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <h3 class="text-lg font-semibold text-slate-700 mb-4">Payment history</h3>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400 border-b border-slate-100">
              <th class="pb-3">Official Receipt</th>
              <th class="pb-3">Order</th>
              <th class="pb-3">Amount</th>
              <th class="pb-3">Method</th>
              <th class="pb-3">Date</th>
              <th class="pb-3">Status</th>
              <th class="pb-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody class="text-slate-600">
            <tr v-for="p in myPayments" :key="p.id" class="border-b border-slate-100">
              <td class="py-4 font-mono text-xs">
                {{ String(p.receiptNumber || '').startsWith('OR-') ? p.receiptNumber : 'Pending OR generation' }}
              </td>
              <td>{{ orderCode(p.orderId) }}</td>
              <td>{{ formatPhp(p.amount) }}</td>
              <td>{{ p.method === 'digital' ? 'Digital' : 'Cash' }}</td>
              <td>{{ formatDateTime(p.createdAt) }}</td>
              <td>
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="
                    p.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  "
                >
                  {{ p.status }}
                </span>
              </td>
              <td class="text-right">
                <button
                  v-if="String(p.receiptNumber || '').startsWith('OR-')"
                  type="button"
                  class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  @click="openPreview(p)"
                >
                  Preview OR
                </button>
                <span v-else class="text-xs text-slate-400">—</span>
              </td>
            </tr>
            <tr v-if="!myPayments.length">
              <td colspan="7" class="py-8 text-center text-slate-400">No payments yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p class="text-xs text-slate-400">Receipts in customer view are view-only. Printing and file download are restricted to staff/admin.</p>

    <div v-if="previewOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4" @click.self="closePreview">
      <div class="w-full max-w-4xl rounded-2xl border border-slate-300 bg-white p-6 shadow-xl">
        <div class="mb-3 flex items-start justify-between gap-4">
          <p class="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">View-Only Receipt</p>
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50" @click="closePreview">Close</button>
        </div>

        <div v-if="previewPayment" class="rounded-xl border border-slate-200 bg-white p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="space-y-2">
              <div class="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-700 text-base font-bold text-white">
                CB
              </div>
              <div>
                <p class="text-lg font-semibold text-slate-900">Crystal Bubble Laundry Shop</p>
                <p class="text-sm text-slate-600">Borromeo Street, Surigao City, SDN</p>
              </div>
            </div>
            <div class="text-right">
              <h3 class="text-4xl font-bold tracking-wider text-blue-800">RECEIPT</h3>
              <p class="mt-2 text-sm text-slate-700"><span class="font-semibold text-slate-900">Receipt #</span> {{ previewPayment.receiptNumber }}</p>
              <p class="text-sm text-slate-700"><span class="font-semibold text-slate-900">Receipt date</span> {{ formatDateOnly(previewPayment.createdAt) }}</p>
            </div>
          </div>

          <div class="mt-8 grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-blue-800">Billed To</p>
              <p class="mt-2 font-semibold text-slate-900">{{ customerName }}</p>
              <p class="text-slate-600">{{ customerAddress }}</p>
            </div>
            <div class="space-y-1 text-right text-slate-700">
              <p><span class="font-semibold text-slate-900">Order</span> {{ orderCode(previewPayment.orderId) }}</p>
              <p><span class="font-semibold text-slate-900">Method</span> {{ previewPayment.method === 'digital' ? 'Digital' : 'Cash' }}</p>
            </div>
          </div>

          <div class="mt-6 overflow-hidden rounded-lg border border-slate-200">
            <table class="w-full text-sm">
              <thead class="bg-blue-800 text-white">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-semibold">QTY</th>
                  <th class="px-3 py-2 text-left text-xs font-semibold">Description</th>
                  <th class="px-3 py-2 text-right text-xs font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-slate-100">
                  <td class="px-3 py-2">{{ orderQty(previewPayment.orderId) }}</td>
                  <td class="px-3 py-2">Laundry service payment for order {{ orderCode(previewPayment.orderId) }}</td>
                  <td class="px-3 py-2 text-right font-medium">{{ formatPhp(previewPayment.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 ml-auto w-full max-w-xs space-y-1 text-sm">
            <div class="flex items-center justify-between border-t border-slate-300 pt-2">
              <span class="font-semibold text-slate-900">Total (PHP)</span>
              <span class="font-bold text-blue-800">{{ formatPhp(previewPayment.amount) }}</span>
            </div>
          </div>

          <div class="mt-5 text-sm text-slate-700">
            <p class="font-semibold text-slate-900">Amount in words:</p>
            <p>{{ amountInWords(previewPayment.amount) }}</p>
          </div>

          <div class="mt-8 grid grid-cols-1 gap-8 text-xs text-slate-500 md:grid-cols-2">
            <div class="border-t border-slate-400 pt-2 text-center">
              <p class="text-base italic text-slate-800">{{ customerName }}</p>
              <p class="mt-1">Customer Signature</p>
            </div>
            <div class="border-t border-slate-400 pt-2 text-center">
              <p class="text-base italic text-slate-800">{{ authorizedSignerName(previewPayment) }}</p>
              <p class="mt-1">{{ authorizedSignerRole(previewPayment) }}</p>
            </div>
          </div>

          <div class="mt-8 text-xs text-slate-500">
            <p class="font-semibold text-slate-700">Notes</p>
            <p>This is a view-only customer copy of the official receipt.</p>
          </div>
        </div>

        <p class="mt-3 text-xs text-slate-500">This preview is view-only. Downloading and printing are restricted to staff and admin.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { formatPhp, formatDateOnly, formatDateTime } from '../../utils/format.js'

const router = useRouter()
const { state } = useLaundryDb()
const customerId = ref(null)
const previewOpen = ref(false)
const previewPayment = ref(null)
const customerName = computed(() => {
  const id = customerId.value
  if (!id) return 'Customer'
  return state.value.accounts.find((a) => a.id === id)?.name || 'Customer'
})
const customerAddress = computed(() => {
  const id = customerId.value
  if (!id) return 'Surigao City'
  return state.value.accounts.find((a) => a.id === id)?.address || 'Surigao City'
})

onMounted(() => {
  const raw = localStorage.getItem('loggedInUser')
  if (!raw) {
    router.push('/')
    return
  }
  const session = JSON.parse(raw)
  customerId.value = session.id
})

const myOrderIds = computed(() => {
  const id = customerId.value
  if (!id) return new Set()
  return new Set(state.value.orders.filter((o) => o.customerId === id).map((o) => o.id))
})

const myPayments = computed(() => {
  const ids = myOrderIds.value
  return state.value.payments
    .filter((p) => ids.has(p.orderId))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
})


const totals = computed(() => {
  const id = customerId.value
  if (!id) return { due: 0, paid: 0, balance: 0 }
  const orders = state.value.orders.filter((o) => o.customerId === id)
  let due = 0
  let paid = 0
  for (const o of orders) {
    due += o.total
    paid += state.value.payments
      .filter((p) => p.orderId === o.id)
      .reduce((s, p) => s + p.amount, 0)
  }
  return {
    due: Math.round(due * 100) / 100,
    paid: Math.round(paid * 100) / 100,
    balance: Math.round(Math.max(0, due - paid) * 100) / 100,
  }
})

function orderCode(orderId) {
  const o = state.value.orders.find((x) => x.id === orderId)
  return o ? o.code : '—'
}

function openPreview(payment) {
  previewPayment.value = payment
  previewOpen.value = true
}

function closePreview() {
  previewOpen.value = false
  previewPayment.value = null
}

function amountInWords(amount) {
  const rounded = Math.round((Number(amount) || 0) * 100) / 100
  const whole = Math.floor(rounded)
  const cents = Math.round((rounded - whole) * 100)
  if (whole === 0 && cents === 0) return 'Zero pesos only'
  if (cents === 0) return `${whole.toLocaleString('en-PH')} pesos only`
  return `${whole.toLocaleString('en-PH')} pesos and ${cents}/100 only`
}

function orderQty(orderId) {
  const order = state.value.orders.find((o) => o.id === orderId)
  if (!order?.lineItems?.length) return 1
  return order.lineItems.reduce((sum, row) => sum + (Number(row.weightKg) > 0 ? 1 : 0), 0) || order.lineItems.length
}

function authorizedSignerName(payment) {
  const signer = state.value.accounts.find((a) => a.id === payment?.recordedBy)
  return signer?.name || 'Cashier on Duty'
}

function authorizedSignerRole(payment) {
  const signer = state.value.accounts.find((a) => a.id === payment?.recordedBy)
  if (!signer) return 'Authorized Personnel'
  return signer.role === 'admin' ? 'Administrator' : signer.role === 'staff' ? 'Staff Cashier' : 'Authorized Personnel'
}

</script>
