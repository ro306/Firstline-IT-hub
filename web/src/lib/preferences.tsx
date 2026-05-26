import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  PrefsContext,
  type Preferences,
  type PrefsValue,
} from './preferencesContext'

const STORAGE_KEY = 'fl-preferences-v1'

function loadPrefs(): Preferences {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Preferences) : {}
  } catch {
    return {}
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(() => loadPrefs())

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // ignore
    }
  }, [prefs])

  const setPref = useCallback<PrefsValue['setPref']>((key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetPref = useCallback<PrefsValue['resetPref']>((key) => {
    setPrefs((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const value = useMemo<PrefsValue>(
    () => ({ prefs, setPref, resetPref }),
    [prefs, setPref, resetPref],
  )

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}
