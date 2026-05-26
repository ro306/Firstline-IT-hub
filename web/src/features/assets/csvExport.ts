import type { Asset } from './types'

// Minimal CSV writer with proper quoting. Handles commas, quotes, newlines.
function csvCell(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function csvRow(cells: Array<string | number | undefined | null>): string {
  return cells.map(csvCell).join(',')
}

const COLUMNS: Array<{
  header: string
  pick: (a: Asset) => string | number | undefined | null
}> = [
  { header: 'Asset tag', pick: (a) => a.assetTag },
  { header: 'Name', pick: (a) => a.name },
  { header: 'Category', pick: (a) => a.category },
  { header: 'Lifecycle state', pick: (a) => a.lifecycleState },
  { header: 'Ownership', pick: (a) => a.ownership },
  { header: 'Serial number', pick: (a) => a.serialNumber },
  { header: 'Location', pick: (a) => a.location },
  { header: 'Assigned to', pick: (a) => a.currentAssignment?.assigneeName },
  { header: 'Assignee email', pick: (a) => a.currentAssignment?.assigneeEmail },
  { header: 'Vendor', pick: (a) => a.purchase.vendor },
  { header: 'Purchase order', pick: (a) => a.purchase.purchaseOrder },
  { header: 'Purchase date', pick: (a) => a.purchase.purchaseDate },
  { header: 'Price', pick: (a) => a.purchase.price.amount },
  { header: 'Currency', pick: (a) => a.purchase.price.currency },
  { header: 'Lease vendor', pick: (a) => a.lease?.vendor },
  { header: 'Lease contract', pick: (a) => a.lease?.contractRef },
  { header: 'Lease starts', pick: (a) => a.lease?.startsAt },
  { header: 'Lease ends', pick: (a) => a.lease?.endsAt },
  { header: 'Monthly lease', pick: (a) => a.lease?.monthlyCost.amount },
  { header: 'Deployed at', pick: (a) => a.deployedAt },
  { header: 'Retired at', pick: (a) => a.retiredAt },
  { header: 'Disposed at', pick: (a) => a.disposedAt },
  { header: 'Warranty count', pick: (a) => a.warranties.length },
  { header: 'Check count', pick: (a) => a.recurringChecks.length },
]

export function assetsToCsv(assets: Asset[]): string {
  const lines: string[] = []
  lines.push(csvRow(COLUMNS.map((c) => c.header)))
  for (const asset of assets) {
    lines.push(csvRow(COLUMNS.map((c) => c.pick(asset))))
  }
  return lines.join('\r\n')
}

// Triggers a browser download of the assets list as a CSV file. Uses an
// invisible anchor + object URL — no library required.
export function downloadAssetsCsv(assets: Asset[], filename = 'assets.csv') {
  if (typeof window === 'undefined') return
  const csv = assetsToCsv(assets)
  // Prepend UTF-8 BOM so Excel detects encoding properly.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
