import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/lib/auth'
import { AlertStoreProvider } from '@/features/lifecycle/alertStore'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/routes'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AlertStoreProvider>
          <RouterProvider router={router} />
        </AlertStoreProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
