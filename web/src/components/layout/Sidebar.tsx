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
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useTranslation } from '@/lib/i18n/useTranslation'

type NavItem = {
  to: string
  labelKey: string
  icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/assets', labelKey: 'nav.assets', icon: Boxes },
  { to: '/renewals', labelKey: 'nav.renewals', icon: BellRing },
  { to: '/tasks', labelKey: 'nav.tasks', icon: CheckSquare },
  { to: '/licenses', labelKey: 'nav.licenses', icon: KeyRound },
  { to: '/maintenance', labelKey: 'nav.maintenance', icon: Wrench },
  { to: '/reports', labelKey: 'nav.reports', icon: FileBarChart },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
]

export function Sidebar() {
  const { t } = useTranslation()
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-200 md:bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white font-semibold">
          J
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-slate-900">
            {t('nav.brand_title')}
          </span>
          <span className="text-xs text-slate-500">{t('nav.brand_subtitle')}</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <Icon className="h-4 w-4" />
            <span>{t(labelKey)}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-400">
        {t('nav.footer_version')}
      </div>
    </aside>
  )
}
