import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle, KeyRound, Cloud } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useLicensesStore } from '@/features/licenses/useLicensesStore'
import {
  licenseCompliance,
  licenseComplianceKey,
  LICENSE_COMPLIANCE_BADGE,
} from '@/features/licenses/sam'
import { formatDate, formatMoney } from '@/features/assets/finance'
import { cn } from '@/lib/cn'
import type {
  BillingModel,
  License,
  LicenseKind,
  ServiceType,
} from '@/features/licenses/types'

const KINDS: LicenseKind[] = [
  'subscription',
  'perpetual',
  'cloud',
  'open_source',
  'other',
]
const CURRENCIES: Array<'DKK' | 'EUR' | 'USD'> = ['DKK', 'EUR', 'USD']

type ServiceFilter = 'all' | 'license' | 'cloud_service'
const SERVICE_FILTERS: ServiceFilter[] = ['all', 'license', 'cloud_service']

// Annual cost for a license/cloud row: flat monthly ×12, else per-seat × seats.
function annualCostOf(l: License): number {
  if (l.billingModel === 'flat_monthly') return (l.monthlyCost ?? 0) * 12
  return (l.costPerSeatPerYear ?? 0) * l.seatsTotal
}

export function LicensesPage() {
  const { t } = useTranslation()
  const store = useLicensesStore()
  const [editing, setEditing] = useState<License | undefined>(undefined)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<License | null>(null)
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all')

  const visible = useMemo(
    () =>
      store.licenses.filter(
        (l) => serviceFilter === 'all' || l.serviceType === serviceFilter,
      ),
    [store.licenses, serviceFilter],
  )

  // SAM compliance only applies to seat-based licenses, not flat cloud.
  const seatLicenses = store.licenses.filter(
    (l) => l.serviceType === 'license',
  )
  const overLicensed = seatLicenses.filter(
    (l) => licenseCompliance(l) === 'over',
  ).length
  const nearLimit = seatLicenses.filter(
    (l) => licenseCompliance(l) === 'warning',
  ).length
  const annualCost = store.licenses.reduce((sum, l) => sum + annualCostOf(l), 0)

  return (
    <div>
      <PageHeader
        title={t('licenses_page.title')}
        description={t('licenses_page.description')}
        actions={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            {t('licenses_page.new')}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label={t('licenses_page.stat.total')} value={store.licenses.length} />
        <Stat
          label={t('licenses_page.stat.over_licensed')}
          value={overLicensed}
          tone={overLicensed > 0 ? 'rose' : 'neutral'}
        />
        <Stat
          label={t('licenses_page.stat.near_limit')}
          value={nearLimit}
          tone={nearLimit > 0 ? 'amber' : 'neutral'}
        />
        <Stat
          label={t('licenses_page.stat.annual_cost')}
          value={formatMoney({ amount: annualCost, currency: 'DKK' })}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900 shadow-elevated">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 p-4">
          {SERVICE_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setServiceFilter(f)}
              className={
                serviceFilter === f
                  ? 'rounded-md bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-300'
                  : 'rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-800'
              }
            >
              {t(`licenses_page.filter.${f}`)}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {t('licenses_page.empty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/40 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">{t('licenses_page.table.name')}</th>
                  <th className="px-4 py-3">{t('licenses_page.table.kind')}</th>
                  <th className="px-4 py-3">{t('licenses_page.table.seats')}</th>
                  <th className="px-4 py-3">
                    {t('licenses_page.table.compliance')}
                  </th>
                  <th className="px-4 py-3">{t('licenses_page.table.cost')}</th>
                  <th className="px-4 py-3">{t('licenses_page.table.renews')}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {visible.map((lic) => {
                  const isCloud = lic.serviceType === 'cloud_service'
                  const pct = lic.seatsTotal
                    ? Math.round((lic.seatsUsed / lic.seatsTotal) * 100)
                    : 0
                  const overuse = lic.seatsUsed > lic.seatsTotal
                  const compliance = licenseCompliance(lic)
                  return (
                    <tr key={lic.id} className="group transition-colors hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800 text-slate-500">
                            {isCloud ? (
                              <Cloud className="h-4 w-4" />
                            ) : (
                              <KeyRound className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-100">
                              {lic.name}
                            </p>
                            <p className="text-xs text-slate-500">{lic.vendor}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {t(`licenses_page.kind.${lic.kind}`)}
                      </td>
                      <td className="px-4 py-3">
                        {isCloud ? (
                          <span className="text-xs text-slate-600">
                            {t('licenses_page.not_applicable')}
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span
                              className={cn(
                                'text-xs',
                                overuse
                                  ? 'font-medium text-rose-300'
                                  : 'text-slate-300',
                              )}
                            >
                              {t('licenses_page.seats_label', {
                                used: lic.seatsUsed,
                                total: lic.seatsTotal,
                              })}
                            </span>
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  overuse
                                    ? 'bg-rose-500'
                                    : pct > 85
                                      ? 'bg-amber-500'
                                      : 'bg-brand-500',
                                )}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isCloud ? (
                          <span className="text-xs text-slate-600">—</span>
                        ) : (
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
                              LICENSE_COMPLIANCE_BADGE[compliance],
                            )}
                          >
                            {t(licenseComplianceKey(compliance))}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {isCloud
                          ? `${formatMoney({ amount: lic.monthlyCost ?? 0, currency: lic.currency })}${t('licenses_page.per_month_suffix')}`
                          : lic.costPerSeatPerYear
                            ? formatMoney({
                                amount: lic.costPerSeatPerYear * lic.seatsTotal,
                                currency: lic.currency,
                              })
                            : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {lic.renewsAt ? formatDate(lic.renewsAt) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditing(lic)}
                            aria-label={t('asset_actions.edit')}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(lic)}
                            aria-label={t('asset_actions.delete')}
                            className="rounded-md p-1.5 text-rose-500 hover:bg-rose-950/40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && <LicenseDialog onClose={() => setCreating(false)} />}
      {editing && (
        <LicenseDialog license={editing} onClose={() => setEditing(undefined)} />
      )}
      {deleting && (
        <DeleteLicenseDialog
          license={deleting}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
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
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueClass}`}>{value}</p>
    </div>
  )
}

function LicenseDialog({
  license,
  onClose,
}: {
  license?: License
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useLicensesStore()
  const editing = !!license
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    name: license?.name ?? '',
    vendor: license?.vendor ?? '',
    kind: license?.kind ?? ('subscription' as LicenseKind),
    serviceType: license?.serviceType ?? ('license' as ServiceType),
    billingModel: license?.billingModel ?? ('per_seat' as BillingModel),
    monthlyCost: license?.monthlyCost ?? 0,
    seatsTotal: license?.seatsTotal ?? 10,
    seatsUsed: license?.seatsUsed ?? 0,
    costPerSeatPerYear: license?.costPerSeatPerYear ?? 0,
    currency: license?.currency ?? ('DKK' as 'DKK' | 'EUR' | 'USD'),
    owner: license?.owner ?? '',
    acquiredAt: license?.acquiredAt ?? today,
    renewsAt: license?.renewsAt ?? '',
    notes: license?.notes ?? '',
  })
  const [error, setError] = useState('')
  const isCloud = form.serviceType === 'cloud_service'
  const isFlat = isCloud || form.billingModel === 'flat_monthly'

  function handleSubmit() {
    if (!form.name.trim() || !form.vendor.trim()) {
      setError(t('asset_form.validation.required'))
      return
    }
    const payload = {
      name: form.name.trim(),
      vendor: form.vendor.trim(),
      kind: form.kind,
      serviceType: form.serviceType,
      billingModel: isFlat ? ('flat_monthly' as BillingModel) : ('per_seat' as BillingModel),
      monthlyCost: isFlat ? Math.max(0, form.monthlyCost) : undefined,
      seatsTotal: isCloud ? 0 : Math.max(0, form.seatsTotal),
      seatsUsed: isCloud ? 0 : Math.max(0, form.seatsUsed),
      costPerSeatPerYear: !isFlat ? form.costPerSeatPerYear || undefined : undefined,
      currency: form.currency,
      owner: form.owner.trim() || undefined,
      acquiredAt: form.acquiredAt,
      renewsAt: form.renewsAt || undefined,
      notes: form.notes.trim() || undefined,
    }
    if (editing && license) {
      store.updateLicense(license.id, payload)
    } else {
      store.createLicense(payload)
    }
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={
        editing
          ? t('licenses_page.form.edit_title')
          : t('licenses_page.form.create_title')
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {editing ? t('asset_form.save_submit') : t('common.confirm')}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <Label>{t('licenses_page.form.field.service_type')}</Label>
          <select
            value={form.serviceType}
            onChange={(e) =>
              setForm({ ...form, serviceType: e.target.value as ServiceType })
            }
            className={inputCls}
          >
            <option value="license">
              {t('licenses_page.service_type.license')}
            </option>
            <option value="cloud_service">
              {t('licenses_page.service_type.cloud_service')}
            </option>
          </select>
        </div>
        <div>
          <Label>{t('licenses_page.form.field.name')}</Label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t('licenses_page.form.field.name_placeholder')}
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('licenses_page.form.field.vendor')}</Label>
            <input
              type="text"
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              placeholder={t('licenses_page.form.field.vendor_placeholder')}
              className={inputCls}
            />
          </div>
          <div>
            <Label>{t('licenses_page.form.field.kind')}</Label>
            <select
              value={form.kind}
              onChange={(e) =>
                setForm({ ...form, kind: e.target.value as LicenseKind })
              }
              className={inputCls}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(`licenses_page.kind.${k}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!isCloud && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('licenses_page.form.field.seats_total')}</Label>
              <input
                type="number"
                min={0}
                value={form.seatsTotal}
                onChange={(e) =>
                  setForm({ ...form, seatsTotal: Number(e.target.value) })
                }
                className={inputCls}
              />
            </div>
            <div>
              <Label>{t('licenses_page.form.field.seats_used')}</Label>
              <input
                type="number"
                min={0}
                value={form.seatsUsed}
                onChange={(e) =>
                  setForm({ ...form, seatsUsed: Number(e.target.value) })
                }
                className={inputCls}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label>
              {isFlat
                ? t('licenses_page.form.field.monthly_cost')
                : t('licenses_page.form.field.cost_per_seat')}
            </Label>
            <input
              type="number"
              min={0}
              value={isFlat ? form.monthlyCost : form.costPerSeatPerYear}
              onChange={(e) =>
                setForm(
                  isFlat
                    ? { ...form, monthlyCost: Number(e.target.value) }
                    : { ...form, costPerSeatPerYear: Number(e.target.value) },
                )
              }
              className={inputCls}
            />
          </div>
          <div>
            <Label>{t('licenses_page.form.field.currency')}</Label>
            <select
              value={form.currency}
              onChange={(e) =>
                setForm({
                  ...form,
                  currency: e.target.value as 'DKK' | 'EUR' | 'USD',
                })
              }
              className={inputCls}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label>{t('licenses_page.form.field.owner')}</Label>
          <input
            type="text"
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
            placeholder={t('licenses_page.form.field.owner_placeholder')}
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>{t('licenses_page.form.field.acquired_at')}</Label>
            <input
              type="date"
              value={form.acquiredAt}
              onChange={(e) => setForm({ ...form, acquiredAt: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <Label>{t('licenses_page.form.field.renews_at')}</Label>
            <input
              type="date"
              value={form.renewsAt}
              onChange={(e) => setForm({ ...form, renewsAt: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <Label>{t('licenses_page.form.field.notes')}</Label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    </Modal>
  )
}

function DeleteLicenseDialog({
  license,
  onClose,
}: {
  license: License
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useLicensesStore()
  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('licenses_page.form.delete_title')}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              store.deleteLicense(license.id)
              onClose()
            }}
            className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            {t('common.delete')}
          </button>
        </>
      }
    >
      <div className="flex gap-3 rounded-md border border-rose-500/30 bg-rose-950/40 p-3 text-sm text-rose-300">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>
          {t('licenses_page.form.delete_warning', { name: license.name })}
        </p>
      </div>
    </Modal>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-slate-300">{children}</label>
}

const inputCls =
  'mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'
