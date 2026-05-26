import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_LICENSES } from './mockLicenses'
import {
  LicensesStoreContext,
  type LicensesStoreValue,
} from './licensesStoreContext'
import type { License } from './types'

const STORAGE_KEY = 'fl-licenses-v1'

function load(): License[] {
  if (typeof window === 'undefined') return MOCK_LICENSES
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return MOCK_LICENSES
    const parsed = JSON.parse(raw) as License[]
    return Array.isArray(parsed) ? parsed : MOCK_LICENSES
  } catch {
    return MOCK_LICENSES
  }
}

function save(items: License[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

function newId(): string {
  return `lic-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function LicensesStoreProvider({ children }: { children: ReactNode }) {
  const [licenses, setLicenses] = useState<License[]>(() => load())

  useEffect(() => {
    save(licenses)
  }, [licenses])

  const getLicense = useCallback(
    (id: string) => licenses.find((l) => l.id === id),
    [licenses],
  )

  const createLicense = useCallback<LicensesStoreValue['createLicense']>(
    (input) => {
      const created: License = { ...input, id: newId() }
      setLicenses((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const updateLicense = useCallback<LicensesStoreValue['updateLicense']>(
    (id, patch) => {
      setLicenses((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      )
    },
    [],
  )

  const deleteLicense = useCallback<LicensesStoreValue['deleteLicense']>(
    (id) => {
      setLicenses((prev) => prev.filter((l) => l.id !== id))
    },
    [],
  )

  const resetToDemo = useCallback(() => {
    setLicenses(MOCK_LICENSES)
  }, [])

  const value = useMemo<LicensesStoreValue>(
    () => ({
      licenses,
      getLicense,
      createLicense,
      updateLicense,
      deleteLicense,
      resetToDemo,
    }),
    [licenses, getLicense, createLicense, updateLicense, deleteLicense, resetToDemo],
  )

  return (
    <LicensesStoreContext.Provider value={value}>
      {children}
    </LicensesStoreContext.Provider>
  )
}
