import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth'
import { I18nProvider } from '@/lib/i18n/I18nProvider'
import { PreferencesProvider } from '@/lib/preferences'
import { AlertStoreProvider } from '@/features/lifecycle/alertStore'
import { RulesStoreProvider } from '@/features/lifecycle/rulesStore'
import { AssetStoreProvider } from '@/features/assets/assetStore'
import { LicensesStoreProvider } from '@/features/licenses/licensesStore'
import { TicketsStoreProvider } from '@/features/maintenance/ticketsStore'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/routes'

export default function App() {
  return (
    <I18nProvider>
      <PreferencesProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AssetStoreProvider>
              <LicensesStoreProvider>
                <TicketsStoreProvider>
                  <RulesStoreProvider>
                    <AlertStoreProvider>
                      <RouterProvider router={router} />
                    </AlertStoreProvider>
                  </RulesStoreProvider>
                </TicketsStoreProvider>
              </LicensesStoreProvider>
            </AssetStoreProvider>
          </AuthProvider>
        </QueryClientProvider>
      </PreferencesProvider>
    </I18nProvider>
  )
}
