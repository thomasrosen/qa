'use client'

import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavButton({
  children,
  href = '/',
  variant,
  className,
  startsWith = false,
}: {
  children: React.ReactNode
  href?: string
  variant?: ButtonProps['variant']
  className?: string
  startsWith?: boolean
}) {
  const pathname = usePathname()
  const isActive = startsWith ? pathname.startsWith(href) : pathname === href

  return (
    <Button variant={isActive ? 'default' : variant || 'ghost'} asChild>
      <Link href={href} className={cn('no-underline', className)}>
        {children}
      </Link>
    </Button>
  )
}
