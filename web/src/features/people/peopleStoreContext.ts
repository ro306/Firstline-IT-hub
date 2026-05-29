import { createContext } from 'react'
import type { Person } from './types'

export type PeopleStoreValue = {
  people: Person[]
  getPerson: (id: string) => Person | undefined
  createPerson: (input: Omit<Person, 'id' | 'assignedLicenseIds'>) => Person
  updatePerson: (
    id: string,
    patch: Partial<Omit<Person, 'id'>>,
  ) => void
  deletePerson: (id: string) => void
  setLicenseAssignments: (id: string, licenseIds: string[]) => void
  resetToDemo: () => void
}

export const PeopleStoreContext = createContext<PeopleStoreValue | null>(null)
