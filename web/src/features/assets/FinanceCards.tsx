import { TrendingDown, Package, Trash2 } from 'lucide-react'
import { computeDepreciation, formatDate, formatMoney } from './finance'
import type { Asset } from './types'

const DEPRECIATION_METHOD_LABEL = {
  straight_line: 'Straight line',
  declining_balance: 'Declining balance (2x)',
  none: 'Not depreciated',
} as const

const DISPOSAL_METHOD_LABEL = {
  sold: 'Sold',
  donated: 'Donated',
  recycled: 'Recycled (WEEE)',
  destroyed: 'Destroyed',
  returned_to_lessor: 'Returned to lessor',
} as const

export function DepreciationCard({ asset }: { asset: Asset }) {
  const snapshot = computeDepreciation(asset)
  if (!asset.depreciation || !snapshot) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-slate-900">Depreciation</h3>
        <p className="mt-2 text-sm text-slate-500">
          This asset is not being depreciated.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Depreciation</h3>
        <TrendingDown className="h-4 w-4 text-slate-400" />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {DEPRECIATION_METHOD_LABEL[asset.depreciation.method]} ·{' '}
        {asset.depreciation.usefulLifeMonths} months useful life
      </p>

      <div className="mt-4 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-500">Book value today</span>
          <span className="text-lg font-semibold text-slate-900">
            {formatMoney(snapshot.bookValue)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-500"
            style={{ width: `${snapshot.percentDepreciated}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>
            {snapshot.percentDepreciated}% depreciated ·{' '}
            {formatMoney(snapshot.depreciated)}
          </span>
          <span>
            Residual {formatMoney(asset.depreciation.residualValue)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function PurchaseCard({ asset }: { asset: Asset }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-slate-900">Purchase</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Vendor</dt>
          <dd className="text-slate-900">{asset.purchase.vendor}</dd>
        </div>
        {asset.purchase.purchaseOrder && (
          <div className="flex justify-between">
            <dt className="text-slate-500">PO</dt>
            <dd className="font-mono text-xs text-slate-700">
              {asset.purchase.purchaseOrder}
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-slate-500">Purchased</dt>
          <dd className="text-slate-900">
            {formatDate(asset.purchase.purchaseDate)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Price</dt>
          <dd className="font-semibold text-slate-900">
            {formatMoney(asset.purchase.price)}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export function LeaseCard({ asset }: { asset: Asset }) {
  if (!asset.lease) return null
  const { lease, ownership } = asset
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Lease ({ownership === 'leased_in' ? 'Leased in' : 'Leased out'})
        </h3>
        <Package className="h-4 w-4 text-slate-400" />
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Vendor</dt>
          <dd className="text-slate-900">{lease.vendor}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Contract</dt>
          <dd className="font-mono text-xs text-slate-700">
            {lease.contractRef}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Period</dt>
          <dd className="text-slate-900">
            {formatDate(lease.startsAt)} → {formatDate(lease.endsAt)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Monthly cost</dt>
          <dd className="font-semibold text-slate-900">
            {formatMoney(lease.monthlyCost)}
          </dd>
        </div>
        {lease.returnedAt && (
          <div className="flex justify-between">
            <dt className="text-slate-500">Returned</dt>
            <dd className="text-slate-900">{formatDate(lease.returnedAt)}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}

export function DisposalCard({ asset }: { asset: Asset }) {
  if (!asset.disposal) return null
  const d = asset.disposal
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Disposal</h3>
        <Trash2 className="h-4 w-4 text-slate-400" />
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Method</dt>
          <dd className="text-slate-900">{DISPOSAL_METHOD_LABEL[d.method]}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Disposed</dt>
          <dd className="text-slate-900">{formatDate(d.disposedAt)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">By</dt>
          <dd className="text-slate-900">{d.disposedBy}</dd>
        </div>
        {d.recipient && (
          <div className="flex justify-between">
            <dt className="text-slate-500">Recipient</dt>
            <dd className="text-slate-900">{d.recipient}</dd>
          </div>
        )}
        {d.salePrice && (
          <div className="flex justify-between">
            <dt className="text-slate-500">Sale price</dt>
            <dd className="font-semibold text-slate-900">
              {formatMoney(d.salePrice)}
            </dd>
          </div>
        )}
        {d.certificateRef && (
          <div className="flex justify-between">
            <dt className="text-slate-500">Certificate</dt>
            <dd className="font-mono text-xs text-slate-700">
              {d.certificateRef}
            </dd>
          </div>
        )}
      </dl>
      {d.notes && (
        <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600 italic">
          {d.notes}
        </p>
      )}
    </div>
  )
}
