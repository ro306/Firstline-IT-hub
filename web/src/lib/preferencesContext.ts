import { createContext } from 'react'

export type Preferences = {
  brandTitle?: string
  brandSubtitle?: string
}

export type PrefsValue = {
  prefs: Preferences
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void
  resetPref: <K extends keyof Preferences>(key: K) => void
}

export const PrefsContext = createContext<PrefsValue | null>(null)
