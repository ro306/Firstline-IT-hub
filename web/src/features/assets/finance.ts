import { getCurrentLocale, LOCALE_TAG } from '@/lib/i18n/i18nContext'
import type { Asset, Money } from './types'

function currentTag(): string {
  return LOCALE_TAG[getCurrentLocale()]
}

export function formatMoney(money: Money): string {
  return new Intl.NumberFormat(currentTag(), {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amount)
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat(currentTag(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(currentTag(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function monthsBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso)
  const to = new Date(toIso)
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()) +
    (to.getDate() >= from.getDate() ? 0 : -1)
  )
}

export type DepreciationSnapshot = {
  ageMonths: number
  ageMonthsCapped: number
  bookValue: Money
  depreciated: Money
  percentDepreciated: number
  fullyDepreciated: boolean
}

export function computeDepreciation(
  asset: Asset,
  at: Date = new Date(),
): DepreciationSnapshot | null {
  if (!asset.depreciation || asset.depreciation.method === 'none') return null
  const { method, usefulLifeMonths, residualValue } = asset.depreciation
  const purchase = asset.purchase.price
  const ageMonths = Math.max(
    0,
    monthsBetween(asset.purchase.purchaseDate, at.toISOString()),
  )
  const ageMonthsCapped = Math.min(ageMonths, usefulLifeMonths)

  let bookAmount: number
  if (method === 'straight_line') {
    const totalDepreciable = purchase.amount - residualValue.amount
    const monthly = totalDepreciable / usefulLifeMonths
    bookAmount = purchase.amount - monthly * ageMonthsCapped
  } else {
    // declining_balance: 2x straight-line rate, capped at residual.
    const rate = 2 / usefulLifeMonths
    bookAmount = purchase.amount
    for (let i = 0; i < ageMonthsCapped; i++) {
      bookAmount = Math.max(residualValue.amount, bookAmount * (1 - rate))
    }
  }

  bookAmount = Math.max(residualValue.amount, bookAmount)
  const depreciatedAmount = purchase.amount - bookAmount
  const percent =
    purchase.amount > 0 ? (depreciatedAmount / purchase.amount) * 100 : 0

  return {
    ageMonths,
    ageMonthsCapped,
    bookValue: { amount: Math.round(bookAmount), currency: purchase.currency },
    depreciated: {
      amount: Math.round(depreciatedAmount),
      currency: purchase.currency,
    },
    percentDepreciated: Math.round(percent),
    fullyDepreciated: ageMonths >= usefulLifeMonths,
  }
}

export function daysUntil(iso: string, from: Date = new Date()): number {
  const target = new Date(iso)
  return Math.ceil((target.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
}
