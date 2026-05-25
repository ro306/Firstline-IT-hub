import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Filter, Download } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { StatusBadge } from '@/features/assets/StatusBadge'
import { MOCK_ASSETS } from '@/features/assets/mockData'
import type { AssetStatus } from '@/features/assets/types'

const STATUS_FILTERS: { value: AssetStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in_use', label: 'In use' },
  { value: 'in_stock', label: 'In stock' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
]

export function AssetsPage() {
  const [filter, setFilter] = useState<AssetStatus | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MOCK_ASSETS.filter((asset) => {
      if (filter !== 'all' && asset.status !== filter) return false
      if (!q) return true
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.assetTag.toLowerCase().includes(q) ||
        asset.serialNumber.toLowerCase().includes(q) ||
        (asset.assignedTo?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [filter, query])

  return (
    <div>
      <PageHeader
        title="Assets"
        description={`${MOCK_ASSETS.length} assets tracked across your organization.`}
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              New asset
            </button>
          </>
        }
      />

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={
                  filter === f.value
                    ? 'rounded-md bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700'
                    : 'rounded-md px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100'
                }
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter rows…"
            className="w-64 max-w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Tag</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned to</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Warranty</th>
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
                    <div className="text-xs text-slate-500 capitalize">
                      {asset.category}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {asset.assetTag}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {asset.assignedTo ?? (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{asset.location}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {asset.warrantyEndsAt ?? (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No assets match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
