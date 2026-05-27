import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useAssetStore } from './useAssetStore'
import type { AssetWarranty, WarrantyKind } from './types'

const KINDS: WarrantyKind[] = [
  'manufacturer',
  'extended',
  'service_contract',
  'accidental_damage',
]

type FormState = {
  kind: WarrantyKind
  provider: string
  reference: string
  startsAt: string
  endsAt: string
  coverageNotes: string
}

function defaultState(): FormState {
  const today = new Date().toISOString().slice(0, 10)
  const yearOut = new Date()
  yearOut.setFullYear(yearOut.getFullYear() + 1)
  return {
    kind: 'manufacturer',
    provider: '',
    reference: '',
    startsAt: today,
    endsAt: yearOut.toISOString().slice(0, 10),
    coverageNotes: '',
  }
}

export function WarrantyDialog({
  assetId,
  warranty,
  onClose,
}: {
  assetId: string
  warranty?: AssetWarranty
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useAssetStore()
  const editing = !!warranty
  const [form, setForm] = useState<FormState>(() =>
    warranty
      ? {
          kind: warranty.kind,
          provider: warranty.provider,
          reference: warranty.reference ?? '',
          startsAt: warranty.startsAt,
          endsAt: warranty.endsAt,
          coverageNotes: warranty.coverageNotes ?? '',
        }
      : defaultState(),
  )
  const [error, setError] = useState('')

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    if (!form.provider.trim()) {
      setError(t('asset_form.validation.required'))
      return
    }
    const payload = {
      kind: form.kind,
      provider: form.provider.trim(),
      reference: form.reference.trim() || undefined,
      startsAt: form.startsAt,
      endsAt: form.endsAt,
      coverageNotes: form.coverageNotes.trim() || undefined,
    }
    if (editing && warranty) {
      store.updateWarranty(assetId, warranty.id, payload)
    } else {
      store.addWarranty(assetId, payload)
    }
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={
        editing ? t('warranty_form.edit_title') : t('warranty_form.add_title')
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
          <label className="text-xs font-medium text-slate-300">
            {t('warranty_form.field.kind')}
          </label>
          <select
            value={form.kind}
            onChange={(e) => set('kind', e.target.value as WarrantyKind)}
            className="mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`asset.warranties.kind.${k}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-300">
            {t('warranty_form.field.provider')}
          </label>
          <input
            type="text"
            value={form.provider}
            onChange={(e) => set('provider', e.target.value)}
            placeholder={t('warranty_form.field.provider_placeholder')}
            className="mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
          {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </div>
        <div>
          <label className="text-xs font-medium text-slate-300">
            {t('warranty_form.field.reference')}
          </label>
          <input
            type="text"
            value={form.reference}
            onChange={(e) => set('reference', e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300">
              {t('warranty_form.field.starts_at')}
            </label>
            <input
              type="date"
              value={form.startsAt}
              onChange={(e) => set('startsAt', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300">
              {t('warranty_form.field.ends_at')}
            </label>
            <input
              type="date"
              value={form.endsAt}
              onChange={(e) => set('endsAt', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-300">
            {t('warranty_form.field.coverage')}
          </label>
          <textarea
            value={form.coverageNotes}
            onChange={(e) => set('coverageNotes', e.target.value)}
            rows={2}
            placeholder={t('warranty_form.field.coverage_placeholder')}
            className="mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  )
}

export function WarrantyDeleteDialog({
  assetId,
  warranty,
  onClose,
}: {
  assetId: string
  warranty: AssetWarranty
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useAssetStore()
  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('warranty_form.delete_title')}
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
              store.deleteWarranty(assetId, warranty.id)
              onClose()
            }}
            className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            {t('common.delete')}
          </button>
        </>
      }
    >
      <div className="flex gap-3 rounded-md border border-rose-200 bg-rose-950/40 p-3 text-sm text-rose-800">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <p>
          {t('warranty_form.delete_warning', { provider: warranty.provider })}
        </p>
      </div>
    </Modal>
  )
}
