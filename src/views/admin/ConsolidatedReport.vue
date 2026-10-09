<template>
  <div class="space-y-6">
    <div class="mb-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="text-3xl font-semibold text-slate-700">Consolidated Report</h1>
        <p class="mt-1 text-slate-500">Admin-only summary of sales, expenses, and net profit.</p>
      </div>
      <div class="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div>
          <label class="mb-1 block text-xs font-medium text-slate-500">Export format</label>
          <select
            v-model="exportFormat"
            class="min-w-[140px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="pdf">PDF</option>
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV</option>
          </select>
        </div>
        <button
          type="button"
          class="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          @click="runExport"
        >
          Export
        </button>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label class="mb-2 block text-sm text-slate-500">From date</label>
          <input v-model="from" type="date" class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" />
        </div>
        <div>
          <label class="mb-2 block text-sm text-slate-500">To date</label>
          <input v-model="to" type="date" class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" />
        </div>
        <div class="flex items-end">
          <button
            type="button"
            class="w-full rounded-xl bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 sm:w-auto"
          >
            Summary updates automatically
          </button>
        </div>
      </div>
    </div>

    <section class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-slate-500">Total Sales</p>
        <p class="mt-2 text-3xl font-semibold text-sky-600">{{ formatPhp(summary.sales) }}</p>
      </article>
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-slate-500">Total Expenses</p>
        <p class="mt-2 text-3xl font-semibold text-rose-600">{{ formatPhp(summary.expenses) }}</p>
      </article>
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-slate-500">Net Profit</p>
        <p class="mt-2 text-3xl font-semibold" :class="summary.net >= 0 ? 'text-emerald-600' : 'text-amber-600'">
          {{ formatPhp(summary.net) }}
        </p>
      </article>
    </section>

    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-100 px-5 py-4">
        <h2 class="text-lg font-semibold text-slate-900">Daily Financial Breakdown</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="border-b border-slate-100 bg-slate-50 text-slate-500">
            <tr>
              <th class="px-4 py-3 text-left">Date</th>
              <th class="px-4 py-3 text-right">Sales</th>
              <th class="px-4 py-3 text-right">Expenses</th>
              <th class="px-4 py-3 text-right">Net Profit</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-for="row in dailyRows" :key="row.day">
              <td class="px-4 py-3">{{ row.day }}</td>
              <td class="px-4 py-3 text-right">{{ formatPhp(row.sales) }}</td>
              <td class="px-4 py-3 text-right">{{ formatPhp(row.expenses) }}</td>
              <td class="px-4 py-3 text-right" :class="row.net >= 0 ? 'text-emerald-700' : 'text-amber-700'">
                {{ formatPhp(row.net) }}
              </td>
            </tr>
            <tr v-if="!dailyRows.length">
              <td colspan="4" class="px-4 py-8 text-center text-slate-400">No financial activity in selected date range.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { formatPhp } from '../../utils/format.js'

const { state } = useLaundryDb()
const from = ref('')
const to = ref('')
const exportFormat = ref('pdf')

onMounted(() => {
  const t = new Date()
  to.value = t.toISOString().slice(0, 10)
  const f = new Date(t)
  f.setDate(f.getDate() - 14)
  from.value = f.toISOString().slice(0, 10)
})

const summary = computed(() => {
  const f = from.value
  const t = to.value
  const sales = state.value.payments
    .filter((p) => {
      const day = (p.createdAt || '').slice(0, 10)
      return day >= f && day <= t
    })
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const expenses = state.value.expenses
    .filter((e) => e.date >= f && e.date <= t)
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  return {
    sales: Math.round(sales * 100) / 100,
    expenses: Math.round(expenses * 100) / 100,
    net: Math.round((sales - expenses) * 100) / 100,
  }
})

const dailyRows = computed(() => {
  const f = from.value
  const t = to.value
  const map = new Map()

  for (const p of state.value.payments) {
    const day = (p.createdAt || '').slice(0, 10)
    if (day < f || day > t) continue
    const row = map.get(day) || { day, sales: 0, expenses: 0, net: 0 }
    row.sales += Number(p.amount) || 0
    map.set(day, row)
  }
  for (const e of state.value.expenses) {
    const day = e.date
    if (day < f || day > t) continue
    const row = map.get(day) || { day, sales: 0, expenses: 0, net: 0 }
    row.expenses += Number(e.amount) || 0
    map.set(day, row)
  }

  return [...map.values()]
    .map((row) => ({
      ...row,
      sales: Math.round(row.sales * 100) / 100,
      expenses: Math.round(row.expenses * 100) / 100,
      net: Math.round((row.sales - row.expenses) * 100) / 100,
    }))
    .sort((a, b) => (a.day < b.day ? 1 : -1))
})

