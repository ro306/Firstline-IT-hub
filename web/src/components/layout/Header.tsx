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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800/70 bg-slate-900/70 px-6 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="group flex w-full max-w-md items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900/80 py-1.5 pr-2 pl-3 text-sm text-slate-500 shadow-sm transition-all hover:border-slate-700 hover:text-slate-500 hover:shadow"
      >
        <Search className="h-4 w-4 transition-colors group-hover:text-slate-500" />
        <span className="flex-1 text-left">{t('header.search_placeholder')}</span>
        <kbd className="hidden items-center gap-0.5 rounded border border-slate-800 bg-slate-900/50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline-flex">
          ⌘K
        </kbd>
      </button>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <Link
          to="/renewals"
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
          aria-label={t('header.notifications_aria', { count: openCount })}
        >
          <Bell className="h-[18px] w-[18px]" />
          {openCount > 0 && (
            <span className="animate-badge-pulse absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white tabular-nums">
              {openCount > 9 ? '9+' : openCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2.5 border-l border-slate-800/70 pl-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/25 to-brand-400/15 text-sm font-semibold text-brand-300 ring-1 ring-inset ring-brand-400/20">
            {initials ?? '?'}
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-medium text-slate-100">
              {user?.name}
            </span>
            <span className="text-[11px] text-slate-500">{user?.email}</span>
          </div>
        </div>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
