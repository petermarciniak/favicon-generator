import { Outlet } from 'react-router-dom'
import { ToastProvider } from '@/components/ui'
import Header from './Header'

export default function Layout() {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 dark:border-slate-700">
          Favicon Generator — generate icons for every platform
        </footer>
      </div>
    </ToastProvider>
  )
}
