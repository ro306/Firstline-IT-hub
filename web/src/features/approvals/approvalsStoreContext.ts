import { createContext } from 'react'
import type { ApprovalRequest } from './types'

export type ApprovalsStoreValue = {
  approvals: ApprovalRequest[]
  pending: ApprovalRequest[]
  getApproval: (id: string) => ApprovalRequest | undefined
  pendingForAsset: (assetId: string) => ApprovalRequest | undefined
  createApproval: (
    input: Omit<ApprovalRequest, 'id' | 'status' | 'requestedAt'> & {
      requestedAt?: string
    },
  ) => ApprovalRequest
  approve: (id: string, approver: string, notes?: string) => void
  reject: (id: string, approver: string, notes?: string) => void
  resetToDemo: () => void
}

export const ApprovalsStoreContext = createContext<ApprovalsStoreValue | null>(
  null,
)
