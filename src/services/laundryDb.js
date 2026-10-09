import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  DETERGENT_OPTIONS,
  SCENT_OPTIONS,
  SERVICE_LABELS,
} from '../constants/laundry.js'
import { computeOrderTotals } from './pricing.js'

const STORAGE_KEY = 'cbl_laundry_db_v4'
const LEGACY_STORAGE_KEY = 'cbl_laundry_db_v3'

export const STORE_MAIN_ID = 'store_main'
export const STORE_DAVAO_ID = 'store_davao'

function newId(prefix) {
  const u =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}_${u}`
}

function notify() {
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('laundry-db-updated'))
  }
}

function todayISODate() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getCurrentRole() {
  try {
    const raw = localStorage.getItem('loggedInUser')
    return raw ? JSON.parse(raw)?.role || '' : ''
  } catch {
    return ''
  }
}

function getCurrentSession() {
  try {
    const raw = localStorage.getItem('loggedInUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function assertRole(allowedRoles) {
  const role = getCurrentRole()
  if (!allowedRoles.includes(role)) {
    throw new Error('You do not have permission to perform this action.')
  }
}

/** Idle cutoff for "online". Max wall-clock lifetime is SESSION_TTL_MS. */
export const SESSION_IDLE_MS = 5 * 60 * 1000
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000

function ensureSessions(state) {
  if (!Array.isArray(state.sessions)) {
    state.sessions = []
    return true
  }
  return false
}

function computeSessionStatus(session, now = Date.now()) {
  if (!session) return 'offline'
  if (session.endedAt) {
    return session.endReason === 'expired' ? 'expired' : 'offline'
  }
  const last = new Date(session.lastActivityAt || session.startedAt).getTime()
  const exp = new Date(session.expiresAt || 0).getTime()
  if (!Number.isFinite(last) || now - last > SESSION_IDLE_MS) return 'expired'
  if (Number.isFinite(exp) && now > exp) return 'expired'
  return 'online'
}

function expireStaleSessions(state, now = Date.now()) {
  let changed = false
  for (const session of state.sessions || []) {
    if (session.endedAt) continue
    if (computeSessionStatus(session, now) !== 'expired') continue
    session.endedAt = new Date(now).toISOString()
    session.endReason = 'expired'
    changed = true
  }
  return changed
}

function beginAuthSession(state, acc) {
  ensureSessions(state)
  expireStaleSessions(state)
  const now = Date.now()
  for (const session of state.sessions) {
    if (session.accountId === acc.id && !session.endedAt) {
      session.endedAt = new Date(now).toISOString()
      session.endReason = 'replaced'
    }
  }
  const row = {
    id: newId('sess'),
    accountId: acc.id,
    role: acc.role,
    storeId: acc.storeId || null,
    startedAt: new Date(now).toISOString(),
    lastActivityAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    endedAt: null,
    endReason: null,
  }
  state.sessions.unshift(row)
  state.sessions = state.sessions.slice(0, 500)
  log(state, 'info', 'Account signed in', {
    accountId: acc.id,
    role: acc.role,
    sessionId: row.id,
    storeId: row.storeId,
  })
  persist(state)
  return row
}

function generateOfficialReceiptNumber(state, date = new Date()) {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, '')
  const prefix = `OR-${stamp}-`
  const todays = state.payments
    .map((p) => String(p.receiptNumber || ''))
    .filter((n) => n.startsWith(prefix))
  const next = todays.length + 1
  return `${prefix}${String(next).padStart(4, '0')}`
}

function persist(state) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
  notify()
}

let memoryOverride = null

export function __setMemoryStateForTests(state) {
  memoryOverride = state
  cache = null
}

export function __clearMemoryStateForTests() {
  memoryOverride = null
  cache = null
}

function readRaw() {
  if (memoryOverride !== null) return memoryOverride
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    return legacy ? JSON.parse(legacy) : null
  } catch {
    return null
  }
}

function makeOrder(partial) {
  const lineItems = partial.lineItems
  const services = partial.services
  const detergentId = partial.detergentId
  const scentId = partial.scentId
  return {
    ...partial,
    ...computeOrderTotals(lineItems, services, detergentId, scentId),
    createdAt: partial.createdAt || new Date().toISOString(),
    updatedAt: partial.updatedAt || new Date().toISOString(),
  }
}

function createSeed() {
  const now = new Date().toISOString()
  const customerId = 'acc_customer_demo'
  const davaoCustomerId = 'acc_customer_davao'

  const stores = [
    {
      id: STORE_MAIN_ID,
      code: 'CB-MAIN',
      name: 'CrystalBubble Main',
      address: 'Obrero, Davao City',
      contactEmail: 'main@crystalbubble.test',
      status: 'active',
      createdAt: now,
    },
    {
      id: STORE_DAVAO_ID,
      code: 'CB-SURIGAO-CITY',
      name: 'Labachine',
      address: 'Surigao City',
      contactEmail: 'davao@crystalbubble.test',
      status: 'active',
      createdAt: now,
    },
  ]

  const order1 = makeOrder({
    id: 'ord_seed_1',
    code: 'CB-1001',
    storeId: STORE_MAIN_ID,
    customerId,
    status: 'washing',
    lineItems: [{ id: 'li1', description: 'Mixed garments', weightKg: 5 }],
    services: { wash: true, dry: true, fold: true, iron: false },
    detergentId: DETERGENT_OPTIONS[0].id,
    scentId: SCENT_OPTIONS[1].id,
    pickupDate: todayISODate(),
    pickupTimeSlot: '14:00',
    branch: 'CrystalBubble Main',
    notes: '',
  })

  const order2 = makeOrder({
    id: 'ord_seed_2',
    code: 'CB-1002',
    storeId: STORE_MAIN_ID,
    customerId,
    status: 'completed',
    lineItems: [{ id: 'li2', description: 'Delicates', weightKg: 3 }],
    services: { wash: true, dry: true, fold: false, iron: true },
    detergentId: DETERGENT_OPTIONS[1].id,
    scentId: SCENT_OPTIONS[0].id,
    pickupDate: todayISODate(),
    pickupTimeSlot: '10:00',
    branch: 'CrystalBubble Main',
    notes: '',
  })

  const order3 = makeOrder({
    id: 'ord_seed_3',
    code: 'CB-2001',
    storeId: STORE_DAVAO_ID,
    customerId: davaoCustomerId,
    status: 'received',
    lineItems: [{ id: 'li3', description: 'Family load', weightKg: 8 }],
    services: { wash: true, dry: true, fold: true, iron: false },
    detergentId: DETERGENT_OPTIONS[0].id,
    scentId: SCENT_OPTIONS[0].id,
    pickupDate: todayISODate(),
    pickupTimeSlot: '16:00',
    branch: 'Labachine',
    notes: '',
  })

  return {
    version: 4,
    meta: { orderSeq: 2002, paymentSeq: 4, receiptSeq: 4 },
    stores,
    accounts: [
      {
        id: 'acc_super_admin',
        username: 'superadmin',
        password: '123456',
        role: 'super_admin',
        storeId: null,
        name: 'Platform Super Admin',
        email: 'superadmin@crystalbubble.test',
        phone: '',
        address: '',
        preferredDetergentId: null,
        preferredScentId: null,
        preferredStoreId: null,
        createdAt: now,
      },
      {
        id: 'acc_admin',
        username: 'admin',
        password: '123456',
        role: 'admin',
        storeId: STORE_MAIN_ID,
        name: 'Main Store Admin',
        email: 'admin@crystalbubble.test',
        phone: '',
        address: '',
        preferredDetergentId: null,
        preferredScentId: null,
        preferredStoreId: null,
        createdAt: now,
      },
      {
        id: 'acc_staff',
        username: 'staff',
        password: '123456',
        role: 'staff',
        storeId: STORE_MAIN_ID,
        name: 'Main Store Staff',
        email: 'staff@crystalbubble.test',
        phone: '',
        address: '',
        preferredDetergentId: null,
        preferredScentId: null,
        preferredStoreId: null,
        createdAt: now,
      },
      {
        id: customerId,
        username: 'customer',
        password: '123456',
        role: 'customer',
        storeId: STORE_MAIN_ID,
        name: 'Ronnel Vince',
        email: 'ronnel@example.com',
        phone: '09123456789',
        address: 'Obrero, Davao City',
        preferredDetergentId: DETERGENT_OPTIONS[0].id,
        preferredScentId: SCENT_OPTIONS[1].id,
        preferredStoreId: null,
        createdAt: now,
      },
      {
        id: 'acc_admin_davao',
        username: 'admin.davao',
        password: '123456',
        role: 'admin',
        storeId: STORE_DAVAO_ID,
        name: 'Davao Store Admin',
        email: 'admin.davao@crystalbubble.test',
        phone: '',
        address: '',
        preferredDetergentId: null,
        preferredScentId: null,
        preferredStoreId: null,
        createdAt: now,
      },
      {
        id: 'acc_staff_davao',
        username: 'staff.davao',
        password: '123456',
        role: 'staff',
        storeId: STORE_DAVAO_ID,
        name: 'Davao Store Staff',
        email: 'staff.davao@crystalbubble.test',
        phone: '',
        address: '',
        preferredDetergentId: null,
        preferredScentId: null,
        preferredStoreId: null,
        createdAt: now,
      },
      {
        id: davaoCustomerId,
        username: 'customer.davao',
        password: '123456',
        role: 'customer',
        storeId: STORE_DAVAO_ID,
        name: 'Ana Reyes',
        email: 'ana.davao@example.com',
        phone: '09181234567',
        address: 'Lanang, Davao City',
        preferredDetergentId: DETERGENT_OPTIONS[1].id,
        preferredScentId: SCENT_OPTIONS[0].id,
        preferredStoreId: null,
        createdAt: now,
      },
    ],
    orders: [order1, order2, order3],
    payments: [
      {
        id: 'pay_seed_0',
        storeId: STORE_MAIN_ID,
        orderId: order1.id,
        amount: 150,
        method: 'cash',
        status: 'partial',
        receiptNumber: 'OR-20260404-0002',
        recordedBy: 'acc_staff',
        createdAt: now,
      },
      {
        id: 'pay_seed_1',
        storeId: STORE_MAIN_ID,
        orderId: order2.id,
        amount: order2.total,
        method: 'digital',
        status: 'paid',
        receiptNumber: 'OR-20260404-0001',
        recordedBy: 'acc_staff',
        createdAt: now,
      },
      {
        id: 'pay_seed_2',
        storeId: STORE_DAVAO_ID,
        orderId: order3.id,
        amount: 200,
        method: 'cash',
        status: 'partial',
        receiptNumber: 'OR-20260404-0003',
        recordedBy: 'acc_staff_davao',
        createdAt: now,
      },
    ],
    inventory: [
      { id: 'inv_1', storeId: STORE_MAIN_ID, name: 'Liquid detergent (bulk)', category: 'detergent', quantity: 15, unit: 'L', lowStockThreshold: 20 },
      { id: 'inv_2', storeId: STORE_MAIN_ID, name: 'Fabric softener', category: 'softener', quantity: 10, unit: 'L', lowStockThreshold: 12 },
      { id: 'inv_3', storeId: STORE_MAIN_ID, name: 'Plastic garment bags', category: 'packaging', quantity: 3, unit: '100 pcs', lowStockThreshold: 10 },
      { id: 'inv_4', storeId: STORE_MAIN_ID, name: 'Stain remover', category: 'other', quantity: 40, unit: 'bottles', lowStockThreshold: 8 },
      { id: 'inv_d1', storeId: STORE_DAVAO_ID, name: 'Liquid detergent (bulk)', category: 'detergent', quantity: 22, unit: 'L', lowStockThreshold: 15 },
      { id: 'inv_d2', storeId: STORE_DAVAO_ID, name: 'Fabric softener', category: 'softener', quantity: 14, unit: 'L', lowStockThreshold: 10 },
      { id: 'inv_d3', storeId: STORE_DAVAO_ID, name: 'Plastic garment bags', category: 'packaging', quantity: 18, unit: '100 pcs', lowStockThreshold: 8 },
    ],
    expenses: [
      { id: 'exp_1', storeId: STORE_MAIN_ID, description: 'Utilities (Apr 1–7)', amount: 1200, date: todayISODate() },
      { id: 'exp_2', storeId: STORE_MAIN_ID, description: 'Supplies restock', amount: 900, date: todayISODate() },
      { id: 'exp_d1', storeId: STORE_DAVAO_ID, description: 'Rent (April)', amount: 15000, date: todayISODate() },
    ],
    sessions: [],
    systemLogs: [
      {
        id: 'log_seed',
        level: 'info',
        message: 'SaaS multi-store database initialized',
        meta: {},
        createdAt: now,
      },
    ],
    messages: [
      {
        id: 'msg_seed_1',
        storeId: STORE_MAIN_ID,
        fromId: 'acc_admin',
        toId: 'acc_staff',
        body: 'Please prioritize ready-for-pickup orders this afternoon.',
        createdAt: now,
        readBy: ['acc_admin'],
      },
      {
        id: 'msg_seed_2',
        storeId: STORE_DAVAO_ID,
        fromId: 'acc_admin_davao',
        toId: 'acc_staff_davao',
        body: 'New walk-in orders expected this weekend.',
        createdAt: now,
        readBy: ['acc_admin_davao'],
      },
    ],
  }
}

function mergeSeedWithAccounts(seed, existingAccounts) {
  const byUser = new Map(existingAccounts.map((a) => [a.username, a]))
  const merged = seed.accounts.map((a) => {
    const cur = byUser.get(a.username)
    return cur ? { ...a, ...cur, id: cur.id } : a
  })
  for (const a of existingAccounts) {
    if (!merged.some((m) => m.id === a.id)) merged.push(a)
  }
  return merged
}

const DEMO_ACCOUNT_USERNAMES = [
  'superadmin',
  'admin',
  'staff',
  'customer',
  'admin.davao',
  'staff.davao',
  'customer.davao',
]

function ensureDemoStores(state) {
  if (!Array.isArray(state.stores)) state.stores = []
  const seed = createSeed()
  let changed = false
  for (const demo of seed.stores) {
    const existing = state.stores.find((s) => s.id === demo.id || s.code === demo.code)
    if (!existing) {
      state.stores.push({ ...demo })
      changed = true
      continue
    }
    if (existing.name !== demo.name) {
      existing.name = demo.name
      changed = true
    }
    if (existing.code !== demo.code) {
      existing.code = demo.code
      changed = true
    }
    if (existing.address !== demo.address) {
      existing.address = demo.address
      changed = true
    }
  }
  for (const order of state.orders || []) {
    if (order.storeId === STORE_DAVAO_ID && order.branch === 'CrystalBubble Davao') {
      order.branch = 'Labachine'
      changed = true
    }
  }
  return changed
}

function ensureDemoAccounts(state) {
  const seed = createSeed()
  let changed = ensureDemoStores(state)
  for (const demo of seed.accounts.filter((a) => DEMO_ACCOUNT_USERNAMES.includes(a.username))) {
    const existing = state.accounts.find(
      (a) => a.id === demo.id || a.username === demo.username || (demo.email && a.email === demo.email),
    )
    if (!existing) {
      state.accounts.unshift({ ...demo })
      changed = true
      continue
    }

    if (
      existing.username !== demo.username ||
      existing.password !== demo.password ||
      existing.role !== demo.role ||
      existing.email !== demo.email ||
      existing.storeId !== demo.storeId
    ) {
      existing.username = demo.username
      existing.password = demo.password
      existing.role = demo.role
      existing.email = demo.email
      existing.storeId = demo.storeId
      if (!existing.name) existing.name = demo.name
      changed = true
    }
  }
  return changed
}

function migrateToV4(state) {
  let changed = false
  if (!Array.isArray(state.stores) || !state.stores.length) {
    state.stores = createSeed().stores.map((s) => ({ ...s }))
    changed = true
  }

  const mainId = state.stores.find((s) => s.id === STORE_MAIN_ID)?.id || state.stores[0]?.id || STORE_MAIN_ID

  for (const acc of state.accounts || []) {
    if (acc.role === 'super_admin') {
      if (acc.storeId != null) {
        acc.storeId = null
        changed = true
      }
      continue
    }
    if (!acc.storeId) {
      acc.storeId = mainId
      changed = true
    }
  }

  for (const collection of ['orders', 'payments', 'inventory', 'expenses', 'messages']) {
    if (!Array.isArray(state[collection])) {
      state[collection] = []
      changed = true
      continue
    }
    for (const row of state[collection]) {
      if (!row.storeId) {
        row.storeId = mainId
        changed = true
      }
    }
  }

  if (state.version !== 4) {
    state.version = 4
    changed = true
  }
  return changed
}

export function ensureDemoCredentials() {
  const state = getState()
  let changed = migrateToV4(state)
  if (ensureDemoAccounts(state)) changed = true
  if (changed) persist(state)
  return state
}

function normalizeOfficialReceipts(state) {
  if (!Array.isArray(state.payments) || !Array.isArray(state.orders)) return false
  let changed = false

  const seqByDay = new Map()
  for (const p of state.payments) {
    const n = String(p.receiptNumber || '')
    const m = /^OR-(\d{8})-(\d{4})$/.exec(n)
    if (!m) continue
    const day = m[1]
    const seq = Number(m[2]) || 0
    seqByDay.set(day, Math.max(seqByDay.get(day) || 0, seq))
  }

  const sorted = [...state.payments].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
  for (const p of sorted) {
    if (p.status !== 'paid') continue
    if (String(p.receiptNumber || '').startsWith('OR-')) continue
    const createdAt = p.createdAt || new Date().toISOString()
    const day = createdAt.slice(0, 10).replace(/-/g, '')
    const next = (seqByDay.get(day) || 0) + 1
    p.receiptNumber = `OR-${day}-${String(next).padStart(4, '0')}`
    seqByDay.set(day, next)
    changed = true
  }

  return changed
}

function ensureState() {
  const raw = readRaw()
  if (raw && raw.version >= 2 && Array.isArray(raw.accounts)) {
    const normalized = {
      ...raw,
      version: 4,
      meta: raw.meta || { orderSeq: 1003, paymentSeq: 1, receiptSeq: 1 },
      stores: Array.isArray(raw.stores) ? raw.stores : [],
      expenses: Array.isArray(raw.expenses) ? raw.expenses : [],
      systemLogs: Array.isArray(raw.systemLogs) ? raw.systemLogs : [],
      messages: Array.isArray(raw.messages) ? raw.messages : [],
      inventory: Array.isArray(raw.inventory) ? raw.inventory : [],
      payments: Array.isArray(raw.payments) ? raw.payments : [],
      orders: Array.isArray(raw.orders) ? raw.orders : [],
      accounts: Array.isArray(raw.accounts) ? raw.accounts : [],
      sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    }
    let changed = migrateToV4(normalized)
    if (normalizeOfficialReceipts(normalized)) changed = true
    if (ensureDemoAccounts(normalized)) changed = true
    if (changed) persist(normalized)
    return normalized
  }
  const seed = createSeed()
  if (raw && Array.isArray(raw.accounts) && raw.accounts.length) {
    seed.accounts = mergeSeedWithAccounts(seed, raw.accounts)
    if (Array.isArray(raw.orders) && raw.orders.length) seed.orders = raw.orders
    if (Array.isArray(raw.payments) && raw.payments.length) seed.payments = raw.payments
    if (Array.isArray(raw.inventory) && raw.inventory.length) seed.inventory = raw.inventory
    if (Array.isArray(raw.expenses)) seed.expenses = raw.expenses
    if (Array.isArray(raw.systemLogs)) seed.systemLogs = raw.systemLogs
    if (Array.isArray(raw.messages)) seed.messages = raw.messages
    if (Array.isArray(raw.stores) && raw.stores.length) seed.stores = raw.stores
    if (Array.isArray(raw.sessions)) seed.sessions = raw.sessions
    if (raw.meta) seed.meta = { ...seed.meta, ...raw.meta }
    migrateToV4(seed)
  }
  ensureDemoAccounts(seed)
  normalizeOfficialReceipts(seed)
  persist(seed)
  return seed
}

let cache = null

export function initLaundryDb() {
  cache = ensureState()
  return cache
}

export function getState() {
  if (!cache) cache = ensureState()
  return cache
}

export function currentStoreId() {
  const session = getCurrentSession()
  if (!session) return null
  if (session.role === 'super_admin') return null
  return session.storeId || null
}

export function isSuperAdminSession() {
  return getCurrentRole() === 'super_admin'
}

export function inCurrentStore(record) {
  if (!record) return false
  if (isSuperAdminSession()) return true
  const storeId = currentStoreId()
  if (!storeId) return false
  return record.storeId === storeId
}

/** Tenant-scoped view of the DB for admin/staff/customer UIs. */
export function getTenantState() {
  const state = getState()
  if (isSuperAdminSession()) return state
  const session = getCurrentSession()
  const storeId = currentStoreId()
  if (!storeId) {
    return {
      ...state,
      accounts: [],
      orders: [],
      payments: [],
      inventory: [],
      expenses: [],
      messages: [],
    }
  }

  // Customers can place orders at any active store — show their own orders across stores.
  if (session?.role === 'customer') {
    const customerId = session.id
    const orders = state.orders.filter((o) => o.customerId === customerId)
    const orderIds = new Set(orders.map((o) => o.id))
    return {
      ...state,
      accounts: state.accounts.filter((a) => a.id === customerId || a.storeId === storeId),
      orders,
      payments: state.payments.filter((p) => orderIds.has(p.orderId)),
      inventory: [],
      expenses: [],
      messages: state.messages.filter((m) => m.fromId === customerId || m.toId === customerId),
    }
  }

  return {
    ...state,
    accounts: state.accounts.filter((a) => a.storeId === storeId),
    orders: state.orders.filter((o) => o.storeId === storeId),
    payments: state.payments.filter((p) => p.storeId === storeId),
    inventory: state.inventory.filter((i) => i.storeId === storeId),
    expenses: state.expenses.filter((e) => e.storeId === storeId),
    messages: state.messages.filter((m) => m.storeId === storeId),
  }
}

/** Active stores available for customer order placement. */
export function listActiveStores() {
  return listStores().filter((s) => s.status === 'active')
}

export function getStore(storeId) {
  const state = getState()
  return state.stores.find((s) => s.id === storeId) || null
}

export function listStores() {
  return getState().stores.slice().sort((a, b) => a.name.localeCompare(b.name))
}

export function getStoreMetrics(storeId) {
  const state = getState()
  const store = getStore(storeId)
  if (!store) return null
  const accounts = state.accounts.filter((a) => a.storeId === storeId)
  const orders = state.orders.filter((o) => o.storeId === storeId)
  const payments = state.payments.filter((p) => p.storeId === storeId)
  const sales = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  return {
    store,
    admins: accounts.filter((a) => a.role === 'admin').length,
    staff: accounts.filter((a) => a.role === 'staff').length,
    customers: accounts.filter((a) => a.role === 'customer').length,
    orders: orders.length,
    sales: Math.round(sales * 100) / 100,
    accounts: accounts.map((a) => toPublicAccount(a)),
    orderRows: orders,
    paymentRows: payments,
  }
}

/** First username for each role in a store (for login deep-links). */
export function getStoreLoginHints(storeId) {
  const state = getState()
  const accounts = state.accounts.filter((a) => a.storeId === storeId)
  const pick = (role) => accounts.find((a) => a.role === role)?.username || null
  return {
    admin: pick('admin'),
    staff: pick('staff'),
    customer: pick('customer'),
  }
}

export function getPlatformSummary() {
  const state = getState()
  const stores = state.stores
  const tenantAccounts = state.accounts.filter((a) => a.role !== 'super_admin')
  const sales = state.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  return {
    stores: stores.length,
    active: stores.filter((s) => s.status === 'active').length,
    suspended: stores.filter((s) => s.status === 'suspended').length,
    admins: tenantAccounts.filter((a) => a.role === 'admin').length,
    staff: tenantAccounts.filter((a) => a.role === 'staff').length,
    customers: tenantAccounts.filter((a) => a.role === 'customer').length,
    orders: state.orders.length,
    sales: Math.round(sales * 100) / 100,
  }
}

function slugCode(name) {
  const base = String(name || 'STORE')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 12)
  return base || 'STORE'
}

export function createStore(payload) {
  assertRole(['super_admin'])
  const state = getState()
  const name = String(payload.name || '').trim()
  if (!name) throw new Error('Store name is required')

  const adminUsername = String(payload.adminUsername || '').trim().toLowerCase()
  const adminPassword = String(payload.adminPassword || '')
  if (!adminUsername || adminPassword.length < 6) {
    throw new Error('Administrator username and password (6+ chars) are required')
  }
  if (state.accounts.some((a) => a.username.toLowerCase() === adminUsername)) {
    throw new Error('Administrator username already taken')
  }

  let code = slugCode(payload.code || name)
  let n = 1
  while (state.stores.some((s) => s.code === code)) {
    code = `${slugCode(name)}-${n}`
    n += 1
  }

  const store = {
    id: newId('store'),
    code,
    name,
    address: String(payload.address || '').trim(),
    contactEmail: String(payload.contactEmail || '').trim(),
    phone: String(payload.phone || '').trim(),
    hours: String(payload.hours || '').trim(),
    status: 'active',
    createdAt: new Date().toISOString(),
  }

  const admin = {
    id: newId('acc'),
    username: adminUsername,
    password: adminPassword,
    role: 'admin',
    storeId: store.id,
    name: String(payload.adminName || '').trim() || adminUsername,
    email: String(payload.adminEmail || '').trim(),
    phone: '',
    address: '',
    preferredDetergentId: null,
    preferredScentId: null,
    preferredStoreId: null,
    createdAt: new Date().toISOString(),
  }

  state.stores.push(store)
  state.accounts.push(admin)
  // Starter inventory for the new store
  state.inventory.push(
    { id: newId('inv'), storeId: store.id, name: 'Liquid detergent (bulk)', category: 'detergent', quantity: 20, unit: 'L', lowStockThreshold: 15 },
    { id: newId('inv'), storeId: store.id, name: 'Fabric softener', category: 'softener', quantity: 12, unit: 'L', lowStockThreshold: 10 },
    { id: newId('inv'), storeId: store.id, name: 'Plastic garment bags', category: 'packaging', quantity: 25, unit: '100 pcs', lowStockThreshold: 8 },
  )

  log(state, 'info', 'Store created', { storeId: store.id, adminId: admin.id })
  persist(state)
  return { store, admin }
}

export function setStoreStatus(storeId, status) {
  assertRole(['super_admin'])
  const state = getState()
  const store = state.stores.find((s) => s.id === storeId)
  if (!store) throw new Error('Store not found')
  if (status !== 'active' && status !== 'suspended') throw new Error('Invalid store status')
  store.status = status
  log(state, 'warn', 'Store status updated', { storeId, status })
  persist(state)
  return store
}

function log(state, level, message, meta = {}) {
  state.systemLogs.unshift({
    id: newId('log'),
    level,
    message,
    meta,
    createdAt: new Date().toISOString(),
  })
  state.systemLogs = state.systemLogs.slice(0, 500)
}

function assertOrderRef(state, orderId) {
  if (!state.orders.some((o) => o.id === orderId)) {
    throw new Error('Order not found')
  }
}

function assertAccountRef(state, accountId) {
  if (!state.accounts.some((a) => a.id === accountId)) {
    throw new Error('Account not found')
  }
}

export function accountToSession(acc) {
  if (!acc) return null
  const store = acc.storeId ? getStore(acc.storeId) : null
  return {
    id: acc.id,
    username: acc.username,
    role: acc.role,
    storeId: acc.storeId || null,
    storeName: store?.name || null,
    name: acc.name,
    email: acc.email,
    phone: acc.phone,
    address: acc.address,
    preferredDetergentId: acc.preferredDetergentId,
    preferredScentId: acc.preferredScentId,
    preferredStoreId: acc.preferredStoreId || null,
    sessionId: null,
    status: acc.status === 'disabled' ? 'disabled' : 'active',
    mustChangePassword: !!acc.mustChangePassword,
  }
}

export function getAccountById(accountId) {
  const state = getState()
  return state.accounts.find((a) => a.id === accountId) || null
}

export function authenticate(identity, password) {
  const state = getState()
  const key = String(identity || '').trim().toLowerCase()
  const pass = String(password || '')
  if (!key || !pass) return null

  const acc = state.accounts.find((a) => {
    const username = String(a.username || '').toLowerCase()
    const email = String(a.email || '').toLowerCase()
    return a.password === pass && (username === key || email === key)
  })
  if (!acc) return null

  if (acc.status === 'disabled') {
    throw new Error('This account is deactivated. Contact the platform administrator.')
  }

  if (acc.role !== 'super_admin' && acc.storeId) {
    const store = state.stores.find((s) => s.id === acc.storeId)
    if (!store) return null
    if (store.status === 'suspended') {
      throw new Error('This store is suspended. Contact the platform administrator.')
    }
  }

  const authSession = beginAuthSession(state, acc)
  return { ...accountToSession(acc), sessionId: authSession.id }
}

export function registerCustomer(payload) {
  const state = getState()
  const u = String(payload.username || '').trim().toLowerCase()
  if (!u || !payload.password) {
    throw new Error('Username and password are required')
  }
  if (state.accounts.some((a) => a.username.toLowerCase() === u)) {
    throw new Error('Username already taken')
  }
  const storeId = payload.storeId || currentStoreId() || STORE_MAIN_ID
  const store = state.stores.find((s) => s.id === storeId)
  if (!store) throw new Error('Store not found')
  if (store.status === 'suspended') throw new Error('This store is not accepting registrations')

  const acc = {
    id: newId('acc'),
    username: u,
    password: String(payload.password),
    role: 'customer',
    storeId,
    name: String(payload.name || '').trim() || u,
    email: String(payload.email || '').trim(),
    phone: String(payload.phone || '').trim(),
    address: String(payload.address || '').trim(),
    preferredDetergentId: payload.preferredDetergentId || DETERGENT_OPTIONS[0].id,
    preferredScentId: payload.preferredScentId || SCENT_OPTIONS[0].id,
    preferredStoreId: payload.preferredStoreId || null,
    createdAt: new Date().toISOString(),
  }
  state.accounts.push(acc)
  log(state, 'info', 'Customer registered', { accountId: acc.id, username: acc.username, storeId })
  persist(state)
  return authenticate(acc.username, acc.password)
}

export function updateAccountProfile(accountId, patch) {
  const state = getState()
  const acc = state.accounts.find((a) => a.id === accountId)
  if (!acc) throw new Error('Account not found')
  if (patch.name != null) acc.name = String(patch.name)
  if (patch.email != null) acc.email = String(patch.email)
  if (patch.phone != null) acc.phone = String(patch.phone)
  if (patch.address != null) acc.address = String(patch.address)
  if (patch.preferredDetergentId != null) acc.preferredDetergentId = patch.preferredDetergentId
  if (patch.preferredScentId != null) acc.preferredScentId = patch.preferredScentId
  if (patch.preferredStoreId !== undefined) acc.preferredStoreId = patch.preferredStoreId || null
  log(state, 'info', 'Profile updated', { accountId })
  persist(state)
  syncSessionFromAccount(acc)
  return acc
}

export function searchCustomers(query) {
  const state = getTenantState()
  const q = String(query || '').trim().toLowerCase()
  return state.accounts.filter((a) => {
    if (a.role !== 'customer') return false
    if (!q) return true
    return (
      a.name.toLowerCase().includes(q) ||
      a.username.toLowerCase().includes(q) ||
      (a.email && a.email.toLowerCase().includes(q)) ||
      (a.phone && a.phone.includes(q))
    )
  })
}

export function searchStaff(query) {
  const state = getTenantState()
  const q = String(query || '').trim().toLowerCase()
  return state.accounts.filter((a) => {
    if (a.role !== 'staff') return false
    if (!q) return true
    return (
      a.name.toLowerCase().includes(q) ||
      a.username.toLowerCase().includes(q) ||
      (a.email && a.email.toLowerCase().includes(q)) ||
      (a.phone && a.phone.includes(q))
    )
  })
}

export function createAccount(payload) {
  const state = getState()
  const username = String(payload.username || '').trim().toLowerCase()
  const role = payload.role === 'staff' ? 'staff' : payload.role === 'admin' ? 'admin' : 'customer'
  if (!username || !payload.password) throw new Error('Username and password are required')
  if (state.accounts.some((a) => a.username.toLowerCase() === username)) {
    throw new Error('Username already taken')
  }
  const storeId = payload.storeId || currentStoreId()
  if (role !== 'super_admin' && !storeId) throw new Error('Store is required for this account')
  const account = {
    id: newId('acc'),
    username,
    password: String(payload.password),
    role,
    storeId: role === 'super_admin' ? null : storeId,
    name: String(payload.name || '').trim() || username,
    email: String(payload.email || '').trim(),
    phone: String(payload.phone || '').trim(),
    address: String(payload.address || '').trim(),
    preferredDetergentId: payload.preferredDetergentId || null,
    preferredScentId: payload.preferredScentId || null,
    preferredStoreId: payload.preferredStoreId || null,
    createdAt: new Date().toISOString(),
  }
  state.accounts.push(account)
  log(state, 'info', 'Account created', { accountId: account.id, role: account.role, storeId: account.storeId })
  persist(state)
  return account
}

export function updateAccount(accountId, patch) {
  const state = getState()
  const account = state.accounts.find((a) => a.id === accountId)
  if (!account) throw new Error('Account not found')
  if (patch.name != null) account.name = String(patch.name).trim()
  if (patch.email != null) account.email = String(patch.email).trim()
  if (patch.phone != null) account.phone = String(patch.phone).trim()
  if (patch.address != null) account.address = String(patch.address).trim()
  if (patch.password != null && String(patch.password).trim()) account.password = String(patch.password)
  if (patch.preferredDetergentId != null) account.preferredDetergentId = patch.preferredDetergentId
  if (patch.preferredScentId != null) account.preferredScentId = patch.preferredScentId
  if (patch.preferredStoreId !== undefined) account.preferredStoreId = patch.preferredStoreId || null
  log(state, 'info', 'Account updated', { accountId })
  persist(state)
  syncSessionFromAccount(account)
  return account
}

export function deleteAccount(accountId) {
  const state = getState()
  const idx = state.accounts.findIndex((a) => a.id === accountId)
  if (idx < 0) throw new Error('Account not found')
  const account = state.accounts[idx]
  if (account.role === 'admin') throw new Error('Admin accounts cannot be deleted')
  state.accounts.splice(idx, 1)
  if (account.role === 'customer') {
    state.orders = state.orders.filter((o) => o.customerId !== accountId)
    const validOrderIds = new Set(state.orders.map((o) => o.id))
    state.payments = state.payments.filter((p) => validOrderIds.has(p.orderId))
  } else if (account.role === 'staff') {
    state.orders = state.orders.map((o) =>
      o.assignedStaffId === accountId ? { ...o, assignedStaffId: null } : o,
    )
  }
  state.messages = state.messages.filter((m) => m.fromId !== accountId && m.toId !== accountId)
  log(state, 'warn', 'Account deleted', { accountId, role: account.role })
  persist(state)
}

export const PLATFORM_ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Laundry Shop Administrator',
  staff: 'Staff',
  customer: 'Customer',
}

function accountStatusOf(acc) {
  return acc?.status === 'disabled' ? 'disabled' : 'active'
}

function latestLoginAt(accountId) {
  const state = getState()
  const session = (state.sessions || []).find((s) => s.accountId === accountId)
  return session?.startedAt || null
}

export function toPublicAccount(acc) {
  if (!acc) return null
  const store = acc.storeId ? getStore(acc.storeId) : null
  return {
    id: acc.id,
    name: acc.name,
    username: acc.username,
    email: acc.email || '',
    phone: acc.phone || '',
    address: acc.address || '',
    role: acc.role,
    roleLabel: PLATFORM_ROLE_LABELS[acc.role] || acc.role,
    storeId: acc.storeId || null,
    storeName: store?.name || (acc.role === 'super_admin' ? 'Platform' : 'Unassigned'),
    status: accountStatusOf(acc),
    createdAt: acc.createdAt,
    lastLoginAt: latestLoginAt(acc.id),
    mustChangePassword: !!acc.mustChangePassword,
  }
}

function actorMeta() {
  const session = getCurrentSession()
  return { actorId: session?.id || null, actorRole: session?.role || null }
}

function countActiveSuperAdmins(state, exceptId = null) {
  return state.accounts.filter(
    (a) => a.role === 'super_admin' && accountStatusOf(a) === 'active' && a.id !== exceptId,
  ).length
}

function revokeAccountSessions(state, accountId, reason) {
  ensureSessions(state)
  const now = new Date().toISOString()
  for (const session of state.sessions) {
    if (session.accountId === accountId && !session.endedAt) {
      session.endedAt = now
      session.endReason = reason
    }
  }
}

function assertUniqueIdentity(state, { username, email, exceptId }) {
  const user = String(username || '').trim().toLowerCase()
  if (user && state.accounts.some((a) => a.id !== exceptId && String(a.username || '').toLowerCase() === user)) {
    throw new Error('Username already taken')
  }
  const mail = String(email || '').trim().toLowerCase()
  if (mail && state.accounts.some((a) => a.id !== exceptId && String(a.email || '').toLowerCase() === mail)) {
    throw new Error('Email address already in use')
  }
}

function assertValidStoreAssignment(role, storeId) {
  if (role === 'super_admin') return null
  if (!storeId) throw new Error('A laundry shop is required for this role.')
  const store = getStore(storeId)
  if (!store) throw new Error('Selected laundry shop was not found.')
  return store.id
}

export function listPlatformAccounts(filters = {}) {
  assertRole(['super_admin'])
  const state = getState()
  const role = filters.role || 'all'
  const storeId = filters.storeId || 'all'
  const status = filters.status || 'all'
  const q = String(filters.search || '').trim().toLowerCase()
  return state.accounts
    .map((acc) => toPublicAccount(acc))
    .filter((row) => {
      if (role !== 'all' && row.role !== role) return false
      if (storeId === 'unassigned' && row.storeId) return false
      if (storeId !== 'all' && storeId !== 'unassigned' && row.storeId !== storeId) return false
      if (status !== 'all' && row.status !== status) return false
      if (!q) return true
      const hay = `${row.name} ${row.username} ${row.email} ${row.storeName} ${row.roleLabel}`.toLowerCase()
      return hay.includes(q)
    })
}

export function getPlatformAccount(accountId) {
  assertRole(['super_admin'])
  const acc = getAccountById(accountId)
  if (!acc) throw new Error('Account not found')
  return toPublicAccount(acc)
}

export function superAdminCreateAccount(payload) {
  assertRole(['super_admin'])
  const state = getState()
  const role = payload.role
  if (!['super_admin', 'admin', 'staff', 'customer'].includes(role)) {
    throw new Error('Invalid account role.')
  }
  const username = String(payload.username || '').trim().toLowerCase()
  const password = String(payload.password || '')
  if (!username || password.length < 6) {
    throw new Error('Username and a password of at least 6 characters are required.')
  }
  const email = String(payload.email || '').trim()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid email address.')
  }
  assertUniqueIdentity(state, { username, email, exceptId: null })
  const storeId = assertValidStoreAssignment(role, payload.storeId)
  const account = {
    id: newId('acc'),
    username,
    password,
    role,
    storeId,
    name: String(payload.name || '').trim() || username,
    email,
    phone: String(payload.phone || '').trim(),
    address: String(payload.address || '').trim(),
    preferredDetergentId: null,
    preferredScentId: null,
    preferredStoreId: null,
    status: 'active',
    mustChangePassword: true,
    createdAt: new Date().toISOString(),
  }
  state.accounts.push(account)
  log(state, 'info', 'Account created', {
    ...actorMeta(),
    accountId: account.id,
    role: account.role,
    storeId: account.storeId,
  })
  persist(state)
  return toPublicAccount(account)
}

export function superAdminUpdateAccount(accountId, patch) {
  assertRole(['super_admin'])
  const state = getState()
  const account = state.accounts.find((a) => a.id === accountId)
  if (!account) throw new Error('Account not found')
  const before = {
    name: account.name,
    username: account.username,
    email: account.email,
    role: account.role,
    storeId: account.storeId,
    status: accountStatusOf(account),
  }

  const nextUsername = patch.username !== undefined ? String(patch.username || '').trim().toLowerCase() : account.username
  const nextEmail = patch.email !== undefined ? String(patch.email || '').trim() : account.email
  if (patch.email !== undefined && nextEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
    throw new Error('Enter a valid email address.')
  }
  assertUniqueIdentity(state, { username: nextUsername, email: nextEmail, exceptId: account.id })

  const nextRole = patch.role !== undefined ? patch.role : account.role
  if (!['super_admin', 'admin', 'staff', 'customer'].includes(nextRole)) {
    throw new Error('Invalid account role.')
  }
  if (account.role === 'super_admin' && nextRole !== 'super_admin' && countActiveSuperAdmins(state, account.id) < 1) {
    throw new Error('Cannot change the role of the last active Super Admin.')
  }

  const nextStoreId =
    patch.storeId !== undefined || patch.role !== undefined
      ? assertValidStoreAssignment(nextRole, patch.storeId !== undefined ? patch.storeId : account.storeId)
      : account.storeId

  if (patch.name !== undefined) account.name = String(patch.name || '').trim() || account.name
  if (patch.username !== undefined) account.username = nextUsername
  if (patch.email !== undefined) account.email = nextEmail
  if (patch.phone !== undefined) account.phone = String(patch.phone || '').trim()
  if (patch.address !== undefined) account.address = String(patch.address || '').trim()
  account.role = nextRole
  account.storeId = nextStoreId

  const sensitive =
    before.role !== account.role || before.storeId !== account.storeId || before.email !== account.email
  if (sensitive) revokeAccountSessions(state, account.id, 'admin_updated')

  log(state, 'info', 'Account details updated', {
    ...actorMeta(),
    accountId: account.id,
    before,
    after: {
      name: account.name,
      username: account.username,
      email: account.email,
      role: account.role,
      storeId: account.storeId,
      status: accountStatusOf(account),
    },
  })
  persist(state)
  syncSessionFromAccount(account)
  return toPublicAccount(account)
}

export function superAdminResetPassword(accountId, newPassword) {
  assertRole(['super_admin'])
  const password = String(newPassword || '')
  if (password.length < 6) throw new Error('Temporary password must be at least 6 characters.')
  const state = getState()
  const account = state.accounts.find((a) => a.id === accountId)
  if (!account) throw new Error('Account not found')
  account.password = password
  account.mustChangePassword = true
  revokeAccountSessions(state, account.id, 'password_reset')
  log(state, 'warn', 'Password reset completed', {
    ...actorMeta(),
    accountId: account.id,
  })
  persist(state)
  return toPublicAccount(account)
}

export function superAdminSetAccountStatus(accountId, status) {
  assertRole(['super_admin'])
  if (status !== 'active' && status !== 'disabled') throw new Error('Invalid account status.')
  const state = getState()
  const account = state.accounts.find((a) => a.id === accountId)
  if (!account) throw new Error('Account not found')
  const session = getCurrentSession()
  if (session?.id === account.id && status === 'disabled') {
    throw new Error('You cannot deactivate your own Super Admin account.')
  }
  if (account.role === 'super_admin' && status === 'disabled' && countActiveSuperAdmins(state, account.id) < 1) {
    throw new Error('Cannot deactivate the last active Super Admin.')
  }
  account.status = status
  if (status === 'disabled') revokeAccountSessions(state, account.id, 'deactivated')
  log(state, 'warn', status === 'disabled' ? 'Account deactivated' : 'Account activated', {
    ...actorMeta(),
    accountId: account.id,
    status,
  })
  persist(state)
  return toPublicAccount(account)
}

export function superAdminDeleteAccount(accountId) {
  assertRole(['super_admin'])
  const state = getState()
  const session = getCurrentSession()
  if (session?.id === accountId) throw new Error('You cannot delete your own Super Admin account.')
  const idx = state.accounts.findIndex((a) => a.id === accountId)
  if (idx < 0) throw new Error('Account not found')
  const account = state.accounts[idx]
  if (account.role === 'super_admin' && countActiveSuperAdmins(state, account.id) < 1) {
    throw new Error('Cannot delete the last active Super Admin.')
  }
  if (account.role === 'customer' && state.orders.some((o) => o.customerId === accountId)) {
    throw new Error('This customer has order history. Deactivate the account instead of deleting it.')
  }
  revokeAccountSessions(state, account.id, 'deleted')
  if (account.role === 'staff') {
    state.orders = state.orders.map((o) =>
      o.assignedStaffId === accountId ? { ...o, assignedStaffId: null } : o,
    )
  }
  state.messages = state.messages.filter((m) => m.fromId !== accountId && m.toId !== accountId)
  state.accounts.splice(idx, 1)
  log(state, 'warn', 'Account deleted', { ...actorMeta(), accountId, role: account.role })
  persist(state)
  return true
}

export function getAccountAuditEntries(accountId, limit = 30) {
  assertRole(['super_admin'])
  const state = getState()
  return (state.systemLogs || [])
    .filter((row) => row.meta?.accountId === accountId)
    .slice(0, limit)
    .map((row) => ({
      id: row.id,
      message: row.message,
      createdAt: row.createdAt,
      meta: {
        actorId: row.meta?.actorId || null,
        role: row.meta?.role || null,
        storeId: row.meta?.storeId || null,
        before: row.meta?.before || null,
        after: row.meta?.after || null,
        status: row.meta?.status || null,
      },
    }))
}

export function getAccountLoginHistory(accountId, limit = 20) {
  assertRole(['super_admin'])
  const state = getState()
  ensureSessions(state)
  return (state.sessions || [])
    .filter((s) => s.accountId === accountId)
    .slice(0, limit)
    .map((s) => ({
      id: s.id,
      startedAt: s.startedAt,
      lastActivityAt: s.lastActivityAt,
      endedAt: s.endedAt,
      endReason: s.endReason,
      role: s.role,
      storeId: s.storeId,
    }))
}

export function changeOwnPassword(currentPassword, nextPassword) {
  const session = getCurrentSession()
  if (!session?.id) throw new Error('Please sign in to change your password.')
  const next = String(nextPassword || '')
  if (next.length < 6) throw new Error('New password must be at least 6 characters.')
  const state = getState()
  const account = state.accounts.find((a) => a.id === session.id)
  if (!account) throw new Error('Account not found')
  if (String(account.password) !== String(currentPassword || '')) {
    throw new Error('Current password is incorrect.')
  }
  account.password = next
  account.mustChangePassword = false
  log(state, 'info', 'Password changed by account owner', { accountId: account.id, actorId: account.id })
  persist(state)
  syncSessionFromAccount(account)
  return toPublicAccount(account)
}

function syncSessionFromAccount(acc) {
  if (typeof localStorage === 'undefined' || !acc) return
  try {
    const raw = localStorage.getItem('loggedInUser')
    if (!raw) return
    const session = JSON.parse(raw)
    if (session?.id !== acc.id) return
    localStorage.setItem(
      'loggedInUser',
      JSON.stringify({ ...accountToSession(acc), sessionId: session.sessionId || null }),
    )
  } catch {
    /* ignore */
  }
}

export function getCustomerPreferredStoreId(accountId) {
  const acc = getAccountById(accountId)
  const preferredId = acc?.preferredStoreId || null
  if (!preferredId) return null
  const store = getStore(preferredId)
  if (!store || store.status !== 'active') return null
  return store.id
}

export function setCustomerPreferredStore(accountId, storeId) {
  const store = getStore(storeId)
  if (!store) throw new Error('Laundry shop not found.')
  if (store.status !== 'active') throw new Error('This laundry shop is not currently available.')
  return updateAccountProfile(accountId, { preferredStoreId: store.id })
}

export function getOrderShop(order) {
  if (!order) return null
  return order.storeId ? getStore(order.storeId) : null
}

export function getOrderShopName(order) {
  const store = getOrderShop(order)
  return store?.name || order?.branch || '—'
}

export function getCustomerServiceHistory(customerId) {
  const state = getState()
  assertAccountRef(state, customerId)
  return state.orders
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function createOrder(input) {
  const state = getState()
  assertAccountRef(state, input.customerId)
  const customer = state.accounts.find((a) => a.id === input.customerId)
  const role = getCurrentRole()
  let storeId = input.storeId || null
  if (!storeId && role === 'customer') {
    storeId = getCustomerPreferredStoreId(customer?.id)
  } else if (!storeId) {
    storeId = currentStoreId() || customer?.storeId || null
  }
  if (!storeId) throw new Error('Please choose a laundry shop for this order.')
  const store = getStore(storeId)
  if (!store) throw new Error('Laundry shop not found.')
  if (store.status !== 'active') throw new Error('This laundry shop is currently unavailable.')
  const lineItems = (input.lineItems || []).map((row, i) => ({
    id: newId('li'),
    description: String(row.description || `Item ${i + 1}`),
    weightKg: Math.max(0, Number(row.weightKg) || 0),
  }))
  const services = {
    wash: !!input.services?.wash,
    dry: !!input.services?.dry,
    fold: !!input.services?.fold,
    iron: !!input.services?.iron,
  }
  const detergentId = input.detergentId || DETERGENT_OPTIONS[0].id
  const scentId = input.scentId || SCENT_OPTIONS[0].id
  const totals = computeOrderTotals(lineItems, services, detergentId, scentId)
  const code = `CB-${state.meta.orderSeq}`
  state.meta.orderSeq += 1
  const order = {
    id: newId('ord'),
    code,
    storeId,
    customerId: input.customerId,
    status: 'received',
    lineItems,
    services,
    detergentId,
    scentId,
    pickupDate: input.pickupDate || todayISODate(),
    pickupTimeSlot: input.pickupTimeSlot || '14:00',
    branch: input.branch || store?.name || 'CrystalBubble',
    notes: String(input.notes || ''),
    ...totals,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  state.orders.push(order)
  log(state, 'info', 'Order created', { orderId: order.id, code: order.code, storeId })
  persist(state)
  return order
}

export function setOrderStatus(orderId, status) {
  const state = getState()
  const order = state.orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Order not found')
  if (status !== 'cancelled' && !ORDER_STATUSES.includes(status)) throw new Error('Invalid status')
  const prev = order.status
  order.status = status
  order.updatedAt = new Date().toISOString()
  if (status === 'completed') {
    consumeInventoryForOrder(state, order)
    const generated = autoGenerateOfficialReceiptForCompletedOrder(state, orderId)
    if (generated) {
      log(state, 'info', 'Official receipt auto-generated on completion', {
        orderId,
        paymentId: generated.id,
        receiptNumber: generated.receiptNumber,
      })
    }
  }
  log(state, 'info', 'Order status updated', {
    orderId,
    from: prev,
    to: status,
    label: ORDER_STATUS_LABELS[status],
  })
  persist(state)
  return order
}

export function updateOrder(orderId, patch) {
  const state = getState()
  const order = state.orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Order not found')
  if (patch.customerId != null) {
    assertAccountRef(state, patch.customerId)
    order.customerId = patch.customerId
  }
  if (patch.notes != null) order.notes = String(patch.notes)
  if (patch.pickupDate != null) order.pickupDate = String(patch.pickupDate)
  if (patch.pickupTimeSlot != null) order.pickupTimeSlot = String(patch.pickupTimeSlot)
  if (patch.assignedStaffId !== undefined) order.assignedStaffId = patch.assignedStaffId || null
  if (patch.services) order.services = { ...order.services, ...patch.services }
  if (patch.detergentId) order.detergentId = patch.detergentId
  if (patch.scentId) order.scentId = patch.scentId
  if (Array.isArray(patch.lineItems) && patch.lineItems.length) {
    order.lineItems = patch.lineItems.map((row, i) => ({
      id: row.id || newId('li'),
      description: String(row.description || `Item ${i + 1}`),
      weightKg: Math.max(0, Number(row.weightKg) || 0),
    }))
  }
  const totals = computeOrderTotals(order.lineItems, order.services, order.detergentId, order.scentId)
  order.subtotal = totals.subtotal
  order.servicesTotal = totals.servicesTotal
  order.addOnTotal = totals.addOnTotal
  order.total = totals.total
  order.updatedAt = new Date().toISOString()
  log(state, 'info', 'Order updated', { orderId })
  persist(state)
  return order
}

export function cancelOrder(orderId) {
  const state = getState()
  const order = state.orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Order not found')
  order.status = 'cancelled'
  order.updatedAt = new Date().toISOString()
  order.cancelledAt = new Date().toISOString()
  log(state, 'warn', 'Order cancelled', { orderId })
  persist(state)
  return order
}

export function deleteOrder(orderId) {
  const state = getState()
  state.orders = state.orders.filter((o) => o.id !== orderId)
  state.payments = state.payments.filter((p) => p.orderId !== orderId)
  log(state, 'warn', 'Order deleted', { orderId })
  persist(state)
}

export function upsertPickupSchedule(orderId, payload) {
  return updateOrder(orderId, {
    pickupDate: payload.pickupDate,
    pickupTimeSlot: payload.pickupTimeSlot,
    assignedStaffId: payload.assignedStaffId,
  })
}

export function getPickupSchedules(filters = {}) {
  const state = getTenantState()
  const date = String(filters.date || '').trim()
  const staffId = String(filters.staffId || '').trim()
  return state.orders
    .filter((o) => (date ? o.pickupDate === date : true))
    .filter((o) => (staffId ? o.assignedStaffId === staffId : true))
    .sort((a, b) => (a.pickupDate + a.pickupTimeSlot < b.pickupDate + b.pickupTimeSlot ? -1 : 1))
}

export function advanceOrderStatus(orderId) {
  const state = getState()
  const order = state.orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Order not found')
  const idx = ORDER_STATUSES.indexOf(order.status)
  if (idx < 0 || idx >= ORDER_STATUSES.length - 1) return order
  return setOrderStatus(orderId, ORDER_STATUSES[idx + 1])
}

function consumeInventoryForOrder(state, order) {
  const kg = order.lineItems.reduce((s, l) => s + (Number(l.weightKg) || 0), 0)
  const storeInv = state.inventory.filter((i) => i.storeId === order.storeId)
  const detergent = storeInv.find((i) => i.category === 'detergent')
  const softener = storeInv.find((i) => i.category === 'softener')
  const packaging = storeInv.find((i) => i.category === 'packaging')
  if (detergent) {
    detergent.quantity = Math.max(0, Math.round((detergent.quantity - kg * 0.12) * 100) / 100)
  }
  if (softener) {
    softener.quantity = Math.max(0, Math.round((softener.quantity - kg * 0.06) * 100) / 100)
  }
  if (packaging) {
    packaging.quantity = Math.max(0, packaging.quantity - 1)
  }
  log(state, 'info', 'Inventory consumed for completed order', {
    orderId: order.id,
    kg,
  })
}

function recalcPaymentStatusesForOrder(state, orderId) {
  const order = state.orders.find((o) => o.id === orderId)
  if (!order) return
  const pays = state.payments
    .filter((x) => x.orderId === orderId)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
  let cumulative = 0
  for (const p of pays) {
    cumulative += p.amount
    p.status = cumulative >= order.total ? 'paid' : cumulative > 0 ? 'partial' : 'pending'
  }
}

function autoGenerateOfficialReceiptForCompletedOrder(state, orderId) {
  const pays = state.payments.filter((p) => p.orderId === orderId)
  if (!pays.length) return null
  if (pays.some((p) => String(p.receiptNumber || '').startsWith('OR-'))) return null

  const paid = pays
    .filter((p) => p.status === 'paid')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0]
  if (!paid) return null

  paid.receiptNumber = generateOfficialReceiptNumber(state, new Date())
  return paid
}

export function recordPayment(input) {
  assertRole(['admin', 'staff'])
  const state = getState()
  assertOrderRef(state, input.orderId)
  const amount = Math.max(0, Number(input.amount) || 0)
  if (amount <= 0) throw new Error('Payment amount must be greater than zero')
  const method = input.method === 'digital' ? 'digital' : 'cash'
  const actor = getCurrentSession()
  const order = state.orders.find((o) => o.id === input.orderId)
  const payment = {
    id: newId('pay'),
    storeId: order?.storeId || currentStoreId(),
    orderId: input.orderId,
    amount,
    method,
    status: 'pending',
    receiptNumber: `PENDING-${state.meta.paymentSeq}`,
    recordedBy: actor?.id || null,
    createdAt: new Date().toISOString(),
  }
  state.payments.push(payment)
  state.meta.paymentSeq += 1
  recalcPaymentStatusesForOrder(state, input.orderId)
  log(state, 'info', 'Payment recorded', {
    paymentId: payment.id,
    orderId: input.orderId,
    receiptNumber: payment.receiptNumber,
    method,
  })
  persist(state)
  return payment
}

export function confirmPayment(paymentId) {
  assertRole(['admin', 'staff'])
  const state = getState()
  const p = state.payments.find((x) => x.id === paymentId)
  if (!p) throw new Error('Payment not found')
  const actor = getCurrentSession()
  if (!String(p.receiptNumber || '').startsWith('OR-')) {
    p.receiptNumber = generateOfficialReceiptNumber(state, new Date(p.createdAt || Date.now()))
  }
  if (!p.recordedBy) p.recordedBy = actor?.id || p.recordedBy || null
  p.status = 'paid'
  recalcPaymentStatusesForOrder(state, p.orderId)
  log(state, 'info', 'Payment confirmed', { paymentId, receiptNumber: p.receiptNumber })
  persist(state)
  return p
}

export function updatePayment(paymentId, patch) {
  assertRole(['admin', 'staff'])
  const state = getState()
  const p = state.payments.find((x) => x.id === paymentId)
  if (!p) throw new Error('Payment not found')
  if (patch.amount != null) {
    const next = Math.max(0, Number(patch.amount) || 0)
    if (next <= 0) throw new Error('Payment amount must be greater than zero')
    p.amount = next
  }
  if (patch.method != null) {
    p.method = patch.method === 'digital' ? 'digital' : 'cash'
  }
  recalcPaymentStatusesForOrder(state, p.orderId)
  log(state, 'info', 'Payment updated', { paymentId })
  persist(state)
  return p
}

export function deletePayment(paymentId) {
  assertRole(['admin', 'staff'])
  const state = getState()
  const idx = state.payments.findIndex((x) => x.id === paymentId)
  if (idx < 0) throw new Error('Payment not found')
  const orderId = state.payments[idx].orderId
  state.payments.splice(idx, 1)
  recalcPaymentStatusesForOrder(state, orderId)
  log(state, 'warn', 'Payment deleted', { paymentId })
  persist(state)
}

export function upsertInventoryItem(row) {
  const state = getState()
  const storeId = row.storeId || currentStoreId()
  if (row.id) {
    const item = state.inventory.find((i) => i.id === row.id)
    if (!item) throw new Error('Inventory item not found')
    if (!isSuperAdminSession() && item.storeId !== storeId) throw new Error('Inventory item not found')
    if (row.name != null) item.name = String(row.name)
    if (row.category != null) item.category = row.category
    if (row.quantity != null) item.quantity = Math.max(0, Number(row.quantity) || 0)
    if (row.unit != null) item.unit = String(row.unit)
    if (row.lowStockThreshold != null) {
      item.lowStockThreshold = Math.max(0, Number(row.lowStockThreshold) || 0)
    }
  } else {
    if (!storeId) throw new Error('Store is required for inventory')
    state.inventory.push({
      id: newId('inv'),
      storeId,
      name: String(row.name || 'Item'),
      category: row.category || 'other',
      quantity: Math.max(0, Number(row.quantity) || 0),
      unit: String(row.unit || 'unit'),
      lowStockThreshold: Math.max(0, Number(row.lowStockThreshold) || 10),
    })
  }
  log(state, 'info', 'Inventory updated', {})
  persist(state)
  return getTenantState().inventory
}

export function deleteInventoryItem(id) {
  const state = getState()
  state.inventory = state.inventory.filter((i) => i.id !== id)
  log(state, 'warn', 'Inventory item deleted', { id })
  persist(state)
}

export function getInventoryAlerts() {
  const state = getTenantState()
  return state.inventory.filter((i) => i.quantity <= i.lowStockThreshold)
}

/** Last `n` calendar months ending at `anchor` (inclusive), as YYYY-MM keys. */
function lastNMonthKeys(n, anchor = new Date()) {
  const keys = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    keys.push(`${y}-${m}`)
  }
  return keys
}

function monthShortLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleString('en-US', { month: 'short' })
}

export function touchAuthSession(sessionId) {
  if (!sessionId) return false
  const state = getState()
  ensureSessions(state)
  const expired = expireStaleSessions(state)
  const session = state.sessions.find((s) => s.id === sessionId)
  if (!session || session.endedAt) {
    if (expired) persist(state)
    return false
  }
  const now = Date.now()
  session.lastActivityAt = new Date(now).toISOString()
  session.expiresAt = new Date(now + SESSION_TTL_MS).toISOString()
  persist(state)
  return true
}

export function endAuthSession(sessionId, reason = 'logout') {
  if (!sessionId) return false
  const state = getState()
  ensureSessions(state)
  const session = state.sessions.find((s) => s.id === sessionId)
  if (!session || session.endedAt) return false
  session.endedAt = new Date().toISOString()
  session.endReason = reason
  log(state, 'info', 'Account session ended', {
    sessionId,
    accountId: session.accountId,
    reason,
  })
  persist(state)
  return true
}

function authorizedStoreIdsForCurrentUser() {
  const session = getCurrentSession()
  const role = session?.role
  if (role === 'super_admin') return listStores().map((s) => s.id)
  if ((role === 'admin' || role === 'staff') && session.storeId) return [session.storeId]
  return []
}

export function listAuthorizedStores() {
  const ids = new Set(authorizedStoreIdsForCurrentUser())
  return listStores().filter((s) => ids.has(s.id))
}

function assertStoreAccess(storeId) {
  const role = getCurrentRole()
  if (role === 'super_admin') return
  const allowed = authorizedStoreIdsForCurrentUser()
  if (!storeId || !allowed.includes(storeId)) {
    throw new Error('You are not authorized to access this branch.')
  }
}

function localDateKey(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function resolveReportRange(filters = {}) {
  const period = filters.period || 'monthly'
  const baseKey = filters.baseDate || todayISODate()
  const base = new Date(`${baseKey}T12:00:00`)
  if (period === 'custom') {
    const from = filters.from || baseKey
    const to = filters.to || baseKey
    return { period, from, to, label: `${from} to ${to}` }
  }
  if (period === 'daily') {
    return { period, from: baseKey, to: baseKey, label: `Daily · ${baseKey}` }
  }
  if (period === 'weekly') {
    const start = new Date(base)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const from = localDateKey(start)
    const to = localDateKey(end)
    return { period, from, to, label: `Weekly · ${from} to ${to}` }
  }
  const from = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-01`
  const last = new Date(base.getFullYear(), base.getMonth() + 1, 0)
  const to = localDateKey(last)
  return { period: 'monthly', from, to, label: `Monthly · ${from.slice(0, 7)}` }
}

