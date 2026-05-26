import { useContext } from 'react'
import {
  LicensesStoreContext,
  type LicensesStoreValue,
} from './licensesStoreContext'

export function useLicensesStore(): LicensesStoreValue {
  const ctx = useContext(LicensesStoreContext)
  if (!ctx) {
    throw new Error(
      'useLicensesStore must be used inside <LicensesStoreProvider>',
    )
  }
  return ctx
}
