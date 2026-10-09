import { describe, expect, it } from 'vitest'
import {
  homePathForRole,
  normalizeRole,
  roleAllowedForPath,
} from '../src/router/guards.js'

describe('router guards', () => {
  it('normalizes role aliases', () => {
    expect(normalizeRole('superadmin')).toBe('super_admin')
    expect(normalizeRole('Super Admin')).toBe('super_admin')
    expect(normalizeRole('admin')).toBe('admin')
    expect(normalizeRole('staff')).toBe('staff')
  })

  it('maps roles to home paths', () => {
    expect(homePathForRole('super_admin')).toBe('/super-admin/dashboard')
    expect(homePathForRole('admin')).toBe('/admin/dashboard')
    expect(homePathForRole('staff')).toBe('/staff/dashboard')
  })

  it('allows only matching role paths', () => {
    expect(roleAllowedForPath('super_admin', '/super-admin/dashboard')).toBe(true)
    expect(roleAllowedForPath('admin', '/admin/dashboard')).toBe(true)
    expect(roleAllowedForPath('staff', '/staff/dashboard')).toBe(true)
    expect(roleAllowedForPath('staff', '/admin/dashboard')).toBe(false)
    expect(roleAllowedForPath('admin', '/super-admin/dashboard')).toBe(false)
  })
})
