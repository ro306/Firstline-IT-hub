// Asset lifecycle is modelled as a single state plus orthogonal ownership.
// Keeping all states in one enum (rather than splitting ownership out) makes
// the UI simpler — one badge, one filter dimension — at the cost of a slightly
// bigger state machine. See lifecycle.ts for allowed transitions.

export type AssetLifecycleState =
  | 'requested'
  | 'ordered'
  | 'in_stock'
  | 'assigned'
  | 'in_use'
  | 'in_maintenance'
  | 'leased_in'
  | 'leased_out'
  | 'retired'
  | 'disposed'
  | 'returned_to_vendor'
  | 'lost'
  | 'stolen'

export type AssetCategory =
  | 'laptop'
  | 'desktop'
  | 'monitor'
  | 'phone'
  | 'tablet'
  | 'peripheral'
  | 'server'
  | 'network'
  | 'other'

export type Ownership = 'owned' | 'leased_in' | 'leased_out'

export type DepreciationMethod = 'straight_line' | 'declining_balance' | 'none'

export type WarrantyKind =
  | 'manufacturer'
  | 'extended'
  | 'service_contract'
  | 'accidental_damage'

export type DisposalMethod =
  | 'sold'
  | 'donated'
  | 'recycled'
  | 'destroyed'
  | 'returned_to_lessor'

export type Money = {
  amount: number
  currency: 'DKK' | 'EUR' | 'USD'
}

export type AssetWarranty = {
  id: string
  kind: WarrantyKind
  provider: string
  reference?: string
  startsAt: string
  endsAt: string
  coverageNotes?: string
}

export type AssetLease = {
  vendor: string
  contractRef: string
  startsAt: string
  endsAt: string
  monthlyCost: Money
  returnedAt?: string
}

export type AssetPurchase = {
  vendor: string
  purchaseOrder?: string
  purchaseDate: string
  price: Money
}

export type AssetDepreciation = {
  method: DepreciationMethod
  usefulLifeMonths: number
  residualValue: Money
}

export type AssetDisposal = {
  method: DisposalMethod
  disposedAt: string
  disposedBy: string
  recipient?: string
  salePrice?: Money
  certificateRef?: string
  notes?: string
}

export type AssetAssignment = {
  id: string
  assigneeName: string
  assigneeEmail?: string
  location: string
  assignedAt: string
  returnedAt?: string
  notes?: string
}

export type AssetLifecycleEventKind =
  | 'state_changed'
  | 'assigned'
  | 'unassigned'
  | 'moved'
  | 'maintenance_started'
  | 'maintenance_completed'
  | 'warranty_added'
  | 'warranty_expired'
  | 'lease_started'
  | 'lease_renewed'
  | 'lease_ended'
  | 'disposed'
  | 'note'

export type AssetLifecycleEvent = {
  id: string
  occurredAt: string
  actor: string
  kind: AssetLifecycleEventKind
  // Free-form context for the event. Shape depends on `kind`.
  payload?: Record<string, string | number | null | undefined>
  notes?: string
}

export type Asset = {
  id: string
  assetTag: string
  name: string
  category: AssetCategory
  lifecycleState: AssetLifecycleState
  ownership: Ownership

  serialNumber: string
  location: string

  // Lifecycle date markers (the latest occurrence of each milestone).
  requestedAt?: string
  orderedAt?: string
  receivedAt?: string
  deployedAt?: string
  retiredAt?: string
  disposedAt?: string

  currentAssignment?: AssetAssignment
  assignments: AssetAssignment[]

  purchase: AssetPurchase
  depreciation?: AssetDepreciation
  lease?: AssetLease
  disposal?: AssetDisposal
  warranties: AssetWarranty[]

  events: AssetLifecycleEvent[]
}
