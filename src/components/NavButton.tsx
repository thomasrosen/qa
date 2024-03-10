'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'

export function NavButton({
  children,
  href = '/',
  variant,
}: {
  children: React.ReactNode
  href?: string
  variant?: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Button variant={variant || isActive ? 'default' : 'ghost'} asChild>
      <Link href={href} className="no-underline">
        {children}
      </Link>
    </Button>
  )
}
