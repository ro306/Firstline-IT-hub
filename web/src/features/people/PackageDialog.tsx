import { useMemo, useState } from 'react'
import { Plus, Trash2, Boxes, KeyRound, Pencil } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useLicensesStore } from '@/features/licenses/useLicensesStore'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { LicenseDialog } from '@/features/licenses/LicenseDialog'
import { usePackagesStore } from './usePackagesStore'
import type { AssetCategory } from '@/features/assets/types'
import type { License } from '@/features/licenses/types'
import type { OnboardingPackage, PackageItem } from './types'

const inputCls =
  'w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none'

const CATEGORIES: AssetCategory[] = [
  'laptop',
  'desktop',
  'monitor',
  'phone',
  'tablet',
  'peripheral',
  'server',
  'network',
  'other',
]

export function PackageDialog({
  pkg,
  onClose,
}: {
  pkg?: OnboardingPackage
  onClose: () => void
}) {
  const { t } = useTranslation()
  const store = usePackagesStore()
  const { licenses } = useLicensesStore()
  const { assets } = useAssetStore()
  const editing = Boolean(pkg)

  // Distinct model names per category, taken from current inventory so the
  // dropdown reflects what's actually available to onboard against.
  const modelsByCategory = useMemo(() => {
    const map = new Map<AssetCategory, string[]>()
    for (const a of assets) {
      const list = map.get(a.category) ?? []
      if (!list.includes(a.name)) list.push(a.name)
      map.set(a.category, list)
    }
    for (const [k, v] of map) map.set(k, v.sort())
    return map
  }, [assets])

  const [name, setName] = useState(pkg?.name ?? '')
  const [description, setDescription] = useState(pkg?.description ?? '')
  const [items, setItems] = useState<PackageItem[]>(pkg?.items ?? [])
  const [error, setError] = useState('')
  // Inline license editor — `newLicenseFor` carries the row index to auto-fill
  // with the newly created license id once it's saved.
  const [editingLicense, setEditingLicense] = useState<License | null>(null)
  const [creatingLicenseFor, setCreatingLicenseFor] = useState<number | null>(
    null,
  )

  function addAssetItem() {
    setItems((prev) => [
      ...prev,
      { type: 'asset_category', category: 'laptop' },
    ])
  }

  function addLicenseItem() {
    const first = licenses[0]?.id ?? ''
    setItems((prev) => [...prev, { type: 'license', licenseId: first }])
  }

  function updateItem(idx: number, patch: Partial<PackageItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? ({ ...it, ...patch } as PackageItem) : it)),
    )
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function save() {
    if (!name.trim()) {
      setError(t('package_form.validation.name_required'))
      return
    }
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      items,
    }
    if (pkg) {
      store.updatePackage(pkg.id, payload)
    } else {
      store.createPackage(payload)
    }
    onClose()
  }

  return (
    <>
    <Modal
      open={true}
      onClose={onClose}
      title={
        editing
          ? t('package_form.edit_title')
          : t('package_form.create_title')
      }
      description={t('package_form.description')}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t('common.save')}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-300">
            {t('package_form.field.name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('package_form.field.name_placeholder')}
            className={`mt-1 ${inputCls}`}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-300">
            {t('package_form.field.description')}
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('package_form.field.description_placeholder')}
            className={`mt-1 ${inputCls}`}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">
              {t('package_form.items_title')}
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={addAssetItem}
                className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800/50"
              >
                <Boxes className="h-3 w-3" />
                {t('package_form.add_asset')}
              </button>
              <button
                type="button"
                onClick={addLicenseItem}
                className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800/50"
              >
                <KeyRound className="h-3 w-3" />
                {t('package_form.add_license')}
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-800 px-3 py-4 text-center text-xs text-slate-500">
              {t('package_form.no_items')}
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((it, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 p-2"
                >
                  {it.type === 'asset_category' ? (
                    <>
                      <Boxes className="mt-2 h-4 w-4 flex-shrink-0 text-emerald-400" />
                      <div className="grid flex-1 grid-cols-[1fr_1fr_64px] gap-1.5">
                        <select
                          value={it.category}
                          onChange={(e) => {
                            const nextCategory = e.target.value as AssetCategory
                            updateItem(idx, {
                              type: 'asset_category',
                              category: nextCategory,
                              count: it.count,
                              // clear model when changing category so we don't
                              // keep a stale filter that no longer matches
                              model: undefined,
                            })
                          }}
                          className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
                          aria-label={t('package_form.field.category')}
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {t(`asset.category.${c}`)}
                            </option>
                          ))}
                        </select>
                        <select
                          value={it.model ?? ''}
                          onChange={(e) =>
                            updateItem(idx, {
                              type: 'asset_category',
                              category: it.category,
                              count: it.count,
                              model: e.target.value || undefined,
                            })
                          }
                          className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
                          aria-label={t('package_form.field.model')}
                        >
                          <option value="">
                            {t('package_form.model_any')}
                          </option>
                          {(modelsByCategory.get(it.category) ?? []).map(
                            (m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ),
                          )}
                        </select>
                        <input
                          type="number"
                          min={1}
                          value={it.count ?? 1}
                          onChange={(e) =>
                            updateItem(idx, {
                              type: 'asset_category',
                              category: it.category,
                              count: Math.max(1, Number(e.target.value) || 1),
                              model: it.model,
                            })
                          }
                          className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-right text-sm tabular-nums focus:border-brand-500 focus:outline-none"
                          aria-label={t('package_form.field.count')}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4 flex-shrink-0 text-brand-400" />
                      <select
                        value={it.licenseId}
                        onChange={(e) =>
                          updateItem(idx, {
                            type: 'license',
                            licenseId: e.target.value,
                          })
                        }
                        className="flex-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none"
                      >
                        {licenses.length === 0 ? (
                          <option value="">
                            {t('package_form.no_licenses')}
                          </option>
                        ) : (
                          licenses.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const lic = licenses.find((l) => l.id === it.licenseId)
                          if (lic) setEditingLicense(lic)
                        }}
                        disabled={!it.licenseId}
                        aria-label={t('package_form.edit_license')}
                        title={t('package_form.edit_license')}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreatingLicenseFor(idx)}
                        aria-label={t('package_form.new_license')}
                        title={t('package_form.new_license')}
                        className="rounded-md p-1.5 text-emerald-400 hover:bg-emerald-950/40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    aria-label={t('asset_actions.delete')}
                    className="rounded-md p-1.5 text-rose-500 hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {items.length === 0 && (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={addAssetItem}
                className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800/50"
              >
                <Plus className="h-3 w-3" />
                {t('package_form.add_asset')}
              </button>
              <button
                type="button"
                onClick={addLicenseItem}
                className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800/50"
              >
                <Plus className="h-3 w-3" />
                {t('package_form.add_license')}
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    </Modal>
    {editingLicense && (
      <LicenseDialog
        license={editingLicense}
        onClose={() => setEditingLicense(null)}
      />
    )}
    {creatingLicenseFor !== null && (
      <LicenseDialog
        onClose={() => setCreatingLicenseFor(null)}
        onSaved={(lic) => {
          const targetIdx = creatingLicenseFor
          if (targetIdx !== null) {
            setItems((prev) =>
              prev.map((it, i) =>
                i === targetIdx
                  ? { type: 'license', licenseId: lic.id }
                  : it,
              ),
            )
          }
        }}
      />
    )}
    </>
  )
}
