import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-7xl font-bold text-slate-200 dark:text-slate-700">404</p>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Page not found</h1>
      <p className="text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <Button variant="outline">Go home</Button>
      </Link>
    </div>
  )
}
