import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/lib/auth'
import { MOCK_ASSETS } from './mockData'
import {
  AssetStoreContext,
  type AssetPatch,
  type AssetStoreValue,
  type NewAssetInput,
} from './assetStoreContext'
import type {
  Asset,
  AssetAssignment,
  AssetLifecycleEvent,
  AssetSecurity,
  AssetWarranty,
} from './types'

function shortId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function pushEvent(
  asset: Asset,
  event: Omit<AssetLifecycleEvent, 'id' | 'occurredAt' | 'actor'>,
  actor: string,
): Asset {
  const fullEvent: AssetLifecycleEvent = {
    id: shortId('e'),
    occurredAt: new Date().toISOString(),
    actor,
    ...event,
  }
  return { ...asset, events: [fullEvent, ...asset.events] }
}

const STORAGE_KEY = 'fl-assets-v1'

function loadAssets(): Asset[] {
  if (typeof window === 'undefined') return MOCK_ASSETS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return MOCK_ASSETS
    const parsed = JSON.parse(raw) as Asset[]
    if (!Array.isArray(parsed)) return MOCK_ASSETS
    return parsed
  } catch {
    return MOCK_ASSETS
  }
}

function saveAssets(assets: Asset[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assets))
  } catch {
    // ignore quota errors
  }
}

