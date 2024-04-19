import { DarkModeToggle } from '@/components/client/DarkModeToggle'
import { HideOnHome } from '@/components/client/HideOnHome'
import { NavButton } from '@/components/client/NavButton'
import { TS } from '@/components/translate/TServer'

export function MainNav() {
  return (
    <HideOnHome>
      <nav
        className="flex gap-4 items-center mb-8 flex-wrap justify-center"
        aria-label="Main"
      >
        <NavButton href="/">
          <TS>Start</TS>
        </NavButton>
        <NavButton startsWith={true} href="/q">
          <TS>Questions</TS>
        </NavButton>
        <NavButton startsWith={true} href="/answers">
          <TS>Answers</TS>
        </NavButton>
        <NavButton startsWith={true} href="/you">
          <TS>About You</TS>
        </NavButton>
        <NavButton startsWith={true} href="/imprint">
          <TS>Imprint + Privacy</TS>
        </NavButton>
        <DarkModeToggle />
      </nav>
    </HideOnHome>
  )
}
