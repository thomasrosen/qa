import { P } from '@/components/P'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const things = [
  {
    thing_id: '1',
    type: 'DefinedTerm',
    name: 'Celsius',
  },
  {
    thing_id: '2',
    type: 'DefinedTerm',
    name: 'Fahrenheit',
  },
  {
    thing_id: '3',
    type: 'DefinedTerm',
    name: 'Kelvin',
  },
]

export default function Questions() {
  return (
    <section className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Do you know this word?</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <P className="mb-0">Fachwort</P>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button variant="default" className="w-full">
            Yes
          </Button>
          <Button variant="default" className="w-full">
            No
          </Button>
        </CardFooter>
      </Card>
      <div className="flex justify-between">
        <nav className="text-white flex">
          {/*
          <Button variant="link" asChild className="z-10">
            <Link href="/suggest" className="no-underline">
              Suggest a Word
            </Link>
          </Button>
          <Separator orientation="vertical" className="my-2 h-auto" />
          */}
          <Button variant="link" asChild className="z-10">
            <Link href="/suggest" className="no-underline">
              Suggest a Question
            </Link>
          </Button>
        </nav>
        <Button variant="outline">Skip</Button>
      </div>
    </section>
  )
}
