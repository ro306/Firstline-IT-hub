import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react'
import { createPortal } from 'react-dom'
import * as motion from 'motion/react-client'
import { AnimatePresence } from 'motion/react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useAssetStore } from '@/features/assets/useAssetStore'
import { StatusBadge } from '@/features/assets/StatusBadge'
import { cn } from '@/lib/cn'

type Props = {
  open: boolean
  onClose: () => void
}

export function SearchDialog({ open, onClose }: Props) {
  return (
    <AnimatePresence>{open && <SearchDialogInner onClose={onClose} />}</AnimatePresence>
  )
}

function SearchDialogInner({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { assets } = useAssetStore()
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return assets.slice(0, 6)
    return assets
      .filter((a) => {
        return (
          a.name.toLowerCase().includes(q) ||
          a.assetTag.toLowerCase().includes(q) ||
          a.serialNumber.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          (a.currentAssignment?.assigneeName.toLowerCase().includes(q) ?? false)
        )
      })
      .slice(0, 10)
  }, [assets, query])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlight((h) => Math.min(h + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlight((h) => Math.max(h - 1, 0))
      } else if (e.key === 'Enter') {
        const item = results[highlight]
        if (item) {
          navigate(`/assets/${item.id}`)
          onClose()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, results, highlight, navigate])

  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-24 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-[0_24px_60px_-15px_rgb(15_23_42_/_0.30)]"
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 4 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-slate-200/70 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setHighlight(0)
            }}
            placeholder={t('header.search_placeholder')}
            autoFocus
            className="flex-1 bg-transparent text-sm placeholder-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label={t('common.close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {!query.trim() && (
            <p className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              {t('header.search_recent')}
            </p>
          )}
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">
              {t('header.search_no_results', { query: query.trim() })}
            </p>
          ) : (
            <ul>
              {results.map((asset, idx) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/assets/${asset.id}`)
                      onClose()
                    }}
                    onMouseEnter={() => setHighlight(idx)}
                    className={cn(
                      'group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                      highlight === idx
                        ? 'bg-brand-50/80 text-brand-900'
                        : 'hover:bg-slate-50',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{asset.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        <span className="font-mono">{asset.assetTag}</span>
                        <span className="mx-1.5 text-slate-300">·</span>
                        {asset.location}
                        {asset.currentAssignment && (
                          <>
                            <span className="mx-1.5 text-slate-300">·</span>
                            {asset.currentAssignment.assigneeName}
                          </>
                        )}
                      </p>
                    </div>
                    <StatusBadge state={asset.lifecycleState} />
                    <ArrowRight
                      className={cn(
                        'h-3.5 w-3.5 transition-all',
                        highlight === idx
                          ? 'translate-x-0 text-brand-600 opacity-100'
                          : '-translate-x-1 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
                      )}
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200/70 bg-slate-50/60 px-4 py-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px]">↑↓</kbd>
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px]">
                <CornerDownLeft className="inline h-2.5 w-2.5" />
              </kbd>
              open
            </span>
          </div>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px]">esc</kbd>
            close
          </span>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
