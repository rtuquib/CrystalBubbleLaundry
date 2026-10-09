<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-900">{{ pageTitle }}</h1>
        <p class="text-sm text-slate-500 mt-2">{{ pageSubtitle }}</p>
      </div>
      <button
        v-if="canCreateOrders"
        type="button"
        class="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium"
        @click="openCreate"
      >
        New order
      </button>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
      <table class="w-full text-sm min-w-[720px]">
        <thead>
          <tr class="text-left text-slate-500 border-b border-slate-200 bg-slate-50/80">
            <th class="py-3 px-2">Order</th>
            <th class="py-3 px-2">Customer</th>
            <th class="py-3 px-2">Status</th>
            <th class="py-3 px-2">Pickup</th>
            <th class="py-3 px-2 text-right">Total</th>
            <th class="py-3 px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in orders" :key="row.id" class="border-b border-slate-100">
            <td class="py-3 px-2 font-medium">{{ row.code }}</td>
            <td class="py-3 px-2">{{ customerName(row.customerId) }}</td>
            <td class="py-3 px-2">
              <select
                :value="row.status"
                :disabled="!orderEditStates[row.id]"
                :class="[
                  'rounded-lg border px-2 py-1.5 text-xs max-w-[140px]',
                  orderEditStates[row.id] 
                    ? 'border-slate-300 bg-white' 
                    : 'border-slate-200 bg-gray-100 cursor-not-allowed'
                ]"
                @change="setStatus(row.id, $event.target.value)"
              >
                <option v-for="status in statusOptions" :key="status" :value="status">
                  {{ labels[status] || status }}
                </option>
              </select>
            </td>
            <td class="py-3 px-2 whitespace-nowrap">{{ row.pickupDate }} {{ row.pickupTimeSlot }}</td>
            <td class="py-3 px-2 text-right">{{ formatPhp(row.total) }}</td>
            <td class="py-3 px-2 space-x-2 whitespace-nowrap">
              <button
                type="button"
                :class="[
                  'text-xs rounded-lg border px-2.5 py-1.5',
                  orderEditStates[row.id] 
                    ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
                    : 'border-slate-300 hover:bg-slate-50'
                ]"
                @click="toggleEditMode(row)"
              >
                {{ orderEditStates[row.id] ? 'Save' : 'Edit' }}
              </button>
              <button
                v-if="canCancelOrders"
                type="button"
                class="text-xs rounded-lg border border-amber-300 text-amber-800 px-2.5 py-1.5 hover:bg-amber-50"
                @click="requestCancel(row)"
              >
                Cancel
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="editing" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-slate-900 mb-4">{{ editForm.id ? 'Edit order' : 'Create order' }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Customer</label>
          <select
            v-model="editForm.customerId"
            class="w-full rounded-xl border px-3 py-2.5 text-sm"
            :class="fieldClass('customerId')"
          >
            <option v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.name }} ({{ customer.username }})
            </option>
          </select>
          <p v-if="formErrors.customerId" class="text-xs text-red-600 mt-1">{{ formErrors.customerId }}</p>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
          <input
            v-model.number="editForm.weightKg"
            type="number"
            min="0"
            step="0.1"
            class="w-full rounded-xl border px-3 py-2.5 text-sm"
            :class="fieldClass('weightKg')"
          />
          <p v-if="formErrors.weightKg" class="text-xs text-red-600 mt-1">{{ formErrors.weightKg }}</p>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Pickup date</label>
          <input
            v-model="editForm.pickupDate"
            type="date"
            class="w-full rounded-xl border px-3 py-2.5 text-sm"
            :class="fieldClass('pickupDate')"
          />
          <p v-if="formErrors.pickupDate" class="text-xs text-red-600 mt-1">{{ formErrors.pickupDate }}</p>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Pickup time</label>
          <input
            v-model="editForm.pickupTimeSlot"
            type="time"
            class="w-full rounded-xl border px-3 py-2.5 text-sm"
            :class="fieldClass('pickupTimeSlot')"
          />
          <p v-if="formErrors.pickupTimeSlot" class="text-xs text-red-600 mt-1">{{ formErrors.pickupTimeSlot }}</p>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Detergent</label>
          <select v-model="editForm.detergentId" class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
            <option v-for="d in detergents" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Scent / softener</label>
          <select v-model="editForm.scentId" class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
            <option v-for="s in scents" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <label v-for="key in serviceKeys" :key="key" class="inline-flex items-center gap-2 text-sm text-slate-700">
          <input v-model="editForm.services[key]" type="checkbox" class="rounded border-slate-300" />
          {{ serviceLabels[key] }}
        </label>
      </div>
      <div class="mt-4">
        <label class="block text-xs font-medium text-slate-600 mb-1">Notes (stains, folding, etc.)</label>
        <textarea
          v-model="editForm.notes"
          rows="3"
          placeholder="Order notes"
          class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
        />
      </div>
      <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
      <div class="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium"
          @click="saveOrder"
        >
          {{ editForm.id ? 'Save order' : 'Create order' }}
        </button>
        <button
          v-if="editForm.id && canDeleteRecords"
          type="button"
          class="rounded-xl border border-red-300 text-red-700 px-4 py-2.5 text-sm font-medium"
          @click="requestDeleteOrder"
        >
          Delete order
        </button>
        <button
          type="button"
          class="rounded-xl border border-slate-300 text-slate-700 px-4 py-2.5 text-sm font-medium"
          @click="closeEditor"
        >
          Close
        </button>
      </div>
    </section>

    <ConfirmDialog
      v-model="cancelDialogOpen"
      title="Cancel this order?"
      :message="cancelDialogMessage"
      confirm-label="Mark cancelled"
      cancel-label="Keep order"
      @confirm="confirmCancel"
    />

    <ConfirmDialog
      v-model="deleteDialogOpen"
      title="Delete order permanently?"
      :message="deleteDialogMessage"
      confirm-label="Delete order"
      cancel-label="Back"
      @confirm="confirmDeleteOrder"
    />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import {
  DETERGENT_OPTIONS,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  SCENT_OPTIONS,
  SERVICE_LABELS,
  SERVICE_TYPES,
} from '../../constants/laundry.js'
import { useRoleAccess } from '../../composables/useRoleAccess.js'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { useToast } from '../../composables/useToast.js'
import { cancelOrder, createOrder, deleteOrder, setOrderStatus, updateOrder } from '../../services/laundryDb.js'
import { formatPhp } from '../../utils/format.js'
import { positiveNumber, required } from '../../utils/validation.js'

