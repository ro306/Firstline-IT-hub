import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useAssetStore } from './useAssetStore'
import { lifecycleStateKey } from './lifecycle'
import type { NewAssetInput } from './assetStoreContext'
import type {
  Asset,
  AssetCategory,
  AssetLifecycleState,
  Ownership,
} from './types'

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

const OWNERSHIPS: Ownership[] = ['owned', 'leased_in', 'leased_out']

// States allowed as the *initial* state when creating an asset. We restrict
// it to early-pipeline states so users don't accidentally seed an asset in,
// say, "disposed".
const INITIAL_STATES: AssetLifecycleState[] = [
  'requested',
  'ordered',
  'in_stock',
  'leased_in',
]

const CURRENCIES: Array<'DKK' | 'EUR' | 'USD'> = ['DKK', 'EUR', 'USD']

type Props = {
  onClose: () => void
  // If asset is passed, dialog is in edit mode; otherwise create.
  asset?: Asset
}

type FormErrors = Partial<Record<keyof NewAssetInput, string>>

const EMPTY: NewAssetInput = {
  name: '',
  assetTag: '',
  serialNumber: '',
  category: 'laptop',
  location: '',
  ownership: 'owned',
  lifecycleState: 'in_stock',
  vendor: '',
  purchaseOrder: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  priceAmount: 0,
  priceCurrency: 'DKK',
}

function assetToForm(asset: Asset): NewAssetInput {
  return {
    name: asset.name,
    assetTag: asset.assetTag,
    serialNumber: asset.serialNumber,
    category: asset.category,
    location: asset.location,
    ownership: asset.ownership,
    lifecycleState: asset.lifecycleState,
    vendor: asset.purchase.vendor,
    purchaseOrder: asset.purchase.purchaseOrder ?? '',
    purchaseDate: asset.purchase.purchaseDate,
    priceAmount: asset.purchase.price.amount,
    priceCurrency: asset.purchase.price.currency,
  }
}

