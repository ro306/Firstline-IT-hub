import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_PACKAGES } from './mockPeople'
import {
  PackagesStoreContext,
  type PackagesStoreValue,
} from './packagesStoreContext'
import type { OnboardingPackage } from './types'

const STORAGE_KEY = 'fl-packages-v1'

function load(): OnboardingPackage[] {
  if (typeof window === 'undefined') return MOCK_PACKAGES
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return MOCK_PACKAGES
    const parsed = JSON.parse(raw) as OnboardingPackage[]
    return Array.isArray(parsed) ? parsed : MOCK_PACKAGES
  } catch {
    return MOCK_PACKAGES
  }
}

function save(items: OnboardingPackage[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

function newId(): string {
  return `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function PackagesStoreProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<OnboardingPackage[]>(() => load())

  useEffect(() => {
    save(packages)
  }, [packages])

  const getPackage = useCallback(
    (id: string) => packages.find((p) => p.id === id),
    [packages],
  )

  const createPackage = useCallback<PackagesStoreValue['createPackage']>(
    (input) => {
      const pkg: OnboardingPackage = { id: newId(), ...input }
      setPackages((prev) => [...prev, pkg])
      return pkg
    },
    [],
  )

  const updatePackage = useCallback<PackagesStoreValue['updatePackage']>(
    (id, patch) => {
      setPackages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      )
    },
    [],
  )

  const deletePackage = useCallback<PackagesStoreValue['deletePackage']>(
    (id) => {
      setPackages((prev) => prev.filter((p) => p.id !== id))
    },
    [],
  )

  const resetToDemo = useCallback(() => setPackages(MOCK_PACKAGES), [])

  const value = useMemo<PackagesStoreValue>(
    () => ({
      packages,
      getPackage,
      createPackage,
      updatePackage,
      deletePackage,
      resetToDemo,
    }),
    [
      packages,
      getPackage,
      createPackage,
      updatePackage,
      deletePackage,
      resetToDemo,
    ],
  )

  return (
    <PackagesStoreContext.Provider value={value}>
      {children}
    </PackagesStoreContext.Provider>
  )
}