function newId(): string {
  return `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function buildAsset(input: NewAssetInput, actor: string): Asset {
  const id = newId()
  const now = new Date().toISOString()
  const lifecycleState = input.lifecycleState
  const baseDates: Partial<Asset> = {}
  if (lifecycleState === 'in_stock') {
    baseDates.receivedAt = input.purchaseDate
  }
  if (lifecycleState === 'ordered') {
    baseDates.orderedAt = input.purchaseDate
  }
  return {
    id,
    assetTag: input.assetTag,
    name: input.name,
    category: input.category,
    lifecycleState,
    ownership: input.ownership,
    serialNumber: input.serialNumber,
    location: input.location,
    ...baseDates,
    assignments: [],
    purchase: {
      vendor: input.vendor,
      purchaseOrder: input.purchaseOrder,
      purchaseDate: input.purchaseDate,
      price: { amount: input.priceAmount, currency: input.priceCurrency },
    },
    warranties: [],
    recurringChecks: [],
    events: [
      {
        id: `e-${Date.now()}`,
        occurredAt: now,
        actor,
        kind: 'state_changed',
        payload: { to: lifecycleState },
        notes: 'Asset created',
      },
    ],
  }
}

function patchAsset(asset: Asset, patch: AssetPatch): Asset {
  const next: Asset = { ...asset }
  if (patch.name !== undefined) next.name = patch.name
  if (patch.assetTag !== undefined) next.assetTag = patch.assetTag
  if (patch.serialNumber !== undefined) next.serialNumber = patch.serialNumber
  if (patch.category !== undefined) next.category = patch.category
  if (patch.location !== undefined) next.location = patch.location
  if (patch.ownership !== undefined) next.ownership = patch.ownership
  if (patch.lifecycleState !== undefined)
    next.lifecycleState = patch.lifecycleState
  if (
    patch.vendor !== undefined ||
    patch.purchaseOrder !== undefined ||
    patch.purchaseDate !== undefined ||
    patch.priceAmount !== undefined ||
    patch.priceCurrency !== undefined
  ) {
    next.purchase = {
      ...asset.purchase,
      vendor: patch.vendor ?? asset.purchase.vendor,
      purchaseOrder:
        patch.purchaseOrder !== undefined
          ? patch.purchaseOrder
          : asset.purchase.purchaseOrder,
      purchaseDate: patch.purchaseDate ?? asset.purchase.purchaseDate,
      price: {
        amount:
          patch.priceAmount !== undefined
            ? patch.priceAmount
            : asset.purchase.price.amount,
        currency: patch.priceCurrency ?? asset.purchase.price.currency,
      },
    }
  }
  return next
}

export function AssetStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const actor = user?.name ?? 'System'
  const [assets, setAssets] = useState<Asset[]>(() => loadAssets())

  useEffect(() => {
    saveAssets(assets)
  }, [assets])

  const getAsset = useCallback(
    (id: string) => assets.find((a) => a.id === id),
    [assets],
  )

  const createAsset = useCallback<AssetStoreValue['createAsset']>(
    (input) => {
      const created = buildAsset(input, actor)
      setAssets((prev) => [created, ...prev])
      return created
    },
    [actor],
  )

  const updateAsset = useCallback<AssetStoreValue['updateAsset']>(
    (id, patch) => {
      setAssets((prev) =>
        prev.map((a) => (a.id === id ? patchAsset(a, patch) : a)),
      )
    },
    [],
  )

  const changeState = useCallback<AssetStoreValue['changeState']>(
    (id, next, notes) => {
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a
          if (a.lifecycleState === next) return a
          const now = new Date().toISOString()
          const event = {
            id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            occurredAt: now,
            actor,
            kind: 'state_changed' as const,
            payload: { from: a.lifecycleState, to: next },
            notes,
          }
          const update: Asset = {
            ...a,
            lifecycleState: next,
            events: [event, ...a.events],
          }
          // Stamp lifecycle date markers on canonical transitions so the
          // detail page summary stays consistent.
          if (next === 'ordered' && !a.orderedAt)
            update.orderedAt = now.slice(0, 10)
          if (next === 'in_stock' && !a.receivedAt)
            update.receivedAt = now.slice(0, 10)
          if (
            (next === 'assigned' || next === 'in_use') &&
            !a.deployedAt
          )
            update.deployedAt = now.slice(0, 10)
          if (next === 'retired' && !a.retiredAt)
            update.retiredAt = now.slice(0, 10)
          if (next === 'disposed' && !a.disposedAt)
            update.disposedAt = now.slice(0, 10)
          return update
        }),
      )
    },
    [actor],
  )

  const deleteAsset = useCallback<AssetStoreValue['deleteAsset']>((id) => {
    setAssets((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const resetToDemo = useCallback(() => {
    setAssets(MOCK_ASSETS)
  }, [])

  const addWarranty = useCallback<AssetStoreValue['addWarranty']>(
    (assetId, input) => {
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id !== assetId) return a
          const warranty: AssetWarranty = { ...input, id: shortId('w') }
          const updated: Asset = {
            ...a,
            warranties: [...a.warranties, warranty],
          }
          return pushEvent(
            updated,
            {
              kind: 'warranty_added',
              payload: { provider: warranty.provider, kind: warranty.kind },
            },
            actor,
          )
        }),
      )
    },
    [actor],
  )

  const updateWarranty = useCallback<AssetStoreValue['updateWarranty']>(
    (assetId, warrantyId, patch) => {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? {
                ...a,
                warranties: a.warranties.map((w) =>
                  w.id === warrantyId ? { ...w, ...patch } : w,
                ),
              }
            : a,
        ),
      )
    },
    [],
  )

  const deleteWarranty = useCallback<AssetStoreValue['deleteWarranty']>(
    (assetId, warrantyId) => {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? {
                ...a,
                warranties: a.warranties.filter((w) => w.id !== warrantyId),
              }
            : a,
        ),
      )
    },
    [],
  )

  const addCheck = useCallback<AssetStoreValue['addCheck']>(
    (assetId, input) => {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? {
                ...a,
                recurringChecks: [
                  ...a.recurringChecks,
                  { ...input, id: shortId('rc') },
                ],
              }
            : a,
        ),
      )
    },
    [],
  )

  const updateCheck = useCallback<AssetStoreValue['updateCheck']>(
    (assetId, checkId, patch) => {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? {
                ...a,
                recurringChecks: a.recurringChecks.map((c) =>
                  c.id === checkId ? { ...c, ...patch } : c,
                ),
              }
            : a,
        ),
      )
    },
    [],
  )

  const deleteCheck = useCallback<AssetStoreValue['deleteCheck']>(
    (assetId, checkId) => {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? {
                ...a,
                recurringChecks: a.recurringChecks.filter(
                  (c) => c.id !== checkId,
                ),
              }
            : a,
        ),
      )
    },
    [],
  )

  // Completing a check stamps lastCompletedAt to today and rolls nextDueAt
  // forward by intervalMonths.
  const completeCheck = useCallback<AssetStoreValue['completeCheck']>(
    (assetId, checkId) => {
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id !== assetId) return a
          const today = new Date()
          const todayIso = today.toISOString().slice(0, 10)
          return {
            ...a,
            recurringChecks: a.recurringChecks.map((c) => {
              if (c.id !== checkId) return c
              const next = new Date(today)
              next.setMonth(next.getMonth() + c.intervalMonths)
              return {
                ...c,
                lastCompletedAt: todayIso,
                nextDueAt: next.toISOString().slice(0, 10),
              }
            }),
          }
        }),
      )
    },
    [],
  )

  const assign = useCallback<AssetStoreValue['assign']>(
    (assetId, input) => {
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id !== assetId) return a
          const newAssignment: AssetAssignment = {
            ...input,
            id: shortId('asg'),
          }
          // End any active assignment first.
          const closedHistory: AssetAssignment[] = a.assignments.map((existing) =>
            existing.returnedAt
              ? existing
              : { ...existing, returnedAt: input.assignedAt },
          )
          const updated: Asset = {
            ...a,
            currentAssignment: newAssignment,
            assignments: [...closedHistory, newAssignment],
          }
          return pushEvent(
            updated,
            {
              kind: 'assigned',
              payload: { assignee: newAssignment.assigneeName },
              notes: input.notes,
            },
            actor,
          )
        }),
      )
    },
    [actor],
  )

  const returnAssignment = useCallback<AssetStoreValue['returnAssignment']>(
    (assetId, notes) => {
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id !== assetId) return a
          if (!a.currentAssignment) return a
          const today = new Date().toISOString().slice(0, 10)
          const returnedAssignment: AssetAssignment = {
            ...a.currentAssignment,
            returnedAt: today,
          }
          const updated: Asset = {
            ...a,
            currentAssignment: undefined,
            assignments: a.assignments.map((existing) =>
              existing.id === returnedAssignment.id
                ? returnedAssignment
                : existing,
            ),
          }
          return pushEvent(
            updated,
            {
              kind: 'unassigned',
              payload: { from: returnedAssignment.assigneeName },
              notes,
            },
            actor,
          )
        }),
      )
    },
    [actor],
  )

  const addNote = useCallback<AssetStoreValue['addNote']>(
    (assetId, note) => {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? pushEvent(a, { kind: 'note', notes: note }, actor)
            : a,
        ),
      )
    },
    [actor],
  )

  const addEvent = useCallback<AssetStoreValue['addEvent']>(
    (assetId, event) => {
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? pushEvent(a, event, actor) : a)),
      )
    },
    [actor],
  )

  const updateSecurity = useCallback<AssetStoreValue['updateSecurity']>(
    (assetId, security: AssetSecurity) => {
      setAssets((prev) =>
        prev.map((a) => {
          if (a.id !== assetId) return a
          return pushEvent(
            { ...a, security },
            { kind: 'note', notes: 'Security & compliance updated' },
            actor,
          )
        }),
      )
    },
    [actor],
  )

  // Suppress eslint exhaustive-deps for completeness — every store fn is
  // listed below, even though several are stable references via useCallback.
  const value = useMemo<AssetStoreValue>(
    () => ({
      assets,
      getAsset,
      createAsset,
      updateAsset,
      changeState,
      deleteAsset,
      resetToDemo,
      addWarranty,
      updateWarranty,
      deleteWarranty,
      addCheck,
      updateCheck,
      deleteCheck,
      completeCheck,
      assign,
      returnAssignment,
      addNote,
      addEvent,
      updateSecurity,
    }),
    [
      assets,
      getAsset,
      createAsset,
      updateAsset,
      changeState,
      deleteAsset,
      resetToDemo,
      addWarranty,
      updateWarranty,
      deleteWarranty,
      addCheck,
      updateCheck,
      deleteCheck,
      completeCheck,
      assign,
      returnAssignment,
      addNote,
      addEvent,
      updateSecurity,
    ],
  )

  return (
    <AssetStoreContext.Provider value={value}>
      {children}
    </AssetStoreContext.Provider>
  )
}