const { state } = useLaundryDb()
const toast = useToast()
const { canCreateOrders, canCancelOrders, canDeleteRecords } = useRoleAccess()

const pageTitle = computed(() => (canCreateOrders.value ? 'Manage orders' : 'Orders'))
const pageSubtitle = computed(() =>
  canCreateOrders.value
    ? 'Full laundry order lifecycle with validation and confirmations.'
    : 'Update status and edit operational details. Creating, cancelling, and deleting orders is limited to administrators.',
)

const labels = ORDER_STATUS_LABELS
const statusOptions = computed(() => (canCancelOrders.value ? [...ORDER_STATUSES, 'cancelled'] : ORDER_STATUSES))
const serviceKeys = SERVICE_TYPES
const serviceLabels = SERVICE_LABELS
const detergents = DETERGENT_OPTIONS
const scents = SCENT_OPTIONS
const customers = computed(() => state.value.accounts.filter((a) => a.role === 'customer'))
const orders = computed(() => [...state.value.orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)))

// Reactive state to track edit modes for each order
const orderEditStates = reactive({})

const editing = ref(false)
const error = ref('')
const formErrors = reactive({
  customerId: '',
  weightKg: '',
  pickupDate: '',
  pickupTimeSlot: '',
})

const editForm = reactive({
  id: '',
  customerId: '',
  weightKg: 4,
  services: { wash: true, dry: true, fold: true, iron: false },
  detergentId: DETERGENT_OPTIONS[0].id,
  scentId: SCENT_OPTIONS[0].id,
  pickupDate: '',
  pickupTimeSlot: '14:00',
  notes: '',
})

const cancelDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const pendingCancelId = ref('')
const pendingCancelCode = ref('')

const cancelDialogMessage = computed(() =>
  pendingCancelCode.value
    ? `Order ${pendingCancelCode.value} will be marked as cancelled. You can still view it in the list.`
    : '',
)

const deleteDialogMessage = computed(() =>
  editForm.id
    ? `This will remove order ${editForm.id.slice(-8)} and its payment rows from the local database.`
    : '',
)

function customerName(id) {
  return state.value.accounts.find((x) => x.id === id)?.name || 'Unknown'
}

function toggleEditMode(row) {
  // Initialize the state if it doesn't exist
  if (orderEditStates[row.id] === undefined) {
    orderEditStates[row.id] = false
  }
  // Toggle the edit state
  orderEditStates[row.id] = !orderEditStates[row.id]
}