function inReportRange(isoOrDate, from, to) {
  const day = String(isoOrDate || '').slice(0, 10)
  if (!day) return false
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}

function paymentMethodLabel(method) {
  if (method === 'cash') return 'Cash'
  if (method === 'digital') return 'Digital (GCash / Maya / card)'
  return method || 'Unspecified'
}

function accountVisibleToAdmin(acc, allowedStoreIds) {
  if (!acc) return false
  if (acc.role === 'super_admin') return getCurrentRole() === 'super_admin'
  if (acc.storeId && allowedStoreIds.includes(acc.storeId)) return true
  return false
}

export function getAccountActivity(filters = {}) {
  assertRole(['admin', 'super_admin'])
  const state = getState()
  ensureSessions(state)
  if (expireStaleSessions(state)) persist(state)

  const allowedStoreIds = authorizedStoreIdsForCurrentUser()
  if (filters.storeId) {
    assertStoreAccess(filters.storeId)
  }
  const storeFilter = filters.storeId || ''
  const roleFilter = filters.role || 'all'
  const statusFilter = filters.status || 'all'
  const q = String(filters.search || '').trim().toLowerCase()

  const latestByAccount = new Map()
  for (const session of state.sessions) {
    if (!latestByAccount.has(session.accountId)) latestByAccount.set(session.accountId, session)
  }

  const accounts = state.accounts.filter((acc) => accountVisibleToAdmin(acc, allowedStoreIds))
  const rows = accounts.map((acc) => {
    const session = latestByAccount.get(acc.id) || null
    const status = session ? computeSessionStatus(session) : 'offline'
    const store = acc.storeId ? getStore(acc.storeId) : null
    return {
      accountId: acc.id,
      name: acc.name || acc.username,
      username: acc.username,
      email: acc.email || '',
      role: acc.role,
      storeId: acc.storeId || null,
      storeName: store?.name || (acc.role === 'super_admin' ? 'Platform' : 'Unassigned'),
      status,
      sessionId: session && status === 'online' ? session.id : null,
      lastLoginAt: session?.startedAt || null,
      lastActivityAt: session?.lastActivityAt || null,
      endedAt: session?.endedAt || null,
      endReason: session?.endReason || null,
    }
  })

  return rows.filter((row) => {
    if (storeFilter && row.storeId !== storeFilter) return false
    if (roleFilter !== 'all' && row.role !== roleFilter) return false
    if (statusFilter === 'online' && row.status !== 'online') return false
    if (statusFilter === 'offline' && row.status !== 'offline') return false
    if (statusFilter === 'expired' && row.status !== 'expired') return false
    if (!q) return true
    const hay = `${row.name} ${row.username} ${row.email} ${row.storeName}`.toLowerCase()
    return hay.includes(q)
  })
}

