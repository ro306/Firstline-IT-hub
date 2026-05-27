import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Package,
  Trash2,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import * as motion from 'motion/react-client'
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
import { AnimatedNumber } from '@/components/motion/AnimatedNumber'
import { StaggerGrid } from '@/components/motion/StaggerGrid'

const ACTIVE = new Set([
  'in_use',
  'in_maintenance',
  'leased_in',
  'leased_out',
  'assigned',
])

const TONE_CLASSES: Record<string, string> = {
  brand: 'bg-gradient-to-br from-brand-50 to-brand-100/60 text-brand-700 ring-brand-100',
  emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-700 ring-emerald-100',
  amber: 'bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-700 ring-amber-100',
  slate: 'bg-gradient-to-br from-slate-100 to-slate-200/60 text-slate-700 ring-slate-200',
  rose: 'bg-gradient-to-br from-rose-50 to-rose-100/60 text-rose-700 ring-rose-100',
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: typeof Boxes
  tone: 'brand' | 'emerald' | 'amber' | 'slate' | 'rose'
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200/70 bg-white p-5 shadow-elevated transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-[28px] font-semibold tracking-tight text-slate-900 tabular-nums">
            <AnimatedNumber value={value} />
          </p>
        </div>
        <div
          className={`rounded-lg p-2 ring-1 ring-inset transition-transform group-hover:scale-110 ${TONE_CLASSES[tone]}`}
        >
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
  const active = assets.filter((a) => ACTIVE.has(a.lifecycleState)).length
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

      <StaggerGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label={t('dashboard.stat.total')} value={total} icon={Boxes} tone="brand" />
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
        <StatCard label={t('dashboard.stat.leased')} value={leased} icon={Package} tone="slate" />
        <StatCard label={t('dashboard.stat.eol')} value={eol} icon={Trash2} tone="rose" />
      </StaggerGrid>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-elevated lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                {t('dashboard.upcoming.title')}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {t('dashboard.upcoming.subtitle')}
              </p>
            </div>
            <Link
              to="/renewals"
              className="group inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
            >
              {t('common.view_all')}
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          {upcomingPeriods.length === 0 ? (
            <p className="mt-4 rounded-lg bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">
              {t('dashboard.upcoming.empty')}
            </p>
          ) : (
            <ul className="mt-4 -mx-2 divide-y divide-slate-100">
              {upcomingPeriods.slice(0, 6).map((p, idx) => (
                <motion.li
                  key={p.key}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.04, duration: 0.25 }}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md px-2 py-3 transition-colors hover:bg-slate-50/70"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/assets/${p.assetId}`}
                      className="text-sm font-medium text-slate-900 transition-colors hover:text-brand-700"
                    >
                      {p.assetName}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {t(kindKey(p.kind))} · {p.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 tabular-nums">
                      {daysLabel(p.daysUntil)}
                    </span>
                    <SeverityBadge severity={p.severity} />
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-elevated"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                {t('dashboard.lease.title')}
              </h3>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-[28px] font-semibold tracking-tight text-slate-900 tabular-nums">
              {formatMoney({ amount: totalMonthlyLease, currency: 'DKK' })}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {leased === 1
                ? t('dashboard.lease.across_one')
                : t('dashboard.lease.across_other', { count: leased })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-elevated"
          >
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">
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
                    <StatusBadge
                      state={state as keyof typeof LIFECYCLE_STATE_CONFIG}
                    />
                    <span className="font-medium text-slate-700 tabular-nums">
                      {count}
                    </span>
                  </li>
                ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
