import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth'
import { I18nProvider } from '@/lib/i18n/I18nProvider'
import { AlertStoreProvider } from '@/features/lifecycle/alertStore'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/routes'

export default function App() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AlertStoreProvider>
            <RouterProvider router={router} />
          </AlertStoreProvider>
        </AuthProvider>
      </QueryClientProvider>
    </I18nProvider>
  )
}
