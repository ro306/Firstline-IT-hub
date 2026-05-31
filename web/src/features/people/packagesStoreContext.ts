import { createContext } from 'react'
import type { OnboardingPackage } from './types'

export type PackagesStoreValue = {
  packages: OnboardingPackage[]
  getPackage: (id: string) => OnboardingPackage | undefined
  createPackage: (input: Omit<OnboardingPackage, 'id'>) => OnboardingPackage
  updatePackage: (
    id: string,
    patch: Partial<Omit<OnboardingPackage, 'id'>>,
  ) => void
  deletePackage: (id: string) => void
  resetToDemo: () => void
}

export const PackagesStoreContext = createContext<PackagesStoreValue | null>(
  null,
)
