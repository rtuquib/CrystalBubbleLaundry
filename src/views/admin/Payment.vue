<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-semibold text-slate-800">Payments</h1>
      <p class="text-slate-500 mt-1">
        Record cash or digital payments against orders, edit mistakes, and audit receipts — all stored locally.
      </p>
    </div>

    <!-- Create / edit -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
      <h2 class="text-lg font-semibold text-slate-800 mb-1">{{ editingId ? 'Edit payment' : 'Record payment' }}</h2>
      <p class="text-sm text-slate-500 mb-4">
        {{ editingId ? 'Adjust amount or method; statuses recompute from order balance.' : 'Post a new receipt line against an open order.' }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-slate-600 mb-1">Order</label>
          <select
            v-model="form.orderId"
            class="w-full border rounded-xl px-3 py-2.5 text-sm"
            :class="errors.orderId ? 'border-red-300 bg-red-50/50' : 'border-slate-200'"
            :disabled="!!editingId"
          >
            <option v-for="o in orderOptions" :key="o.id" :value="o.id">
              {{ o.code }} — {{ customerName(o.customerId) }} · Balance {{ formatPhp(balanceFor(o)) }} · Total
              {{ formatPhp(o.total) }}
            </option>
          </select>
          <p v-if="errors.orderId" class="text-xs text-red-600 mt-1">{{ errors.orderId }}</p>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Amount (PHP)</label>
          <input
            v-model.number="form.amount"
            type="number"
            min="0"
            step="1"
            class="w-full border rounded-xl px-3 py-2.5 text-sm"
            :class="errors.amount ? 'border-red-300 bg-red-50/50' : 'border-slate-200'"
          />
          <p v-if="errors.amount" class="text-xs text-red-600 mt-1">{{ errors.amount }}</p>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Method</label>
          <select v-model="form.method" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm">
            <option value="cash">Cash</option>
            <option value="digital">Digital (GCash / card / bank)</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-xl bg-sky-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-sky-700 action-btn"
          @click="submit"
          style="pointer-events: auto; cursor: pointer;"
        >
          {{ editingId ? 'Save changes' : 'Post payment' }}
        </button>
        <button
          v-if="editingId"
          type="button"
          class="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 action-btn"
          @click="resetForm"
          style="pointer-events: auto; cursor: pointer;"
        >
          Cancel edit
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 class="text-lg font-semibold text-slate-800">Payment history</h2>
        <input
          v-model="tableQuery"
          type="search"
          placeholder="Search receipt or order…"
          class="rounded-xl border border-slate-200 px-3 py-2 text-sm max-w-xs w-full"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[800px]">
          <thead>
            <tr class="text-left text-slate-500 border-b border-slate-200 bg-slate-50/80">
              <th class="py-3 px-2">Receipt #</th>
              <th class="py-3 px-2">Order</th>
              <th class="py-3 px-2">Customer</th>
              <th class="py-3 px-2 text-right">Amount</th>
              <th class="py-3 px-2">Method</th>
              <th class="py-3 px-2">Status</th>
              <th class="py-3 px-2">When</th>
              <th class="py-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="text-slate-700">
            <tr v-for="p in filteredPayments" :key="p.id" class="border-b border-slate-100 hover:bg-slate-50/80">
              <td class="py-3 px-2 font-mono text-xs">{{ p.receiptNumber }}</td>
              <td class="py-3 px-2">{{ orderCode(p.orderId) }}</td>
              <td class="py-3 px-2">{{ customerForOrder(p.orderId) }}</td>
              <td class="py-3 px-2 text-right tabular-nums">{{ formatPhp(p.amount) }}</td>
              <td class="py-3 px-2">{{ p.method === 'digital' ? 'Digital' : 'Cash' }}</td>
              <td class="py-3 px-2">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="
                    p.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : p.status === 'partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                  "
                >
                  {{ p.status }}
                </span>
              </td>
              <td class="py-3 px-2 whitespace-nowrap text-slate-600">{{ formatDateTime(p.createdAt) }}</td>
              <td class="py-3 px-2 text-right space-x-2 whitespace-nowrap">
                <button
                  v-if="!String(p.receiptNumber || '').startsWith('OR-')"
                  type="button"
                  class="text-xs rounded-lg border border-emerald-200 text-emerald-700 px-2.5 py-1.5 hover:bg-emerald-50"
                  @click="confirmReceipt(p)"
                >
                  Confirm
                </button>
                <button
                  v-if="String(p.receiptNumber || '').startsWith('OR-')"
                  type="button"
                  class="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 hover:bg-white"
                  @click="printThermal(p)"
                >
                  Print
                </button>
                <button
                  v-if="String(p.receiptNumber || '').startsWith('OR-')"
                  type="button"
                  class="text-xs rounded-lg border border-sky-200 text-sky-700 px-2.5 py-1.5 hover:bg-sky-50"
                  @click="downloadReceiptPdf(p)"
                >
                  PDF
                </button>
                <button
                  type="button"
                  class="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 hover:bg-white"
                  @click="startEdit(p)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="text-xs rounded-lg border border-red-200 text-red-700 px-2.5 py-1.5 hover:bg-red-50"
                  @click="requestDelete(p)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!filteredPayments.length" class="text-sm text-slate-500 py-8 text-center">No payments match your search.</p>
    </div>

    <ConfirmDialog
      v-model="deleteOpen"
      title="Delete this payment row?"
      :message="deleteMessage"
      confirm-label="Delete payment"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { jsPDF } from 'jspdf'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { useToast } from '../../composables/useToast.js'
import { confirmPayment, deletePayment, recordPayment, updatePayment } from '../../services/laundryDb.js'
import { formatPhp, formatDateTime } from '../../utils/format.js'
import { positiveNumber, required } from '../../utils/validation.js'

const { state } = useLaundryDb()
const toast = useToast()

const form = reactive({
  orderId: '',
  amount: 0,
  method: 'cash',
})

const errors = reactive({
  orderId: '',
  amount: '',
})

const editingId = ref('')
const tableQuery = ref('')
const deleteOpen = ref(false)
const pendingDeleteId = ref('')

const payments = computed(() =>
  [...state.value.payments].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
)

const orderOptions = computed(() => state.value.orders)

const filteredPayments = computed(() => {
  const q = tableQuery.value.trim().toLowerCase()
  if (!q) return payments.value
  return payments.value.filter((p) => {
    const oc = orderCode(p.orderId).toLowerCase()
    const cust = customerForOrder(p.orderId).toLowerCase()
    return (
      (p.receiptNumber || '').toLowerCase().includes(q) ||
      oc.includes(q) ||
      cust.includes(q)
    )
  })
})

function paidFor(orderId) {
  return state.value.payments.filter((p) => p.orderId === orderId).reduce((s, p) => s + p.amount, 0)
}

function balanceFor(o) {
  return Math.max(0, o.total - paidFor(o.id))
}

watch(
  () => [orderOptions.value, form.orderId, editingId.value],
  () => {
    const list = orderOptions.value
    if (!list.length) return
    if (!form.orderId || !list.some((o) => o.id === form.orderId)) {
      form.orderId = list[0].id
    }
    if (!editingId.value) {
      const cur = list.find((o) => o.id === form.orderId)
      if (cur) form.amount = balanceFor(cur)
    }
  },
  { immediate: true },
)

function customerName(id) {
  const a = state.value.accounts.find((x) => x.id === id)
  return a ? a.name : '—'
}

function orderCode(orderId) {
  const o = state.value.orders.find((x) => x.id === orderId)
  return o ? o.code : '—'
}

function customerForOrder(orderId) {
  const o = state.value.orders.find((x) => x.id === orderId)
  return o ? customerName(o.customerId) : '—'
}

function clearErrors() {
  errors.orderId = ''
  errors.amount = ''
}

function validate() {
  clearErrors()
  let ok = true
  const o = required(form.orderId, 'Order')
  if (o) {
    errors.orderId = o
    ok = false
  }
  const a = positiveNumber(form.amount, 'Amount')
  if (a) {
    errors.amount = a
    ok = false
  }
  return ok
}

function submit() {
  if (!validate()) return
  try {
    if (editingId.value) {
      updatePayment(editingId.value, { amount: form.amount, method: form.method })
      toast.push('Payment updated.')
    } else {
      const pay = recordPayment({
        orderId: form.orderId,
        amount: form.amount,
        method: form.method,
      })
      toast.push(`Payment posted — ${pay.receiptNumber}`)
    }
    resetForm()
  } catch (e) {
    toast.push(e.message || 'Failed to save payment', 'error')
  }
}

function startEdit(p) {
  editingId.value = p.id
  form.orderId = p.orderId
  form.amount = p.amount
  form.method = p.method
}

function confirmReceipt(p) {
  try {
    const updated = confirmPayment(p.id)
    toast.push(`Payment confirmed — ${updated.receiptNumber}`)
  } catch (e) {
    toast.push(e.message || 'Failed to confirm payment', 'error')
  }
}

function printThermal(p) {
  const w = window.open('', '_blank', 'width=420,height=700')
  if (!w) return
  w.document.write(`
    <html><head><title>${p.receiptNumber}</title>
    <style>
      body{font-family:Courier New,monospace;margin:0;padding:8px}
      .ticket{width:80mm}
      .r{display:flex;justify-content:space-between;font-size:12px;margin:4px 0}
      hr{border:none;border-top:1px dashed #111}
    </style></head><body>
      <div class="ticket">
        <div style="text-align:center"><strong>CRYSTALBUBBLE LAUNDRY</strong><br/>OFFICIAL RECEIPT</div>
        <hr/>
        <div class="r"><span>OR #</span><span>${p.receiptNumber}</span></div>
        <div class="r"><span>Order</span><span>${orderCode(p.orderId)}</span></div>
        <div class="r"><span>Customer</span><span>${customerForOrder(p.orderId)}</span></div>
        <div class="r"><span>Amount</span><span>${formatPhp(p.amount)}</span></div>
        <div class="r"><span>Method</span><span>${p.method === 'digital' ? 'Digital' : 'Cash'}</span></div>
        <div class="r"><span>Date</span><span>${formatDateTime(p.createdAt)}</span></div>
      </div>
      <script>window.print();<\/script>
    </body></html>`)
  w.document.close()
}

function downloadReceiptPdf(p) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text('OFFICIAL RECEIPT', 40, 60)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(`OR Number: ${p.receiptNumber}`, 40, 90)
  doc.text(`Date Issued: ${formatDateTime(p.createdAt)}`, 40, 108)
  doc.text(`Customer: ${customerForOrder(p.orderId)}`, 40, 126)
  doc.text(`Order: ${orderCode(p.orderId)}`, 40, 144)
  doc.text(`Amount Paid: ${formatPhp(p.amount)}`, 40, 162)
  doc.text(`Method: ${p.method === 'digital' ? 'Digital' : 'Cash'}`, 40, 180)
  doc.text('Prepared for CrystalBubble Laundry thesis/demo presentation.', 40, 220)
  doc.save(`${p.receiptNumber}.pdf`)
}

function resetForm() {
  editingId.value = ''
  clearErrors()
  const list = orderOptions.value
  form.orderId = list[0]?.id || ''
  const cur = list.find((o) => o.id === form.orderId)
  if (cur) form.amount = balanceFor(cur)
  form.method = 'cash'
}

const deleteMessage = computed(() => {
  const p = state.value.payments.find((x) => x.id === pendingDeleteId.value)
  if (!p) return ''
  return `Remove receipt ${p.receiptNumber} for ${formatPhp(p.amount)}? Order balances will be recalculated.`
})

function requestDelete(p) {
  pendingDeleteId.value = p.id
  deleteOpen.value = true
}

function confirmDelete() {
  try {
    deletePayment(pendingDeleteId.value)
    toast.push('Payment removed.')
    if (editingId.value === pendingDeleteId.value) resetForm()
  } catch (e) {
    toast.push(e.message || 'Delete failed', 'error')
  }
  deleteOpen.value = false
  pendingDeleteId.value = ''
}
</script>
