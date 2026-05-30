import { createContext } from 'react'
import type { DepartmentBudget } from './types'

export type BudgetsStoreValue = {
  budgets: DepartmentBudget[]
  getBudget: (department: string) => DepartmentBudget | undefined
  setBudget: (
    department: string,
    annualBudget: number,
    currency?: 'DKK' | 'EUR' | 'USD',
  ) => void
  deleteBudget: (id: string) => void
  resetToDemo: () => void
}

export const BudgetsStoreContext = createContext<BudgetsStoreValue | null>(null)
