import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MOCK_BUDGETS } from './mockBudgets'
import {
  BudgetsStoreContext,
  type BudgetsStoreValue,
} from './budgetsStoreContext'
import type { DepartmentBudget } from './types'

const STORAGE_KEY = 'fl-budgets-v1'

function load(): DepartmentBudget[] {
  if (typeof window === 'undefined') return MOCK_BUDGETS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return MOCK_BUDGETS
    const parsed = JSON.parse(raw) as DepartmentBudget[]
    return Array.isArray(parsed) ? parsed : MOCK_BUDGETS
  } catch {
    return MOCK_BUDGETS
  }
}

function save(items: DepartmentBudget[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

function newId(): string {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function BudgetsStoreProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<DepartmentBudget[]>(() => load())

  useEffect(() => {
    save(budgets)
  }, [budgets])

  const getBudget = useCallback(
    (department: string) =>
      budgets.find(
        (b) => b.department.toLowerCase() === department.toLowerCase(),
      ),
    [budgets],
  )

  // Upsert by department name — one budget per department.
  const setBudget = useCallback<BudgetsStoreValue['setBudget']>(
    (department, annualBudget, currency = 'DKK') => {
      setBudgets((prev) => {
        const existing = prev.find(
          (b) => b.department.toLowerCase() === department.toLowerCase(),
        )
        if (existing) {
          return prev.map((b) =>
            b.id === existing.id ? { ...b, annualBudget, currency } : b,
          )
        }
        return [
          ...prev,
          { id: newId(), department, annualBudget, currency },
        ]
      })
    },
    [],
  )

  const deleteBudget = useCallback<BudgetsStoreValue['deleteBudget']>((id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const resetToDemo = useCallback(() => setBudgets(MOCK_BUDGETS), [])

  const value = useMemo<BudgetsStoreValue>(
    () => ({ budgets, getBudget, setBudget, deleteBudget, resetToDemo }),
    [budgets, getBudget, setBudget, deleteBudget, resetToDemo],
  )

  return (
    <BudgetsStoreContext.Provider value={value}>
      {children}
    </BudgetsStoreContext.Provider>
  )
}
