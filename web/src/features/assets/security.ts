import type { Asset, ComplianceStatus, PatchStatus } from './types'

export const COMPLIANCE_STATUSES: ComplianceStatus[] = [
  'compliant',
  'non_compliant',
  'exempt',
  'unknown',
]

export const PATCH_STATUSES: PatchStatus[] = [
  'up_to_date',
  'outdated',
  'unknown',
]

export const FRAMEWORK_OPTIONS = ['GDPR', 'ISO27001', 'NIS2'] as const

export function complianceStatusKey(s: ComplianceStatus): string {
  return `compliance_status.${s}`
}

export function patchStatusKey(s: PatchStatus): string {
  return `patch_status.${s}`
}

// Dark-mode badge palette, matching the SeverityBadge convention
// (bg-*-950/40 text-*-300 ring-*-600/20).
export const COMPLIANCE_BADGE: Record<ComplianceStatus, string> = {
  compliant: 'bg-emerald-950/40 text-emerald-300 ring-emerald-600/20',
  non_compliant: 'bg-rose-950/40 text-rose-300 ring-rose-600/20',
  exempt: 'bg-slate-800 text-slate-300 ring-slate-500/20',
  unknown: 'bg-slate-800 text-slate-500 ring-slate-500/20',
}

export const PATCH_BADGE: Record<PatchStatus, string> = {
  up_to_date: 'bg-emerald-950/40 text-emerald-300 ring-emerald-600/20',
  outdated: 'bg-amber-950/40 text-amber-300 ring-amber-600/20',
  unknown: 'bg-slate-800 text-slate-500 ring-slate-500/20',
}

// Effective compliance status — falls back to 'unknown' when no security
// record (or no explicit status) exists.
export function deriveComplianceStatus(asset: Asset): ComplianceStatus {
  return asset.security?.complianceStatus ?? 'unknown'
}

export function isNonCompliant(asset: Asset): boolean {
  return deriveComplianceStatus(asset) === 'non_compliant'
}
