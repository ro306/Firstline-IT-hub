import { createContext } from 'react'

export type Language = 'da' | 'en'

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string

export type I18nValue = {
  lang: Language
  setLang: (lang: Language) => void
  t: TranslateFn
}

export const I18nContext = createContext<I18nValue | null>(null)

// Module-level locale, kept in sync by I18nProvider. Standalone formatters
// (formatDate, formatMoney) read from this so they don't need props/hooks.
let currentLocale: Language = 'da'

export function getCurrentLocale(): Language {
  return currentLocale
}

export function setCurrentLocale(lang: Language) {
  currentLocale = lang
}

export const LOCALE_TAG: Record<Language, string> = {
  da: 'da-DK',
  en: 'en-GB',
}
