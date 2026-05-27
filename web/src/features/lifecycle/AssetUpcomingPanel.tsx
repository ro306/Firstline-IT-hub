import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SeverityBadge } from './SeverityBadge'
import { computeExpirations, kindKey } from './expirations'
import { useRulesStore } from './useRulesStore'
import { formatDate } from '@/features/assets/finance'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Asset } from '@/features/assets/types'

export function AssetUpcomingPanel({ asset }: { asset: Asset }) {
  const { t } = useTranslation()
  const { rules } = useRulesStore()
  const periods = useMemo(
    () =>
      computeExpirations([asset], rules)
        .filter((p) => p.daysUntil <= 180)
        .sort((a, b) => a.daysUntil - b.daysUntil),
    [asset, rules],
  )

  if (periods.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-elevated">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          {t('asset.upcoming.title')}
        </h3>
        <Link
          to="/renewals"
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
        >
          {t('asset.upcoming.open_renewals')}
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
                {t(kindKey(p.kind))} ·{' '}
                {t('renewals.ends_on', { date: formatDate(p.endsAt) })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {p.daysUntil < 0
                  ? t('renewals.days.overdue', { n: Math.abs(p.daysUntil) })
                  : p.daysUntil === 0
                    ? t('renewals.days.today')
                    : p.daysUntil === 1
                      ? t('renewals.days.one_left')
                      : t('renewals.days.many_left', { n: p.daysUntil })}
              </span>
              <SeverityBadge severity={p.severity} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
