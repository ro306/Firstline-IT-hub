import type { AssetLifecycleState, AssetLifecycleEventKind } from './types'

type StateConfig = {
  label: string
  // Tailwind classes for the badge background/text/ring.
  badge: string
  // Stage in the canonical pipeline (used by the stepper). null = off-flow.
  stage: number | null
  terminal: boolean
}

export const LIFECYCLE_STATE_CONFIG: Record<AssetLifecycleState, StateConfig> =
  {
    requested: {
      label: 'Requested',
      badge: 'bg-violet-50 text-violet-700 ring-violet-600/20',
      stage: 0,
      terminal: false,
    },
    ordered: {
      label: 'Ordered',
      badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
      stage: 1,
      terminal: false,
    },
    in_stock: {
      label: 'In stock',
      badge: 'bg-sky-50 text-sky-700 ring-sky-600/20',
      stage: 2,
      terminal: false,
    },
    assigned: {
      label: 'Assigned',
      badge: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
      stage: 3,
      terminal: false,
    },
    in_use: {
      label: 'In use',
      badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      stage: 4,
      terminal: false,
    },
    in_maintenance: {
      label: 'Maintenance',
      badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      stage: 4,
      terminal: false,
    },
    leased_in: {
      label: 'Leased in',
      badge: 'bg-teal-50 text-teal-700 ring-teal-600/20',
      stage: 4,
      terminal: false,
    },
    leased_out: {
      label: 'Leased out',
      badge: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20',
      stage: 4,
      terminal: false,
    },
    retired: {
      label: 'Retired',
      badge: 'bg-slate-100 text-slate-700 ring-slate-500/20',
      stage: 5,
      terminal: false,
    },
    disposed: {
      label: 'Disposed',
      badge: 'bg-zinc-100 text-zinc-600 ring-zinc-500/20',
      stage: 6,
      terminal: true,
    },
    returned_to_vendor: {
      label: 'Returned to vendor',
      badge: 'bg-stone-100 text-stone-700 ring-stone-500/20',
      stage: 6,
      terminal: true,
    },
    lost: {
      label: 'Lost',
      badge: 'bg-rose-50 text-rose-700 ring-rose-600/20',
      stage: null,
      terminal: true,
    },
    stolen: {
      label: 'Stolen',
      badge: 'bg-red-50 text-red-700 ring-red-600/20',
      stage: null,
      terminal: true,
    },
  }

// Canonical pipeline shown in the stepper. Off-flow states (lost/stolen) are
// rendered separately as exception badges.
export const PIPELINE_STAGES: {
  key: string
  label: string
  states: AssetLifecycleState[]
}[] = [
  { key: 'requested', label: 'Requested', states: ['requested'] },
  { key: 'ordered', label: 'Ordered', states: ['ordered'] },
  { key: 'in_stock', label: 'In stock', states: ['in_stock'] },
  { key: 'assigned', label: 'Assigned', states: ['assigned'] },
  {
    key: 'in_use',
    label: 'In use',
    states: ['in_use', 'in_maintenance', 'leased_in', 'leased_out'],
  },
  { key: 'retired', label: 'Retired', states: ['retired'] },
  {
    key: 'disposed',
    label: 'End of life',
    states: ['disposed', 'returned_to_vendor'],
  },
]

export function getCurrentStageIndex(state: AssetLifecycleState): number {
  const cfg = LIFECYCLE_STATE_CONFIG[state]
  return cfg.stage ?? -1
}

// Allowed forward/sideways transitions. Used to populate the "Change state"
// dropdown in the UI. Backwards transitions (e.g. mistakes) are handled by an
// admin override, not part of this map.
export const ALLOWED_TRANSITIONS: Record<
  AssetLifecycleState,
  AssetLifecycleState[]
> = {
  requested: ['ordered', 'in_stock'],
  ordered: ['in_stock', 'returned_to_vendor'],
  in_stock: ['assigned', 'in_use', 'leased_out', 'retired', 'lost', 'stolen'],
  assigned: ['in_use', 'in_stock', 'in_maintenance', 'lost', 'stolen'],
  in_use: ['in_maintenance', 'in_stock', 'retired', 'lost', 'stolen'],
  in_maintenance: ['in_use', 'in_stock', 'retired'],
  leased_in: ['in_use', 'returned_to_vendor', 'in_maintenance'],
  leased_out: ['in_stock', 'in_use', 'in_maintenance'],
  retired: ['disposed', 'returned_to_vendor'],
  disposed: [],
  returned_to_vendor: [],
  lost: ['in_stock'],
  stolen: ['in_stock', 'disposed'],
}

export const EVENT_KIND_LABEL: Record<AssetLifecycleEventKind, string> = {
  state_changed: 'State changed',
  assigned: 'Assigned',
  unassigned: 'Unassigned',
  moved: 'Moved',
  maintenance_started: 'Maintenance started',
  maintenance_completed: 'Maintenance completed',
  warranty_added: 'Warranty added',
  warranty_expired: 'Warranty expired',
  lease_started: 'Lease started',
  lease_renewed: 'Lease renewed',
  lease_ended: 'Lease ended',
  disposed: 'Disposed',
  note: 'Note',
}
