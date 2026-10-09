import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as laundryDb from '../services/laundryDb.js'

export function useLaundryDb() {
  const tick = ref(0)
  const refresh = () => {
    tick.value += 1
  }

  onMounted(() => {
    window.addEventListener('laundry-db-updated', refresh)
  })
  onUnmounted(() => {
    window.removeEventListener('laundry-db-updated', refresh)
  })

  const state = computed(() => {
    tick.value
    // Super admin pages that need platform-wide data should call getState() directly.
    // Admin/staff/customer UIs get store-scoped data.
    return laundryDb.getTenantState()
  })

  return {
    tick,
    refresh,
    state,
    db: laundryDb,
  }
}
