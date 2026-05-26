import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AlertState, AlertStatus, FollowUpTask } from './types'
import { AlertStoreContext, type AlertStoreValue } from './alertStoreContext'

const STORAGE_KEY_ALERTS = 'fl-asset-alerts-v1'
const STORAGE_KEY_TASKS = 'fl-asset-tasks-v1'

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota errors
  }
}

export function AlertStoreProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Record<string, AlertState>>(() =>
    loadJson<Record<string, AlertState>>(STORAGE_KEY_ALERTS, {}),
  )
  const [tasks, setTasks] = useState<FollowUpTask[]>(() =>
    loadJson<FollowUpTask[]>(STORAGE_KEY_TASKS, []),
  )

  useEffect(() => {
    saveJson(STORAGE_KEY_ALERTS, alerts)
  }, [alerts])

  useEffect(() => {
    saveJson(STORAGE_KEY_TASKS, tasks)
  }, [tasks])

  const updateAlert = useCallback(
    (key: string, patch: Partial<AlertState> & { status: AlertStatus }) => {
      setAlerts((prev) => ({
        ...prev,
        [key]: { ...prev[key], ...patch },
      }))
    },
    [],
  )

  const snooze = useCallback<AlertStoreValue['snooze']>(
    (key, untilIso, notes) => {
      updateAlert(key, { status: 'snoozed', snoozedUntil: untilIso, notes })
    },
    [updateAlert],
  )

  const acknowledge = useCallback<AlertStoreValue['acknowledge']>(
    (key, by, notes) => {
      updateAlert(key, {
        status: 'acknowledged',
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBy: by,
        notes,
      })
    },
    [updateAlert],
  )

  const resolve = useCallback<AlertStoreValue['resolve']>(
    (key, notes) => {
      updateAlert(key, {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        notes,
      })
    },
    [updateAlert],
  )

  const reopen = useCallback<AlertStoreValue['reopen']>(
    (key) => {
      updateAlert(key, { status: 'open' })
    },
    [updateAlert],
  )

  const createTask = useCallback<AlertStoreValue['createTask']>((task) => {
    const newTask: FollowUpTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
    return newTask
  }, [])

  const completeTask = useCallback<AlertStoreValue['completeTask']>((id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'done' } : t)),
    )
  }, [])

  const value = useMemo<AlertStoreValue>(
    () => ({
      alerts,
      tasks,
      snooze,
      acknowledge,
      resolve,
      reopen,
      createTask,
      completeTask,
    }),
    [alerts, tasks, snooze, acknowledge, resolve, reopen, createTask, completeTask],
  )

  return (
    <AlertStoreContext.Provider value={value}>
      {children}
    </AlertStoreContext.Provider>
  )
}
