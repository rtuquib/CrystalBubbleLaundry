import { describe, it, expect } from 'vitest'
import { computeOrderTotals, computeLineWeightTotal, computeServiceFees } from '../src/services/pricing.js'
import { DETERGENT_OPTIONS, SCENT_OPTIONS } from '../src/constants/laundry.js'

describe('pricing', () => {
  it('computes weight line from kg', () => {
    const items = [{ weightKg: 4 }]
    expect(computeLineWeightTotal(items)).toBe(100)
  })

  it('sums selected service fees', () => {
    const fees = computeServiceFees({ wash: true, dry: true, fold: false, iron: false })
    expect(fees).toBe(110)
  })

  it('computes order totals with catalog add-ons', () => {
    const t = computeOrderTotals(
      [{ weightKg: 2 }],
      { wash: true, dry: false, fold: false, iron: false },
      DETERGENT_OPTIONS[1].id,
      SCENT_OPTIONS[2].id,
    )
    expect(t.subtotal).toBe(t.total)
    expect(t.catalogAddOn).toBeGreaterThan(0)
  })
})