export function getActiveSessions() {
  assertRole(['admin', 'super_admin'])
  const state = getState()
  ensureSessions(state)
  if (expireStaleSessions(state)) persist(state)
  const allowedStoreIds = authorizedStoreIdsForCurrentUser()
  const now = Date.now()
  return state.sessions
    .filter((session) => computeSessionStatus(session, now) === 'online')
    .filter((session) => {
      if (getCurrentRole() === 'super_admin') return true
      return session.storeId && allowedStoreIds.includes(session.storeId)
    })
    .map((session) => {
      const acc = state.accounts.find((a) => a.id === session.accountId)
      const store = session.storeId ? getStore(session.storeId) : null
      return {
        id: session.id,
        accountId: session.accountId,
        name: acc?.name || acc?.username || 'Unknown',
        username: acc?.username || '',
        role: session.role,
        storeName: store?.name || (session.role === 'super_admin' ? 'Platform' : 'Unassigned'),
        startedAt: session.startedAt,
        lastActivityAt: session.lastActivityAt,
        expiresAt: session.expiresAt,
      }
    })
}

export function getLoginHistory(limit = 25) {
  assertRole(['admin', 'super_admin'])
  const state = getState()
  ensureSessions(state)
  const allowedStoreIds = authorizedStoreIdsForCurrentUser()
  return state.sessions
    .filter((session) => {
      if (getCurrentRole() === 'super_admin') return true
      return session.storeId && allowedStoreIds.includes(session.storeId)
    })
    .slice(0, limit)
    .map((session) => {
      const acc = state.accounts.find((a) => a.id === session.accountId)
      const store = session.storeId ? getStore(session.storeId) : null
      return {
        id: session.id,
        name: acc?.name || acc?.username || 'Unknown',
        role: session.role,
        storeName: store?.name || (session.role === 'super_admin' ? 'Platform' : 'Unassigned'),
        startedAt: session.startedAt,
        lastActivityAt: session.lastActivityAt,
        endedAt: session.endedAt,
        endReason: session.endReason,
        status: computeSessionStatus(session),
      }
    })
}

