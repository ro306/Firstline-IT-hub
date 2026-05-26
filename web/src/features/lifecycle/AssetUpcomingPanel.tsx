import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SeverityBadge } from './SeverityBadge'
import { computeExpirations, KIND_LABEL } from './expirations'
import { DEFAULT_WORKFLOW_RULES } from './mockRules'
import { formatDate } from '@/features/assets/finance'
import type { Asset } from '@/features/assets/types'

export function AssetUpcomingPanel({ asset }: { asset: Asset }) {
  const periods = useMemo(
    () =>
      computeExpirations([asset], DEFAULT_WORKFLOW_RULES)
        .filter((p) => p.daysUntil <= 180)
        .sort((a, b) => a.daysUntil - b.daysUntil),
    [asset],
  )

  if (periods.length === 0) return null

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Upcoming for this asset
        </h3>
        <Link
          to="/renewals"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
        >
          Open renewals
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="mt-3 divide-y divide-slate-100">
        {periods.map((p) => (
          <li
            key={p.key}
            className="flex flex-wrap items-center justify-between gap-2 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{p.label}</p>
              <p className="text-xs text-slate-500">
                {KIND_LABEL[p.kind]} · ends {formatDate(p.endsAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {p.daysUntil < 0
                  ? `${Math.abs(p.daysUntil)}d overdue`
                  : `${p.daysUntil}d left`}
              </span>
              <SeverityBadge severity={p.severity} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
