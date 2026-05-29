import type { License } from './types'

export type LicenseCompliance = 'compliant' | 'warning' | 'over'

export const LICENSE_COMPLIANCES: LicenseCompliance[] = [
  'compliant',
  'warning',
  'over',
]

// Software Asset Management status for a single license:
// - over    : more seats used than owned (over-deployed → audit risk)
// - warning : utilization above 90% (running close to the limit)
// - compliant: comfortably within entitlement
export function licenseCompliance(license: License): LicenseCompliance {
  if (license.seatsTotal <= 0) return 'compliant'
  if (license.seatsUsed > license.seatsTotal) return 'over'
  if (license.seatsUsed / license.seatsTotal > 0.9) return 'warning'
  return 'compliant'
}

export function licenseComplianceKey(c: LicenseCompliance): string {
  return `licenses_page.compliance.${c}`
}

export const LICENSE_COMPLIANCE_BADGE: Record<LicenseCompliance, string> = {
  compliant: 'bg-emerald-950/40 text-emerald-300 ring-emerald-600/20',
  warning: 'bg-amber-950/40 text-amber-300 ring-amber-600/20',
  over: 'bg-rose-950/40 text-rose-300 ring-rose-600/20',
}
