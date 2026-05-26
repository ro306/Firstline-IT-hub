import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Boxes,
  KeyRound,
  Wrench,
  FileBarChart,
  Settings,
  BellRing,
  ListChecks,
} from 'lucide-react'
import { cn } from '@/lib/cn'

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assets', label: 'Assets', icon: Boxes },
  { to: '/renewals', label: 'Renewals', icon: BellRing },
  { to: '/workflows', label: 'Workflows', icon: ListChecks },
  { to: '/licenses', label: 'Licenses', icon: KeyRound },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-200 md:bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white font-semibold">
          F
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-slate-900">
            Firstline IT
          </span>
          <span className="text-xs text-slate-500">Asset Management</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
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
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-400">
        v0.1.0 · dev build
      </div>
    </aside>
  )
}
