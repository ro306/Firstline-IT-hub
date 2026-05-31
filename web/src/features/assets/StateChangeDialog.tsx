import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useAssetStore } from './useAssetStore'
import { useApprovalsStore } from '@/features/approvals/useApprovalsStore'
import { useAuth } from '@/lib/auth'
import { ALLOWED_TRANSITIONS, lifecycleStateKey } from './lifecycle'
import { StatusBadge } from './StatusBadge'
import type { Asset, AssetLifecycleState } from './types'

// Transitions requiring sign-off from a second person before the state is
// applied. Disposal is the canonical risky / irreversible action.
const APPROVAL_REQUIRED: AssetLifecycleState[] = [
  'disposed',
  'returned_to_vendor',
]

export function StateChangeDialog({
  asset,
  onClose,
}: {
  asset: Asset
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const store = useAssetStore()
  const approvals = useApprovalsStore()
  const [next, setNext] = useState<AssetLifecycleState | ''>('')
  const [notes, setNotes] = useState('')

  const allowed = ALLOWED_TRANSITIONS[asset.lifecycleState]
  const needsApproval =
    next !== '' && APPROVAL_REQUIRED.includes(next as AssetLifecycleState)

  function handleConfirm() {
    if (!next) return
    if (needsApproval) {
      approvals.createApproval({
        kind: next === 'disposed' ? 'dispose' : 'other',
        subject:
          notes ||
          t('state_change.approval_default_subject', {
            asset: asset.name,
            state: t(lifecycleStateKey(next as AssetLifecycleState)),
          }),
        assetId: asset.id,
        assetName: asset.name,
        proposedState: next as AssetLifecycleState,
        requestedBy: user?.name ?? 'Unknown',
      })
    } else {
      store.changeState(asset.id, next, notes || undefined)
    }
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={t('state_change.title')}
      description={asset.name}
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
            onClick={handleConfirm}
            disabled={!next}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:bg-slate-300"
          >
            {needsApproval
              ? t('state_change.request_approval')
              : t('common.confirm')}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-300">
            {t('state_change.current')}
          </p>
          <div className="mt-1">
            <StatusBadge state={asset.lifecycleState} />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-300">
            {t('state_change.next')}
          </p>
          {allowed.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              {t('state_change.no_transitions')}
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {allowed.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNext(s)}
                  className={
                    next === s
                      ? 'rounded-md border-2 border-brand-500 bg-brand-400/10 px-3 py-2 text-left text-sm font-medium text-brand-300'
                      : 'rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-900/50'
                  }
                >
                  {t(lifecycleStateKey(s))}
                </button>
              ))}
            </div>
          )}
        </div>

        {needsApproval && (
          <div className="flex gap-3 rounded-md border border-amber-500/30 bg-amber-950/40 p-3 text-sm text-amber-300">
            <ShieldAlert className="h-5 w-5 flex-shrink-0" />
            <p>{t('state_change.approval_required')}</p>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-300">
            {t('dialog.notes_label')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={t('state_change.notes_placeholder')}
            className="mt-1 w-full rounded-md border border-slate-800 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
        </div>
      </div>
    </Modal>
  )
}
