import { computed, ref } from 'vue'
import { useLaundryDb } from './useLaundryDb.js'

export function usePreferredStore() {
  const { tick, db } = useLaundryDb()
  const shopsLoading = ref(false)
  const shopsError = ref('')

  const shops = computed(() => {
    tick.value
    try {
      return db.listActiveStores()
    } catch (e) {
      shopsError.value = e.message || 'Unable to load laundry shops.'
      return []
    }
  })

  const session = computed(() => {
    tick.value
    try {
      const raw = localStorage.getItem('loggedInUser')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const preferredStoreId = computed(() => {
    tick.value
    const id = session.value?.id
    if (!id) return ''
    return db.getCustomerPreferredStoreId(id) || ''
  })

  const selectedShop = computed(() => {
    const id = preferredStoreId.value
    return shops.value.find((s) => s.id === id) || null
  })

  function loadShops() {
    shopsLoading.value = true
    shopsError.value = ''
    try {
      db.listActiveStores()
    } catch (e) {
      shopsError.value = e.message || 'Unable to load laundry shops.'
    } finally {
      shopsLoading.value = false
    }
  }

  function selectShop(storeId) {
    const accountId = session.value?.id
    if (!accountId) throw new Error('Please sign in to choose a laundry shop.')
    return db.setCustomerPreferredStore(accountId, storeId)
  }

  return {
    shops,
    shopsLoading,
    shopsError,
    preferredStoreId,
    selectedShop,
    loadShops,
    selectShop,
  }
}
