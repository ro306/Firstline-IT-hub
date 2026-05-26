import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useAlertStore } from '@/features/lifecycle/useAlertStore'
import { effectiveStatus } from '@/features/lifecycle/alertStoreContext'
import { computeExpirations } from '@/features/lifecycle/expirations'
import { MOCK_ASSETS } from '@/features/assets/mockData'
import { DEFAULT_WORKFLOW_RULES } from '@/features/lifecycle/mockRules'

export function Header() {
  const { user } = useAuth()
  const store = useAlertStore()
  const initials = user?.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const openCount = useMemo(() => {
    const periods = computeExpirations(MOCK_ASSETS, DEFAULT_WORKFLOW_RULES)
    return periods.filter((p) => {
      if (p.matchedRules.length === 0 && p.daysUntil >= 0) return false
      return effectiveStatus(store.alerts[p.key]) === 'open'
    }).length
  }, [store.alerts])

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search assets, serial numbers, owners…"
          className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-4">
        <Link
          to="/renewals"
          className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label={`Notifications (${openCount} open)`}
        >
          <Bell className="h-5 w-5" />
          {openCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
              {openCount > 9 ? '9+' : openCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {initials ?? '?'}
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-medium text-slate-900">
              {user?.name}
            </span>
            <span className="text-xs text-slate-500">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
