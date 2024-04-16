import { cn } from '@/lib/utils'

export function ComboBoxBadge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-xs px-3 py-1 text-start whitespace-normal font-normal',
        className
      )}
      {...props}
    />
  )
}
