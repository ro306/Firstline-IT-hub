import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Package,
  TrendingDown,
  ClipboardCheck,
  RotateCcw,
  Clock,
  CheckCheck,
  ListChecks,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { SeverityBadge } from '@/features/lifecycle/SeverityBadge'
import {
  PeriodActionDialog,
  type ActionKind,
} from '@/features/lifecycle/PeriodActionDialog'
import {
  computeExpirations,
  kindKey,
  severityKey,
  EXPIRATION_KINDS,
  SEVERITIES,
  type ExpirationPeriod,
} from '@/features/lifecycle/expirations'
import { useAlertStore } from '@/features/lifecycle/useAlertStore'
import { effectiveStatus } from '@/features/lifecycle/alertStoreContext'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { useRulesStore } from '@/features/lifecycle/useRulesStore'
import { AnimatedNumber } from '@/components/motion/AnimatedNumber'
import { formatDate } from '@/features/assets/finance'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { TranslateFn } from '@/lib/i18n/i18nContext'
import type { ExpirationKind, Severity } from '@/features/lifecycle/types'

type StatusFilter = 'open' | 'snoozed' | 'acknowledged' | 'resolved' | 'all'
type KindFilter = 'all' | ExpirationKind
type SeverityFilter = 'all' | Severity

const KIND_ICONS: Record<ExpirationKind, typeof ShieldCheck> = {
  warranty: ShieldCheck,
  lease: Package,
  depreciation_eol: TrendingDown,
  recurring_check: ClipboardCheck,
}

function daysLabel(days: number, t: TranslateFn): string {
  if (days < 0) return t('renewals.days.overdue', { n: Math.abs(days) })
  if (days === 0) return t('renewals.days.today')
  if (days === 1) return t('renewals.days.one_left')
  return t('renewals.days.many_left', { n: days })
}

