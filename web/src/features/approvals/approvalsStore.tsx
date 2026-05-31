import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_APPROVALS } from './mockApprovals'
import {
  ApprovalsStoreContext,
  type ApprovalsStoreValue,
} from './approvalsStoreContext'
import type { ApprovalRequest } from './types'

const STORAGE_KEY = 'fl-approvals-v1'

function load(): ApprovalRequest[] {
  if (typeof window === 'undefined') return MOCK_APPROVALS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return MOCK_APPROVALS
    const parsed = JSON.parse(raw) as ApprovalRequest[]
    return Array.isArray(parsed) ? parsed : MOCK_APPROVALS
  } catch {
    return MOCK_APPROVALS
  }
}

function save(items: ApprovalRequest[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

function newId(): string {
  return `apr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function ApprovalsStoreProvider({ children }: { children: ReactNode }) {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() => load())

  useEffect(() => {
    save(approvals)
  }, [approvals])

  const pending = useMemo(
    () => approvals.filter((a) => a.status === 'pending'),
    [approvals],
  )

  const getApproval = useCallback(
    (id: string) => approvals.find((a) => a.id === id),
    [approvals],
  )

  const pendingForAsset = useCallback(
    (assetId: string) =>
      approvals.find((a) => a.assetId === assetId && a.status === 'pending'),
    [approvals],
  )

  const createApproval = useCallback<ApprovalsStoreValue['createApproval']>(
    (input) => {
      const created: ApprovalRequest = {
        ...input,
        id: newId(),
        status: 'pending',
        requestedAt: input.requestedAt ?? new Date().toISOString(),
      }
      setApprovals((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const approve = useCallback<ApprovalsStoreValue['approve']>(
    (id, approver, notes) => {
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: 'approved',
                approver,
                decidedAt: new Date().toISOString(),
                notes: notes ?? a.notes,
              }
            : a,
        ),
      )
    },
    [],
  )

  const reject = useCallback<ApprovalsStoreValue['reject']>(
    (id, approver, notes) => {
      setApprovals((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: 'rejected',
                approver,
                decidedAt: new Date().toISOString(),
                notes: notes ?? a.notes,
              }
            : a,
        ),
      )
    },
    [],
  )

  const resetToDemo = useCallback(() => setApprovals(MOCK_APPROVALS), [])

  const value = useMemo<ApprovalsStoreValue>(
    () => ({
      approvals,
      pending,
      getApproval,
      pendingForAsset,
      createApproval,
      approve,
      reject,
      resetToDemo,
    }),
    [
      approvals,
      pending,
      getApproval,
      pendingForAsset,
      createApproval,
      approve,
      reject,
      resetToDemo,
    ],
  )

  return (
    <ApprovalsStoreContext.Provider value={value}>
      {children}
    </ApprovalsStoreContext.Provider>
  )
}
