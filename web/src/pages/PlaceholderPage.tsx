import { PageHeader } from '@/components/PageHeader'

export function PlaceholderPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">
          This module is not built yet. Coming soon.
        </p>
      </div>
    </div>
  )
}