export function RenewalsPage() {
  const { t } = useTranslation()
  const store = useAlertStore()
  const { assets } = useAssetStore()
  const { rules } = useRulesStore()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open')
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [dialogPeriod, setDialogPeriod] = useState<ExpirationPeriod | null>(
    null,
  )
  const [dialogAction, setDialogAction] = useState<ActionKind | null>(null)

  const periods = useMemo(
    () => computeExpirations(assets, rules),
    [assets, rules],
  )

  const actionable = useMemo(
    () =>
      periods.filter(
        (p) => p.matchedRules.length > 0 || p.daysUntil < 0,
      ),
    [periods],
  )

  const stats = useMemo(() => {
    const buckets = { open: 0, snoozed: 0, acknowledged: 0, resolved: 0 }
    for (const p of actionable) {
      const status = effectiveStatus(store.alerts[p.key])
      buckets[status] += 1
    }
    return buckets
  }, [actionable, store.alerts])

  const filtered = useMemo(() => {
    return actionable
      .filter((p) => {
        const status = effectiveStatus(store.alerts[p.key])
        if (statusFilter !== 'all' && status !== statusFilter) return false
        if (kindFilter !== 'all' && p.kind !== kindFilter) return false
        if (severityFilter !== 'all' && p.severity !== severityFilter)
          return false
        return true
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
  }, [actionable, statusFilter, kindFilter, severityFilter, store.alerts])

  function openDialog(period: ExpirationPeriod, action: ActionKind) {
    setDialogPeriod(period)
    setDialogAction(action)
  }

  function closeDialog() {
    setDialogPeriod(null)
    setDialogAction(null)
  }

  return (
    <div>
      <PageHeader
        title={t('renewals.title')}
        description={t('renewals.description')}
        actions={
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
          >
            <ListChecks className="h-4 w-4" />
            {t('renewals.workflow_rules_button')}
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label={t('renewals.status.open')}
          value={stats.open}
          icon={Clock}
          tone="brand"
          active={statusFilter === 'open'}
          onClick={() => setStatusFilter('open')}
        />
        <StatCard
          label={t('renewals.status.snoozed')}
          value={stats.snoozed}
          icon={RotateCcw}
          tone="amber"
          active={statusFilter === 'snoozed'}
          onClick={() => setStatusFilter('snoozed')}
        />
        <StatCard
          label={t('renewals.status.acknowledged')}
          value={stats.acknowledged}
          icon={CheckCheck}
          tone="sky"
          active={statusFilter === 'acknowledged'}
          onClick={() => setStatusFilter('acknowledged')}
        />
        <StatCard
          label={t('renewals.status.resolved')}
          value={stats.resolved}
          icon={ShieldCheck}
          tone="emerald"
          active={statusFilter === 'resolved'}
          onClick={() => setStatusFilter('resolved')}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900 shadow-elevated">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <FilterRow
              label={t('renewals.filter.kind_label')}
              value={kindFilter}
              onChange={(v) => setKindFilter(v as KindFilter)}
              options={[
                { value: 'all', label: t('common.all') },
                ...EXPIRATION_KINDS.map((k) => ({
                  value: k,
                  label: t(kindKey(k)),
                })),
              ]}
            />
            <FilterRow
              label={t('renewals.filter.severity_label')}
              value={severityFilter}
              onChange={(v) => setSeverityFilter(v as SeverityFilter)}
              options={[
                { value: 'all', label: t('common.all') },
                ...SEVERITIES.map((s) => ({
                  value: s,
                  label: t(severityKey(s)),
                })),
              ]}
            />
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={
              statusFilter === 'all'
                ? 'rounded-md bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-300'
                : 'rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-800'
            }
          >
            {t('renewals.filter.show_all_statuses')}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {t('renewals.empty')}
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/70">
            {filtered.map((period) => {
              const Icon = KIND_ICONS[period.kind]
              const status = effectiveStatus(store.alerts[period.key])
              return (
                <li
                  key={period.key}
                  className="group flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-slate-800/40"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/assets/${period.assetId}`}
                        className="text-sm font-medium text-slate-100 hover:text-brand-300"
                      >
                        {period.assetName}
                      </Link>
                      <span className="font-mono text-xs text-slate-500">
                        {period.assetTag}
                      </span>
                      <SeverityBadge severity={period.severity} />
                      {status !== 'open' && (
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500">
                          {t(`renewals.status.${status}`)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {t(kindKey(period.kind))} · {period.label}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-100">
                      {daysLabel(period.daysUntil, t)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t('renewals.ends_on', {
                        date: formatDate(period.endsAt),
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {period.kind !== 'depreciation_eol' &&
                      period.kind !== 'recurring_check' && (
                        <ActionButton
                          onClick={() => openDialog(period, 'renew')}
                        >
                          {t('renewals.action.renew')}
                        </ActionButton>
                      )}
                    <ActionButton onClick={() => openDialog(period, 'task')}>
                      {t('renewals.action.task')}
                    </ActionButton>
                    <ActionButton onClick={() => openDialog(period, 'snooze')}>
                      {t('renewals.action.snooze')}
                    </ActionButton>
                    <ActionButton
                      onClick={() => openDialog(period, 'acknowledge')}
                    >
                      {t('renewals.action.ack')}
                    </ActionButton>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <PeriodActionDialog
        period={dialogPeriod}
        action={dialogAction}
        onClose={closeDialog}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  active,
  onClick,
}: {
  label: string
  value: number
  icon: typeof Clock
  tone: 'brand' | 'amber' | 'sky' | 'emerald'
  active: boolean
  onClick: () => void
}) {
  const toneClasses = {
    brand: 'bg-gradient-to-br from-brand-50 to-brand-100/60 text-brand-300 ring-brand-400/30',
    amber: 'bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-300 ring-amber-100',
    sky: 'bg-gradient-to-br from-sky-50 to-sky-100/60 text-sky-300 ring-sky-100',
    emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-300 ring-emerald-100',
  }[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'group flex items-start justify-between rounded-xl border border-brand-500 bg-slate-900 p-5 text-left shadow-elevated ring-2 ring-brand-500/15 transition-all'
          : 'group flex items-start justify-between rounded-xl border border-slate-800/70 bg-slate-900 p-5 text-left shadow-elevated transition-all hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-lift'
      }
    >
      <div>
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-[28px] font-semibold tracking-tight text-slate-100 tabular-nums">
          <AnimatedNumberSpan value={value} />
        </p>
      </div>
      <div className={`rounded-lg p-2 ring-1 ring-inset transition-transform group-hover:scale-110 ${toneClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
    </button>
  )
}

function AnimatedNumberSpan({ value }: { value: number }) {
  return <AnimatedNumber value={value} />
}

function ActionButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-slate-800/70 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 transition-all hover:-translate-y-px hover:border-slate-700 hover:bg-slate-900/50 hover:shadow-sm active:translate-y-0"
    >
      {children}
    </button>
  )
}

function FilterRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-medium text-slate-500">{label}:</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={
            value === o.value
              ? 'rounded-md bg-brand-400/10 px-2.5 py-1 text-xs font-medium text-brand-300'
              : 'rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-800'
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
