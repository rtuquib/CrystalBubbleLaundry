<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-semibold text-slate-700">{{ pageTitle }}</h1>
      <p class="text-slate-500 mt-1">
        {{ pageSubtitle }}
      </p>
    </div>

    <div v-if="alerts.length" class="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
      <h2 class="text-sm font-semibold text-red-700 mb-2">Low stock alerts</h2>
      <ul class="text-sm text-red-700 space-y-1 list-disc pl-5">
        <li v-for="a in alerts" :key="a.id">
          {{ a.name }} — {{ a.quantity }} {{ a.unit }} (threshold {{ a.lowStockThreshold }})
        </li>
      </ul>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">SKUs tracked</p>
        <h2 class="text-3xl font-bold text-sky-500 leading-none">{{ items.length }}</h2>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Low stock</p>
        <h2 class="text-3xl font-bold text-red-500 leading-none">{{ alerts.length }}</h2>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Total on-hand (sum)</p>
        <h2
          class="text-2xl sm:text-3xl font-bold text-green-500 leading-none tracking-tight tabular-nums truncate"
          :title="formattedTotalUnits"
        >
          {{ formattedTotalUnits }}
        </h2>
      </div>
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p class="text-sm text-slate-400 mb-2">Categories</p>
        <h2 class="text-3xl font-bold text-amber-500 leading-none">{{ categories }}</h2>
      </div>
    </div>

    <div v-if="canManageCatalog" class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 mb-6">
      <h3 class="text-lg font-semibold text-slate-700 mb-1">Add supply</h3>
      <p class="text-sm text-slate-500 mb-4">Create a new stock keeping unit (detergent drums, bags, hangers, etc.).</p>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-slate-600 mb-1">Material name</label>
          <input
            v-model="newRow.name"
            type="text"
            class="w-full border rounded-xl px-3 py-2 text-sm"
            :class="addErrors.name ? 'border-red-300 bg-red-50/50' : 'border-slate-200'"
            placeholder="e.g. Liquid detergent (bulk)"
          />
          <p v-if="addErrors.name" class="text-xs text-red-600 mt-1">{{ addErrors.name }}</p>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Category</label>
          <select v-model="newRow.category" class="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
            <option value="detergent">Detergent</option>
            <option value="softener">Softener</option>
            <option value="packaging">Packaging</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
          <input
            v-model.number="newRow.quantity"
            type="number"
            min="0"
            class="w-full border rounded-xl px-3 py-2 text-sm"
            :class="addErrors.quantity ? 'border-red-300 bg-red-50/50' : 'border-slate-200'"
          />
          <p v-if="addErrors.quantity" class="text-xs text-red-600 mt-1">{{ addErrors.quantity }}</p>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Unit</label>
          <input
            v-model="newRow.unit"
            type="text"
            class="w-full border rounded-xl px-3 py-2 text-sm"
            :class="addErrors.unit ? 'border-red-300 bg-red-50/50' : 'border-slate-200'"
            placeholder="L, pcs, bottles"
          />
          <p v-if="addErrors.unit" class="text-xs text-red-600 mt-1">{{ addErrors.unit }}</p>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Low threshold</label>
          <input
            v-model.number="newRow.lowStockThreshold"
            type="number"
            min="0"
            class="w-full border rounded-xl px-3 py-2 text-sm"
            :class="addErrors.lowStockThreshold ? 'border-red-300 bg-red-50/50' : 'border-slate-200'"
          />
          <p v-if="addErrors.lowStockThreshold" class="text-xs text-red-600 mt-1">{{ addErrors.lowStockThreshold }}</p>
        </div>
      </div>
      <button
        type="button"
        class="mt-4 px-5 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600"
        @click="add"
      >
        Add material
      </button>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 class="text-lg font-semibold text-slate-700">Stock levels</h3>
        <input
          v-model="query"
          type="search"
          placeholder="Search material…"
          class="rounded-xl border border-slate-300 px-3 py-2 text-sm max-w-xs w-full"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-400 border-b border-slate-100">
              <th class="pb-3">Material</th>
              <th class="pb-3">Category</th>
              <th class="pb-3">On hand</th>
              <th class="pb-3">Threshold</th>
              <th class="pb-3">Status</th>
              <th class="pb-3">Actions</th>
            </tr>
          </thead>

          <tbody class="text-slate-600">
            <tr v-for="row in filteredItems" :key="row.id" class="border-b border-slate-100">
              <td class="py-3">
                <input
                  :value="row.name"
                  type="text"
                  class="w-full min-w-[140px] border border-slate-200 rounded-lg px-2 py-1 text-sm"
                  @change="onName(row.id, $event.target.value)"
                />
              </td>
              <td>
                <select
                  :value="row.category"
                  class="border border-slate-200 rounded-lg px-2 py-1 text-sm capitalize"
                  @change="onCategory(row.id, $event.target.value)"
                >
                  <option value="detergent">detergent</option>
                  <option value="softener">softener</option>
                  <option value="packaging">packaging</option>
                  <option value="other">other</option>
                </select>
              </td>
              <td>
                <input
                  :value="row.quantity"
                  type="number"
                  min="0"
                  class="w-24 border border-slate-200 rounded-lg px-2 py-1"
                  @change="onQty(row.id, $event.target.value)"
                />
                <span class="ml-1 text-xs text-slate-400">{{ row.unit }}</span>
              </td>
              <td>
                <input
                  :value="row.lowStockThreshold"
                  type="number"
                  min="0"
                  class="w-20 border border-slate-200 rounded-lg px-2 py-1"
                  @change="onThresh(row.id, $event.target.value)"
                />
              </td>
              <td>
                <span class="px-3 py-1 rounded-full text-xs font-medium" :class="statusClass(row)">
                  {{ statusLabel(row) }}
                </span>
              </td>
              <td>
                <button
                  v-if="canManageCatalog"
                  type="button"
                  class="text-xs rounded-lg border border-red-300 text-red-700 px-2 py-1 hover:bg-red-50"
                  @click="requestDelete(row)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmDialog
      v-model="deleteOpen"
      title="Remove inventory item?"
      :message="deleteMessage"
      confirm-label="Delete SKU"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import { useRoleAccess } from '../../composables/useRoleAccess.js'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { useToast } from '../../composables/useToast.js'
