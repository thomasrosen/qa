import { DarkModeToggle } from '@/components/client/DarkModeToggle'
import { NavButton } from '@/components/client/NavButton'
import { TS } from '@/components/translate/TServer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <TS>Curious minds thrive on answers. 🧠💡🌱</TS>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TS>
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
            <TS>Go deeper than ice cream... 🍦🌊</TS>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TS>
            Join me in gathering insights by answering questions that go beyond
            a simple socialmedia poll.
          </TS>
        </CardContent>
      </Card>
      <br />
      <Card>
        <CardHeader>
          <CardTitle>
            <TS>Let’s go! 🚀</TS>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TS>
            I am starting this dataset with some simple questions. So just
            answer some and let’s see where this goes.
          </TS>
        </CardContent>
      </Card>
      <br />

      <nav className="text-center" aria-label="Main">
        <NavButton href="/q" variant="default" className="mb-4">
          <TS>Start collecting Answers</TS>
        </NavButton>
        <div className="flex gap-4 flex-wrap justify-center">
          {/* <NavButton href="/answers">Answers</NavButton> */}
          <NavButton href="/imprint">
            <TS>Imprint + Privacy</TS>
          </NavButton>
          <DarkModeToggle />
        </div>
      </nav>
    </>
  )
}
