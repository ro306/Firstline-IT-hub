export type LicenseKind =
  | 'subscription'
  | 'perpetual'
  | 'cloud'
  | 'open_source'
  | 'other'

export type License = {
  id: string
  name: string
  vendor: string
  kind: LicenseKind
  seatsTotal: number
  seatsUsed: number
  costPerSeatPerYear?: number
  currency: 'DKK' | 'EUR' | 'USD'
  // Optional contact/owner inside the org.
  owner?: string
  notes?: string
  renewsAt?: string
  acquiredAt: string
}
