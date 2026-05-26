import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useAssetStore } from './useAssetStore'
import type { RecurringCheck, RecurringCheckKind } from './types'

const KINDS: RecurringCheckKind[] = [
  'inventory_audit',
  'preventive_maintenance',
  'license_renewal',
  'compliance_review',
  'other',
]

type FormState = {
  kind: RecurringCheckKind
  label: string
  intervalMonths: number
  nextDueAt: string
  responsibleRole: string
}

function defaultState(): FormState {
  const next = new Date()
  next.setMonth(next.getMonth() + 12)
  return {
    kind: 'inventory_audit',
    label: '',
    intervalMonths: 12,
    nextDueAt: next.toISOString().slice(0, 10),
    responsibleRole: '',
  }
}

export function RecurringCheckDialog({
  assetId,
  check,
  onClose,
}: {
  assetId: string
  check?: RecurringCheck
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useAssetStore()
  const editing = !!check
  const [form, setForm] = useState<FormState>(() =>
    check
      ? {
          kind: check.kind,
          label: check.label,
          intervalMonths: check.intervalMonths,
          nextDueAt: check.nextDueAt,
          responsibleRole: check.responsibleRole ?? '',
        }
      : defaultState(),
  )
  const [error, setError] = useState('')

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    if (!form.label.trim()) {
      setError(t('asset_form.validation.required'))
      return
    }
    const payload = {
      kind: form.kind,
      label: form.label.trim(),
      intervalMonths: Math.max(1, form.intervalMonths),
      nextDueAt: form.nextDueAt,
      responsibleRole: form.responsibleRole.trim() || undefined,
      lastCompletedAt: check?.lastCompletedAt,
    }
    if (editing && check) {
      store.updateCheck(assetId, check.id, payload)
    } else {
      store.addCheck(assetId, payload)
    }
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={editing ? t('check_form.edit_title') : t('check_form.add_title')}
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
          <label className="text-xs font-medium text-slate-700">
            {t('check_form.field.kind')}
          </label>
          <select
            value={form.kind}
            onChange={(e) => set('kind', e.target.value as RecurringCheckKind)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`recurring_check_kind.${k}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-700">
            {t('check_form.field.label')}
          </label>
          <input
            type="text"
            value={form.label}
            onChange={(e) => set('label', e.target.value)}
            placeholder={t('check_form.field.label_placeholder')}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
          {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700">
              {t('check_form.field.interval_months')}
            </label>
            <input
              type="number"
              min={1}
              value={form.intervalMonths}
              onChange={(e) => set('intervalMonths', Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700">
              {t('check_form.field.next_due_at')}
            </label>
            <input
              type="date"
              value={form.nextDueAt}
              onChange={(e) => set('nextDueAt', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-700">
            {t('check_form.field.responsible_role')}
          </label>
          <input
            type="text"
            value={form.responsibleRole}
            onChange={(e) => set('responsibleRole', e.target.value)}
            placeholder={t('check_form.field.responsible_placeholder')}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  )
}

export function RecurringCheckDeleteDialog({
  assetId,
  check,
  onClose,
}: {
  assetId: string
  check: RecurringCheck
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useAssetStore()
  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('check_form.delete_title')}
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
              store.deleteCheck(assetId, check.id)
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
        <p>{t('check_form.delete_warning', { label: check.label })}</p>
      </div>
    </Modal>
  )
}
