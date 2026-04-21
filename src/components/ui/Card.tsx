import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-4', className)} {...props} />
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-semibold leading-tight text-foreground', className)} {...props} />
  )
}

function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-[13px] text-muted-foreground', className)} {...props} />
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-4', className)} {...props} />
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center px-5 pb-5 pt-0', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
