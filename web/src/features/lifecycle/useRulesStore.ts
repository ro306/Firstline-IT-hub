import { useContext } from 'react'
import { RulesStoreContext, type RulesStoreValue } from './rulesStoreContext'

export function useRulesStore(): RulesStoreValue {
  const ctx = useContext(RulesStoreContext)
  if (!ctx) {
    throw new Error('useRulesStore must be used inside <RulesStoreProvider>')
  }
  return ctx
}
