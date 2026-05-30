export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'awaiting_parts'
  | 'awaiting_user'
  | 'resolved'
  | 'cancelled'

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'

export type MaintenanceTicket = {
  id: string
  title: string
  assetId?: string
  // Snapshot of the asset name so deletions of the asset don't leave the
  // ticket dangling visually.
  assetName?: string
  status: TicketStatus
  priority: TicketPriority
  // Free-form short text.
  description: string
  reportedBy: string
  assignedTo?: string
  vendor?: string
  ticketRef?: string
  createdAt: string
  scheduledFor?: string
  resolvedAt?: string
  resolutionNotes?: string
  // Estimated cost for this ticket; rolled into TCO if set.
  costEstimate?: number
  costCurrency?: 'DKK' | 'EUR' | 'USD'
}
