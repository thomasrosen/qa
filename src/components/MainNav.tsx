import { DarkModeToggle } from '@/components/client/DarkModeToggle'
import { HideOnHome } from '@/components/client/HideOnHome'
import { NavButton } from '@/components/client/NavButton'
import { TS } from '@/translate/components/TServer'
import { TranslationStoreEntryPoint } from '@/translate/components/TranslationStoreEntryPoint'

export function MainNav() {
  return (
    <HideOnHome>
      <TranslationStoreEntryPoint keys={['MainNav', 'DarkModeToggle']}>
        <nav
          className="flex gap-4 items-center mb-8 flex-wrap justify-center"
          aria-label="Main"
        >
          <NavButton href="/">
            <TS keys="MainNav" note="This is the start/homepage button text.">
              Start
            </TS>
          </NavButton>
          <NavButton startsWith={true} href="/q">
            <TS keys="MainNav">Questions</TS>
          </NavButton>
          <NavButton startsWith={true} href="/answers">
            <TS keys="MainNav">Answers</TS>
          </NavButton>
          <NavButton startsWith={true} href="/you">
            <TS keys="MainNav">About You</TS>
          </NavButton>
          <NavButton startsWith={true} href="/imprint">
            <TS keys="MainNav">Imprint + Privacy</TS>
          </NavButton>
          <DarkModeToggle />
        </nav>
      </TranslationStoreEntryPoint>
    </HideOnHome>
  )
}
