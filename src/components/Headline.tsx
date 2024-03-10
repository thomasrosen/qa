import { cn } from '@/lib/utils'

export function Headline({
  children,
  type,
  className,
}: {
  children: React.ReactNode
  type?: string
  className?: string
}) {
  switch (type) {
    case 'h2':
      return (
        <h2
          className={cn(
            'scroll-m-20 border-b border-foreground/20 first:pt-0 pt-8 pb-2 text-3xl font-semibold tracking-tight mb-4',
            className
          )}
        >
          {children}
        </h2>
      )
    case 'h3':
      return (
        <h3
          className={cn(
            'scroll-m-20 text-2xl font-semibold tracking-tight first:pt-0 pt-4 mb-4',
            className
          )}
        >
          {children}
        </h3>
      )
    case 'h4':
      return (
        <h4 className={cn('scroll-m-20 text-xl font-semibold tracking-tight mb-4', className)}>
          {children}
        </h4>
      )
  }

  return (
    <h1
      className={cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4',
        className
      )}
    >
      {children}
    </h1>
  )
}
