import { daysUntil } from '@/features/assets/finance'
import type {
  Asset,
  AssetWarranty,
  AssetLease,
  RecurringCheck,
} from '@/features/assets/types'
import type {
  ExpirationKind,
  Severity,
  WorkflowRule,
} from './types'

export type ExpirationPeriod = {
  // Stable key used to address alert state and tasks.
  key: string
  assetId: string
  assetName: string
  assetTag: string
  kind: ExpirationKind
  label: string
  // Domain reference — e.g. warranty id, check id. Undefined for lease (one
  // per asset) and depreciation EOL.
  periodId?: string
  endsAt: string
  daysUntil: number
  // Matched against rules to derive severity + actions.
  matchedRules: WorkflowRule[]
  severity: Severity
}

const SEVERITY_ORDER: Severity[] = ['info', 'warning', 'urgent', 'expired']

function severityRank(s: Severity): number {
  return SEVERITY_ORDER.indexOf(s)
}

function maxSeverity(rules: WorkflowRule[], days: number): Severity {
  if (days < 0) return 'expired'
  if (rules.length === 0) return 'info'
  return rules.reduce<Severity>(
    (acc, r) => (severityRank(r.severity) > severityRank(acc) ? r.severity : acc),
    'info',
  )
}

function matchRules(
  rules: WorkflowRule[],
  kind: ExpirationKind,
  days: number,
  warrantyKind?: string,
): WorkflowRule[] {
  return rules.filter((r) => {
    if (!r.enabled) return false
    if (r.appliesTo !== kind) return false
    if (
      kind === 'warranty' &&
      r.warrantyKindFilter &&
      warrantyKind &&
      !r.warrantyKindFilter.includes(warrantyKind)
    ) {
      return false
    }
    // Rule fires when days remaining <= threshold (i.e. we're past the alert
    // point). Negative thresholds mean "fires N days after expiry".
    return days <= r.thresholdDays
  })
}

function warrantyPeriod(
  asset: Asset,
  w: AssetWarranty,
  rules: WorkflowRule[],
  now: Date,
): ExpirationPeriod {
  const days = daysUntil(w.endsAt, now)
  const matched = matchRules(rules, 'warranty', days, w.kind)
  return {
    key: `${asset.id}:warranty:${w.id}`,
    assetId: asset.id,
    assetName: asset.name,
    assetTag: asset.assetTag,
    kind: 'warranty',
    label: `${w.provider} (${w.kind.replace('_', ' ')})`,
    periodId: w.id,
    endsAt: w.endsAt,
    daysUntil: days,
    matchedRules: matched,
    severity: maxSeverity(matched, days),
  }
}

function leasePeriod(
  asset: Asset,
  l: AssetLease,
  rules: WorkflowRule[],
  now: Date,
): ExpirationPeriod {
  const days = daysUntil(l.endsAt, now)
  const matched = matchRules(rules, 'lease', days)
  return {
    key: `${asset.id}:lease:${asset.id}`,
    assetId: asset.id,
    assetName: asset.name,
    assetTag: asset.assetTag,
    kind: 'lease',
    label: `${l.vendor} · ${l.contractRef}`,
    endsAt: l.endsAt,
    daysUntil: days,
    matchedRules: matched,
    severity: maxSeverity(matched, days),
  }
}

function depreciationEolPeriod(
  asset: Asset,
  rules: WorkflowRule[],
  now: Date,
): ExpirationPeriod | null {
  if (!asset.depreciation || asset.depreciation.method === 'none') return null
  const purchaseDate = new Date(asset.purchase.purchaseDate)
  const eol = new Date(purchaseDate)
  eol.setMonth(eol.getMonth() + asset.depreciation.usefulLifeMonths)
  const eolIso = eol.toISOString().slice(0, 10)
  const days = daysUntil(eolIso, now)
  const matched = matchRules(rules, 'depreciation_eol', days)
  return {
    key: `${asset.id}:depreciation_eol:${asset.id}`,
    assetId: asset.id,
    assetName: asset.name,
    assetTag: asset.assetTag,
    kind: 'depreciation_eol',
    label: `End of useful life (${asset.depreciation.usefulLifeMonths}m)`,
    endsAt: eolIso,
    daysUntil: days,
    matchedRules: matched,
    severity: maxSeverity(matched, days),
  }
}

function recurringCheckPeriod(
  asset: Asset,
  c: RecurringCheck,
  rules: WorkflowRule[],
  now: Date,
): ExpirationPeriod {
  const days = daysUntil(c.nextDueAt, now)
  const matched = matchRules(rules, 'recurring_check', days)
  return {
    key: `${asset.id}:recurring_check:${c.id}`,
    assetId: asset.id,
    assetName: asset.name,
    assetTag: asset.assetTag,
    kind: 'recurring_check',
    label: c.label,
    periodId: c.id,
    endsAt: c.nextDueAt,
    daysUntil: days,
    matchedRules: matched,
    severity: maxSeverity(matched, days),
  }
}

const TERMINAL_STATES = new Set(['disposed', 'returned_to_vendor'])

// Build the list of every period across every asset. Terminal-state assets
// (disposed/returned) are skipped — once an asset is gone, its periods no
// longer matter for renewals.
export function computeExpirations(
  assets: Asset[],
  rules: WorkflowRule[],
  now: Date = new Date(),
): ExpirationPeriod[] {
  const out: ExpirationPeriod[] = []
  for (const asset of assets) {
    if (TERMINAL_STATES.has(asset.lifecycleState)) continue
    for (const w of asset.warranties) {
      out.push(warrantyPeriod(asset, w, rules, now))
    }
    if (asset.lease && !asset.lease.returnedAt) {
      out.push(leasePeriod(asset, asset.lease, rules, now))
    }
    const eol = depreciationEolPeriod(asset, rules, now)
    if (eol) out.push(eol)
    for (const c of asset.recurringChecks) {
      out.push(recurringCheckPeriod(asset, c, rules, now))
    }
  }
  return out
}

// "Actionable" = severity >= info AND at least one rule matched.
export function isActionable(p: ExpirationPeriod): boolean {
  return p.matchedRules.length > 0 || p.daysUntil < 0
}

export function kindKey(k: ExpirationKind): string {
  return `renewals.kind.${k}`
}

export function severityKey(s: Severity): string {
  return `renewals.severity.${s}`
}

export const EXPIRATION_KINDS: ExpirationKind[] = [
  'warranty',
  'lease',
  'depreciation_eol',
  'recurring_check',
]

export const SEVERITIES: Severity[] = ['info', 'warning', 'urgent', 'expired']

export const SEVERITY_BADGE: Record<Severity, string> = {
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  urgent: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  expired: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}
