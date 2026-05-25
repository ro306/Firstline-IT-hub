import { useMemo, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue, type AuthUser } from './context'

// TODO(logto): Replace this stub with the real Logto provider once the
// platform team ships the IAM integration. Expected wiring:
//   1. Install @logto/react and wrap children in <LogtoProvider config={...}>.
//   2. Derive the value below from useLogto() so the rest of the app keeps
//      the same shape (user, isAuthenticated, signIn, signOut).
//   3. Source endpoint + appId from import.meta.env.VITE_LOGTO_* vars.

const STUB_USER: AuthUser = {
  id: 'stub-user',
  name: 'Local Developer',
  email: 'dev@firstlineit.local',
  roles: ['asset.read', 'asset.write'],
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user: STUB_USER,
      isAuthenticated: true,
      signIn: () => {
        console.warn('[auth] signIn() is stubbed — Logto integration pending')
      },
      signOut: () => {
        console.warn('[auth] signOut() is stubbed — Logto integration pending')
      },
    }),
    [],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
