import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { AssetsPage } from '@/pages/AssetsPage'
import { AssetDetailPage } from '@/pages/AssetDetailPage'
import { RenewalsPage } from '@/pages/RenewalsPage'
import { WorkflowsPage } from '@/pages/WorkflowsPage'
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
      { path: 'workflows', Component: WorkflowsPage },
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
      {
        path: 'settings',
        element: (
          <PlaceholderPage
            titleKey="nav.settings"
            descriptionKey="placeholder.settings"
          />
        ),
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
