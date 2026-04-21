import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-foreground text-background hover:opacity-90 active:opacity-80 focus-visible:ring-focus',
  secondary:
    'bg-accent text-foreground hover:bg-neutral-300 active:bg-neutral-300 dark:hover:bg-neutral-600 focus-visible:ring-focus',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-accent active:bg-accent focus-visible:ring-focus',
  ghost:
    'bg-transparent text-foreground hover:bg-accent active:bg-accent focus-visible:ring-focus',
  destructive:
    'bg-destructive text-white hover:opacity-90 active:opacity-80 focus-visible:ring-destructive',
}

const sizes = {
  sm: 'h-7 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-8 px-3.5 text-[13px] gap-2 rounded-lg',
  lg: 'h-10 px-5 text-sm gap-2 rounded-xl',
  icon: 'h-8 w-8 rounded-lg',
  'icon-sm': 'h-7 w-7 rounded-md',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-40',
        'select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
      )}
      {children}
    </button>
  )
)

Button.displayName = 'Button'

export { Button }
