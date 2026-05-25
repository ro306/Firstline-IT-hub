import { cn } from '@/lib/cn'
import type { AssetStatus } from './types'

const STATUS_CONFIG: Record<AssetStatus, { label: string; classes: string }> = {
  in_use: {
    label: 'In use',
    classes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  },
  in_stock: {
    label: 'In stock',
    classes: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  },
  maintenance: {
    label: 'Maintenance',
    classes: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  retired: {
    label: 'Retired',
    classes: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  },
}

export function StatusBadge({ status }: { status: AssetStatus }) {
  const { label, classes } = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        classes,
      )}
    >
      {label}
    </span>
  )
}
