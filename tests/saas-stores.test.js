import { beforeEach, describe, expect, it } from 'vitest'
import {
  STORE_DAVAO_ID,
  STORE_MAIN_ID,
  __clearMemoryStateForTests,
  authenticate,
  createOrder,
  createStore,
  getPlatformSummary,
  getStoreMetrics,
  getTenantState,
  listStores,
  loadFreshSeedForTests,
  searchCustomers,
  searchStaff,
  setCustomerPreferredStore,
  setStoreStatus,
} from '../src/services/laundryDb.js'

function installMemoryLocalStorage() {
  const map = new Map()
  globalThis.localStorage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(String(k), String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  }
}

describe('SaaS multi-store', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    __clearMemoryStateForTests()
    loadFreshSeedForTests()
  })

  it('seeds two stores and demo accounts', () => {
    const stores = listStores()
    expect(stores.map((s) => s.id).sort()).toEqual([STORE_DAVAO_ID, STORE_MAIN_ID].sort())
    expect(authenticate('admin', '123456').storeId).toBe(STORE_MAIN_ID)
    expect(authenticate('admin.davao', '123456').storeId).toBe(STORE_DAVAO_ID)
    expect(authenticate('superadmin', '123456').storeId).toBeNull()
  })

  it('scopes tenant lists by logged-in store', () => {
    localStorage.setItem('loggedInUser', JSON.stringify(authenticate('admin', '123456')))
    const customers = searchCustomers('')
    expect(customers.every((c) => c.storeId === STORE_MAIN_ID)).toBe(true)
    expect(customers.some((c) => c.username === 'customer')).toBe(true)
    expect(customers.some((c) => c.username === 'customer.davao')).toBe(false)

    localStorage.setItem('loggedInUser', JSON.stringify(authenticate('staff.davao', '123456')))
    const staff = searchStaff('')
    expect(staff.every((s) => s.storeId === STORE_DAVAO_ID)).toBe(true)
  })

  it('builds platform summary and store metrics', () => {
    const summary = getPlatformSummary()
    expect(summary.stores).toBe(2)
    expect(summary.active).toBe(2)
    const main = getStoreMetrics(STORE_MAIN_ID)
    expect(main.admins).toBeGreaterThanOrEqual(1)
    expect(main.orders).toBeGreaterThanOrEqual(1)
  })

  it('lets super admin create a store with first admin', () => {
    localStorage.setItem('loggedInUser', JSON.stringify(authenticate('superadmin', '123456')))
    const { store, admin } = createStore({
      name: 'CrystalBubble Cebu',
      address: 'Cebu City',
      contactEmail: 'cebu@test.com',
      adminName: 'Cebu Admin',
      adminEmail: 'cebu.admin@test.com',
      adminUsername: 'admin.cebu',
      adminPassword: '123456',
    })
    expect(store.code).toBeTruthy()
    expect(admin.storeId).toBe(store.id)
    expect(getPlatformSummary().stores).toBe(3)
  })

  it('blocks login when store is suspended', () => {
    localStorage.setItem('loggedInUser', JSON.stringify(authenticate('superadmin', '123456')))
    setStoreStatus(STORE_MAIN_ID, 'suspended')
    expect(() => authenticate('admin', '123456')).toThrow(/suspended/i)
  })

  it('returns tenant-scoped state for store users', () => {
    localStorage.setItem('loggedInUser', JSON.stringify(authenticate('admin', '123456')))
    const tenant = getTenantState()
    expect(tenant.orders.every((o) => o.storeId === STORE_MAIN_ID)).toBe(true)
    expect(tenant.inventory.every((i) => i.storeId === STORE_MAIN_ID)).toBe(true)
  })

  it('stores the selected shop on each order and keeps past orders after a preference change', () => {
    const session = authenticate('customer', '123456')
    localStorage.setItem('loggedInUser', JSON.stringify(session))
    expect(() =>
      createOrder({
        customerId: session.id,
        lineItems: [{ description: 'No shop', weightKg: 2 }],
        services: { wash: true, dry: false, fold: false, iron: false },
      }),
    ).toThrow(/laundry shop/i)

    setCustomerPreferredStore(session.id, STORE_DAVAO_ID)
    const first = createOrder({
      customerId: session.id,
      storeId: STORE_DAVAO_ID,
      lineItems: [{ description: 'Labachine load', weightKg: 2 }],
      services: { wash: true, dry: true, fold: false, iron: false },
    })
    expect(first.storeId).toBe(STORE_DAVAO_ID)
    expect(first.branch).toBe('Labachine')

    setCustomerPreferredStore(session.id, STORE_MAIN_ID)
    const second = createOrder({
      customerId: session.id,
      storeId: STORE_MAIN_ID,
      lineItems: [{ description: 'Main load', weightKg: 2 }],
      services: { wash: true, dry: false, fold: true, iron: false },
    })
    expect(second.storeId).toBe(STORE_MAIN_ID)
    expect(first.storeId).toBe(STORE_DAVAO_ID)
  })

  it('rejects inactive shops on customer orders', () => {
    const session = authenticate('customer', '123456')
    localStorage.setItem('loggedInUser', JSON.stringify(authenticate('superadmin', '123456')))
    setStoreStatus(STORE_DAVAO_ID, 'suspended')
    localStorage.setItem('loggedInUser', JSON.stringify(session))
    expect(() =>
      createOrder({
        customerId: session.id,
        storeId: STORE_DAVAO_ID,
        lineItems: [{ description: 'Closed shop', weightKg: 1 }],
        services: { wash: true, dry: false, fold: false, iron: false },
      }),
    ).toThrow(/unavailable/i)
  })
})
