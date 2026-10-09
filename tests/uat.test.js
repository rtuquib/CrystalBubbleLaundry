import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  loadFreshSeedForTests,
  __clearMemoryStateForTests,
  registerCustomer,
  createOrder,
  authenticate,
  recordPayment,
  searchCustomers,
  getInventoryAlerts,
} from '../src/services/laundryDb.js'

/**
 * Automated user-acceptance style checks for core business journeys.
 */
describe('user acceptance flows', () => {
  beforeEach(() => {
    loadFreshSeedForTests()
  })

  afterEach(() => {
    __clearMemoryStateForTests()
  })

  it('registers a customer and places an order with preferences', () => {
    const session = registerCustomer({
      username: 'newcust',
      password: 'secret',
      name: 'New Customer',
      email: 'n@example.com',
      phone: '0999',
      address: 'City',
    })
    expect(session.username).toBe('newcust')
    const order = createOrder({
      customerId: session.id,
      lineItems: [{ description: 'Shirts', weightKg: 3 }],
      services: { wash: true, dry: true, fold: true, iron: false },
    })
    expect(order.total).toBeGreaterThan(0)
  })

  it('staff/admin can find customers and inventory alerts surface', () => {
    expect(searchCustomers('customer').length).toBeGreaterThan(0)
    expect(Array.isArray(getInventoryAlerts())).toBe(true)
  })

  it('customer can pay an order and receive a receipt id', () => {
    const s = authenticate('customer', '123456')
    const order = createOrder({
      customerId: s.id,
      lineItems: [{ weightKg: 1 }],
      services: { wash: true, dry: false, fold: false, iron: false },
    })
    const pay = recordPayment({ orderId: order.id, amount: order.total, method: 'digital' })
    expect(pay.receiptNumber).toMatch(/^RCP-/)
  })
})