export function terminateAuthSession(sessionId) {
  assertRole(['admin', 'super_admin'])
  const state = getState()
  ensureSessions(state)
  const session = state.sessions.find((s) => s.id === sessionId)
  if (!session) throw new Error('Session not found.')
  if (getCurrentRole() !== 'super_admin') {
    assertStoreAccess(session.storeId)
  }
  if (session.endedAt) return session
  session.endedAt = new Date().toISOString()
  session.endReason = 'admin_terminated'
  log(state, 'warn', 'Administrator terminated a session', {
    sessionId,
    accountId: session.accountId,
  })
  persist(state)
  return session
}

function scopedFinancialRows(filters = {}) {
  assertRole(['admin', 'super_admin'])
  const allowed = authorizedStoreIdsForCurrentUser()
  const requested = filters.storeId || ''
  if (requested) assertStoreAccess(requested)
  const storeIds = requested ? [requested] : allowed
  const range = resolveReportRange(filters)
  const state = getState()

  const orders = state.orders.filter((o) => storeIds.includes(o.storeId) && inReportRange(o.createdAt, range.from, range.to))
  const payments = state.payments.filter(
    (p) => storeIds.includes(p.storeId) && inReportRange(p.createdAt, range.from, range.to),
  )
  const expenses = state.expenses.filter((e) => storeIds.includes(e.storeId) && inReportRange(e.date, range.from, range.to))
  const unassigned = {
    orders: state.orders.filter((o) => !o.storeId).length,
    payments: state.payments.filter((p) => !p.storeId).length,
    expenses: state.expenses.filter((e) => !e.storeId).length,
  }
  return { state, storeIds, range, orders, payments, expenses, unassigned, requested }
}

