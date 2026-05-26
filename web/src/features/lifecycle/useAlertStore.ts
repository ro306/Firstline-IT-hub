import { useContext } from 'react'
import {
  AlertStoreContext,
  type AlertStoreValue,
} from './alertStoreContext'

export function useAlertStore(): AlertStoreValue {
  const ctx = useContext(AlertStoreContext)
  if (!ctx) {
    throw new Error('useAlertStore must be used inside <AlertStoreProvider>')
  }
  return ctx
}
