import { PageHeader } from '@/components/PageHeader'
import { useTranslation } from '@/lib/i18n/useTranslation'

export function PlaceholderPage({
  titleKey,
  descriptionKey,
}: {
  titleKey: string
  descriptionKey: string
}) {
  const { t } = useTranslation()
  return (
    <div>
      <PageHeader title={t(titleKey)} description={t(descriptionKey)} />
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">{t('placeholder.construction')}</p>
      </div>
    </div>
  )
}
