import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export default function Header() {
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background transition-opacity group-hover:opacity-80">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <rect x="2"  y="2"  width="7" height="7" rx="1.5" fill="currentColor" />
              <rect x="11" y="2"  width="7" height="7" rx="1.5" fill="currentColor" />
              <rect x="2"  y="11" width="7" height="7" rx="1.5" fill="currentColor" />
              <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold text-foreground">
            Favicon Generator
          </span>
        </Link>

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {theme === 'dark'
            ? <Sun  className="h-4 w-4" />
            : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}
