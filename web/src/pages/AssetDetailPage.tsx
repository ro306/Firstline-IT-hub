import { useState, useRef, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  UserPlus,
  UserMinus,
  FileText,
  ShieldCheck,
  Lock,
  LockOpen,
} from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/features/assets/StatusBadge'
import { LifecycleStepper } from '@/features/assets/LifecycleStepper'
import { LifecycleTimeline } from '@/features/assets/LifecycleTimeline'
import { WarrantyList } from '@/features/assets/WarrantyList'
import { RecurringCheckList } from '@/features/assets/RecurringCheckList'
import { AssignmentHistory } from '@/features/assets/AssignmentHistory'
import {
  DepreciationCard,
  PurchaseCard,
  LeaseCard,
  DisposalCard,
} from '@/features/assets/FinanceCards'
import { AssetFormDialog } from '@/features/assets/AssetFormDialog'
import { StateChangeDialog } from '@/features/assets/StateChangeDialog'
import { DeleteAssetDialog } from '@/features/assets/DeleteAssetDialog'
import {
  WarrantyDialog,
  WarrantyDeleteDialog,
} from '@/features/assets/WarrantyDialog'
import {
  RecurringCheckDialog,
  RecurringCheckDeleteDialog,
} from '@/features/assets/RecurringCheckDialog'
import {
  AssignmentDialog,
  ReturnAssignmentDialog,
  NoteDialog,
} from '@/features/assets/AssignmentDialog'
import { SecurityDialog } from '@/features/assets/SecurityDialog'
import { ComplianceBadge, PatchBadge } from '@/features/assets/ComplianceBadge'
import { deriveComplianceStatus } from '@/features/assets/security'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { AssetUpcomingPanel } from '@/features/lifecycle/AssetUpcomingPanel'
import { formatDate } from '@/features/assets/finance'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { cn } from '@/lib/cn'
import type {
  AssetWarranty,
  RecurringCheck,
} from '@/features/assets/types'

type Tab = 'overview' | 'history' | 'warranties' | 'finance'

const TABS: Tab[] = ['overview', 'history', 'warranties', 'finance']

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-800/70 py-3 last:border-0 sm:flex-row sm:items-center sm:gap-6">
      <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase sm:w-40">
        {label}
      </dt>
      <dd className="text-sm text-slate-100">{value}</dd>
    </div>
  )
}

