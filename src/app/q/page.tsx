import { P } from '@/components/P'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getRandomQuestion } from '@/lib/getRandomQuestion'
import { getRandomThing } from '@/lib/getRandomThing'
import Link from 'next/link'

export default async function Questions() {
  const question = await getRandomQuestion()
  const thing = await getRandomThing({})

  if (!question) {
    return <P className="text-center">There are no questions available at the moment.</P>
  }

  return (
    <section className="flex flex-col gap-4">
      <pre>{JSON.stringify(question, null, 2)}</pre>
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{question.question}</CardTitle>
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
