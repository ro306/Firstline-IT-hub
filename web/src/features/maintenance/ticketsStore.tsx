import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_TICKETS } from './mockTickets'
import {
  TicketsStoreContext,
  type TicketsStoreValue,
} from './ticketsStoreContext'
import type { MaintenanceTicket } from './types'

const STORAGE_KEY = 'fl-tickets-v1'

function load(): MaintenanceTicket[] {
  if (typeof window === 'undefined') return MOCK_TICKETS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return MOCK_TICKETS
    const parsed = JSON.parse(raw) as MaintenanceTicket[]
    return Array.isArray(parsed) ? parsed : MOCK_TICKETS
  } catch {
    return MOCK_TICKETS
  }
}

function save(items: MaintenanceTicket[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

function newId(): string {
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function TicketsStoreProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => load())

  useEffect(() => {
    save(tickets)
  }, [tickets])

  const getTicket = useCallback(
    (id: string) => tickets.find((t) => t.id === id),
    [tickets],
  )

  const createTicket = useCallback<TicketsStoreValue['createTicket']>(
    (input) => {
      const created: MaintenanceTicket = {
        ...input,
        id: newId(),
        createdAt: new Date().toISOString(),
      }
      setTickets((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const updateTicket = useCallback<TicketsStoreValue['updateTicket']>(
    (id, patch) => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t
          const next = { ...t, ...patch }
          // Auto-stamp resolvedAt when status flips to resolved.
          if (
            patch.status === 'resolved' &&
            t.status !== 'resolved' &&
            !next.resolvedAt
          ) {
            next.resolvedAt = new Date().toISOString().slice(0, 10)
          }
          return next
        }),
      )
    },
    [],
  )

  const deleteTicket = useCallback<TicketsStoreValue['deleteTicket']>(
    (id) => {
      setTickets((prev) => prev.filter((t) => t.id !== id))
    },
    [],
  )

  const resetToDemo = useCallback(() => {
    setTickets(MOCK_TICKETS)
  }, [])

  const value = useMemo<TicketsStoreValue>(
    () => ({
      tickets,
      getTicket,
      createTicket,
      updateTicket,
      deleteTicket,
      resetToDemo,
    }),
    [tickets, getTicket, createTicket, updateTicket, deleteTicket, resetToDemo],
  )

  return (
    <TicketsStoreContext.Provider value={value}>
      {children}
    </TicketsStoreContext.Provider>
  )
}