export function AssetFormDialog({ onClose, asset }: Props) {
  const { t } = useTranslation()
  const store = useAssetStore()
  const editing = !!asset

  const [form, setForm] = useState<NewAssetInput>(() =>
    asset ? assetToForm(asset) : EMPTY,
  )
  const [errors, setErrors] = useState<FormErrors>({})

  function set<K extends keyof NewAssetInput>(
    key: K,
    value: NewAssetInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate(): boolean {
    const next: FormErrors = {}
    const req = t('asset_form.validation.required')
    if (!form.name.trim()) next.name = req
    if (!form.assetTag.trim()) next.assetTag = req
    if (!form.serialNumber.trim()) next.serialNumber = req
    if (!form.location.trim()) next.location = req
    if (!form.vendor.trim()) next.vendor = req
    if (!form.purchaseDate) next.purchaseDate = req
    if (form.priceAmount < 0)
      next.priceAmount = t('asset_form.validation.positive')

    // Tag uniqueness — ignore current asset when editing.
    const tagOwner = store.assets.find(
      (a) => a.assetTag === form.assetTag.trim() && a.id !== asset?.id,
    )
    if (tagOwner) next.assetTag = t('asset_form.validation.tag_in_use')

    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    const trimmed: NewAssetInput = {
      ...form,
      name: form.name.trim(),
      assetTag: form.assetTag.trim(),
      serialNumber: form.serialNumber.trim(),
      location: form.location.trim(),
      vendor: form.vendor.trim(),
      purchaseOrder: form.purchaseOrder?.trim() || undefined,
    }
    if (editing && asset) {
      store.updateAsset(asset.id, trimmed)
    } else {
      store.createAsset(trimmed)
    }
    onClose()
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={
        editing ? t('asset_form.edit_title') : t('asset_form.create_title')
      }
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {editing
              ? t('asset_form.save_submit')
              : t('asset_form.create_submit')}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <Section title={t('asset_form.section_identity')}>
          <Row>
            <Field
              label={t('asset_form.field.name')}
              error={errors.name}
              className="col-span-2"
            >
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder={t('asset_form.field.name_placeholder')}
                className={inputCls(!!errors.name)}
              />
            </Field>
          </Row>
          <Row>
            <Field
              label={t('asset_form.field.asset_tag')}
              error={errors.assetTag}
            >
              <input
                type="text"
                value={form.assetTag}
                onChange={(e) => set('assetTag', e.target.value)}
                placeholder={t('asset_form.field.asset_tag_placeholder')}
                className={inputCls(!!errors.assetTag)}
              />
            </Field>
            <Field
              label={t('asset_form.field.serial_number')}
              error={errors.serialNumber}
            >
              <input
                type="text"
                value={form.serialNumber}
                onChange={(e) => set('serialNumber', e.target.value)}
                placeholder={t('asset_form.field.serial_placeholder')}
                className={inputCls(!!errors.serialNumber)}
              />
            </Field>
          </Row>
          <Row>
            <Field label={t('asset_form.field.category')}>
              <select
                value={form.category}
                onChange={(e) =>
                  set('category', e.target.value as AssetCategory)
                }
                className={inputCls(false)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`asset.category.${c}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={t('asset_form.field.location')}
              error={errors.location}
            >
              <input
                type="text"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder={t('asset_form.field.location_placeholder')}
                className={inputCls(!!errors.location)}
              />
            </Field>
          </Row>
        </Section>

        <Section title={t('asset_form.section_status')}>
          <Row>
            <Field label={t('asset_form.field.ownership')}>
              <select
                value={form.ownership}
                onChange={(e) =>
                  set('ownership', e.target.value as Ownership)
                }
                className={inputCls(false)}
              >
                {OWNERSHIPS.map((o) => (
                  <option key={o} value={o}>
                    {o === 'owned'
                      ? t('asset.ownership.owned')
                      : o === 'leased_in'
                        ? t('asset.finance.lease_in')
                        : t('asset.finance.lease_out')}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('asset_form.field.lifecycle_state')}>
              <select
                value={form.lifecycleState}
                onChange={(e) =>
                  set(
                    'lifecycleState',
                    e.target.value as AssetLifecycleState,
                  )
                }
                className={inputCls(false)}
              >
                {(editing
                  ? ([form.lifecycleState] as AssetLifecycleState[])
                  : INITIAL_STATES
                ).map((s) => (
                  <option key={s} value={s}>
                    {t(lifecycleStateKey(s))}
                  </option>
                ))}
              </select>
            </Field>
          </Row>
        </Section>

        <Section title={t('asset_form.section_purchase')}>
          <Row>
            <Field
              label={t('asset_form.field.vendor')}
              error={errors.vendor}
            >
              <input
                type="text"
                value={form.vendor}
                onChange={(e) => set('vendor', e.target.value)}
                placeholder={t('asset_form.field.vendor_placeholder')}
                className={inputCls(!!errors.vendor)}
              />
            </Field>
            <Field label={t('asset_form.field.purchase_order')}>
              <input
                type="text"
                value={form.purchaseOrder ?? ''}
                onChange={(e) => set('purchaseOrder', e.target.value)}
                placeholder={t('asset_form.field.purchase_order_placeholder')}
                className={inputCls(false)}
              />
            </Field>
          </Row>
          <Row>
            <Field
              label={t('asset_form.field.purchase_date')}
              error={errors.purchaseDate}
            >
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => set('purchaseDate', e.target.value)}
                className={inputCls(!!errors.purchaseDate)}
              />
            </Field>
            <Field
              label={t('asset_form.field.price')}
              error={errors.priceAmount}
            >
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={form.priceAmount}
                  onChange={(e) =>
                    set('priceAmount', Number(e.target.value))
                  }
                  className={inputCls(!!errors.priceAmount)}
                />
                <select
                  value={form.priceCurrency}
                  onChange={(e) =>
                    set(
                      'priceCurrency',
                      e.target.value as NewAssetInput['priceCurrency'],
                    )
                  }
                  className="rounded-md border border-slate-800 px-2 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
          </Row>
        </Section>
      </div>
    </Modal>
  )
}

function inputCls(hasError: boolean): string {
  return [
    'mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none',
    hasError
      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
      : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500/20',
  ].join(' ')
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-300">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  )
}
