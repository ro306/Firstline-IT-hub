import { TrendingDown, Package, Trash2 } from 'lucide-react'
import { computeDepreciation, formatDate, formatMoney } from './finance'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { Asset } from './types'

export function DepreciationCard({ asset }: { asset: Asset }) {
  const { t } = useTranslation()
  const snapshot = computeDepreciation(asset)
  if (!asset.depreciation || !snapshot) {
    return (
      <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
        <h3 className="text-sm font-semibold text-slate-100">
          {t('asset.finance.depreciation_title')}
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          {t('asset.finance.not_depreciated')}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-slate-100">
          {t('asset.finance.depreciation_title')}
        </h3>
        <TrendingDown className="h-4 w-4 text-slate-500" />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {t(
          `asset.finance.depreciation_method.${asset.depreciation.method}`,
        )}{' '}
        ·{' '}
        {t('asset.finance.useful_life_months', {
          n: asset.depreciation.usefulLifeMonths,
        })}
      </p>

      <div className="mt-4 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-500">
            {t('asset.finance.book_value_today')}
          </span>
          <span className="text-lg font-semibold text-slate-100">
            {formatMoney(snapshot.bookValue)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-500"
            style={{ width: `${snapshot.percentDepreciated}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>
            {t('asset.finance.percent_depreciated', {
              percent: snapshot.percentDepreciated,
              amount: formatMoney(snapshot.depreciated),
            })}
          </span>
          <span>
            {t('asset.finance.residual', {
              amount: formatMoney(asset.depreciation.residualValue),
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export function PurchaseCard({ asset }: { asset: Asset }) {
  const { t } = useTranslation()
  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
      <h3 className="text-sm font-semibold text-slate-100">
        {t('asset.finance.purchase_title')}
      </h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">{t('asset.finance.vendor')}</dt>
          <dd className="text-slate-100">{asset.purchase.vendor}</dd>
        </div>
        {asset.purchase.purchaseOrder && (
          <div className="flex justify-between">
            <dt className="text-slate-500">{t('asset.finance.po')}</dt>
            <dd className="font-mono text-xs text-slate-300">
              {asset.purchase.purchaseOrder}
            </dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-slate-500">{t('asset.finance.purchased')}</dt>
          <dd className="text-slate-100">
            {formatDate(asset.purchase.purchaseDate)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{t('asset.finance.price')}</dt>
          <dd className="font-semibold text-slate-100">
            {formatMoney(asset.purchase.price)}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export function LeaseCard({ asset }: { asset: Asset }) {
  const { t } = useTranslation()
  if (!asset.lease) return null
  const { lease, ownership } = asset
  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-slate-100">
          {t('asset.finance.lease_title')} (
          {ownership === 'leased_in'
            ? t('asset.finance.lease_in')
            : t('asset.finance.lease_out')}
          )
        </h3>
        <Package className="h-4 w-4 text-slate-500" />
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">{t('asset.finance.vendor')}</dt>
          <dd className="text-slate-100">{lease.vendor}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{t('asset.finance.contract')}</dt>
          <dd className="font-mono text-xs text-slate-300">
            {lease.contractRef}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{t('asset.finance.period')}</dt>
          <dd className="text-slate-100">
            {formatDate(lease.startsAt)} → {formatDate(lease.endsAt)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{t('asset.finance.monthly_cost')}</dt>
          <dd className="font-semibold text-slate-100">
            {formatMoney(lease.monthlyCost)}
          </dd>
        </div>
        {lease.returnedAt && (
          <div className="flex justify-between">
            <dt className="text-slate-500">{t('asset.finance.returned')}</dt>
            <dd className="text-slate-100">{formatDate(lease.returnedAt)}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}

export function DisposalCard({ asset }: { asset: Asset }) {
  const { t } = useTranslation()
  if (!asset.disposal) return null
  const d = asset.disposal
  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-900 p-6 shadow-elevated">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-semibold text-slate-100">
          {t('asset.finance.disposal_title')}
        </h3>
        <Trash2 className="h-4 w-4 text-slate-500" />
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">
            {t('asset.finance.disposal_method')}
          </dt>
          <dd className="text-slate-100">
            {t(`asset.finance.disposal_method_value.${d.method}`)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{t('asset.finance.disposed_at')}</dt>
          <dd className="text-slate-100">{formatDate(d.disposedAt)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{t('asset.finance.by')}</dt>
          <dd className="text-slate-100">{d.disposedBy}</dd>
        </div>
        {d.recipient && (
          <div className="flex justify-between">
            <dt className="text-slate-500">{t('asset.finance.recipient')}</dt>
            <dd className="text-slate-100">{d.recipient}</dd>
          </div>
        )}
        {d.salePrice && (
          <div className="flex justify-between">
            <dt className="text-slate-500">{t('asset.finance.sale_price')}</dt>
            <dd className="font-semibold text-slate-100">
              {formatMoney(d.salePrice)}
            </dd>
          </div>
        )}
        {d.certificateRef && (
          <div className="flex justify-between">
            <dt className="text-slate-500">{t('asset.finance.certificate')}</dt>
            <dd className="font-mono text-xs text-slate-300">
              {d.certificateRef}
            </dd>
          </div>
        )}
      </dl>
      {d.notes && (
        <p className="mt-3 rounded-md bg-slate-900/50 px-3 py-2 text-xs text-slate-500 italic">
          {d.notes}
        </p>
      )}
    </div>
  )
}
