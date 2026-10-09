export function formatPhp(amount) {
  const n = Number(amount) || 0
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function summarizeServices(services) {
  if (!services) return '—'
  const parts = []
  if (services.wash) parts.push('Wash')
  if (services.dry) parts.push('Dry')
  if (services.fold) parts.push('Fold')
  if (services.iron) parts.push('Iron')
  return parts.length ? parts.join(', ') : '—'
}

export function formatDateOnly(isoOrYmd) {
  if (!isoOrYmd) return '—'
  try {
    const d = isoOrYmd.length <= 10 ? new Date(`${isoOrYmd}T12:00:00`) : new Date(isoOrYmd)
    return d.toLocaleDateString('en-PH', { dateStyle: 'medium' })
  } catch {
    return isoOrYmd
  }
}

export function formatDate(isoOrYmd) {
  if (!isoOrYmd) return '—'
  try {
    const d = isoOrYmd.length <= 10 ? new Date(`${isoOrYmd}T12:00:00`) : new Date(isoOrYmd)
    return d.toLocaleDateString('en-PH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  } catch {
    return isoOrYmd
  }
}
