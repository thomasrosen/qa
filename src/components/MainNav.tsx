import { DarkModeToggle } from '@/components/client/DarkModeToggle'
import { HideOnHome } from '@/components/client/HideOnHome'
import { NavButton } from '@/components/client/NavButton'
import { auth } from '@/lib/auth'
import { getUser } from '@/lib/getUser'
import { isSignedIn } from '@/lib/isSignedIn'
import { TS } from '@/translate/components/TServer'
import { TranslationStoreEntryPoint } from '@/translate/components/TranslationStoreEntryPoint'

export async function MainNav() {
  let isAdmin = false
  const session = await auth()
  if (isSignedIn(session)) {
    // @ts-ignore Is already checked in isSignedOut()
    const user_id = session.user.id
    const user = await getUser({
      where: {
        id: user_id,
      },
      select: {
        isAdmin: true,
      },
    })
    isAdmin = user?.isAdmin || false
  }

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
          {isAdmin && (
            <>
              <NavButton startsWith={true} href="/admin/questions">
                <TS keys="MainNav">Admin/Questions</TS>
              </NavButton>
              <NavButton startsWith={true} href="/admin/things">
                <TS keys="MainNav">Admin/Things</TS>
              </NavButton>
              <NavButton startsWith={true} href="/admin/users">
                <TS keys="MainNav">Admin/Users</TS>
              </NavButton>
            </>
          )}
        </nav>
      </TranslationStoreEntryPoint>
    </HideOnHome>
  )
}
