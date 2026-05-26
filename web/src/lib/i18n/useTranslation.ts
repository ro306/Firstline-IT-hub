import { useContext } from 'react'
import { I18nContext, type I18nValue } from './i18nContext'

export function useTranslation(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useTranslation must be used inside <I18nProvider>')
  }
  return ctx
}
