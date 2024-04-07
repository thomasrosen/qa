import { cn } from '@/lib/utils';

export function P({
  children,
  type,
  className,
}: {
  children: React.ReactNode;
  type?: string;
  className?: string;
}) {
  switch (type) {
    case 'lead':
      return (
        <p className={cn('text-xl text-muted-foreground mb-4', className)}>
          {children}
        </p>
      );
    case 'large':
      return (
        <p className={cn('text-lg font-semibold mb-4', className)}>
          {children}
        </p>
      );
    case 'small':
      return (
        <p className={cn('text-sm font-medium leading-none mb-4', className)}>
          {children}
        </p>
      );
    case 'muted':
      return (
        <p
          className={cn(
            'text-sm text-muted-foreground mb-4 opacity-60',
            className
          )}
        >
          {children}
        </p>
      );
  }

  return <p className={cn('leading-7 mb-4', className)}>{children}</p>;
}
