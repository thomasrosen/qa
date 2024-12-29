import { QuestionSearch } from '@/components/QuestionSearch'
import { DarkModeToggle } from '@/components/client/DarkModeToggle'
import { NavButton } from '@/components/client/NavButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TS } from '@/translate/components/TServer'
import { Suspense } from 'react'
// import { TranslationStoreEntryPoint } from '@/translate/components/TranslationStoreEntryPoint'

export default function HomePage() {
  return (
    <>
      {/* <TranslationStoreEntryPoint keys={['Home', 'DarkModeToggle']}> */}
      <Suspense>
        <QuestionSearch />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>
            <TS keys="home">Curious minds thrive on answers. 🧠💡🌱</TS>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TS keys="home">
            While a quick poll might determine the best ice cream flavour,
            deeper inquiries require a bit more insight. That‘s where you come
            in!
          </TS>
        </CardContent>
      </Card>
      <br />
      <Card>
        <CardHeader>
          <CardTitle>
            <TS keys="home">Go deeper than ice cream... 🍦🌊</TS>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TS keys="home">
            Join me in gathering insights by answering questions that go beyond
            a simple socialmedia poll.
          </TS>
        </CardContent>
      </Card>
      <br />
      <Card>
        <CardHeader>
          <CardTitle>
            <TS keys="home">Let’s go! 🚀</TS>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TS keys="home">
            I am starting this dataset with some simple questions. So just
            answer some and let’s see where this goes.
          </TS>
        </CardContent>
      </Card>
      <br />

      <nav className="text-center" aria-label="Main">
        <NavButton href="/q" variant="default" className="mb-4">
          <TS
            keys="Home"
            note="this is the main call to action of the start page"
          >
            Start collecting Answers
          </TS>
        </NavButton>
        <div className="flex gap-4 flex-wrap justify-center">
          {/* <NavButton href="/answers">Answers</NavButton> */}
          <NavButton href="/imprint">
            <TS keys="Home">Imprint + Privacy</TS>
          </NavButton>
          <DarkModeToggle />
        </div>
      </nav>
      {/* </TranslationStoreEntryPoint> */}
    </>
  )
}