import { upsertInventoryItem, getInventoryAlerts, deleteInventoryItem } from '../../services/laundryDb.js'
import { nonNegativeNumber, required } from '../../utils/validation.js'

const { canManageAccounts } = useRoleAccess()
const canManageCatalog = canManageAccounts
const toast = useToast()

const pageTitle = computed(() => (canManageCatalog.value ? 'Inventory' : 'Inventory (operations)'))
const pageSubtitle = computed(() =>
  canManageCatalog.value
    ? 'Full SKU management: add materials, adjust counts, and remove obsolete lines.'
    : 'Adjust on-hand quantities and thresholds for daily operations. Adding or removing catalog items is limited to administrators.',
)

const { state } = useLaundryDb()

const items = computed(() => state.value.inventory)
const query = ref('')
const filteredItems = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return items.value
  return items.value.filter(
    (row) =>
      row.name.toLowerCase().includes(q) ||
      row.category.toLowerCase().includes(q),
  )
})

const alerts = computed(() => getInventoryAlerts())

const totalUnits = computed(() =>
  items.value.reduce((s, i) => s + (Number(i.quantity) || 0), 0),
)

const formattedTotalUnits = computed(() =>
  Number(totalUnits.value).toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }),
)

const categories = computed(() => new Set(items.value.map((i) => i.category)).size)

const newRow = reactive({
  name: '',
  category: 'detergent',
  quantity: 0,
  unit: 'units',
  lowStockThreshold: 10,
})

const addErrors = reactive({
  name: '',
  quantity: '',
  unit: '',
  lowStockThreshold: '',
})

const deleteOpen = ref(false)
const pendingDeleteId = ref('')
const pendingDeleteName = ref('')

const deleteMessage = computed(() =>
  pendingDeleteName.value
    ? `Delete “${pendingDeleteName.value}” from inventory? Stock history in reports may reference past usage.`
    : '',
)

function clearAddErrors() {
  addErrors.name = ''
  addErrors.quantity = ''
  addErrors.unit = ''
  addErrors.lowStockThreshold = ''
}

function validateAdd() {
  clearAddErrors()
  let ok = true
  const n = required(newRow.name, 'Material name')
  if (n) {
    addErrors.name = n
    ok = false
  }
  const q = nonNegativeNumber(newRow.quantity, 'Quantity')
  if (q) {
    addErrors.quantity = q
    ok = false
  }
  const u = required(newRow.unit, 'Unit')
  if (u) {
    addErrors.unit = u
    ok = false
  }
  const t = nonNegativeNumber(newRow.lowStockThreshold, 'Threshold')
  if (t) {
    addErrors.lowStockThreshold = t
    ok = false
  }
  return ok
}

function statusLabel(row) {
  if (row.quantity <= row.lowStockThreshold) {
    return row.quantity === 0 ? 'Out' : 'Low'
  }
  return 'OK'
}

function statusClass(row) {
  if (row.quantity <= row.lowStockThreshold) {
    return row.quantity === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
  }
  return 'bg-green-100 text-green-700'
}

function onQty(id, val) {
  try {
    upsertInventoryItem({ id, quantity: Number(val) })
    toast.push('Quantity updated.')
  } catch (e) {
    toast.push(e.message || 'Update failed', 'error')
  }
}

function onName(id, val) {
  try {
    upsertInventoryItem({ id, name: String(val || '') })
    toast.push('Material name saved.')
  } catch (e) {
    toast.push(e.message || 'Update failed', 'error')
  }
}

function onCategory(id, val) {
  try {
    upsertInventoryItem({ id, category: String(val || 'other') })
    toast.push('Category updated.')
  } catch (e) {
    toast.push(e.message || 'Update failed', 'error')
  }
}

function onThresh(id, val) {
  try {
    upsertInventoryItem({ id, lowStockThreshold: Number(val) })
    toast.push('Threshold updated.')
  } catch (e) {
    toast.push(e.message || 'Update failed', 'error')
  }
}

function add() {
  if (!validateAdd()) return
  try {
    upsertInventoryItem({ ...newRow })
    toast.push(`Added “${newRow.name.trim()}” to inventory.`)
    newRow.name = ''
    newRow.quantity = 0
    newRow.unit = 'units'
    newRow.lowStockThreshold = 10
    clearAddErrors()
  } catch (e) {
    toast.push(e.message || 'Could not add item', 'error')
  }
}

function requestDelete(row) {
  pendingDeleteId.value = row.id
  pendingDeleteName.value = row.name
  deleteOpen.value = true
}

function confirmDelete() {
  try {
    deleteInventoryItem(pendingDeleteId.value)
    toast.push('Inventory item removed.')
  } catch (e) {
    toast.push(e.message || 'Delete failed', 'error')
  }
  deleteOpen.value = false
  pendingDeleteId.value = ''
  pendingDeleteName.value = ''
}
</script>
