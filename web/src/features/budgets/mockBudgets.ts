import type { DepartmentBudget } from './types'

export const MOCK_BUDGETS: DepartmentBudget[] = [
  {
    id: 'b-eng',
    department: 'Engineering',
    annualBudget: 350000,
    currency: 'DKK',
  },
  { id: 'b-mkt', department: 'Marketing', annualBudget: 120000, currency: 'DKK' },
  { id: 'b-sales', department: 'Sales', annualBudget: 180000, currency: 'DKK' },
  {
    id: 'b-infra',
    department: 'Infra Team',
    annualBudget: 600000,
    currency: 'DKK',
  },
]
