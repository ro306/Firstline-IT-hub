import { createContext } from 'react'
import type { License } from './types'

export type LicensesStoreValue = {
  licenses: License[]
  getLicense: (id: string) => License | undefined
  createLicense: (input: Omit<License, 'id'>) => License
  updateLicense: (id: string, patch: Partial<Omit<License, 'id'>>) => void
  deleteLicense: (id: string) => void
  resetToDemo: () => void
}

export const LicensesStoreContext = createContext<LicensesStoreValue | null>(
  null,
)
