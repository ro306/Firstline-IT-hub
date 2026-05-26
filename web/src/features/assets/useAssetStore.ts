import { useContext } from 'react'
import {
  AssetStoreContext,
  type AssetStoreValue,
} from './assetStoreContext'

export function useAssetStore(): AssetStoreValue {
  const ctx = useContext(AssetStoreContext)
  if (!ctx) {
    throw new Error('useAssetStore must be used inside <AssetStoreProvider>')
  }
  return ctx
}
