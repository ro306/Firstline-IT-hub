import { createContext } from 'react'
import type {
  Asset,
  AssetAssignment,
  AssetLifecycleEvent,
  AssetSecurity,
  AssetWarranty,
  RecurringCheck,
} from './types'

export type AssetStoreValue = {
  assets: Asset[]
  getAsset: (id: string) => Asset | undefined
  createAsset: (input: NewAssetInput) => Asset
  updateAsset: (id: string, patch: AssetPatch) => void
  changeState: (id: string, next: Asset['lifecycleState'], notes?: string) => void
  deleteAsset: (id: string) => void
  resetToDemo: () => void
  // Sub-entity CRUD. Each operation also appends a lifecycle event so the
  // change is visible on the asset timeline.
  addWarranty: (assetId: string, input: Omit<AssetWarranty, 'id'>) => void
  updateWarranty: (
    assetId: string,
    warrantyId: string,
    patch: Partial<Omit<AssetWarranty, 'id'>>,
  ) => void
  deleteWarranty: (assetId: string, warrantyId: string) => void
  addCheck: (assetId: string, input: Omit<RecurringCheck, 'id'>) => void
  updateCheck: (
    assetId: string,
    checkId: string,
    patch: Partial<Omit<RecurringCheck, 'id'>>,
  ) => void
  deleteCheck: (assetId: string, checkId: string) => void
  completeCheck: (assetId: string, checkId: string) => void
  assign: (
    assetId: string,
    input: Omit<AssetAssignment, 'id' | 'returnedAt'>,
  ) => void
  returnAssignment: (assetId: string, notes?: string) => void
  updateSecurity: (assetId: string, security: AssetSecurity) => void
  addNote: (assetId: string, note: string) => void
  // Appends a freeform lifecycle event with optional payload.
  addEvent: (
    assetId: string,
    event: Omit<AssetLifecycleEvent, 'id' | 'occurredAt' | 'actor'>,
  ) => void
}

export type NewAssetInput = {
  name: string
  assetTag: string
  serialNumber: string
  category: Asset['category']
  location: string
  department?: string
  ownership: Asset['ownership']
  lifecycleState: Asset['lifecycleState']
  vendor: string
  purchaseOrder?: string
  purchaseDate: string
  priceAmount: number
  priceCurrency: 'DKK' | 'EUR' | 'USD'
}

export type AssetPatch = Partial<NewAssetInput>

export const AssetStoreContext = createContext<AssetStoreValue | null>(null)
