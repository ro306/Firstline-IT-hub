import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Package,
  Trash2,
  ArrowUpRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { LIFECYCLE_STATE_CONFIG } from '@/features/assets/lifecycle'
import { formatMoney } from '@/features/assets/finance'
import { StatusBadge } from '@/features/assets/StatusBadge'
import {
  computeExpirations,
  kindKey,
} from '@/features/lifecycle/expirations'
import { SeverityBadge } from '@/features/lifecycle/SeverityBadge'
import { useRulesStore } from '@/features/lifecycle/useRulesStore'
import { useTranslation } from '@/lib/i18n/useTranslation'

const ACTIVE = new Set([
  'in_use',
  'in_maintenance',
  'leased_in',
  'leased_out',
  'assigned',
])

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number | string
  icon: typeof Boxes
  tone: 'brand' | 'emerald' | 'amber' | 'slate' | 'rose'
}) {
  const toneClasses = {
    brand: 'bg-brand-50 text-brand-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-600',
    rose: 'bg-rose-50 text-rose-700',
  }[tone]

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-md p-2 ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { t } = useTranslation()
  const { assets } = useAssetStore()
  const { rules } = useRulesStore()
  const total = assets.length
  const active = assets.filter((a) =>
    ACTIVE.has(a.lifecycleState),
  ).length
  const maintenance = assets.filter(
    (a) => a.lifecycleState === 'in_maintenance',
  ).length
  const leased = assets.filter(
    (a) => a.ownership === 'leased_in' || a.ownership === 'leased_out',
  ).length
  const eol = assets.filter((a) =>
    ['retired', 'disposed', 'returned_to_vendor'].includes(a.lifecycleState),
  ).length

  const upcomingPeriods = computeExpirations(assets, rules)
    .filter((p) => p.daysUntil <= 90)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  const totalMonthlyLease = assets.reduce(
    (sum, a) => sum + (a.lease?.monthlyCost.amount ?? 0),
    0,
  )

  const stateBreakdown = assets.reduce<Record<string, number>>(
    (acc, a) => {
      acc[a.lifecycleState] = (acc[a.lifecycleState] ?? 0) + 1
      return acc
    },
    {},
  )

  function daysLabel(days: number): string {
    if (days < 0) return t('renewals.days.overdue', { n: Math.abs(days) })
    if (days === 0) return t('renewals.days.today')
    if (days === 1) return t('renewals.days.one_left')
    return t('renewals.days.many_left', { n: days })
  }

  return (
    <div>
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label={t('dashboard.stat.total')}
          value={total}
          icon={Boxes}
          tone="brand"
        />
        <StatCard
          label={t('dashboard.stat.active')}
          value={active}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label={t('dashboard.stat.maintenance')}
          value={maintenance}
          icon={AlertTriangle}
          tone="amber"
        />
        <StatCard
          label={t('dashboard.stat.leased')}
          value={leased}
          icon={Package}
          tone="slate"
        />
        <StatCard
          label={t('dashboard.stat.eol')}
          value={eol}
          icon={Trash2}
          tone="rose"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              {t('dashboard.upcoming.title')}
            </h3>
            <Link
              to="/renewals"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
            >
              {t('common.view_all')}
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            {t('dashboard.upcoming.subtitle')}
          </p>
          {upcomingPeriods.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              {t('dashboard.upcoming.empty')}
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {upcomingPeriods.slice(0, 6).map((p) => (
                <li
                  key={p.key}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/assets/${p.assetId}`}
                      className="text-sm font-medium text-slate-900 hover:text-brand-700"
                    >
                      {p.assetName}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {t(kindKey(p.kind))} · {p.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {daysLabel(p.daysUntil)}
                    </span>
                    <SeverityBadge severity={p.severity} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900">
              {t('dashboard.lease.title')}
            </h3>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatMoney({ amount: totalMonthlyLease, currency: 'DKK' })}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {leased === 1
                ? t('dashboard.lease.across_one')
                : t('dashboard.lease.across_other', { count: leased })}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900">
              {t('dashboard.lifecycle_breakdown_title')}
            </h3>
            <ul className="mt-3 space-y-1.5">
              {Object.entries(stateBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([state, count]) => (
                  <li
                    key={state}
                    className="flex items-center justify-between text-xs"
                  >
                    <StatusBadge state={state as keyof typeof LIFECYCLE_STATE_CONFIG} />
                    <span className="font-medium text-slate-700">{count}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
