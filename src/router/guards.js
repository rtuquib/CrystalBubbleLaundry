/**
 * Session helpers for Vue Router navigation guards (local demo auth).
 */

const ROLE_HOME = {
  super_admin: '/super-admin/dashboard',
  admin: '/admin/dashboard',
  staff: '/staff/dashboard',
  customer: '/customer/dashboard',
}

const ROLE_ALIASES = {
  superadmin: 'super_admin',
  'super-admin': 'super_admin',
  super_admin: 'super_admin',
  administrator: 'admin',
  admin: 'admin',
  staff: 'staff',
  customer: 'customer',
}

export function normalizeRole(role) {
  if (role == null || role === '') return null
  const key = String(role).trim().toLowerCase().replace(/\s+/g, '_')
  return ROLE_ALIASES[key] || null
}

export function getSession() {
  try {
    const raw = localStorage.getItem('loggedInUser')
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session || typeof session !== 'object') return null
    const role = normalizeRole(session.role)
    if (!role) return null
    return { ...session, role }
  } catch {
    return null
  }
}

export function getSessionRole() {
  return getSession()?.role ?? null
}

export function homePathForRole(role) {
  const normalized = normalizeRole(role)
  return (normalized && ROLE_HOME[normalized]) || '/'
}

export function roleAllowedForPath(role, path) {
  const normalized = normalizeRole(role)
  if (!normalized || !path) return false

  if (path === '/' || path === '/register' || path.startsWith('/login')) return true
  if (path.startsWith('/super-admin')) return normalized === 'super_admin'
  if (path.startsWith('/admin')) return normalized === 'admin'
  if (path.startsWith('/staff')) return normalized === 'staff'
  if (path.startsWith('/customer')) return normalized === 'customer'
  return false
}

export function clearSession() {
  localStorage.removeItem('loggedInUser')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userSession')
}
