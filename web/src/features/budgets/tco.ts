import type { Asset } from '@/features/assets/types'
import type { MaintenanceTicket } from '@/features/maintenance/types'

// Total cost of ownership for a single asset, summed in the asset's purchase
// currency. We sum three buckets without converting between currencies — for
// a single-currency org this is exact; for mixed currencies the consumer
// should display them grouped by currency.
export type TcoBreakdown = {
  purchase: number
  lease: number
  maintenance: number
  total: number
  currency: 'DKK' | 'EUR' | 'USD'
}

function monthsBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso)
  const to = new Date(toIso)
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return 0
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()) +
    (to.getDate() >= from.getDate() ? 0 : -1)
  return Math.max(0, months)
}

export function computeAssetTco(
  asset: Asset,
  tickets: MaintenanceTicket[],
  now: Date = new Date(),
): TcoBreakdown {
  const currency = asset.purchase.price.currency
  const purchase = asset.purchase.price.amount
  // Lease: monthlyCost × months owned (capped at returnedAt if set).
  let lease = 0
  if (asset.lease) {
    const startIso = asset.lease.startsAt
    const endIso =
      asset.lease.returnedAt ??
      (now.toISOString().slice(0, 10) < asset.lease.endsAt
        ? now.toISOString().slice(0, 10)
        : asset.lease.endsAt)
    lease = asset.lease.monthlyCost.amount * monthsBetween(startIso, endIso)
  }
  // Maintenance: sum costEstimate for tickets linked to this asset.
  const maintenance = tickets
    .filter((t) => t.assetId === asset.id)
    .reduce((sum, t) => sum + (t.costEstimate ?? 0), 0)

  return {
    purchase,
    lease,
    maintenance,
    total: purchase + lease + maintenance,
    currency,
  }
}

export type DepartmentSpend = {
  department: string
  spend: number
  assetCount: number
}

// Roll up TCO per department across all assets, dropping currency
// distinctions for the simple report (assumes a primary currency).
export function tcoByDepartment(
  assets: Asset[],
  tickets: MaintenanceTicket[],
  now: Date = new Date(),
): DepartmentSpend[] {
  const buckets = new Map<string, DepartmentSpend>()
  for (const asset of assets) {
    const dept = asset.department ?? 'Ikke tildelt'
    const tco = computeAssetTco(asset, tickets, now)
    const existing = buckets.get(dept) ?? {
      department: dept,
      spend: 0,
      assetCount: 0,
    }
    existing.spend += tco.total
    existing.assetCount += 1
    buckets.set(dept, existing)
  }
  return Array.from(buckets.values()).sort((a, b) => b.spend - a.spend)
}
