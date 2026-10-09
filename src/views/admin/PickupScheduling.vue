<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">Pickup Scheduling</h1>
      <p class="text-sm text-slate-500 mt-2">
        {{ pageSubtitle }}
      </p>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label class="block text-xs text-slate-500 mb-1">Pickup date</label>
          <input v-model="dateFilter" type="date" class="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1">Assigned staff</label>
          <select v-model="staffFilter" class="rounded-xl border border-slate-300 px-3 py-2 text-sm min-w-44">
            <option v-if="canAssignAnyStaff" value="">All staff</option>
            <option v-for="s in staffs" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-slate-500 border-b border-slate-200">
              <th class="py-2">Order</th>
              <th class="py-2">Customer</th>
              <th class="py-2">Pickup Date</th>
              <th class="py-2">Pickup Time</th>
              <th class="py-2">Assigned Staff</th>
              <th class="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in editableRows" :key="row.id" class="border-b border-slate-100">
              <td class="py-3 font-medium text-slate-800">{{ row.code }}</td>
              <td class="py-3">{{ customerName(row.customerId) }}</td>
              <td class="py-3">
                <input
                  v-model="row.pickupDate"
                  type="date"
                  class="rounded-lg border border-slate-300 px-2 py-1.5"
                  :readonly="!row.isEditing"
                  :class="{ 'bg-gray-100': !row.isEditing, 'bg-white': row.isEditing }"
                />
              </td>
              <td class="py-3">
                <input
                  v-model="row.pickupTimeSlot"
                  type="time"
                  class="rounded-lg border border-slate-300 px-2 py-1.5"
                  :readonly="!row.isEditing"
                  :class="{ 'bg-gray-100': !row.isEditing, 'bg-white': row.isEditing }"
                />
              </td>
              <td class="py-3">
                <select
                  v-model="row.assignedStaffId"
                  class="rounded-lg border border-slate-300 px-2 py-1.5 min-w-40"
                  :disabled="!row.isEditing"
                  :class="{ 'bg-gray-100': !row.isEditing, 'bg-white': row.isEditing }"
                >
                  <option value="">Unassigned</option>
                  <option v-for="s in assignableStaff" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </td>
              <td class="py-3">
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="rounded-lg bg-slate-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-700"
                    @click="editRow(row)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-blue-700"
                    @click="saveRow(row)"
                  >
                    Save
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!editableRows.length">
              <td colspan="6" class="py-8 text-center text-slate-400">No schedules found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import { useRoleAccess } from '../../composables/useRoleAccess.js'
import { useLaundryDb } from '../../composables/useLaundryDb.js'
import { getSession } from '../../router/guards.js'
import { getPickupSchedules, upsertPickupSchedule } from '../../services/laundryDb.js'

const { canAssignAnyStaff } = useRoleAccess()
const pageSubtitle = computed(() =>
  canAssignAnyStaff.value
    ? 'Assign staff, update pickup schedules, and reschedule customer orders.'
    : 'Update pickup times and assign pickups to yourself. Full staff assignment is managed by administrators.',
)

const { state } = useLaundryDb()
const dateFilter = ref('')
const staffFilter = ref('')
const formRows = reactive([])

const allStaff = computed(() => state.value.accounts.filter((a) => a.role === 'staff'))

const staffs = computed(() => {
  if (canAssignAnyStaff.value) return allStaff.value
  const me = getSession()?.id
  return me ? allStaff.value.filter((s) => s.id === me) : allStaff.value
})

const assignableStaff = computed(() => staffs.value)

watch(
  [canAssignAnyStaff, () => getSession()?.id],
  () => {
    if (!canAssignAnyStaff.value && getSession()?.id) {
      staffFilter.value = getSession().id
    }
  },
  { immediate: true },
)

const sourceRows = computed(() =>
  getPickupSchedules({ date: dateFilter.value, staffId: staffFilter.value }),
)

watchEffect(() => {
  formRows.splice(
    0,
    formRows.length,
    ...sourceRows.value.map((row) => ({
      id: row.id,
      code: row.code,
      customerId: row.customerId,
      pickupDate: row.pickupDate || '',
      pickupTimeSlot: row.pickupTimeSlot || '',
      assignedStaffId: row.assignedStaffId || '',
      isEditing: false,
    })),
  )
})

const editableRows = computed(() => formRows)

function customerName(id) {
  return state.value.accounts.find((a) => a.id === id)?.name || 'Unknown'
}

function editRow(row) {
  // Enable editing mode for this specific row
  row.isEditing = true
}

function saveRow(row) {
  upsertPickupSchedule(row.id, {
    pickupDate: row.pickupDate,
    pickupTimeSlot: row.pickupTimeSlot,
    assignedStaffId: row.assignedStaffId || null,
  })
  // Exit editing mode after saving
  row.isEditing = false
}
</script>
