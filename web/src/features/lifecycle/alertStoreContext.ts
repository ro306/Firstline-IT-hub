import { createContext } from 'react'
import type { AlertState, AlertStatus, FollowUpTask } from './types'

export type AlertStoreValue = {
  alerts: Record<string, AlertState>
  tasks: FollowUpTask[]
  snooze: (key: string, untilIso: string, notes?: string) => void
  acknowledge: (key: string, by: string, notes?: string) => void
  resolve: (key: string, notes?: string) => void
  reopen: (key: string) => void
  createTask: (task: Omit<FollowUpTask, 'id' | 'createdAt'>) => FollowUpTask
  completeTask: (id: string) => void
}

export const AlertStoreContext = createContext<AlertStoreValue | null>(null)

// Returns the effective status for a period key, taking expiration of
// snoozes into account. If a snooze has passed, the alert is "open" again.
export function effectiveStatus(
  state: AlertState | undefined,
  now: Date = new Date(),
): AlertStatus {
  if (!state) return 'open'
  if (state.status === 'snoozed' && state.snoozedUntil) {
    if (new Date(state.snoozedUntil) <= now) return 'open'
  }
  return state.status
}