export function getBranchReport(filters = {}) {
  const scoped = scopedFinancialRows(filters)
  const { state, storeIds, range, orders, payments, expenses, unassigned, requested } = scoped
  const cancelled = orders.filter((o) => o.status === 'cancelled')
  const countedOrders = orders.filter((o) => o.status !== 'cancelled')

  const orderRevenue = countedOrders.reduce((s, o) => s + (Number(o.total) || 0), 0)
  const paymentsReceived = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0)
  const expensesTotal = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)

  const paidByOrder = {}
  for (const p of state.payments.filter((row) => storeIds.includes(row.storeId))) {
    paidByOrder[p.orderId] = (paidByOrder[p.orderId] || 0) + (Number(p.amount) || 0)
  }
  const outstandingOrders = state.orders.filter(
    (o) => storeIds.includes(o.storeId) && o.status !== 'cancelled',
  )
  const outstanding = outstandingOrders.reduce((s, o) => {
    const paid = paidByOrder[o.id] || 0
    return s + Math.max(0, (Number(o.total) || 0) - paid)
  }, 0)

  const byStatus = ORDER_STATUSES.reduce((acc, st) => {
    acc[st] = countedOrders.filter((o) => o.status === st).length
    return acc
  }, {})
  const inProgress = countedOrders.filter((o) => o.status !== 'completed').length

  const serviceCounts = { wash: 0, dry: 0, fold: 0, iron: 0 }
  for (const o of countedOrders) {
    for (const k of Object.keys(serviceCounts)) {
      if (o.services?.[k]) serviceCounts[k] += 1
    }
  }

  const paymentMethods = {}
  for (const p of payments) {
    const key = p.method || 'unspecified'
    if (!paymentMethods[key]) paymentMethods[key] = { method: key, label: paymentMethodLabel(key), amount: 0, count: 0 }
    paymentMethods[key].amount += Number(p.amount) || 0
    paymentMethods[key].count += 1
  }

  const stores = listStores().filter((s) => storeIds.includes(s.id))
  const branchName = requested
    ? getStore(requested)?.name || 'Unknown branch'
    : stores.length === 1
      ? stores[0].name
      : 'All Laundry Shops'

  const branchBreakdown = stores.map((store) => {
    const storeOrders = countedOrders.filter((o) => o.storeId === store.id)
    const storePayments = payments.filter((p) => p.storeId === store.id)
    const storeExpenses = expenses.filter((e) => e.storeId === store.id)
    const sales = storePayments.reduce((s, p) => s + (Number(p.amount) || 0), 0)
    const exp = storeExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)
    const revenue = storeOrders.reduce((s, o) => s + (Number(o.total) || 0), 0)
    return {
      storeId: store.id,
      name: store.name,
      orders: storeOrders.length,
      completed: storeOrders.filter((o) => o.status === 'completed').length,
      orderRevenue: Math.round(revenue * 100) / 100,
      paymentsReceived: Math.round(sales * 100) / 100,
      expenses: Math.round(exp * 100) / 100,
      netIncome: Math.round((sales - exp) * 100) / 100,
    }
  })

  const chartMonthKeys = lastNMonthKeys(6)
  const paymentsByMonth = {}
  const revenueByMonth = {}
  for (const p of state.payments.filter((row) => storeIds.includes(row.storeId))) {
    const mk = (p.createdAt || '').slice(0, 7)
    if (mk) paymentsByMonth[mk] = (paymentsByMonth[mk] || 0) + (Number(p.amount) || 0)
  }
  for (const o of state.orders.filter((row) => storeIds.includes(row.storeId) && row.status !== 'cancelled')) {
    const mk = (o.createdAt || '').slice(0, 7)
    if (mk) revenueByMonth[mk] = (revenueByMonth[mk] || 0) + (Number(o.total) || 0)
  }

  const customerSpend = {}
  const customerOrders = {}
  for (const o of countedOrders) {
    customerSpend[o.customerId] = (customerSpend[o.customerId] || 0) + (Number(o.total) || 0)
    customerOrders[o.customerId] = (customerOrders[o.customerId] || 0) + 1
  }
  const customerAnalytics = state.accounts
    .filter((a) => a.role === 'customer' && storeIds.includes(a.storeId))
    .map((c) => ({
      accountId: c.id,
      name: c.name,
      orders: customerOrders[c.id] || 0,
      spendPhp: Math.round((customerSpend[c.id] || 0) * 100) / 100,
    }))

  const today = todayISODate()
  const todayPayments = state.payments.filter(
    (p) => storeIds.includes(p.storeId) && (p.createdAt || '').slice(0, 10) === today,
  )
  const monthKey = today.slice(0, 7)
  const monthPayments = state.payments.filter(
    (p) => storeIds.includes(p.storeId) && (p.createdAt || '').slice(0, 7) === monthKey,
  )
  const monthExpenses = state.expenses.filter(
    (e) => storeIds.includes(e.storeId) && String(e.date || '').slice(0, 7) === monthKey,
  )

  return {
    branchName,
    storeIds,
    range,
    unassigned,
    orderRevenue: Math.round(orderRevenue * 100) / 100,
    paymentsReceived: Math.round(paymentsReceived * 100) / 100,
    outstanding: Math.round(outstanding * 100) / 100,
    expensesTotal: Math.round(expensesTotal * 100) / 100,
    netIncome: Math.round((paymentsReceived - expensesTotal) * 100) / 100,
    ordersReceived: countedOrders.length,
    completedOrders: countedOrders.filter((o) => o.status === 'completed').length,
    inProgressOrders: inProgress,
    cancelledOrders: cancelled.length,
    pendingOrders: countedOrders.filter((o) => o.status === 'received' || o.status === 'processing').length,
    byStatus,
    popularServices: Object.keys(serviceCounts).map((id) => ({
      id,
      label: SERVICE_LABELS[id] || id,
      count: serviceCounts[id],
    })),
    paymentMethods: Object.values(paymentMethods).map((row) => ({
      ...row,
      amount: Math.round(row.amount * 100) / 100,
    })),
    branchBreakdown,
    orders,
    payments,
    expenses,
    customerAnalytics,
    dashboardCharts: {
      months: chartMonthKeys.map((key) => ({ key, shortLabel: monthShortLabel(key) })),
      incomePhp: chartMonthKeys.map((k) => Math.round((paymentsByMonth[k] || 0) * 100) / 100),
      salesPhp: chartMonthKeys.map((k) => Math.round((revenueByMonth[k] || 0) * 100) / 100),
      popularServices: Object.keys(serviceCounts)
        .map((id) => ({ id, label: SERVICE_LABELS[id] || id, count: serviceCounts[id] }))
        .sort((a, b) => b.count - a.count),
    },
    dailySalesSummary: {
      date: today,
      orderCount: state.orders.filter(
        (o) => storeIds.includes(o.storeId) && (o.createdAt || '').slice(0, 10) === today,
      ).length,
      recordedPaymentsPhp: Math.round(todayPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0) * 100) / 100,
    },
    monthlyRevenue: {
      month: monthKey,
      recordedPaymentsPhp: Math.round(monthPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0) * 100) / 100,
    },
    monthlyExpenses: Math.round(monthExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0) * 100) / 100,
    orderVolume: {
      total: countedOrders.length,
      byStatus,
    },
    servicePopularity: serviceCounts,
  }
}

