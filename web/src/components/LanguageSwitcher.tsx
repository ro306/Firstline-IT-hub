import { Languages } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { cn } from '@/lib/cn'
import type { Language } from '@/lib/i18n/i18nContext'

export function LanguageSwitcher() {
  const { lang, setLang, t } = useTranslation()

  function pill(target: Language, label: string) {
    return (
      <button
        type="button"
        onClick={() => setLang(target)}
        className={cn(
          'rounded px-2 py-0.5 text-xs font-medium transition-colors',
          lang === target
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700',
        )}
        aria-pressed={lang === target}
      >
        {label}
      </button>
    )
  }

  return (
    <div
      className="flex items-center gap-1 rounded-md bg-slate-100 p-0.5"
      role="group"
      aria-label={t('language.switcher_label')}
    >
      <Languages className="ml-1 h-4 w-4 text-slate-400" aria-hidden="true" />
      {pill('da', 'DA')}
      {pill('en', 'EN')}
    </div>
  )
}
