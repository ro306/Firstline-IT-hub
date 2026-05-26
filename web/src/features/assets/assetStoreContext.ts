import { createContext } from 'react'
import type { Asset } from './types'

export type AssetStoreValue = {
  assets: Asset[]
  getAsset: (id: string) => Asset | undefined
  createAsset: (input: NewAssetInput) => Asset
  updateAsset: (id: string, patch: AssetPatch) => void
  changeState: (id: string, next: Asset['lifecycleState'], notes?: string) => void
  deleteAsset: (id: string) => void
  resetToDemo: () => void
}

// Subset of Asset that the create-form gathers. The store fills in defaults
// (id, empty arrays, default lifecycle state) so the form stays focused on
// fields a user actually types.
export type NewAssetInput = {
  name: string
  assetTag: string
  serialNumber: string
  category: Asset['category']
  location: string
  ownership: Asset['ownership']
  lifecycleState: Asset['lifecycleState']
  vendor: string
  purchaseOrder?: string
  purchaseDate: string
  priceAmount: number
  priceCurrency: 'DKK' | 'EUR' | 'USD'
}

// Patch type for editing — same fields, all optional.
export type AssetPatch = Partial<NewAssetInput>

export const AssetStoreContext = createContext<AssetStoreValue | null>(null)
