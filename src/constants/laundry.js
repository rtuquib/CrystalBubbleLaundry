/** Full-service order pipeline (sequential stages). */
export const ORDER_STATUSES = [
  'received',
  'processing',
  'washing',
  'drying',
  'folding',
  'quality_check',
  'ready_for_pickup',
  'completed',
]

export const ORDER_STATUS_LABELS = {
  received: 'Received',
  processing: 'Processing',
  washing: 'Washing',
  drying: 'Drying',
  folding: 'Folding',
  quality_check: 'Quality check',
  ready_for_pickup: 'Ready for pickup',
  completed: 'Completed',
}

export const ORDER_STATUS_STEPS = [
  { status: 'received', label: 'Received' },
  { status: 'processing', label: 'Processing' },
  { status: 'washing', label: 'Washing' },
  { status: 'drying', label: 'Drying' },
  { status: 'folding', label: 'Folding' },
  { status: 'quality_check', label: 'Quality Check' },
  { status: 'ready_for_pickup', label: 'Ready for Pickup' },
  { status: 'completed', label: 'Completed' },
]

/** Core wash/dry/fold/iron service toggles priced per order. */
export const SERVICE_TYPES = ['wash', 'dry', 'fold', 'iron']

export const SERVICE_LABELS = {
  wash: 'Wash',
  dry: 'Dry',
  fold: 'Fold',
  iron: 'Iron',
}

/** Flat add-on per selected service (PHP). */
export const SERVICE_FEES_PHP = {
  wash: 60,
  dry: 50,
  fold: 45,
  iron: 55,
}

/** Weight-based handling (PHP per kg). */
export const BASE_RATE_PER_KG = 25

export const INVENTORY_CATEGORIES = ['detergent', 'softener', 'packaging', 'other']

export const PAYMENT_METHODS = ['cash', 'digital']

export const PAYMENT_METHOD_LABELS = {
  cash: 'Cash',
  digital: 'Digital (GCash / card)',
}

/** Catalog items customers may prefer (linked by id). */
export const DETERGENT_OPTIONS = [
  { id: 'det-hypo', name: 'Hypoallergenic liquid', addOnPhp: 0 },
  { id: 'det-bio', name: 'Bio-enzyme detergent', addOnPhp: 15 },
  { id: 'det-color', name: 'Color care', addOnPhp: 10 },
]

export const SCENT_OPTIONS = [
  { id: 'scent-none', name: 'Unscented', addOnPhp: 0 },
  { id: 'scent-lav', name: 'Lavender', addOnPhp: 10 },
  { id: 'scent-fresh', name: 'Fresh linen', addOnPhp: 10 },
  { id: 'scent-citrus', name: 'Citrus burst', addOnPhp: 12 },
]

export function findCatalogAddOn(detergentId, scentId) {
  const d = DETERGENT_OPTIONS.find((x) => x.id === detergentId)
  const s = SCENT_OPTIONS.find((x) => x.id === scentId)
  return (d?.addOnPhp ?? 0) + (s?.addOnPhp ?? 0)
}
