'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavButton({
  children,
  href = '/',
  variant,
  className,
}: {
  children: React.ReactNode
  href?: string
  variant?: string
  className?: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Button variant={variant || isActive ? 'default' : 'ghost'} asChild>
      <Link href={href} className={cn('no-underline', className)}>
        {children}
      </Link>
    </Button>
  )
}
