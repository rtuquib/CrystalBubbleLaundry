import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  loadFreshSeedForTests,
  __clearMemoryStateForTests,
  createOrder,
  getState,
  authenticate,
  STORE_MAIN_ID,
  recordPayment,
  updatePayment,
  deletePayment,
  validateDataIntegrity,
  setOrderStatus,
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

function loginAs(username) {
  const session = authenticate(username, '123456')
  localStorage.setItem('loggedInUser', JSON.stringify(session))
  return session
}

describe('laundryDb integration', () => {
  beforeEach(() => {
    installMemoryLocalStorage()
    loadFreshSeedForTests()
  })

  afterEach(() => {
    __clearMemoryStateForTests()
  })

  it('authenticates seeded accounts', () => {
    expect(authenticate('customer', '123456')).toBeTruthy()
    expect(authenticate('nope', 'bad')).toBeNull()
  })

  it('creates orders and payments with referential integrity', () => {
    const session = loginAs('customer')
    const order = createOrder({
      customerId: session.id,
      storeId: STORE_MAIN_ID,
      lineItems: [{ description: 'Test', weightKg: 2 }],
      services: { wash: true, dry: true, fold: false, iron: false },
    })
    expect(order.code).toMatch(/^CB-/)
    expect(order.storeId).toBe(STORE_MAIN_ID)
    loginAs('staff')
    recordPayment({ orderId: order.id, amount: order.total, method: 'cash' })
    const v = validateDataIntegrity()
    expect(v.ok).toBe(true)
  })

  it('advances status pipeline', () => {
    const o = getState().orders[0]
    setOrderStatus(o.id, 'processing')
    const updated = getState().orders.find((x) => x.id === o.id)
    expect(updated.status).toBe('processing')
  })

  it('updates and deletes payments while keeping integrity', () => {
    loginAs('staff')
    const order = getState().orders.find((x) => x.status !== 'cancelled')
    expect(order).toBeTruthy()
    const p = recordPayment({ orderId: order.id, amount: 50, method: 'cash' })
    updatePayment(p.id, { amount: 55 })
    const afterEdit = getState().payments.find((x) => x.id === p.id)
    expect(afterEdit.amount).toBe(55)
    expect(afterEdit.storeId).toBe(order.storeId)
    deletePayment(p.id)
    expect(getState().payments.some((x) => x.id === p.id)).toBe(false)
    expect(validateDataIntegrity().ok).toBe(true)
  })
})
