import type { Asset, AssetCategory } from '@/features/assets/types'
import type { License } from '@/features/licenses/types'
import type { OnboardingPackage, PackageItem, Person } from './types'

// What an onboarding execution would do, computed up-front so we can preview
// it before mutating anything. Each row is one PackageItem resolved to either
// a concrete asset, license seat, or a "no match" note.
export type ResolvedPackageItem =
  | { item: PackageItem; kind: 'asset'; asset: Asset }
  | { item: PackageItem; kind: 'asset_missing'; category: AssetCategory }
  | { item: PackageItem; kind: 'license'; license: License }
  | { item: PackageItem; kind: 'license_full'; license: License }
  | { item: PackageItem; kind: 'license_missing'; licenseId: string }

const TAKEABLE = new Set(['in_stock', 'requested', 'ordered'])

// Best-effort resolver: greedy first-available match per category. Multiple
// items of the same category are handled by tracking consumed asset ids so we
// don't double-assign the same machine.
export function resolveOnboarding(
  pkg: OnboardingPackage,
  assets: Asset[],
  licenses: License[],
): ResolvedPackageItem[] {
  const consumed = new Set<string>()
  const out: ResolvedPackageItem[] = []
  for (const item of pkg.items) {
    if (item.type === 'asset_category') {
      const need = item.count ?? 1
      for (let i = 0; i < need; i++) {
        const candidate = assets.find(
          (a) =>
            a.category === item.category &&
            TAKEABLE.has(a.lifecycleState) &&
            !a.currentAssignment &&
            !consumed.has(a.id),
        )
        if (candidate) {
          consumed.add(candidate.id)
          out.push({ item, kind: 'asset', asset: candidate })
        } else {
          out.push({ item, kind: 'asset_missing', category: item.category })
        }
      }
    } else {
      const lic = licenses.find((l) => l.id === item.licenseId)
      if (!lic) {
        out.push({ item, kind: 'license_missing', licenseId: item.licenseId })
      } else if (lic.seatsUsed >= lic.seatsTotal && lic.seatsTotal > 0) {
        out.push({ item, kind: 'license_full', license: lic })
      } else {
        out.push({ item, kind: 'license', license: lic })
      }
    }
  }
  return out
}

// Summary stats for the preview UI.
export function summarizeResolution(resolved: ResolvedPackageItem[]) {
  const assets = resolved.filter((r) => r.kind === 'asset').length
  const licenses = resolved.filter((r) => r.kind === 'license').length
  const missing = resolved.filter(
    (r) =>
      r.kind === 'asset_missing' ||
      r.kind === 'license_full' ||
      r.kind === 'license_missing',
  ).length
  return { assets, licenses, missing }
}

// Find all assets currently assigned to the given person (by name match).
// Names are the only persistent link we have until people get IDs on
// assignments — keep this lookup tolerant of trailing whitespace.
export function assetsAssignedTo(person: Person, assets: Asset[]): Asset[] {
  const target = person.name.trim().toLowerCase()
  return assets.filter(
    (a) => a.currentAssignment?.assigneeName.trim().toLowerCase() === target,
  )
}
