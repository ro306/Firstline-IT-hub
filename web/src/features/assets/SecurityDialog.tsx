import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useAssetStore } from './useAssetStore'
import {
  COMPLIANCE_STATUSES,
  PATCH_STATUSES,
  FRAMEWORK_OPTIONS,
  complianceStatusKey,
  patchStatusKey,
} from './security'
import { cn } from '@/lib/cn'
import type {
  Asset,
  ComplianceStatus,
  PatchStatus,
} from './types'

type FormState = {
  encrypted: boolean
  patchStatus: PatchStatus
  osName: string
  osVersion: string
  lastSeenAt: string
  complianceStatus: ComplianceStatus
  frameworks: string[]
  notes: string
}

function initialState(asset: Asset): FormState {
  const s = asset.security
  return {
    encrypted: s?.encrypted ?? false,
    patchStatus: s?.patchStatus ?? 'unknown',
    osName: s?.osName ?? '',
    osVersion: s?.osVersion ?? '',
    lastSeenAt: s?.lastSeenAt ?? '',
    complianceStatus: s?.complianceStatus ?? 'unknown',
    frameworks: s?.frameworks ?? [],
    notes: s?.notes ?? '',
  }
}

const inputCls =
  'mt-1 w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'

export function SecurityDialog({
  asset,
  onClose,
}: {
  asset: Asset
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = useAssetStore()
  const [form, setForm] = useState<FormState>(() => initialState(asset))

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleFramework(fw: string) {
    setForm((prev) => ({
      ...prev,
      frameworks: prev.frameworks.includes(fw)
        ? prev.frameworks.filter((f) => f !== fw)
        : [...prev.frameworks, fw],
    }))
  }

  function handleSubmit() {
    store.updateSecurity(asset.id, {
      encrypted: form.encrypted,
      patchStatus: form.patchStatus,
      osName: form.osName.trim() || undefined,
      osVersion: form.osVersion.trim() || undefined,
      lastSeenAt: form.lastSeenAt || undefined,
      complianceStatus: form.complianceStatus,
      frameworks: form.frameworks.length ? form.frameworks : undefined,
      notes: form.notes.trim() || undefined,
    })
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('security_form.title')}
      description={asset.name}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t('asset_form.save_submit')}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.encrypted}
            onChange={(e) => set('encrypted', e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500/30"
          />
          <span className="text-sm text-slate-300">
            {t('security_form.field.encrypted')}
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300">
              {t('security_form.field.patch_status')}
            </label>
            <select
              value={form.patchStatus}
              onChange={(e) => set('patchStatus', e.target.value as PatchStatus)}
              className={inputCls}
            >
              {PATCH_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(patchStatusKey(s))}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300">
              {t('security_form.field.compliance_status')}
            </label>
            <select
              value={form.complianceStatus}
              onChange={(e) =>
                set('complianceStatus', e.target.value as ComplianceStatus)
              }
              className={inputCls}
            >
              {COMPLIANCE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(complianceStatusKey(s))}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300">
              {t('security_form.field.os_name')}
            </label>
            <input
              type="text"
              value={form.osName}
              onChange={(e) => set('osName', e.target.value)}
              placeholder={t('security_form.field.os_name_placeholder')}
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300">
              {t('security_form.field.os_version')}
            </label>
            <input
              type="text"
              value={form.osVersion}
              onChange={(e) => set('osVersion', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300">
            {t('security_form.field.last_seen_at')}
          </label>
          <input
            type="date"
            value={form.lastSeenAt}
            onChange={(e) => set('lastSeenAt', e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300">
            {t('security_form.field.frameworks')}
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {FRAMEWORK_OPTIONS.map((fw) => {
              const active = form.frameworks.includes(fw)
              return (
                <button
                  key={fw}
                  type="button"
                  onClick={() => toggleFramework(fw)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors',
                    active
                      ? 'bg-brand-400/10 text-brand-300 ring-brand-400/30'
                      : 'bg-slate-900 text-slate-400 ring-slate-800 hover:bg-slate-800/50',
                  )}
                >
                  {fw}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300">
            {t('security_form.field.notes')}
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            className={inputCls}
          />
        </div>
      </div>
    </Modal>
  )
}