export function getReports(filters = {}) {
  const role = getCurrentRole()
  if (role === 'admin' || role === 'super_admin') {
    const report = getBranchReport({ period: filters.period || 'monthly', ...filters })
    return {
      ...report,
      expensesTotal: report.expensesTotal,
    }
  }

  const state = getTenantState()
  const orders = state.orders
  const payments = state.payments.filter((p) => p.status === 'paid' || p.status === 'partial')

  const salesByDay = {}
  const revenueByMonth = {}
  const serviceCounts = { wash: 0, dry: 0, fold: 0, iron: 0 }

  for (const o of orders) {
    const day = (o.createdAt || '').slice(0, 10)
    if (!day) continue
    salesByDay[day] = (salesByDay[day] || 0) + (o.total || 0)
    const month = day.slice(0, 7)
    revenueByMonth[month] = (revenueByMonth[month] || 0) + (o.total || 0)
    for (const k of Object.keys(serviceCounts)) {
      if (o.services?.[k]) serviceCounts[k] += 1
    }
  }

  const customerSpend = {}
  const customerOrders = {}
  for (const o of orders) {
    customerSpend[o.customerId] = (customerSpend[o.customerId] || 0) + (o.total || 0)
    customerOrders[o.customerId] = (customerOrders[o.customerId] || 0) + 1
  }

  const customers = state.accounts.filter((a) => a.role === 'customer')
  const customerAnalytics = customers.map((c) => ({
    accountId: c.id,
    name: c.name,
    orders: customerOrders[c.id] || 0,
    spendPhp: Math.round((customerSpend[c.id] || 0) * 100) / 100,
  }))

  const paidTotalsByOrder = {}
  for (const p of state.payments) {
    paidTotalsByOrder[p.orderId] = (paidTotalsByOrder[p.orderId] || 0) + p.amount
  }

  const today = todayISODate()
  const todayPayments = state.payments.filter((p) => (p.createdAt || '').slice(0, 10) === today)
  const todaySales = todayPayments.reduce((s, p) => s + p.amount, 0)

  const monthKey = today.slice(0, 7)
  const monthPayments = state.payments.filter(
    (p) => (p.createdAt || '').slice(0, 7) === monthKey,
  )
  const monthRevenue = monthPayments.reduce((s, p) => s + p.amount, 0)

  const paymentsByMonth = {}
  for (const p of state.payments) {
    const mk = (p.createdAt || '').slice(0, 7)
    if (!mk) continue
    paymentsByMonth[mk] = (paymentsByMonth[mk] || 0) + (Number(p.amount) || 0)
  }

  const chartMonthKeys = lastNMonthKeys(6)
  const dashboardCharts = {
    months: chartMonthKeys.map((key) => ({
      key,
      shortLabel: monthShortLabel(key),
    })),
    incomePhp: chartMonthKeys.map((k) => Math.round((paymentsByMonth[k] || 0) * 100) / 100),
    salesPhp: chartMonthKeys.map((k) => Math.round((revenueByMonth[k] || 0) * 100) / 100),
    popularServices: Object.keys(serviceCounts)
      .map((id) => ({
        id,
        label: SERVICE_LABELS[id] || id,
        count: serviceCounts[id],
      }))
      .sort((a, b) => b.count - a.count),
  }

  return {
    dailySalesSummary: {
      date: today,
      orderCount: orders.filter((o) => (o.createdAt || '').slice(0, 10) === today).length,
      recordedPaymentsPhp: Math.round(todaySales * 100) / 100,
    },
    monthlyRevenue: {
      month: monthKey,
      recordedPaymentsPhp: Math.round(monthRevenue * 100) / 100,
    },
    customerAnalytics,
    orderVolume: {
      total: orders.length,
      byStatus: ORDER_STATUSES.reduce((acc, st) => {
        acc[st] = orders.filter((o) => o.status === st).length
        return acc
      }, {}),
    },
    servicePopularity: serviceCounts,
    dashboardCharts,
    paymentRows: payments,
    expensesTotal: state.expenses.reduce((s, e) => s + e.amount, 0),
  }
}

