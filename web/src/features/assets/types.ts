export type AssetStatus = 'in_use' | 'in_stock' | 'maintenance' | 'retired'

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

export type Asset = {
  id: string
  assetTag: string
  name: string
  category: AssetCategory
  status: AssetStatus
  serialNumber: string
  assignedTo: string | null
  location: string
  purchaseDate: string
  warrantyEndsAt: string | null
}