function baseFilename() {
  const a = String(from.value || 'start').replaceAll('-', '')
  const b = String(to.value || 'end').replaceAll('-', '')
  return `consolidated-report-${a}-${b}`
}

function generatedAtLabel() {
  return new Date().toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function runExport() {
  if (exportFormat.value === 'csv') exportCsv()
  else if (exportFormat.value === 'xlsx') exportXlsx()
  else exportPdf()
}

function exportCsv() {
  const s = summary.value
  const rows = dailyRows.value
  const lines = [
    ['Consolidated Report — Crystal Bubble Laundry Shop'],
    ['Generated', generatedAtLabel()],
    ['Date range (From)', from.value],
    ['Date range (To)', to.value],
    [],
    ['SUMMARY'],
    ['Metric', 'Amount (PHP)'],
    ['Total Sales', String(s.sales)],
    ['Total Expenses', String(s.expenses)],
    ['Net Profit', String(s.net)],
    [],
    ['DAILY FINANCIAL BREAKDOWN'],
    ['Date', 'Sales (PHP)', 'Expenses (PHP)', 'Net Profit (PHP)'],
    ...rows.map((r) => [r.day, String(r.sales), String(r.expenses), String(r.net)]),
  ]
  const csv = lines
    .map((row) =>
      row
        .map((cell) => {
          const v = String(cell ?? '')
          return `"${v.replaceAll('"', '""')}"`
        })
        .join(','),
    )
    .join('\n')
  downloadBlob(csv, `${baseFilename()}.csv`, 'text/csv;charset=utf-8;')
}

function exportXlsx() {
  const s = summary.value
  const rows = dailyRows.value
  const aoa = [
    ['Consolidated Report'],
    ['Crystal Bubble Laundry Shop'],
    [],
    ['Generated', generatedAtLabel()],
    ['From date', from.value],
    ['To date', to.value],
    [],
    ['SUMMARY'],
    ['Metric', 'Amount (PHP)'],
    ['Total Sales', s.sales],
    ['Total Expenses', s.expenses],
    ['Net Profit', s.net],
    [],
    ['DAILY FINANCIAL BREAKDOWN'],
    ['Date', 'Sales (PHP)', 'Expenses (PHP)', 'Net Profit (PHP)'],
    ...rows.map((r) => [r.day, r.sales, r.expenses, r.net]),
  ]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 18 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Consolidated Report')
  XLSX.writeFile(wb, `${baseFilename()}.xlsx`)
}

function exportPdf() {
  const s = summary.value
  const rows = dailyRows.value
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 48
  let y = 56

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(15, 23, 42)
  doc.text('Consolidated Report', margin, y)
  y += 22
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(71, 85, 105)
  doc.text('Crystal Bubble Laundry Shop', margin, y)
  y += 16
  doc.text(`Generated: ${generatedAtLabel()}`, margin, y)
  y += 14
  doc.text(`Date range: ${from.value} to ${to.value}`, margin, y)
  y += 28

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('Summary', margin, y)
  y += 6
  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Amount (PHP)']],
    body: [
      ['Total Sales', formatPhpPlain(s.sales)],
      ['Total Expenses', formatPhpPlain(s.expenses)],
      ['Net Profit', formatPhpPlain(s.net)],
    ],
    styles: { fontSize: 10, cellPadding: 8, textColor: [30, 41, 59] },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: margin, right: margin },
  })
  y = (doc.lastAutoTable?.finalY || y) + 24

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Daily Financial Breakdown', margin, y)
  y += 6
  autoTable(doc, {
    startY: y,
    head: [['Date', 'Sales (PHP)', 'Expenses (PHP)', 'Net Profit (PHP)']],
    body: rows.map((r) => [
      r.day,
      formatPhpPlain(r.sales),
      formatPhpPlain(r.expenses),
      formatPhpPlain(r.net),
    ]),
    styles: { fontSize: 9, cellPadding: 6, textColor: [30, 41, 59] },
    headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    margin: { left: margin, right: margin },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 3 && rows[data.row.index]) {
        const n = rows[data.row.index].net
        data.cell.styles.textColor = n >= 0 ? [4, 120, 87] : [180, 83, 9]
      }
    },
  })

  doc.save(`${baseFilename()}.pdf`)
}

function formatPhpPlain(n) {
  const v = Number(n) || 0
  return `PHP ${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
