import type { AssetCategory } from '@/features/assets/types'

export type PersonStatus =
  | 'onboarding'
  | 'active'
  | 'offboarding'
  | 'inactive'

export type Person = {
  id: string
  name: string
  email: string
  department?: string
  role?: string
  startDate?: string
  endDate?: string
  status: PersonStatus
  // License IDs informally assigned to this person via an onboarding flow,
  // so offboarding can release the seats. Asset assignments stay on the
  // asset (currentAssignment) — single source of truth.
  assignedLicenseIds: string[]
  notes?: string
}

// A pre-defined bundle the org applies during onboarding. Items are either a
// pool of asset categories (we'll pick any available in-stock match — optionally
// narrowed by model name) or a specific license to add a seat to.
export type PackageItem =
  | {
      type: 'asset_category'
      category: AssetCategory
      count?: number
      // Optional model/name filter. When set, the onboarding resolver only
      // matches assets whose name contains this string (case-insensitive).
      model?: string
    }
  | { type: 'license'; licenseId: string }

export type OnboardingPackage = {
  id: string
  name: string
  description?: string
  items: PackageItem[]
}
