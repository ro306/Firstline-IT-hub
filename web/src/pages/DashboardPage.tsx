import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Package,
  Trash2,
  ArrowUpRight,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import * as motion from 'motion/react-client'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
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
import { Sparkline } from '@/components/charts/Sparkline'

const ACTIVE = new Set([
  'in_use',
  'in_maintenance',
  'leased_in',
  'leased_out',
  'assigned',
])

const TONE_CLASSES: Record<string, { bg: string; spark: string }> = {
  brand: {
    bg: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/30',
    spark: '#22d3ee',
  },
  emerald: {
    bg: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
    spark: '#34d399',
  },
  amber: {
    bg: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
    spark: '#fbbf24',
  },
  slate: {
    bg: 'bg-slate-500/10 text-slate-300 ring-slate-500/30',
    spark: '#94a3b8',
  },
  rose: {
    bg: 'bg-rose-500/10 text-rose-300 ring-rose-500/30',
    spark: '#fb7185',
  },
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  trend,
  to,
}: {
  label: string
  value: number
  icon: typeof Boxes
  tone: keyof typeof TONE_CLASSES
  trend?: number[]
  to?: string
}) {
  const t = TONE_CLASSES[tone]
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {label}
          </p>
          <p className="mt-2 text-[28px] font-semibold tracking-tight text-slate-100 tabular-nums">
            <AnimatedNumber value={value} />
          </p>
        </div>
        <div
          className={`rounded-lg p-2 ring-1 ring-inset transition-transform group-hover:scale-110 ${t.bg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && trend.length > 1 && (
        <div className="mt-3 -mx-1 -mb-1">
          <Sparkline data={trend} width={220} height={36} stroke={t.spark} className="w-full" />
        </div>
      )}
    </>
  )
  const cls =
    'group relative block overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/60 p-5 shadow-elevated backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-lift'
  if (to) {
    return (
      <Link to={to} className={cls + ' focus:outline-none focus:ring-2 focus:ring-cyan-500/40'}>
        {inner}
      </Link>
    )
  }
  return <div className={cls}>{inner}</div>
}

// Synthetic trend generator — gives the stat cards a believable historical
// curve. Will be replaced by a real time-series once the backend is in.
function fakeTrend(seed: number, current: number, points = 14): number[] {
  const out: number[] = []
  let v = Math.max(0, current - Math.floor(current * 0.3))
  for (let i = 0; i < points; i++) {
    const noise = (Math.sin(seed + i * 1.3) + Math.cos(seed * 1.7 + i)) * 0.5
    v = Math.max(0, v + noise + (current - v) / (points - i))
    out.push(Number(v.toFixed(1)))
  }
  out[out.length - 1] = current
  return out
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

  // Build expirations-by-month series for the chart (12 months forward).
  const allPeriods = computeExpirations(assets, rules)
  const chartData = (() => {
    const buckets: Record<string, { month: string; warranty: number; lease: number; check: number }> = {}
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString(undefined, { month: 'short' })
      buckets[key] = { month: label, warranty: 0, lease: 0, check: 0 }
    }
    for (const p of allPeriods) {
      const d = new Date(p.endsAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!buckets[key]) continue
      if (p.kind === 'warranty') buckets[key].warranty++
      else if (p.kind === 'lease') buckets[key].lease++
      else if (p.kind === 'recurring_check') buckets[key].check++
    }
    return Object.values(buckets)
  })()

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
        <StatCard
          label={t('dashboard.stat.total')}
          value={total}
          icon={Boxes}
          tone="brand"
          trend={fakeTrend(1, total)}
          to="/assets"
        />
        <StatCard
          label={t('dashboard.stat.active')}
          value={active}
          icon={CheckCircle2}
          tone="emerald"
          trend={fakeTrend(2, active)}
          to="/assets?filter=active"
        />
        <StatCard
          label={t('dashboard.stat.maintenance')}
          value={maintenance}
          icon={AlertTriangle}
          tone="amber"
          trend={fakeTrend(3, maintenance)}
          to="/assets?filter=maintenance"
        />
        <StatCard
          label={t('dashboard.stat.leased')}
          value={leased}
          icon={Package}
          tone="slate"
          trend={fakeTrend(4, leased)}
          to="/assets?filter=leased"
        />
        <StatCard
          label={t('dashboard.stat.eol')}
          value={eol}
          icon={Trash2}
          tone="rose"
          trend={fakeTrend(5, eol)}
          to="/assets?filter=end_of_life"
        />
      </StaggerGrid>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.3 }}
          className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-elevated backdrop-blur-sm lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-100">
                Expirations forecast
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                12 måneder fremad fordelt på type
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <LegendDot color="#22d3ee" label="Warranty" />
              <LegendDot color="#a78bfa" label="Lease" />
              <LegendDot color="#fbbf24" label="Check" />
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-warranty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="grad-lease" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="grad-check" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={28} />
                <Tooltip
                  cursor={{ stroke: '#475569', strokeDasharray: '3 3' }}
                  contentStyle={{ background: 'transparent', border: 'none' }}
                  labelStyle={{ color: '#cbd5e1', fontWeight: 600 }}
                  itemStyle={{ color: '#cbd5e1' }}
                />
                <Area type="monotone" dataKey="warranty" stroke="#22d3ee" strokeWidth={1.75} fill="url(#grad-warranty)" />
                <Area type="monotone" dataKey="lease" stroke="#a78bfa" strokeWidth={1.75} fill="url(#grad-lease)" />
                <Area type="monotone" dataKey="check" stroke="#fbbf24" strokeWidth={1.75} fill="url(#grad-check)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.3 }}
          className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-elevated backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-slate-100">
              {t('dashboard.lease.title')}
            </h3>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-3 text-[28px] font-semibold tracking-tight text-slate-100 tabular-nums">
            {formatMoney({ amount: totalMonthlyLease, currency: 'DKK' })}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {leased === 1
              ? t('dashboard.lease.across_one')
              : t('dashboard.lease.across_other', { count: leased })}
          </p>
          <div className="mt-4 -mx-2 -mb-2">
            <Sparkline data={fakeTrend(9, totalMonthlyLease, 16)} width={280} height={50} stroke="#22d3ee" className="w-full" />
          </div>
        </motion.div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.3 }}
          className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-elevated backdrop-blur-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-100">
                {t('dashboard.upcoming.title')}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {t('dashboard.upcoming.subtitle')}
              </p>
            </div>
            <Link
              to="/renewals"
              className="group inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/10"
            >
              {t('common.view_all')}
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          {upcomingPeriods.length === 0 ? (
            <p className="mt-4 rounded-lg bg-slate-800/40 px-4 py-6 text-center text-sm text-slate-500">
              {t('dashboard.upcoming.empty')}
            </p>
          ) : (
            <ul className="mt-4 -mx-2 divide-y divide-slate-800/70">
              {upcomingPeriods.slice(0, 6).map((p, idx) => (
                <motion.li
                  key={p.key}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.04, duration: 0.25 }}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md px-2 py-3 transition-colors hover:bg-slate-800/40"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/assets/${p.assetId}`}
                      className="text-sm font-medium text-slate-100 transition-colors hover:text-cyan-300"
                    >
                      {p.assetName}
                    </Link>
                    <p className="text-xs text-slate-500">
                      <span className="font-mono">{p.assetTag}</span>
                      <span className="mx-1.5 text-slate-700">·</span>
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

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="rounded-xl border border-slate-800/70 bg-slate-900/60 p-6 shadow-elevated backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-slate-100">
              {t('dashboard.lifecycle_breakdown_title')}
            </h3>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <ul className="mt-4 space-y-2">
            {Object.entries(stateBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([state, count]) => {
                const total = assets.length || 1
                const pct = (count / total) * 100
                return (
                  <li key={state} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <StatusBadge
                        state={state as keyof typeof LIFECYCLE_STATE_CONFIG}
                      />
                      <span className="font-medium text-slate-300 tabular-nums">
                        {count}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                      />
                    </div>
                  </li>
                )
              })}
          </ul>
        </motion.div>
      </div>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-400">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}
