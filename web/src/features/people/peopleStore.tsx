import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_PEOPLE } from './mockPeople'
import {
  PeopleStoreContext,
  type PeopleStoreValue,
} from './peopleStoreContext'
import type { Person } from './types'

const STORAGE_KEY = 'fl-people-v1'

function load(): Person[] {
  if (typeof window === 'undefined') return MOCK_PEOPLE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return MOCK_PEOPLE
    const parsed = JSON.parse(raw) as Person[]
    if (!Array.isArray(parsed)) return MOCK_PEOPLE
    // Backfill assignedLicenseIds for older saved records.
    return parsed.map((p) => ({
      ...p,
      assignedLicenseIds: p.assignedLicenseIds ?? [],
    }))
  } catch {
    return MOCK_PEOPLE
  }
}

function save(items: Person[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

function newId(): string {
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function PeopleStoreProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>(() => load())

  useEffect(() => {
    save(people)
  }, [people])

  const getPerson = useCallback(
    (id: string) => people.find((p) => p.id === id),
    [people],
  )

  const createPerson = useCallback<PeopleStoreValue['createPerson']>(
    (input) => {
      const created: Person = {
        ...input,
        id: newId(),
        assignedLicenseIds: [],
      }
      setPeople((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const updatePerson = useCallback<PeopleStoreValue['updatePerson']>(
    (id, patch) => {
      setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    },
    [],
  )

  const deletePerson = useCallback<PeopleStoreValue['deletePerson']>((id) => {
    setPeople((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const setLicenseAssignments = useCallback<
    PeopleStoreValue['setLicenseAssignments']
  >((id, licenseIds) => {
    setPeople((prev) =>
      prev.map((p) => (p.id === id ? { ...p, assignedLicenseIds: licenseIds } : p)),
    )
  }, [])

  const resetToDemo = useCallback(() => setPeople(MOCK_PEOPLE), [])

  const value = useMemo<PeopleStoreValue>(
    () => ({
      people,
      getPerson,
      createPerson,
      updatePerson,
      deletePerson,
      setLicenseAssignments,
      resetToDemo,
    }),
    [
      people,
      getPerson,
      createPerson,
      updatePerson,
      deletePerson,
      setLicenseAssignments,
      resetToDemo,
    ],
  )

  return (
    <PeopleStoreContext.Provider value={value}>
      {children}
    </PeopleStoreContext.Provider>
  )
}
