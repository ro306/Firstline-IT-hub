import { useContext } from 'react'
import {
  ApprovalsStoreContext,
  type ApprovalsStoreValue,
} from './approvalsStoreContext'

export function useApprovalsStore(): ApprovalsStoreValue {
  const ctx = useContext(ApprovalsStoreContext)
  if (!ctx) {
    throw new Error(
      'useApprovalsStore must be used inside <ApprovalsStoreProvider>',
    )
  }
  return ctx
}
