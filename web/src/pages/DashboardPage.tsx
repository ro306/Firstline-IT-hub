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
import { MOCK_ASSETS } from '@/features/assets/mockData'
import { LIFECYCLE_STATE_CONFIG } from '@/features/assets/lifecycle'
import { formatMoney } from '@/features/assets/finance'
import { StatusBadge } from '@/features/assets/StatusBadge'
import {
  computeExpirations,
  KIND_LABEL,
} from '@/features/lifecycle/expirations'
import { SeverityBadge } from '@/features/lifecycle/SeverityBadge'
import { DEFAULT_WORKFLOW_RULES } from '@/features/lifecycle/mockRules'

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
  const total = MOCK_ASSETS.length
  const active = MOCK_ASSETS.filter((a) =>
    ACTIVE.has(a.lifecycleState),
  ).length
  const maintenance = MOCK_ASSETS.filter(
    (a) => a.lifecycleState === 'in_maintenance',
  ).length
  const leased = MOCK_ASSETS.filter(
    (a) => a.ownership === 'leased_in' || a.ownership === 'leased_out',
  ).length
  const eol = MOCK_ASSETS.filter((a) =>
    ['retired', 'disposed', 'returned_to_vendor'].includes(a.lifecycleState),
  ).length

  // Upcoming periods within 90 days across all kinds (warranty, lease,
  // depreciation EOL, recurring checks) plus anything already overdue.
  const upcomingPeriods = computeExpirations(
    MOCK_ASSETS,
    DEFAULT_WORKFLOW_RULES,
  )
    .filter((p) => p.daysUntil <= 90)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  // Total monthly lease cost.
  const totalMonthlyLease = MOCK_ASSETS.reduce(
    (sum, a) => sum + (a.lease?.monthlyCost.amount ?? 0),
    0,
  )

  // Lifecycle state breakdown.
  const stateBreakdown = MOCK_ASSETS.reduce<Record<string, number>>(
    (acc, a) => {
      acc[a.lifecycleState] = (acc[a.lifecycleState] ?? 0) + 1
      return acc
    },
    {},
  )

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Lifecycle overview of your IT asset inventory."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total assets" value={total} icon={Boxes} tone="brand" />
        <StatCard
          label="Active"
          value={active}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="In maintenance"
          value={maintenance}
          icon={AlertTriangle}
          tone="amber"
        />
        <StatCard label="Leased" value={leased} icon={Package} tone="slate" />
        <StatCard label="End of life" value={eol} icon={Trash2} tone="rose" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Upcoming renewals
            </h3>
            <Link
              to="/renewals"
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
            >
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-slate-500">
            Warranties, leases, EOL and recurring checks within 90 days
          </p>
          {upcomingPeriods.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Nothing expiring in the next 90 days.
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
                      {KIND_LABEL[p.kind]} · {p.label}
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
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Monthly lease cost
            </h3>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatMoney({ amount: totalMonthlyLease, currency: 'DKK' })}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Across {leased} leased asset{leased === 1 ? '' : 's'}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Lifecycle breakdown
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
