<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-semibold text-slate-700">Official Receipt</h1>
      <p class="mt-1 text-slate-500">Admin receipt registry for confirmed payments and OR records.</p>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <input v-model="filters.query" type="search" placeholder="Search OR, order, customer..." class="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <input v-model="filters.from" type="date" class="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <input v-model="filters.to" type="date" class="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <select v-model="filters.method" class="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <option value="">All methods</option>
          <option value="cash">Cash</option>
          <option value="digital">Digital</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-slate-100 bg-slate-50 text-slate-500">
          <tr>
            <th class="px-4 py-3">OR Number</th>
            <th class="px-4 py-3">Order</th>
            <th class="px-4 py-3">Customer</th>
            <th class="px-4 py-3 text-right">Amount</th>
            <th class="px-4 py-3">Method</th>
            <th class="px-4 py-3">Date</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="row in rows" :key="row.id">
            <td class="px-4 py-3 font-mono text-xs">{{ row.receiptNumber }}</td>
            <td class="px-4 py-3">{{ row.orderCode }}</td>
            <td class="px-4 py-3">{{ row.customerName }}</td>
            <td class="px-4 py-3 text-right">{{ formatPhp(row.amount) }}</td>
            <td class="px-4 py-3 capitalize">{{ row.method }}</td>
            <td class="px-4 py-3">{{ formatDateTime(row.createdAt) }}</td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <button class="rounded-lg border border-slate-300 px-3 py-1 text-xs" @click="openPreview(row)">Preview</button>
                <button class="rounded-lg border border-slate-300 px-3 py-1 text-xs" @click="printReceipt(row)">Print</button>
                <button class="rounded-lg border border-sky-200 px-3 py-1 text-xs text-sky-700" @click="downloadPdf(row)">PDF</button>
              </div>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="7" class="px-4 py-8 text-center text-slate-400">No official receipts match your filters.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="previewOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4" @click.self="closePreview">
      <div class="w-full max-w-4xl rounded-2xl border border-slate-300 bg-white p-6 shadow-xl">
        <div class="mb-3 flex items-start justify-between gap-4">
          <p class="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Official Receipt Preview</p>
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50" @click="closePreview">Close</button>
        </div>

        <div v-if="previewPayment" class="rounded-xl border border-slate-200 bg-white p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="space-y-2">
              <div class="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-700 text-base font-bold text-white">CB</div>
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
              <p class="mt-2 font-semibold text-slate-900">{{ previewPayment.customerName }}</p>
              <p class="text-slate-600">{{ previewPayment.customerAddress || 'Surigao City' }}</p>
            </div>
            <div class="space-y-1 text-right text-slate-700">
              <p><span class="font-semibold text-slate-900">Order</span> {{ previewPayment.orderCode }}</p>
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
                  <td class="px-3 py-2">{{ previewPayment.orderQty }}</td>
                  <td class="px-3 py-2">Laundry service payment for order {{ previewPayment.orderCode }}</td>
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
              <p class="text-base italic text-slate-800">{{ previewPayment.customerName }}</p>
              <p class="mt-1">Customer Signature</p>
            </div>
            <div class="border-t border-slate-400 pt-2 text-center">
              <p class="text-base italic text-slate-800">{{ authorizedSignerName(previewPayment) }}</p>
              <p class="mt-1">{{ authorizedSignerRole(previewPayment) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { jsPDF } from 'jspdf'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { formatDateOnly, formatDateTime, formatPhp } from '../../utils/format.js'

const { state } = useLaundryDb()

const filters = reactive({
  query: '',
  from: '',
  to: '',
  method: '',
})
const previewOpen = ref(false)
const previewPayment = ref(null)

const rows = computed(() => {
  const q = filters.query.trim().toLowerCase()
  return state.value.payments
    .filter((p) => String(p.receiptNumber || '').startsWith('OR-'))
    .map((p) => {
      const order = state.value.orders.find((o) => o.id === p.orderId)
      const customer = order ? state.value.accounts.find((a) => a.id === order.customerId) : null
      return {
        ...p,
        orderCode: order?.code || '—',
        customerName: customer?.name || '—',
        customerAddress: customer?.address || '',
        orderQty: order?.lineItems?.length || 1,
      }
    })
    .filter((p) => (filters.method ? p.method === filters.method : true))
    .filter((p) => {
      const day = (p.createdAt || '').slice(0, 10)
      if (filters.from && day < filters.from) return false
      if (filters.to && day > filters.to) return false
      return true
    })
    .filter((p) => {
      if (!q) return true
      return (
        String(p.receiptNumber).toLowerCase().includes(q) ||
        String(p.orderCode).toLowerCase().includes(q) ||
        String(p.customerName).toLowerCase().includes(q)
      )
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
})

function openPreview(row) {
  previewPayment.value = row
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

function authorizedSignerName(payment) {
  const signer = state.value.accounts.find((a) => a.id === payment?.recordedBy)
  return signer?.name || 'Cashier on Duty'
}

function authorizedSignerRole(payment) {
  const signer = state.value.accounts.find((a) => a.id === payment?.recordedBy)
  if (!signer) return 'Authorized Personnel'
  return signer.role === 'admin' ? 'Administrator' : signer.role === 'staff' ? 'Staff Cashier' : 'Authorized Personnel'
}

function printReceipt(row) {
  const w = window.open('', '_blank', 'width=420,height=700')
  if (!w) return
  w.document.write(receiptDocumentHtml(row))
  w.document.close()
}

function downloadPdf(row) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 42
  const pageWidth = doc.internal.pageSize.getWidth()
  const rightX = pageWidth - margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(30, 64, 175)
  doc.text('RECEIPT', rightX, 62, { align: 'right' })
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(11)
  doc.text(`Receipt #: ${row.receiptNumber}`, rightX, 86, { align: 'right' })
  doc.text(`Receipt date: ${formatDateOnly(row.createdAt)}`, rightX, 102, { align: 'right' })

  doc.setFillColor(30, 64, 175)
  doc.roundedRect(margin, 42, 34, 34, 5, 5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.text('CB', margin + 17, 64, { align: 'center' })
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(18)
  doc.text('Crystal Bubble Laundry Shop', margin + 46, 60)
  doc.setFontSize(11)
  doc.setTextColor(71, 85, 105)
  doc.text('Borromeo Street, Surigao City, SDN', margin + 46, 77)

  doc.setTextColor(30, 64, 175)
  doc.setFontSize(10)
  doc.text('BILLED TO', margin, 130)
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(13)
  doc.text(row.customerName, margin, 148)
  doc.setFontSize(11)
  doc.setTextColor(71, 85, 105)
  doc.text(row.customerAddress || 'Surigao City', margin, 164)

  doc.setTextColor(15, 23, 42)
  doc.setFontSize(12)
  doc.text(`Order: ${row.orderCode}`, rightX, 148, { align: 'right' })
  doc.text(`Method: ${row.method === 'digital' ? 'Digital' : 'Cash'}`, rightX, 166, { align: 'right' })

  doc.setFillColor(30, 64, 175)
  doc.rect(margin, 188, pageWidth - margin * 2, 24, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text('QTY', margin + 10, 204)
  doc.text('Description', margin + 56, 204)
  doc.text('Amount', rightX - 8, 204, { align: 'right' })

  doc.setDrawColor(226, 232, 240)
  doc.rect(margin, 212, pageWidth - margin * 2, 32)
  doc.setTextColor(15, 23, 42)
  doc.text(String(row.orderQty), margin + 10, 232)
  doc.text(`Laundry service payment for order ${row.orderCode}`, margin + 56, 232)
  doc.text(formatPhp(row.amount), rightX - 8, 232, { align: 'right' })

  doc.setDrawColor(148, 163, 184)
  doc.line(pageWidth - 220, 264, rightX, 264)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Total (PHP)', pageWidth - 220, 282)
  doc.setTextColor(30, 64, 175)
  doc.text(formatPhp(row.amount), rightX, 282, { align: 'right' })

  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(`Amount in words: ${amountInWords(row.amount)}`, margin, 320)

  doc.setDrawColor(148, 163, 184)
  doc.line(margin, 370, margin + 220, 370)
  doc.line(rightX - 220, 370, rightX, 370)
  doc.setTextColor(71, 85, 105)
  doc.text(row.customerName, margin + 110, 388, { align: 'center' })
  doc.text('Customer Signature', margin + 110, 404, { align: 'center' })
  doc.text(authorizedSignerName(row), rightX - 110, 388, { align: 'center' })
  doc.text(authorizedSignerRole(row), rightX - 110, 404, { align: 'center' })

  doc.save(`${row.receiptNumber}.pdf`)
}

function receiptDocumentHtml(row) {
  const methodLabel = row.method === 'digital' ? 'Digital' : 'Cash'
  return `<!doctype html><html><head><meta charset="utf-8"/><title>${esc(row.receiptNumber)}</title>
  <style>
  body{font-family:Arial,sans-serif;background:#f1f5f9;margin:0;padding:16px}
  .sheet{max-width:900px;margin:0 auto;background:#fff;border:1px solid #cbd5e1;border-radius:12px;padding:20px}
  .top{display:flex;justify-content:space-between;gap:16px}.logo{display:inline-flex;width:42px;height:42px;background:#1e40af;color:#fff;font-weight:700;border-radius:8px;align-items:center;justify-content:center}
  h1{margin:6px 0 2px 0;font-size:33px;letter-spacing:.08em;color:#1e40af}.muted{color:#475569}.small{font-size:12px}.meta{text-align:right}
  .mid{display:flex;justify-content:space-between;margin-top:28px}.blue{font-size:12px;font-weight:700;color:#1e40af;letter-spacing:.06em}
  table{width:100%;border-collapse:collapse;margin-top:18px}th{background:#1e40af;color:#fff;text-align:left;padding:8px;font-size:12px}td{border:1px solid #e2e8f0;padding:8px;font-size:13px}
  .right{text-align:right}.total{width:240px;margin-left:auto;margin-top:16px;border-top:1px solid #94a3b8;padding-top:8px;display:flex;justify-content:space-between;font-weight:700}
  .sig{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:42px}.line{border-top:1px solid #94a3b8;text-align:center;padding-top:8px}
  </style></head><body><div class="sheet">
    <div class="top">
      <div><div class="logo">CB</div><div style="margin-top:8px"><div style="font-size:34px;font-weight:700;color:#1e40af;line-height:1">RECEIPT</div></div></div>
      <div class="meta">
        <div style="font-weight:700">Crystal Bubble Laundry Shop</div>
        <div class="muted">Borromeo Street, Surigao City, SDN</div>
        <div style="margin-top:12px"><b>Receipt #</b> ${esc(row.receiptNumber)}</div>
        <div><b>Receipt date</b> ${esc(formatDateOnly(row.createdAt))}</div>
      </div>
    </div>
    <div class="mid">
      <div><div class="blue">BILLED TO</div><div style="font-weight:700;margin-top:6px">${esc(row.customerName)}</div><div class="muted">${esc(row.customerAddress || 'Surigao City')}</div></div>
      <div class="right"><div><b>Order</b> ${esc(row.orderCode)}</div><div style="margin-top:4px"><b>Method</b> ${esc(methodLabel)}</div></div>
    </div>
    <table><thead><tr><th style="width:80px">QTY</th><th>Description</th><th style="width:160px" class="right">Amount</th></tr></thead>
      <tbody><tr><td>${esc(String(row.orderQty))}</td><td>Laundry service payment for order ${esc(row.orderCode)}</td><td class="right">${esc(formatPhp(row.amount))}</td></tr></tbody>
    </table>
    <div class="total"><span>Total (PHP)</span><span>${esc(formatPhp(row.amount))}</span></div>
    <div style="margin-top:18px"><b>Amount in words:</b> ${esc(amountInWords(row.amount))}</div>
    <div class="sig">
      <div class="line"><div style="font-style:italic;font-size:28px">${esc(row.customerName)}</div><div class="muted small">Customer Signature</div></div>
      <div class="line"><div style="font-style:italic;font-size:28px">${esc(authorizedSignerName(row))}</div><div class="muted small">${esc(authorizedSignerRole(row))}</div></div>
    </div>
  </div><script>window.print();<\/script></body></html>`
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
</script>
