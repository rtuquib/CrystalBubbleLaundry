import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Derives workspace role from route prefix (/admin vs /staff).
 * Used to show/hide admin-only actions on shared module pages.
 */
export function useRoleAccess() {
  const route = useRoute()
  const isAdminWorkspace = computed(() => route.path.startsWith('/admin'))
  const isStaffWorkspace = computed(() => route.path.startsWith('/staff'))
  return {
    isAdminWorkspace,
    isStaffWorkspace,
    /** Admin: full customer/staff account lifecycle */
    canManageAccounts: computed(() => isAdminWorkspace.value),
    /** Admin: destructive deletes (orders, inventory SKUs, customers) */
    canDeleteRecords: computed(() => isAdminWorkspace.value),
    /** Admin: cancel orders, create orders on behalf of customers */
    canCancelOrders: computed(() => isAdminWorkspace.value),
    canCreateOrders: computed(() => isAdminWorkspace.value),
    /** Admin: assign pickups to any staff member */
    canAssignAnyStaff: computed(() => isAdminWorkspace.value),
  }
}