function clearFormErrors() {
  formErrors.customerId = ''
  formErrors.weightKg = ''
  formErrors.pickupDate = ''
  formErrors.pickupTimeSlot = ''
}

function fieldClass(key) {
  return formErrors[key] ? 'border-red-300 bg-red-50/50' : 'border-slate-300'
}

function validateOrderForm() {
  clearFormErrors()
  let ok = true
  const c = required(editForm.customerId, 'Customer')
  if (c) {
    formErrors.customerId = c
    ok = false
  }
  const w = positiveNumber(editForm.weightKg, 'Weight')
  if (w) {
    formErrors.weightKg = w
    ok = false
  }
  const d = required(editForm.pickupDate, 'Pickup date')
  if (d) {
    formErrors.pickupDate = d
    ok = false
  }
  const t = required(editForm.pickupTimeSlot, 'Pickup time')
  if (t) {
    formErrors.pickupTimeSlot = t
    ok = false
  }
  return ok
}

function openCreate() {
  editing.value = true
  error.value = ''
  clearFormErrors()
  Object.assign(editForm, {
    id: '',
    customerId: customers.value[0]?.id || '',
    weightKg: 4,
    services: { wash: true, dry: true, fold: true, iron: false },
    detergentId: DETERGENT_OPTIONS[0].id,
    scentId: SCENT_OPTIONS[0].id,
    pickupDate: new Date().toISOString().slice(0, 10),
    pickupTimeSlot: '14:00',
    notes: '',
  })
}

function openEdit(row) {
  editing.value = true
  error.value = ''
  clearFormErrors()
  Object.assign(editForm, {
    id: row.id,
    customerId: row.customerId,
    weightKg: row.lineItems.reduce((s, i) => s + (Number(i.weightKg) || 0), 0),
    services: { ...row.services },
    detergentId: row.detergentId,
    scentId: row.scentId,
    pickupDate: row.pickupDate,
    pickupTimeSlot: row.pickupTimeSlot,
    notes: row.notes || '',
  })
}

function closeEditor() {
  editing.value = false
}

function setStatus(orderId, status) {
  if (status === 'cancelled' && !canCancelOrders.value) return
  if (status === 'cancelled') {
    const row = state.value.orders.find((o) => o.id === orderId)
    pendingCancelId.value = orderId
    pendingCancelCode.value = row?.code || ''
    cancelDialogOpen.value = true
    return
  }
  try {
    setOrderStatus(orderId, status)
    toast.push('Order status updated.')
  } catch (e) {
    toast.push(e.message || 'Invalid status', 'error')
  }
}

function requestCancel(row) {
  pendingCancelId.value = row.id
  pendingCancelCode.value = row.code
  cancelDialogOpen.value = true
}

function confirmCancel() {
  try {
    cancelOrder(pendingCancelId.value)
    toast.push(`Order ${pendingCancelCode.value} cancelled.`)
  } catch (e) {
    toast.push(e.message || 'Could not cancel', 'error')
  }
  cancelDialogOpen.value = false
  pendingCancelId.value = ''
  pendingCancelCode.value = ''
}

function saveOrder() {
  error.value = ''
  if (!validateOrderForm()) return
  try {
    const payload = {
      customerId: editForm.customerId,
      lineItems: [{ description: 'Laundry load', weightKg: editForm.weightKg }],
      services: editForm.services,
      detergentId: editForm.detergentId,
      scentId: editForm.scentId,
      pickupDate: editForm.pickupDate,
      pickupTimeSlot: editForm.pickupTimeSlot,
      notes: editForm.notes,
    }
    if (editForm.id) {
      updateOrder(editForm.id, payload)
      toast.push('Order updated.')
    } else {
      createOrder(payload)
      toast.push('Order created.')
    }
    closeEditor()
  } catch (e) {
    error.value = e.message || 'Unable to save order'
    toast.push(error.value, 'error')
  }
}

function requestDeleteOrder() {
  if (!editForm.id || !canDeleteRecords.value) return
  deleteDialogOpen.value = true
}

function confirmDeleteOrder() {
  if (!editForm.id) return
  try {
    deleteOrder(editForm.id)
    toast.push('Order deleted.')
    deleteDialogOpen.value = false
    closeEditor()
  } catch (e) {
    toast.push(e.message || 'Delete failed', 'error')
    deleteDialogOpen.value = false
  }
}
</script>
