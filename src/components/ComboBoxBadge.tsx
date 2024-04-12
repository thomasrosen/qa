import { cn } from '@/lib/utils'

export function ComboBoxBadge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-xs -ms-1 px-3 py-1 whitespace-normal',
        className
      )}
      {...props}
    />
  )
}
