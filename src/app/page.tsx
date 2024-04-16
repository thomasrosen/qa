import { DarkModeToggle } from '@/components/client/DarkModeToggle'
import { NavButton } from '@/components/client/NavButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Curious minds thrive on answers. 🧠💡🌱</CardTitle>
        </CardHeader>
        <CardContent>
          While a quick poll might determine the best ice cream flavour, deeper
          inquiries require a bit more insight. That‘s where you come in!
        </CardContent>
      </Card>
      <br />
      <Card>
        <CardHeader>
          <CardTitle>Go deeper than ice cream... 🍦🌊</CardTitle>
        </CardHeader>
        <CardContent>
          Join me in gathering insights by answering questions that go beyond a
          simple socialmedia poll.
        </CardContent>
      </Card>
      <br />
      <Card>
        <CardHeader>
          <CardTitle>Let’s go! 🚀</CardTitle>
        </CardHeader>
        <CardContent>
          I am starting this dataset with some simple questions. So just answer
          some and let’s see where this goes.
        </CardContent>
      </Card>
      <br />

      <nav className="text-center" aria-label="Main">
        <NavButton href="/q" variant="default" className="mb-4">
          Start collecting Answers
        </NavButton>
        <div className="flex gap-4 flex-wrap justify-center">
          {/* <NavButton href="/answers">Answers</NavButton> */}
          <NavButton href="/imprint">Imprint + Privacy</NavButton>
          <DarkModeToggle />
        </div>
      </nav>
    </>
  )
}
