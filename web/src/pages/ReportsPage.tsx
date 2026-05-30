import { Download } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/features/assets/StatusBadge'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { useLicensesStore } from '@/features/licenses/useLicensesStore'
import { licenseCompliance } from '@/features/licenses/sam'
import { useTicketsStore } from '@/features/maintenance/useTicketsStore'
import { useBudgetsStore } from '@/features/budgets/useBudgetsStore'
import { tcoByDepartment } from '@/features/budgets/tco'
import { useRulesStore } from '@/features/lifecycle/useRulesStore'
import { computeExpirations } from '@/features/lifecycle/expirations'
import {
  computeDepreciation,
  daysUntil,
  formatMoney,
} from '@/features/assets/finance'
import { downloadAssetsCsv } from '@/features/assets/csvExport'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { cn } from '@/lib/cn'
import type { AssetLifecycleState } from '@/features/assets/types'

const TERMINAL = new Set<AssetLifecycleState>([
  'disposed',
  'returned_to_vendor',
  'retired',
])

export function ReportsPage() {
  const { t } = useTranslation()
  const { assets } = useAssetStore()
  const { licenses } = useLicensesStore()
  const { tickets } = useTicketsStore()
  const { budgets } = useBudgetsStore()
  const { rules } = useRulesStore()

  const tcoByDept = tcoByDepartment(assets, tickets)
  const grandTotalTco = tcoByDept.reduce((s, d) => s + d.spend, 0)

  const liveAssets = assets.filter((a) => !TERMINAL.has(a.lifecycleState))
  const totalValue = assets.reduce(
    (sum, a) => sum + a.purchase.price.amount,
    0,
  )
  const monthlyLease = assets.reduce(
    (sum, a) => sum + (a.lease?.monthlyCost.amount ?? 0),
    0,
  )
  const leased = assets.filter(
    (a) => a.ownership === 'leased_in' || a.ownership === 'leased_out',
  ).length

  const expirations = computeExpirations(assets, rules)
  const expiringWarranties = expirations.filter(
    (p) => p.kind === 'warranty' && p.daysUntil >= 0 && p.daysUntil <= 90,
  ).length
  const expiringLeases = expirations.filter(
    (p) => p.kind === 'lease' && p.daysUntil >= 0 && p.daysUntil <= 180,
  ).length
  const overdueChecks = assets.reduce(
    (sum, a) =>
      sum +
      a.recurringChecks.filter((c) => daysUntil(c.nextDueAt) < 0).length,
    0,
  )

  const byCategory = countBy(assets, (a) => a.category)
  const byLifecycle = countBy(assets, (a) => a.lifecycleState)
  const byLocation = countBy(assets, (a) => a.location)

  const bookValue = assets.reduce((sum, a) => {
    const snap = computeDepreciation(a)
    if (!snap) return sum + a.purchase.price.amount
    return sum + snap.bookValue.amount
  }, 0)

  const ticketCounts = countBy(tickets, (t) => t.status)
  const totalSeats = licenses.reduce((s, l) => s + l.seatsTotal, 0)
  const usedSeats = licenses.reduce((s, l) => s + l.seatsUsed, 0)
  const seatLicenses = licenses.filter((l) => l.serviceType === 'license')
  const seatLicenseCount = seatLicenses.length
  const licenseComplianceCounts = countBy(seatLicenses, (l) =>
    licenseCompliance(l),
  )

  return (
    <div>
      <PageHeader
        title={t('reports_page.title')}
        description={t('reports_page.description')}
        actions={
          <button
            type="button"
            onClick={() => downloadAssetsCsv(assets)}
            className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
          >
            <Download className="h-4 w-4" />
            {t('reports_page.export_csv')}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat
          label={t('reports_page.stat.total_assets')}
          value={assets.length}
        />
        <Stat
          label={t('reports_page.stat.active_assets')}
          value={liveAssets.length}
        />
        <Stat label={t('reports_page.stat.leased_assets')} value={leased} />
        <Stat
          label={t('reports_page.stat.total_value')}
          value={formatMoney({ amount: totalValue, currency: 'DKK' })}
        />
        <Stat
          label={t('reports_page.stat.monthly_lease')}
          value={formatMoney({ amount: monthlyLease, currency: 'DKK' })}
        />
        <Stat
          label={t('reports_page.stat.expiring_warranties')}
          value={expiringWarranties}
          tone={expiringWarranties > 0 ? 'amber' : 'neutral'}
        />
        <Stat
          label={t('reports_page.stat.expiring_leases')}
          value={expiringLeases}
          tone={expiringLeases > 0 ? 'amber' : 'neutral'}
        />
        <Stat
          label={t('reports_page.stat.overdue_checks')}
          value={overdueChecks}
          tone={overdueChecks > 0 ? 'rose' : 'neutral'}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title={t('reports_page.section.by_category')}>
          <BarList
            data={byCategory}
            renderLabel={(key) => t(`asset.category.${key}`)}
          />
        </Section>

        <Section title={t('reports_page.section.by_lifecycle')}>
          <ul className="space-y-1.5">
            {Object.entries(byLifecycle)
              .sort(([, a], [, b]) => b - a)
              .map(([state, count]) => (
                <li
                  key={state}
                  className="flex items-center justify-between text-xs"
                >
                  <StatusBadge state={state as AssetLifecycleState} />
                  <span className="font-medium text-slate-300">{count}</span>
                </li>
              ))}
          </ul>
        </Section>

        <Section title={t('reports_page.section.by_location')}>
          <BarList data={byLocation} renderLabel={(key) => key} />
        </Section>

        <Section title={t('reports_page.section.depreciation')}>
          <p className="text-3xl font-semibold text-slate-100">
            {formatMoney({ amount: bookValue, currency: 'DKK' })}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {Math.round((bookValue / Math.max(totalValue, 1)) * 100)}% af
            købsværdi
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{
                width: `${Math.round((bookValue / Math.max(totalValue, 1)) * 100)}%`,
              }}
            />
          </div>
        </Section>

        <Section title={t('reports_page.section.tickets')}>
          <ul className="space-y-1.5">
            {Object.entries(ticketCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => (
                <li
                  key={status}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-300">
                    {t(`maintenance_page.status.${status}`)}
                  </span>
                  <span className="font-medium text-slate-300">{count}</span>
                </li>
              ))}
            {tickets.length === 0 && (
              <li className="text-xs text-slate-500">
                {t('reports_page.no_data')}
              </li>
            )}
          </ul>
        </Section>

        <Section title={t('reports_page.section.licenses')}>
          {totalSeats === 0 ? (
            <p className="text-xs text-slate-500">
              {t('reports_page.no_data')}
            </p>
          ) : (
            <>
              <p className="text-3xl font-semibold text-slate-100">
                {usedSeats} / {totalSeats}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {Math.round((usedSeats / totalSeats) * 100)}% udnyttelse
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={cn(
                    'h-full rounded-full',
                    usedSeats / totalSeats > 0.85
                      ? 'bg-amber-500'
                      : 'bg-brand-500',
                  )}
                  style={{ width: `${(usedSeats / totalSeats) * 100}%` }}
                />
              </div>
            </>
          )}
        </Section>

        <Section title={t('reports_page.section.license_compliance')}>
          {seatLicenseCount === 0 ? (
            <p className="text-xs text-slate-500">{t('reports_page.no_data')}</p>
          ) : (
            <ul className="space-y-1.5">
              {(['compliant', 'warning', 'over'] as const).map((c) => (
                <li
                  key={c}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-slate-300">
                    {t(`licenses_page.compliance.${c}`)}
                  </span>
                  <span className="font-medium text-slate-300 tabular-nums">
                    {licenseComplianceCounts[c] ?? 0}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={t('reports_page.section.tco_by_department')}>
          {tcoByDept.length === 0 ? (
            <p className="text-xs text-slate-500">{t('reports_page.no_data')}</p>
          ) : (
            <ul className="space-y-2">
              {tcoByDept.map((row) => {
                const budget = budgets.find(
                  (b) =>
                    b.department.toLowerCase() === row.department.toLowerCase(),
                )
                const max = budget?.annualBudget ?? grandTotalTco
                const pct = max > 0 ? Math.min(100, (row.spend / max) * 100) : 0
                const overBudget =
                  budget !== undefined && row.spend > budget.annualBudget
                return (
                  <li key={row.department} className="space-y-1">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-300">
                        {row.department}
                        <span className="ml-1.5 text-slate-500 tabular-nums">
                          · {row.assetCount}
                        </span>
                      </span>
                      <span className="font-medium text-slate-300 tabular-nums">
                        {formatMoney({ amount: row.spend, currency: 'DKK' })}
                        {budget && (
                          <span className="ml-1 text-[10px] text-slate-500">
                            /{' '}
                            {formatMoney({
                              amount: budget.annualBudget,
                              currency: budget.currency,
                            })}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          overBudget
                            ? 'bg-rose-500'
                            : pct > 85
                              ? 'bg-amber-500'
                              : 'bg-brand-500',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>
      </div>
    </div>
  )
}

function countBy<T>(items: T[], pick: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const item of items) {
    const k = pick(item)
    out[k] = (out[k] ?? 0) + 1
  }
  return out
}

function Stat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: number | string
  tone?: 'neutral' | 'amber' | 'rose'
}) {
  const valueClass = {
    neutral: 'text-slate-100',
    amber: 'text-amber-300',
    rose: 'text-rose-300',
  }[tone]
  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-5 shadow-elevated transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <p className="text-[13px] font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-[28px] font-semibold tracking-tight tabular-nums ${valueClass}`}>{value}</p>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
      <h3 className="mb-4 text-sm font-semibold tracking-tight text-slate-100">{title}</h3>
      {children}
    </div>
  )
}

function BarList({
  data,
  renderLabel,
}: {
  data: Record<string, number>
  renderLabel: (key: string) => string
}) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a)
  if (entries.length === 0) {
    return <p className="text-xs text-slate-500">—</p>
  }
  const max = entries[0][1]
  return (
    <ul className="space-y-2">
      {entries.map(([key, count]) => (
        <li key={key}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">{renderLabel(key)}</span>
            <span className="font-medium text-slate-100">{count}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
