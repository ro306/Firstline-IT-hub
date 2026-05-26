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
import { DEFAULT_WORKFLOW_RULES } from '@/features/lifecycle/mockRules'
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open')
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [dialogPeriod, setDialogPeriod] = useState<ExpirationPeriod | null>(
    null,
  )
  const [dialogAction, setDialogAction] = useState<ActionKind | null>(null)

  const periods = useMemo(
    () => computeExpirations(assets, DEFAULT_WORKFLOW_RULES),
    [assets],
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
            to="/workflows"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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

      <div className="mt-6 rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
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
                ? 'rounded-md bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700'
                : 'rounded-md px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100'
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
          <ul className="divide-y divide-slate-100">
            {filtered.map((period) => {
              const Icon = KIND_ICONS[period.kind]
              const status = effectiveStatus(store.alerts[period.key])
              return (
                <li
                  key={period.key}
                  className="flex flex-wrap items-center gap-4 p-4 hover:bg-slate-50/60"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/assets/${period.assetId}`}
                        className="text-sm font-medium text-slate-900 hover:text-brand-700"
                      >
                        {period.assetName}
                      </Link>
                      <span className="font-mono text-xs text-slate-400">
                        {period.assetTag}
                      </span>
                      <SeverityBadge severity={period.severity} />
                      {status !== 'open' && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {t(`renewals.status.${status}`)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {t(kindKey(period.kind))} · {period.label}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
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
    brand: 'bg-brand-50 text-brand-700',
    amber: 'bg-amber-50 text-amber-700',
    sky: 'bg-sky-50 text-sky-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  }[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'flex items-start justify-between rounded-lg border border-brand-500 bg-white p-5 text-left ring-2 ring-brand-500/20'
          : 'flex items-start justify-between rounded-lg border border-slate-200 bg-white p-5 text-left hover:border-slate-300'
      }
    >
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      </div>
      <div className={`rounded-md p-2 ${toneClasses}`}>
        <Icon className="h-5 w-5" />
      </div>
    </button>
  )
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
      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
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
              ? 'rounded-md bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700'
              : 'rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100'
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