export function getSalesReport(filters = {}) {
  const report = getBranchReport(filters)
  const method = filters.method || 'all'
  const payments =
    method === 'all' ? report.payments : report.payments.filter((p) => p.method === method)
  const state = getState()

  const paymentRows = payments.map((p) => {
    const order = state.orders.find((o) => o.id === p.orderId)
    const customer = order ? state.accounts.find((a) => a.id === order.customerId) : null
    const store = p.storeId ? getStore(p.storeId) : null
    return {
      ...p,
      orderCode: order?.code || 'Unknown',
      customerName: customer?.name || 'Unknown',
      shopName: store?.name || 'Unassigned',
      date: p.createdAt?.slice(0, 10) || '',
    }
  })

  const totalSales = paymentRows.reduce((sum, row) => sum + (row.amount || 0), 0)
  const txCount = paymentRows.length
  const byDay = paymentRows.reduce((acc, row) => {
    acc[row.date] = (acc[row.date] || 0) + row.amount
    return acc
  }, {})

  return {
    branchName: report.branchName,
    range: report.range,
    paymentRows,
    summary: {
      totalSales: Math.round(totalSales * 100) / 100,
      transactionCount: txCount,
      averageTicket: txCount ? Math.round((totalSales / txCount) * 100) / 100 : 0,
    },
    byDay,
  }
}

