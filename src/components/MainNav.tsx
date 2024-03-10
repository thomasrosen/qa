'use client'

import { usePathname } from 'next/navigation'
import { DarkModeToggle } from './DarkModeToggle'
import { NavButton } from './NavButton'

export function MainNav() {
  const pathname = usePathname()

  if (pathname === '/') {
    // hide main nav on start page
    return null
  }

  return (
    <nav className="flex gap-4 items-center mb-8 flex-wrap justify-center" aria-label="Main">
      <NavButton href="/">Home</NavButton>
      <NavButton href="/q">Questions</NavButton>
      <NavButton href="/you">About You</NavButton>
      <NavButton href="/insights">Insights</NavButton>
      <NavButton href="/imprint">Imprint + Privacy</NavButton>
      <DarkModeToggle />
    </nav>
  )
}
