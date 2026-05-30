import { useContext } from 'react'
import {
  BudgetsStoreContext,
  type BudgetsStoreValue,
} from './budgetsStoreContext'

export function useBudgetsStore(): BudgetsStoreValue {
  const ctx = useContext(BudgetsStoreContext)
  if (!ctx) {
    throw new Error('useBudgetsStore must be used inside <BudgetsStoreProvider>')
  }
  return ctx
}
