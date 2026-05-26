import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { AssetsPage } from '@/pages/AssetsPage'
import { AssetDetailPage } from '@/pages/AssetDetailPage'
import { RenewalsPage } from '@/pages/RenewalsPage'
import { TasksPage } from '@/pages/TasksPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'assets', Component: AssetsPage },
      { path: 'assets/:id', Component: AssetDetailPage },
      { path: 'renewals', Component: RenewalsPage },
      { path: 'tasks', Component: TasksPage },
      // The old /workflows route is now split: rules live in /settings,
      // tasks live at /tasks. Redirect any bookmarks.
      { path: 'workflows', element: <Navigate to="/settings" replace /> },
      { path: 'settings', Component: SettingsPage },
      {
        path: 'licenses',
        element: (
          <PlaceholderPage
            titleKey="nav.licenses"
            descriptionKey="placeholder.licenses"
          />
        ),
      },
      {
        path: 'maintenance',
        element: (
          <PlaceholderPage
            titleKey="nav.maintenance"
            descriptionKey="placeholder.maintenance"
          />
        ),
      },
      {
        path: 'reports',
        element: (
          <PlaceholderPage
            titleKey="nav.reports"
            descriptionKey="placeholder.reports"
          />
        ),
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
