import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import daTranslations from './locales/da.json'
import enTranslations from './locales/en.json'
import {
  I18nContext,
  setCurrentLocale,
  type I18nValue,
  type Language,
  type TranslateFn,
} from './i18nContext'

const STORAGE_KEY = 'fl-lang'

const RESOURCES: Record<Language, Record<string, unknown>> = {
  da: daTranslations,
  en: enTranslations,
}

function loadLang(): Language {
  if (typeof window === 'undefined') return 'da'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'da') return stored
  return 'da'
}

function lookup(table: Record<string, unknown>, key: string): string | null {
  const parts = key.split('.')
  let cursor: unknown = table
  for (const part of parts) {
    if (cursor && typeof cursor === 'object' && part in cursor) {
      cursor = (cursor as Record<string, unknown>)[part]
    } else {
      return null
    }
  }
  return typeof cursor === 'string' ? cursor : null
}

function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const v = vars[name]
    return v === undefined ? `{${name}}` : String(v)
  })
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const initial = loadLang()
    setCurrentLocale(initial)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = initial
    }
    return initial
  })

  useEffect(() => {
    setCurrentLocale(lang)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang)
    }
  }, [lang])

  const setLang = useCallback((next: Language) => {
    setLangState(next)
  }, [])

  const t = useMemo<TranslateFn>(() => {
    const table = RESOURCES[lang]
    const fallback = RESOURCES.en
    return (key, vars) => {
      const hit = lookup(table, key) ?? lookup(fallback, key) ?? key
      return interpolate(hit, vars)
    }
  }, [lang])

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
