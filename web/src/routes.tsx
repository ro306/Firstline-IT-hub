import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { AssetsPage } from '@/pages/AssetsPage'
import { AssetDetailPage } from '@/pages/AssetDetailPage'
import { RenewalsPage } from '@/pages/RenewalsPage'
import { TasksPage } from '@/pages/TasksPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { LicensesPage } from '@/pages/LicensesPage'
import { MaintenancePage } from '@/pages/MaintenancePage'
import { ReportsPage } from '@/pages/ReportsPage'
import { PeoplePage } from '@/pages/PeoplePage'
import { ApprovalsPage } from '@/pages/ApprovalsPage'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  // Public landing page — no AppShell (no sidebar/header).
  { path: '/welcome', Component: LandingPage },
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'assets', Component: AssetsPage },
      { path: 'assets/:id', Component: AssetDetailPage },
      { path: 'renewals', Component: RenewalsPage },
      { path: 'tasks', Component: TasksPage },
      { path: 'people', Component: PeoplePage },
      { path: 'approvals', Component: ApprovalsPage },
      { path: 'licenses', Component: LicensesPage },
      { path: 'maintenance', Component: MaintenancePage },
      { path: 'reports', Component: ReportsPage },
      { path: 'workflows', element: <Navigate to="/settings" replace /> },
      { path: 'settings', Component: SettingsPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
