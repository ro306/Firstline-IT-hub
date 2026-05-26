import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MoreHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/features/assets/StatusBadge'
import { LifecycleStepper } from '@/features/assets/LifecycleStepper'
import { LifecycleTimeline } from '@/features/assets/LifecycleTimeline'
import { WarrantyList } from '@/features/assets/WarrantyList'
import { AssignmentHistory } from '@/features/assets/AssignmentHistory'
import {
  DepreciationCard,
  PurchaseCard,
  LeaseCard,
  DisposalCard,
} from '@/features/assets/FinanceCards'
import { AssetUpcomingPanel } from '@/features/lifecycle/AssetUpcomingPanel'
import { MOCK_ASSETS } from '@/features/assets/mockData'
import { formatDate } from '@/features/assets/finance'
import { cn } from '@/lib/cn'

type Tab = 'overview' | 'history' | 'warranties' | 'finance'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'history', label: 'Lifecycle history' },
  { id: 'warranties', label: 'Warranties' },
  { id: 'finance', label: 'Finance' },
]

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:gap-6">
      <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase sm:w-40">
        {label}
      </dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  )
}

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState<Tab>('overview')
  const asset = MOCK_ASSETS.find((a) => a.id === id)

  if (!asset) {
    return (
      <div>
        <Link
          to="/assets"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to assets
        </Link>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Asset not found
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            The asset with id <code>{id}</code> doesn&apos;t exist.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/assets"
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to assets
      </Link>
      <PageHeader
        title={asset.name}
        description={`Asset tag ${asset.assetTag} · Serial ${asset.serialNumber}`}
        actions={
          <>
            <StatusBadge state={asset.lifecycleState} />
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Change state
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </>
        }
      />

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Lifecycle
        </h3>
        <LifecycleStepper state={asset.lifecycleState} />
      </div>

      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === t.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
        <div className="mb-6">
          <AssetUpcomingPanel asset={asset} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900">Details</h3>
            <dl className="mt-2">
              <DetailRow label="Category" value={asset.category} />
              <DetailRow label="Location" value={asset.location} />
              <DetailRow
                label="Ownership"
                value={
                  asset.ownership === 'owned'
                    ? 'Owned'
                    : asset.ownership === 'leased_in'
                      ? 'Leased in'
                      : 'Leased out'
                }
              />
              <DetailRow
                label="Currently assigned to"
                value={
                  asset.currentAssignment ? (
                    <>
                      <p className="font-medium text-slate-900">
                        {asset.currentAssignment.assigneeName}
                      </p>
                      {asset.currentAssignment.assigneeEmail && (
                        <p className="text-xs text-slate-500">
                          {asset.currentAssignment.assigneeEmail}
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-400">Unassigned</span>
                  )
                }
              />
            </dl>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-slate-900">
              Lifecycle dates
            </h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Requested</dt>
                <dd className="text-slate-900">
                  {formatDate(asset.requestedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Ordered</dt>
                <dd className="text-slate-900">
                  {formatDate(asset.orderedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Received</dt>
                <dd className="text-slate-900">
                  {formatDate(asset.receivedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Deployed</dt>
                <dd className="text-slate-900">
                  {formatDate(asset.deployedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Retired</dt>
                <dd className="text-slate-900">
                  {formatDate(asset.retiredAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Disposed</dt>
                <dd className="text-slate-900">
                  {formatDate(asset.disposedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        </>
      )}

      {tab === 'history' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Event timeline
            </h3>
            <LifecycleTimeline events={asset.events} />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Assignment history
            </h3>
            <AssignmentHistory assignments={asset.assignments} />
          </div>
        </div>
      )}

      {tab === 'warranties' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Warranties &amp; service contracts
          </h3>
          <WarrantyList warranties={asset.warranties} />
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
    </div>
  )
}
