import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
