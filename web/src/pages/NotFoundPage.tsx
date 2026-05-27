import { Link } from 'react-router-dom'
import { useTranslation } from '@/lib/i18n/useTranslation'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-brand-400">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-100">
        {t('not_found.title')}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {t('not_found.description')}
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        {t('not_found.back_link')}
      </Link>
    </div>
  )
}
