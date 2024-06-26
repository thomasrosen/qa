import { cn } from '@/lib/utils'

export function P({
  type,
  className = '',
  ref,
  ...props
}: {
  type?: 'lead' | 'large' | 'small' | 'muted' | 'ghost' | undefined
  ref?: React.Ref<HTMLParagraphElement> | React.LegacyRef<HTMLParagraphElement>
} & React.HTMLAttributes<HTMLParagraphElement>) {
  switch (type) {
    case 'lead':
      return (
        <p
          ref={ref}
          className={cn('text-xl text-muted-foreground mb-4 w-full', className)}
          dir="auto"
          {...props}
        />
      )
    case 'large':
      return (
        <p
          ref={ref}
          className={cn('text-lg font-semibold mb-4 w-full', className)}
          dir="auto"
          {...props}
        />
      )
    case 'small':
      return (
        <p
          ref={ref}
          className={cn(
            'text-sm font-medium leading-none mb-4 w-full',
            className
          )}
          dir="auto"
          {...props}
        />
      )
    case 'muted':
      return (
        <p
          ref={ref}
          className={cn('text-sm text-muted-foreground mb-4 w-full', className)}
          dir="auto"
          {...props}
        />
      )
    case 'ghost':
      return (
        <p
          ref={ref}
          className={cn(
            'text-sm text-muted-foreground mb-4 opacity-60 w-full',
            className
          )}
          dir="auto"
          {...props}
        />
      )
  }

  return (
    <p
      ref={ref}
      className={cn('leading-7 mb-4 w-full', className)}
      dir="auto"
      {...props}
    />
  )
}
