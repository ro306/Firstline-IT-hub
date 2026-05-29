export type LicenseKind =
  | 'subscription'
  | 'perpetual'
  | 'cloud'
  | 'open_source'
  | 'other'

// Distinguishes a software license entitlement from a cloud service
// subscription. Both share the same table/data shape.
export type ServiceType = 'license' | 'cloud_service'

// How the cost is billed. Per-seat uses costPerSeatPerYear; flat_monthly uses
// monthlyCost (×12 for the annual roll-up).
export type BillingModel = 'per_seat' | 'flat_monthly'

export type License = {
  id: string
  name: string
  vendor: string
  kind: LicenseKind
  serviceType: ServiceType
  billingModel?: BillingModel
  monthlyCost?: number
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
