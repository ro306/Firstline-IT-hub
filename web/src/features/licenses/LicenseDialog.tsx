import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useLicensesStore } from './useLicensesStore'
import type {
  BillingModel,
  License,
  LicenseKind,
  ServiceType,
} from './types'

const KINDS: LicenseKind[] = [
  'subscription',
  'perpetual',
  'cloud',
  'open_source',
  'other',
]
const CURRENCIES: Array<'DKK' | 'EUR' | 'USD'> = ['DKK', 'EUR', 'USD']

const inputCls =
  'mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium text-slate-300">{children}</label>
  )
}

export function LicenseDialog({
  license,
  onClose,
  onSaved,
}: {
  license?: License
  onClose: () => void
  onSaved?: (license: License) => void
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
      billingModel: isFlat
        ? ('flat_monthly' as BillingModel)
        : ('per_seat' as BillingModel),
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
    let saved: License
    if (editing && license) {
      store.updateLicense(license.id, payload)
      saved = { ...license, ...payload }
    } else {
      saved = store.createLicense(payload)
    }
    onSaved?.(saved)
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
              onChange={(e) =>
                setForm({ ...form, acquiredAt: e.target.value })
              }
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

export function DeleteLicenseDialog({
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

// `createLicense` should return the newly created license so callers can hook
// into the saved id (e.g. PackageDialog auto-selects it after creating).
