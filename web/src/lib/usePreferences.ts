import { useContext } from 'react'
import { PrefsContext, type PrefsValue } from './preferencesContext'

export function usePreferences(): PrefsValue {
  const ctx = useContext(PrefsContext)
  if (!ctx) {
    throw new Error('usePreferences must be used inside <PreferencesProvider>')
  }
  return ctx
}
