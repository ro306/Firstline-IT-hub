import { useContext } from 'react'
import {
  TicketsStoreContext,
  type TicketsStoreValue,
} from './ticketsStoreContext'

export function useTicketsStore(): TicketsStoreValue {
  const ctx = useContext(TicketsStoreContext)
  if (!ctx) {
    throw new Error(
      'useTicketsStore must be used inside <TicketsStoreProvider>',
    )
  }
  return ctx
}
