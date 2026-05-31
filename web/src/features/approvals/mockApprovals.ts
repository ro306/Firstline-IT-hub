import type { ApprovalRequest } from './types'

export const MOCK_APPROVALS: ApprovalRequest[] = [
  {
    id: 'apr-1',
    kind: 'dispose',
    subject: 'Bortskaffelse af gammel ThinkPad efter 4 års tjeneste',
    assetId: '6',
    assetName: 'MacBook Air 13" M3',
    proposedState: 'disposed',
    requestedBy: 'Mikkel Holm',
    requestedAt: '2026-05-20T10:00:00Z',
    status: 'pending',
  },
  {
    id: 'apr-2',
    kind: 'order',
    subject: '5 nye MacBook Pro M4 til engineering',
    requestedBy: 'Mikkel Holm',
    requestedAt: '2026-05-22T13:00:00Z',
    status: 'approved',
    approver: 'Local Developer',
    decidedAt: '2026-05-23T09:00:00Z',
    notes: 'Budget tilladt — Q2 indkøb.',
  },
]
