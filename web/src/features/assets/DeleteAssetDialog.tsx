import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useAssetStore } from './useAssetStore'
import type { Asset } from './types'

export function DeleteAssetDialog({
  asset,
  onClose,
  onDeleted,
}: {
  asset: Asset
  onClose: () => void
  onDeleted?: () => void
}) {
  const { t } = useTranslation()
  const store = useAssetStore()
  const [tagInput, setTagInput] = useState('')

  const canDelete = tagInput.trim() === asset.assetTag

  function handleDelete() {
    if (!canDelete) return
    store.deleteAsset(asset.id)
    onDeleted?.()
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('delete_asset.title')}
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
            onClick={handleDelete}
            disabled={!canDelete}
            className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:bg-slate-300"
          >
            {t('delete_asset.confirm')}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-3 rounded-md border border-rose-200 bg-rose-950/40 p-3 text-sm text-rose-800">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p>{t('delete_asset.warning', { name: asset.name })}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-300">
            {t('delete_asset.confirm_label', { tag: asset.assetTag })}
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm font-mono focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  )
}
