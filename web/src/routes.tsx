import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { AssetsPage } from '@/pages/AssetsPage'
import { AssetDetailPage } from '@/pages/AssetDetailPage'
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
      {
        path: 'licenses',
        element: (
          <PlaceholderPage
            title="Licenses"
            description="Software license inventory and assignments."
          />
        ),
      },
      {
        path: 'maintenance',
        element: (
          <PlaceholderPage
            title="Maintenance"
            description="Scheduled and active maintenance tickets across assets."
          />
        ),
      },
      {
        path: 'reports',
        element: (
          <PlaceholderPage
            title="Reports"
            description="Asset reports, exports, and audit logs."
          />
        ),
      },
      {
        path: 'settings',
        element: (
          <PlaceholderPage
            title="Settings"
            description="Module preferences. Tenant and IAM settings live in the platform."
          />
        ),
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
