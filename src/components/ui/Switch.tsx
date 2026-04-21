import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

function Switch({ checked, onCheckedChange, label, disabled, className, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'group inline-flex items-center gap-2.5 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-40',
        className
      )}
      {...props}
    >
      {/* Track */}
      <span
        className={cn(
          'relative flex shrink-0 items-center rounded-full transition-colors duration-150',
        )}
        style={{
          width: 34,
          height: 20,
          backgroundColor: checked ? '#6B97FF' : 'var(--accent)',
        }}
      >
        {/* Thumb */}
        <span
          className={cn(
            'absolute top-[2px] block h-4 w-4 rounded-full bg-white shadow-sm',
            'transition-all duration-150 ease-in-out',
          )}
          style={{ left: checked ? 'calc(100% - 18px)' : '2px' }}
        />
      </span>
      {label && (
        <span
          className={cn(
            'text-[13px] transition-colors duration-100',
            checked ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {label}
        </span>
      )}
    </button>
  )
}

export { Switch }
