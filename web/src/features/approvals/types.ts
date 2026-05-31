import type { AssetLifecycleState } from '@/features/assets/types'

export type ApprovalKind =
  | 'order'
  | 'dispose'
  | 'license_increase'
  | 'other'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

// A request that needs human sign-off before an action is executed.
// Today this covers disposal of an asset (high-risk state change) — but the
// shape supports orders and license increases as future kinds.
export type ApprovalRequest = {
  id: string
  kind: ApprovalKind
  subject: string
  assetId?: string
  assetName?: string
  // For 'dispose' and 'order': the lifecycle state to apply on approval.
  proposedState?: AssetLifecycleState
  requestedBy: string
  requestedAt: string
  status: ApprovalStatus
  approver?: string
  decidedAt?: string
  notes?: string
}
