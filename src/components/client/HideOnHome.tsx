'use client'

import { usePathname } from 'next/navigation'

export function HideOnHome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/') {
    // hide main nav on start page
    return null
  }

  return children
}
