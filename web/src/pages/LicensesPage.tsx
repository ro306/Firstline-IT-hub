import { useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle, KeyRound } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useLicensesStore } from '@/features/licenses/useLicensesStore'
import { formatDate, formatMoney } from '@/features/assets/finance'
import { cn } from '@/lib/cn'
import type { License, LicenseKind } from '@/features/licenses/types'

const KINDS: LicenseKind[] = [
  'subscription',
  'perpetual',
  'cloud',
  'open_source',
  'other',
]
const CURRENCIES: Array<'DKK' | 'EUR' | 'USD'> = ['DKK', 'EUR', 'USD']

export function LicensesPage() {
  const { t } = useTranslation()
  const store = useLicensesStore()
  const [editing, setEditing] = useState<License | undefined>(undefined)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<License | null>(null)

  const totalSeats = store.licenses.reduce((s, l) => s + l.seatsTotal, 0)
  const usedSeats = store.licenses.reduce((s, l) => s + l.seatsUsed, 0)
  const freeSeats = totalSeats - usedSeats
  const annualCost = store.licenses.reduce(
    (sum, l) => sum + (l.costPerSeatPerYear ?? 0) * l.seatsTotal,
    0,
  )

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
        <Stat label={t('licenses_page.stat.seats_used')} value={usedSeats} />
        <Stat label={t('licenses_page.stat.seats_free')} value={freeSeats} />
        <Stat
          label={t('licenses_page.stat.annual_cost')}
          value={formatMoney({ amount: annualCost, currency: 'DKK' })}
        />
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white">
        {store.licenses.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {t('licenses_page.empty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">{t('licenses_page.table.name')}</th>
                  <th className="px-4 py-3">{t('licenses_page.table.kind')}</th>
                  <th className="px-4 py-3">{t('licenses_page.table.seats')}</th>
                  <th className="px-4 py-3">{t('licenses_page.table.cost')}</th>
                  <th className="px-4 py-3">{t('licenses_page.table.renews')}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {store.licenses.map((lic) => {
                  const pct = lic.seatsTotal
                    ? Math.round((lic.seatsUsed / lic.seatsTotal) * 100)
                    : 0
                  const overuse = lic.seatsUsed > lic.seatsTotal
                  return (
                    <tr key={lic.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                            <KeyRound className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {lic.name}
                            </p>
                            <p className="text-xs text-slate-500">{lic.vendor}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {t(`licenses_page.kind.${lic.kind}`)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={cn(
                              'text-xs',
                              overuse ? 'font-medium text-rose-700' : 'text-slate-700',
                            )}
                          >
                            {t('licenses_page.seats_label', {
                              used: lic.seatsUsed,
                              total: lic.seatsTotal,
                            })}
                          </span>
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
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
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {lic.costPerSeatPerYear
                          ? formatMoney({
                              amount:
                                lic.costPerSeatPerYear * lic.seatsTotal,
                              currency: lic.currency,
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {lic.renewsAt ? formatDate(lic.renewsAt) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditing(lic)}
                            aria-label={t('asset_actions.edit')}
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(lic)}
                            aria-label={t('asset_actions.delete')}
                            className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
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
}: {
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
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

  function handleSubmit() {
    if (!form.name.trim() || !form.vendor.trim()) {
      setError(t('asset_form.validation.required'))
      return
    }
    const payload = {
      name: form.name.trim(),
      vendor: form.vendor.trim(),
      kind: form.kind,
      seatsTotal: Math.max(0, form.seatsTotal),
      seatsUsed: Math.max(0, form.seatsUsed),
      costPerSeatPerYear: form.costPerSeatPerYear || undefined,
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
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label>{t('licenses_page.form.field.cost_per_seat')}</Label>
            <input
              type="number"
              min={0}
              value={form.costPerSeatPerYear}
              onChange={(e) =>
                setForm({
                  ...form,
                  costPerSeatPerYear: Number(e.target.value),
                })
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
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
      <div className="flex gap-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>
          {t('licenses_page.form.delete_warning', { name: license.name })}
        </p>
      </div>
    </Modal>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-slate-700">{children}</label>
}

const inputCls =
  'mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'
