import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Filter, Download } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/features/assets/StatusBadge'
import { AssetFormDialog } from '@/features/assets/AssetFormDialog'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { downloadAssetsCsv } from '@/features/assets/csvExport'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { AssetLifecycleState } from '@/features/assets/types'

type FilterKind = 'all' | 'active' | 'pipeline' | 'end_of_life' | 'exception'

const FILTERS: FilterKind[] = [
  'all',
  'pipeline',
  'active',
  'end_of_life',
  'exception',
]

const ACTIVE_STATES: AssetLifecycleState[] = [
  'in_use',
  'in_maintenance',
  'leased_in',
  'leased_out',
  'assigned',
]
const PIPELINE_STATES: AssetLifecycleState[] = [
  'requested',
  'ordered',
  'in_stock',
]
const EOL_STATES: AssetLifecycleState[] = [
  'retired',
  'disposed',
  'returned_to_vendor',
]
const EXCEPTION_STATES: AssetLifecycleState[] = ['lost', 'stolen']

function matchesFilter(state: AssetLifecycleState, filter: FilterKind): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'active':
      return ACTIVE_STATES.includes(state)
    case 'pipeline':
      return PIPELINE_STATES.includes(state)
    case 'end_of_life':
      return EOL_STATES.includes(state)
    case 'exception':
      return EXCEPTION_STATES.includes(state)
  }
}

export function AssetsPage() {
  const { t } = useTranslation()
  const { assets } = useAssetStore()
  const [filter, setFilter] = useState<FilterKind>('all')
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return assets.filter((asset) => {
      if (!matchesFilter(asset.lifecycleState, filter)) return false
      if (!q) return true
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.assetTag.toLowerCase().includes(q) ||
        asset.serialNumber.toLowerCase().includes(q) ||
        (asset.currentAssignment?.assigneeName.toLowerCase().includes(q) ??
          false)
      )
    })
  }, [assets, filter, query])

  const description =
    assets.length === 1
      ? t('assets_page.description_one')
      : t('assets_page.description_other', { count: assets.length })

  return (
    <div>
      <PageHeader
        title={t('assets_page.title')}
        description={description}
        actions={
          <>
            <button
              type="button"
              onClick={() => downloadAssetsCsv(filtered)}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              {t('assets_page.export')}
            </button>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              {t('assets_page.new_asset')}
            </button>
          </>
        }
      />

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? 'rounded-md bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700'
                    : 'rounded-md px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100'
                }
              >
                {t(`assets_page.filter.${f}`)}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('assets_page.search_placeholder')}
            className="w-64 max-w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">{t('assets_page.table.name')}</th>
                <th className="px-4 py-3">{t('assets_page.table.tag')}</th>
                <th className="px-4 py-3">{t('assets_page.table.lifecycle')}</th>
                <th className="px-4 py-3">
                  {t('assets_page.table.assigned_to')}
                </th>
                <th className="px-4 py-3">{t('assets_page.table.location')}</th>
                <th className="px-4 py-3">
                  {t('assets_page.table.ownership')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/assets/${asset.id}`}
                      className="font-medium text-slate-900 hover:text-brand-700"
                    >
                      {asset.name}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {t(`asset.category.${asset.category}`)}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {asset.assetTag}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge state={asset.lifecycleState} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {asset.currentAssignment?.assigneeName ?? (
                      <span className="text-slate-400">
                        {t('assets_page.unassigned')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{asset.location}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {asset.ownership === 'leased_in'
                      ? t('asset.finance.lease_in')
                      : asset.ownership === 'leased_out'
                        ? t('asset.finance.lease_out')
                        : t('asset.ownership.owned')}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    {t('assets_page.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {creating && <AssetFormDialog onClose={() => setCreating(false)} />}
    </div>
  )
}
