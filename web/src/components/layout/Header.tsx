import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useAlertStore } from '@/features/lifecycle/useAlertStore'
import { effectiveStatus } from '@/features/lifecycle/alertStoreContext'
import { computeExpirations } from '@/features/lifecycle/expirations'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { useRulesStore } from '@/features/lifecycle/useRulesStore'
import { SearchDialog } from '@/components/SearchDialog'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function Header() {
  const { user } = useAuth()
  const store = useAlertStore()
  const { assets } = useAssetStore()
  const { rules } = useRulesStore()
  const { t } = useTranslation()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  const initials = user?.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const openCount = useMemo(() => {
    const periods = computeExpirations(assets, rules)
    return periods.filter((p) => {
      if (p.matchedRules.length === 0 && p.daysUntil >= 0) return false
      return effectiveStatus(store.alerts[p.key]) === 'open'
    }).length
  }, [assets, rules, store.alerts])

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="group flex w-full max-w-md items-center gap-2 rounded-md border border-slate-200 bg-slate-50 py-2 pr-3 pl-3 text-sm text-slate-400 hover:bg-white hover:text-slate-600"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">{t('header.search_placeholder')}</span>
        <kbd className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-500 sm:inline">
          ⌘K
        </kbd>
      </button>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <Link
          to="/renewals"
          className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label={t('header.notifications_aria', { count: openCount })}
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
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