export function AssetDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const store = useAssetStore()
  const getAsset = store.getAsset
  const [tab, setTab] = useState<Tab>('overview')
  const [editing, setEditing] = useState(false)
  const [changingState, setChangingState] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [addingWarranty, setAddingWarranty] = useState(false)
  const [editingWarranty, setEditingWarranty] = useState<AssetWarranty | null>(
    null,
  )
  const [deletingWarranty, setDeletingWarranty] = useState<AssetWarranty | null>(
    null,
  )
  const [addingCheck, setAddingCheck] = useState(false)
  const [editingCheck, setEditingCheck] = useState<RecurringCheck | null>(null)
  const [deletingCheck, setDeletingCheck] = useState<RecurringCheck | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [returningAssignment, setReturningAssignment] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  const [editingSecurity, setEditingSecurity] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const asset = id ? getAsset(id) : undefined

  useEffect(() => {
    if (!menuOpen) return
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  if (!asset) {
    return (
      <div>
        <Link
          to="/assets"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('asset.back_to_assets')}
        </Link>
        <div className="mt-6 rounded-xl border border-slate-800/70 bg-slate-900 p-10 shadow-elevated text-center">
          <h2 className="text-lg font-semibold text-slate-100">
            {t('asset.not_found_title')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('asset.not_found_description', { id: id ?? '' })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/assets"
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('asset.back_to_assets')}
      </Link>
      <PageHeader
        title={asset.name}
        description={t('asset.header_subtitle', {
          tag: asset.assetTag,
          serial: asset.serialNumber,
        })}
        actions={
          <>
            <StatusBadge state={asset.lifecycleState} />
            <button
              type="button"
              onClick={() => setChangingState(true)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
            >
              {t('asset.change_state')}
            </button>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-md border border-slate-800 bg-slate-900 p-2 text-slate-500 hover:bg-slate-900/50"
                aria-label={t('asset.more_actions')}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-md border border-slate-800 bg-slate-900 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      setEditing(true)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-900/50"
                  >
                    <Pencil className="h-4 w-4" />
                    {t('asset_actions.edit')}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      setDeleting(true)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('asset_actions.delete')}
                  </button>
                </div>
              )}
            </div>
          </>
        }
      />

      <div className="mb-6 rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
        <h3 className="mb-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {t('asset.section_lifecycle')}
        </h3>
        <LifecycleStepper state={asset.lifecycleState} />
      </div>

      <div className="mb-4 flex gap-1 border-b border-slate-800">
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === id
                ? 'border-brand-600 text-brand-300'
                : 'border-transparent text-slate-500 hover:text-slate-300',
            )}
          >
            {t(`asset.tab.${id}`)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="mb-6">
            <AssetUpcomingPanel asset={asset} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated lg:col-span-2">
              <h3 className="text-sm font-semibold text-slate-100">
                {t('asset.details.title')}
              </h3>
              <dl className="mt-2">
                <DetailRow
                  label={t('asset.details.category')}
                  value={t(`asset.category.${asset.category}`)}
                />
                <DetailRow
                  label={t('asset.details.location')}
                  value={asset.location}
                />
                <DetailRow
                  label={t('asset.details.ownership')}
                  value={
                    asset.ownership === 'owned'
                      ? t('asset.ownership.owned')
                      : asset.ownership === 'leased_in'
                        ? t('asset.finance.lease_in')
                        : t('asset.finance.lease_out')
                  }
                />
                <DetailRow
                  label={t('asset.details.currently_assigned_to')}
                  value={
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        {asset.currentAssignment ? (
                          <>
                            <p className="font-medium text-slate-100">
                              {asset.currentAssignment.assigneeName}
                            </p>
                            {asset.currentAssignment.assigneeEmail && (
                              <p className="text-xs text-slate-500">
                                {asset.currentAssignment.assigneeEmail}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-500">
                            {t('asset.details.unassigned')}
                          </span>
                        )}
                      </div>
                      {asset.currentAssignment ? (
                        <button
                          type="button"
                          onClick={() => setReturningAssignment(true)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-900/50"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                          {t('asset_detail.return_asset')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAssigning(true)}
                          className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          {t('asset_detail.assign_to')}
                        </button>
                      )}
                    </div>
                  }
                />
              </dl>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
              <h3 className="text-sm font-semibold text-slate-100">
                {t('asset.lifecycle_dates.title')}
              </h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    {t('asset.lifecycle_dates.requested')}
                  </dt>
                  <dd className="text-slate-100">
                    {formatDate(asset.requestedAt)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    {t('asset.lifecycle_dates.ordered')}
                  </dt>
                  <dd className="text-slate-100">
                    {formatDate(asset.orderedAt)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    {t('asset.lifecycle_dates.received')}
                  </dt>
                  <dd className="text-slate-100">
                    {formatDate(asset.receivedAt)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    {t('asset.lifecycle_dates.deployed')}
                  </dt>
                  <dd className="text-slate-100">
                    {formatDate(asset.deployedAt)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    {t('asset.lifecycle_dates.retired')}
                  </dt>
                  <dd className="text-slate-100">
                    {formatDate(asset.retiredAt)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    {t('asset.lifecycle_dates.disposed')}
                  </dt>
                  <dd className="text-slate-100">
                    {formatDate(asset.disposedAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">
                {t('asset_detail.recurring_checks_title')}
              </h3>
              <button
                type="button"
                onClick={() => setAddingCheck(true)}
                className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700"
              >
                <Plus className="h-3.5 w-3.5" />
                {t('asset_detail.add_check')}
              </button>
            </div>
            <RecurringCheckList
              checks={asset.recurringChecks}
              onEdit={(c) => setEditingCheck(c)}
              onDelete={(c) => setDeletingCheck(c)}
              onComplete={(c) => store.completeCheck(asset.id, c.id)}
            />
          </div>

          <div className="mt-6 rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                {t('asset.security.title')}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSecurity(true)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800/50"
              >
                <Pencil className="h-3.5 w-3.5" />
                {t('asset.security.edit')}
              </button>
            </div>
            {!asset.security ? (
              <p className="text-sm text-slate-500">
                {t('asset.security.none')}
              </p>
            ) : (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">
                    {t('asset.security.encrypted')}
                  </dt>
                  <dd>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
                        asset.security.encrypted
                          ? 'bg-emerald-950/40 text-emerald-300 ring-emerald-600/20'
                          : 'bg-rose-950/40 text-rose-300 ring-rose-600/20',
                      )}
                    >
                      {asset.security.encrypted ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <LockOpen className="h-3 w-3" />
                      )}
                      {asset.security.encrypted
                        ? t('asset.security.encrypted_yes')
                        : t('asset.security.encrypted_no')}
                    </span>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">
                    {t('asset.security.compliance')}
                  </dt>
                  <dd>
                    <ComplianceBadge status={deriveComplianceStatus(asset)} />
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">
                    {t('asset.security.patch_status')}
                  </dt>
                  <dd>
                    <PatchBadge
                      status={asset.security.patchStatus ?? 'unknown'}
                    />
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">{t('asset.security.os')}</dt>
                  <dd className="text-slate-300">
                    {[asset.security.osName, asset.security.osVersion]
                      .filter(Boolean)
                      .join(' ') || '—'}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">
                    {t('asset.security.last_seen')}
                  </dt>
                  <dd className="text-slate-300">
                    {formatDate(asset.security.lastSeenAt)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">
                    {t('asset.security.frameworks')}
                  </dt>
                  <dd className="flex flex-wrap justify-end gap-1">
                    {asset.security.frameworks?.length
                      ? asset.security.frameworks.map((fw) => (
                          <span
                            key={fw}
                            className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                          >
                            {fw}
                          </span>
                        ))
                      : '—'}
                  </dd>
                </div>
                {asset.security.notes && (
                  <div className="col-span-2">
                    <dt className="text-slate-500">
                      {t('asset.security.notes')}
                    </dt>
                    <dd className="mt-1 rounded-md bg-slate-900/50 px-3 py-2 text-xs text-slate-400 italic">
                      {asset.security.notes}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </>
      )}

      {tab === 'history' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">
                {t('asset.history.timeline_title')}
              </h3>
              <button
                type="button"
                onClick={() => setAddingNote(true)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-900/50"
              >
                <FileText className="h-3.5 w-3.5" />
                {t('asset_detail.add_note')}
              </button>
            </div>
            <LifecycleTimeline events={asset.events} />
          </div>
          <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
            <h3 className="mb-4 text-sm font-semibold text-slate-100">
              {t('asset.history.assignment_title')}
            </h3>
            <AssignmentHistory assignments={asset.assignments} />
          </div>
        </div>
      )}

      {tab === 'warranties' && (
        <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              {t('asset.section_warranties')}
            </h3>
            <button
              type="button"
              onClick={() => setAddingWarranty(true)}
              className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('asset_detail.add_warranty')}
            </button>
          </div>
          <WarrantyList
            warranties={asset.warranties}
            onEdit={(w) => setEditingWarranty(w)}
            onDelete={(w) => setDeletingWarranty(w)}
          />
        </div>
      )}

      {tab === 'finance' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PurchaseCard asset={asset} />
          <DepreciationCard asset={asset} />
          {asset.lease && <LeaseCard asset={asset} />}
          {asset.disposal && <DisposalCard asset={asset} />}
        </div>
      )}

      {editing && (
        <AssetFormDialog onClose={() => setEditing(false)} asset={asset} />
      )}
      {changingState && (
        <StateChangeDialog
          asset={asset}
          onClose={() => setChangingState(false)}
        />
      )}
      {deleting && (
        <DeleteAssetDialog
          asset={asset}
          onClose={() => setDeleting(false)}
          onDeleted={() => navigate('/assets')}
        />
      )}
      {addingWarranty && (
        <WarrantyDialog
          assetId={asset.id}
          onClose={() => setAddingWarranty(false)}
        />
      )}
      {editingWarranty && (
        <WarrantyDialog
          assetId={asset.id}
          warranty={editingWarranty}
          onClose={() => setEditingWarranty(null)}
        />
      )}
      {deletingWarranty && (
        <WarrantyDeleteDialog
          assetId={asset.id}
          warranty={deletingWarranty}
          onClose={() => setDeletingWarranty(null)}
        />
      )}
      {addingCheck && (
        <RecurringCheckDialog
          assetId={asset.id}
          onClose={() => setAddingCheck(false)}
        />
      )}
      {editingCheck && (
        <RecurringCheckDialog
          assetId={asset.id}
          check={editingCheck}
          onClose={() => setEditingCheck(null)}
        />
      )}
      {deletingCheck && (
        <RecurringCheckDeleteDialog
          assetId={asset.id}
          check={deletingCheck}
          onClose={() => setDeletingCheck(null)}
        />
      )}
      {assigning && (
        <AssignmentDialog asset={asset} onClose={() => setAssigning(false)} />
      )}
      {returningAssignment && (
        <ReturnAssignmentDialog
          asset={asset}
          onClose={() => setReturningAssignment(false)}
        />
      )}
      {addingNote && (
        <NoteDialog asset={asset} onClose={() => setAddingNote(false)} />
      )}
      {editingSecurity && (
        <SecurityDialog
          asset={asset}
          onClose={() => setEditingSecurity(false)}
        />
      )}
    </div>
  )
}
