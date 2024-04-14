'use client'

import { DarkModeToggle } from '@/components/client/DarkModeToggle'
import { NavButton } from '@/components/client/NavButton'
import { usePathname } from 'next/navigation'

export function MainNav() {
  const pathname = usePathname()

  if (pathname === '/') {
    // hide main nav on start page
    return null
  }

  return (
    <nav
      className="flex gap-4 items-center mb-8 flex-wrap justify-center"
      aria-label="Main"
    >
      <NavButton href="/">Home</NavButton>
      <NavButton startsWith={true} href="/q">
        Questions
      </NavButton>
      <NavButton startsWith={true} href="/you">
        About You / Answers
      </NavButton>
      {/* <NavButton startsWith={true} href="/insights">
        Insights
      </NavButton> */}
      <NavButton startsWith={true} href="/imprint">
        Imprint + Privacy
      </NavButton>
      <DarkModeToggle />
    </nav>
  )
}
