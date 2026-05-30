export type DepartmentBudget = {
  id: string
  department: string
  annualBudget: number
  currency: 'DKK' | 'EUR' | 'USD'
  notes?: string
}
