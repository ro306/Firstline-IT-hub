import { useContext } from 'react'
import {
  PeopleStoreContext,
  type PeopleStoreValue,
} from './peopleStoreContext'

export function usePeopleStore(): PeopleStoreValue {
  const ctx = useContext(PeopleStoreContext)
  if (!ctx) {
    throw new Error('usePeopleStore must be used inside <PeopleStoreProvider>')
  }
  return ctx
}
