import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  X,
  Clock,
  ShoppingCart,
  Trash2,
  KeyRound,
  FileText,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useApprovalsStore } from '@/features/approvals/useApprovalsStore'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { useAuth } from '@/lib/auth'
import { formatDateTime } from '@/features/assets/finance'
import { cn } from '@/lib/cn'
import type {
  ApprovalKind,
  ApprovalRequest,
  ApprovalStatus,
} from '@/features/approvals/types'

type Filter = 'pending' | 'decided' | 'all'
const FILTERS: Filter[] = ['pending', 'decided', 'all']

const KIND_ICONS: Record<ApprovalKind, typeof ShoppingCart> = {
  order: ShoppingCart,
  dispose: Trash2,
  license_increase: KeyRound,
  other: FileText,
}

const STATUS_BADGE: Record<ApprovalStatus, string> = {
  pending: 'bg-amber-950/40 text-amber-300 ring-amber-600/20',
  approved: 'bg-emerald-950/40 text-emerald-300 ring-emerald-600/20',
  rejected: 'bg-rose-950/40 text-rose-300 ring-rose-600/20',
}

export function ApprovalsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const store = useApprovalsStore()
  const assetStore = useAssetStore()
  const [filter, setFilter] = useState<Filter>('pending')

  const visible = store.approvals.filter((a) => {
    if (filter === 'pending') return a.status === 'pending'
    if (filter === 'decided') return a.status !== 'pending'
    return true
  })

  function approve(req: ApprovalRequest) {
    store.approve(req.id, user?.name ?? 'Unknown')
    // For dispose/order approvals tied to an asset, apply the state change.
    if (req.assetId && req.proposedState) {
      assetStore.changeState(
        req.assetId,
        req.proposedState,
        `Godkendt: ${req.subject}`,
      )
    }
  }

  function reject(req: ApprovalRequest) {
    store.reject(req.id, user?.name ?? 'Unknown')
  }

  return (
    <div>
      <PageHeader
        title={t('approvals_page.title')}
        description={t('approvals_page.description')}
      />

      <div className="overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900 shadow-elevated">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 p-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? 'rounded-md bg-brand-400/10 px-3 py-1 text-xs font-medium text-brand-300'
                  : 'rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-800'
              }
            >
              {t(`approvals_page.filter.${f}`)}
              {f === 'pending' && store.pending.length > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 tabular-nums">
                  {store.pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {t('approvals_page.empty')}
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/70">
            {visible.map((req) => {
              const Icon = KIND_ICONS[req.kind]
              return (
                <li key={req.id} className="flex flex-wrap items-center gap-4 p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-100">
                        {req.subject}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
                          STATUS_BADGE[req.status],
                        )}
                      >
                        {t(`approvals_page.status.${req.status}`)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {t(`approvals_page.kind.${req.kind}`)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {t('approvals_page.requested_by', {
                        name: req.requestedBy,
                      })}{' '}
                      ·{' '}
                      <Clock className="inline h-3 w-3" />{' '}
                      <span className="tabular-nums">
                        {formatDateTime(req.requestedAt)}
                      </span>
                      {req.assetId && req.assetName && (
                        <>
                          {' · '}
                          <Link
                            to={`/assets/${req.assetId}`}
                            className="text-brand-300 hover:underline"
                          >
                            {req.assetName}
                          </Link>
                        </>
                      )}
                    </p>
                    {req.notes && (
                      <p className="mt-1 text-xs text-slate-500 italic">
                        {req.notes}
                      </p>
                    )}
                    {req.status !== 'pending' && req.approver && (
                      <p className="mt-1 text-[11px] text-slate-500">
                        {t('approvals_page.decided_by', {
                          name: req.approver,
                          date: formatDateTime(req.decidedAt ?? ''),
                        })}
                      </p>
                    )}
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => reject(req)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-950/40"
                      >
                        <X className="h-3.5 w-3.5" />
                        {t('approvals_page.reject')}
                      </button>
                      <button
                        type="button"
                        onClick={() => approve(req)}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {t('approvals_page.approve')}
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
