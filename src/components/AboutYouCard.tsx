'use client'

import { P } from '@/components/P'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useCallback } from 'react'

export function AboutYouCard() {
  const resetID = useCallback(() => {}, [])

  return (
    <Card className="orange">
      <CardHeader>
        <CardTitle>About You</CardTitle>

        <CardDescription>
          This answer will be grouped together with your other answers. You can reset the identifier
          to restart collecting. <Link href="/imprint">Learn more…</Link>
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex gap-4 justify-between items-center">
        <P className="mb-0 font-bold">Your ID: ti3wv6eurztoaw8ke7vtvka</P>
        <Button variant="link" className="font-bold h-auto p-0" onClick={resetID}>
          Reset ID
        </Button>
      </CardFooter>
    </Card>
  )
}
