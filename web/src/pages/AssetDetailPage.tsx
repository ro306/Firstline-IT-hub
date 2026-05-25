import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/features/assets/StatusBadge'
import { MOCK_ASSETS } from '@/features/assets/mockData'

function DetailRow({ label, value }: { label: string; value: string }) {
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
        description={`Asset tag ${asset.assetTag}`}
        actions={<StatusBadge status={asset.status} />}
      />

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <dl>
          <DetailRow label="Category" value={asset.category} />
          <DetailRow label="Serial number" value={asset.serialNumber} />
          <DetailRow label="Assigned to" value={asset.assignedTo ?? '—'} />
          <DetailRow label="Location" value={asset.location} />
          <DetailRow label="Purchased" value={asset.purchaseDate} />
          <DetailRow
            label="Warranty ends"
            value={asset.warrantyEndsAt ?? '—'}
          />
        </dl>
      </div>
    </div>
  )
}
