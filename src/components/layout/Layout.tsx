import { Outlet } from 'react-router-dom'
import { ToastProvider } from '@/components/ui'
import Header from './Header'

export default function Layout() {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          <Outlet />
        </main>
        <footer className="border-t border-border py-4 text-center text-[12px] text-muted-foreground">
          Favicon Generator — all processing runs locally in your browser, nothing is uploaded.
        </footer>
      </div>
    </ToastProvider>
  )
}
