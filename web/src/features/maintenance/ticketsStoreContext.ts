import { createContext } from 'react'
import type { MaintenanceTicket } from './types'

export type TicketsStoreValue = {
  tickets: MaintenanceTicket[]
  getTicket: (id: string) => MaintenanceTicket | undefined
  createTicket: (input: Omit<MaintenanceTicket, 'id' | 'createdAt'>) => MaintenanceTicket
  updateTicket: (
    id: string,
    patch: Partial<Omit<MaintenanceTicket, 'id' | 'createdAt'>>,
  ) => void
  deleteTicket: (id: string) => void
  resetToDemo: () => void
}

export const TicketsStoreContext = createContext<TicketsStoreValue | null>(null)