export function sendMessage(payload) {
  const state = getState()
  assertAccountRef(state, payload.fromId)
  assertAccountRef(state, payload.toId)
  const body = String(payload.body || '').trim()
  if (!body) throw new Error('Message cannot be empty')
  const from = state.accounts.find((a) => a.id === payload.fromId)
  const msg = {
    id: newId('msg'),
    storeId: payload.storeId || from?.storeId || currentStoreId(),
    fromId: payload.fromId,
    toId: payload.toId,
    body,
    createdAt: new Date().toISOString(),
    readBy: [payload.fromId],
  }
  state.messages.push(msg)
  log(state, 'info', 'Message sent', { fromId: payload.fromId, toId: payload.toId })
  persist(state)
  return msg
}

export function getConversationMessages(userId, peerId) {
  const state = getState()
  return state.messages
    .filter(
      (m) =>
        (m.fromId === userId && m.toId === peerId) ||
        (m.fromId === peerId && m.toId === userId),
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
}

export function markConversationRead(userId, peerId) {
  const state = getState()
  for (const m of state.messages) {
    const isInConversation =
      (m.fromId === userId && m.toId === peerId) || (m.fromId === peerId && m.toId === userId)
    if (isInConversation && !m.readBy.includes(userId)) m.readBy.push(userId)
  }
  persist(state)
}

export function getUnreadMessageCount(userId) {
  const state = getState()
  return state.messages.filter((m) => m.toId === userId && !m.readBy.includes(userId)).length
}

export function getConversationSummaries(userId, targetRole = '') {
  const state = getTenantState()
  const candidates = state.accounts.filter(
    (a) => a.id !== userId && a.role !== 'super_admin' && (!targetRole || a.role === targetRole),
  )
  return candidates
    .map((peer) => {
      const messages = getConversationMessages(userId, peer.id)
      const last = messages[messages.length - 1] || null
      const unread = messages.filter((m) => m.toId === userId && !m.readBy.includes(userId)).length
      return { peer, last, unread }
    })
    .sort((a, b) => {
      const at = a.last?.createdAt || ''
      const bt = b.last?.createdAt || ''
      if (at === bt) return 0
      return at < bt ? 1 : -1
    })
}

export function validateDataIntegrity() {
  const state = getState()
  const issues = []
  const orderIds = new Set(state.orders.map((o) => o.id))
  const accountIds = new Set(state.accounts.map((a) => a.id))
  for (const o of state.orders) {
    if (!accountIds.has(o.customerId)) issues.push(`Order ${o.code}: invalid customerId`)
  }
  for (const p of state.payments) {
    if (!orderIds.has(p.orderId)) issues.push(`Payment ${p.id}: invalid orderId`)
  }
  return { ok: issues.length === 0, issues }
}

export function resetDatabaseToSeed() {
  const seed = createSeed()
  cache = seed
  persist(seed)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  }
  return seed
}

/** Resets in-memory state to a fresh seed (for automated tests). */
export function loadFreshSeedForTests() {
  const seed = createSeed()
  memoryOverride = seed
  cache = seed
  return seed
}
