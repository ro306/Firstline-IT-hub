import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Boxes,
  KeyRound,
  Wrench,
  FileBarChart,
  Settings,
  BellRing,
  CheckSquare,
  Users,
} from 'lucide-react'
import * as motion from 'motion/react-client'
import { cn } from '@/lib/cn'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { usePreferences } from '@/lib/usePreferences'

type NavItem = {
  to: string
  labelKey: string
  icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/assets', labelKey: 'nav.assets', icon: Boxes },
  { to: '/people', labelKey: 'nav.people', icon: Users },
  { to: '/renewals', labelKey: 'nav.renewals', icon: BellRing },
  { to: '/tasks', labelKey: 'nav.tasks', icon: CheckSquare },
  { to: '/licenses', labelKey: 'nav.licenses', icon: KeyRound },
  { to: '/maintenance', labelKey: 'nav.maintenance', icon: Wrench },
  { to: '/reports', labelKey: 'nav.reports', icon: FileBarChart },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
]

export function Sidebar() {
  const { t } = useTranslation()
  const { prefs } = usePreferences()
  const brandTitle = prefs.brandTitle || t('nav.brand_title')
  const brandSubtitle = prefs.brandSubtitle || t('nav.brand_subtitle')
  const initial = brandTitle.trim().charAt(0).toUpperCase() || 'J'
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-800/70 md:bg-slate-900/60 md:backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-800/70 px-5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white shadow-[0_4px_12px_-2px_rgb(99_102_241_/_0.35)]">
          {initial}
          <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-slate-100">
            {brandTitle}
          </span>
          <span className="text-[11px] text-slate-500">{brandSubtitle}</span>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-2.5 py-4">
        {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'text-brand-300'
                  : 'text-slate-500 hover:text-slate-100',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-md bg-brand-400/10 ring-1 ring-inset ring-brand-400/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span
                  className={cn(
                    'absolute inset-0 rounded-md transition-colors',
                    !isActive && 'group-hover:bg-slate-800/60',
                  )}
                />
                <Icon
                  className={cn(
                    'relative h-4 w-4 transition-transform group-hover:scale-110',
                    isActive ? 'text-brand-400' : 'text-slate-500',
                  )}
                />
                <span className="relative">{t(labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-800/70 px-5 py-3.5 text-[11px] text-slate-500">
        {t('nav.footer_version')}
      </div>
    </aside>
  )
}
