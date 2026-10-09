/**
 * Small validation helpers for local CRUD forms (no external deps).
 * Return `null` when valid, or an error string.
 */

export function required(value, label = 'This field') {
  const s = value == null ? '' : String(value).trim()
  if (!s) return `${label} is required`
  return null
}

export function minLength(value, min, label = 'Value') {
  const s = String(value ?? '')
  if (s.length < min) return `${label} must be at least ${min} characters`
  return null
}

export function optionalEmail(value) {
  const s = String(value ?? '').trim()
  if (!s) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'Enter a valid email address'
  return null
}

export function optionalPhonePh(value) {
  const s = String(value ?? '').trim()
  if (!s) return null
  const digits = s.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 15) return 'Enter a valid phone number'
  return null
}

export function positiveNumber(value, label = 'Amount') {
  const n = Number(value)
  if (Number.isNaN(n) || n <= 0) return `${label} must be greater than zero`
  return null
}

export function nonNegativeNumber(value, label = 'Quantity') {
  const n = Number(value)
  if (Number.isNaN(n) || n < 0) return `${label} cannot be negative`
  return null
}
