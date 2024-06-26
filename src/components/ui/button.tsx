import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'font-bold bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'font-bold border-2 border-foreground/10 dark:border-foreground/20 hover:border-foreground/0 dark:hover:border-foreground/0 bg-background hover:bg-primary hover:text-primary-foreground',
        input:
          'font-bold border rounded-sm border-foreground/20 dark:border-foreground/20 hover:border-foreground/0 dark:hover:border-foreground/0 bg-background hover:bg-primary hover:text-primary-foreground',
        secondary:
          'font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'font-bold dark:bg-primary/40 dark:hover:bg-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground',
        link: 'text-foreground underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        input: 'min-h-10 px-3 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        dir="auto"
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
