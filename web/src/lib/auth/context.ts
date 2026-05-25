import { createContext } from 'react'

export type AuthUser = {
  id: string
  name: string
  email: string
  roles: string[]
}

export type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  signIn: () => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
