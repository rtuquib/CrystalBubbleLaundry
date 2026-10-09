import {
  BASE_RATE_PER_KG,
  SERVICE_FEES_PHP,
  SERVICE_TYPES,
  findCatalogAddOn,
} from '../constants/laundry.js'

/**
 * @param {{ weightKg: number }[]} lineItems
 * @param {Record<string, boolean>} services
 */
export function computeLineWeightTotal(lineItems) {
  const kg = lineItems.reduce((sum, row) => sum + (Number(row.weightKg) || 0), 0)
  return Math.round(kg * BASE_RATE_PER_KG * 100) / 100
}

/**
 * @param {Record<string, boolean>} services
 */
export function computeServiceFees(services) {
  let total = 0
  for (const key of SERVICE_TYPES) {
    if (services?.[key]) total += SERVICE_FEES_PHP[key] ?? 0
  }
  return total
}

/**
 * @param {{ weightKg: number }[]} lineItems
 * @param {Record<string, boolean>} services
 * @param {string} detergentId
 * @param {string} scentId
 */
export function computeOrderTotals(lineItems, services, detergentId, scentId) {
  const weightTotal = computeLineWeightTotal(lineItems)
  const serviceTotal = computeServiceFees(services)
  const catalog = findCatalogAddOn(detergentId, scentId)
  const subtotal = Math.round((weightTotal + serviceTotal + catalog) * 100) / 100
  return {
    weightTotal,
    serviceTotal,
    catalogAddOn: catalog,
    subtotal,
    total: subtotal,
  }
}
