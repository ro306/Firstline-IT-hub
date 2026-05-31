import { useContext } from 'react'
import {
  PackagesStoreContext,
  type PackagesStoreValue,
} from './packagesStoreContext'

export function usePackagesStore(): PackagesStoreValue {
  const ctx = useContext(PackagesStoreContext)
  if (!ctx) {
    throw new Error(
      'usePackagesStore must be used inside <PackagesStoreProvider>',
    )
  }
  return ctx
}
