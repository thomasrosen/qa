'use client'

import { P } from '@/components/P'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserSchemaType } from '@/lib/prisma'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useCallback } from 'react'

export function AboutYouCard({ user }: { user: UserSchemaType }) {
  const resetID = useCallback(() => signOut(), [])

  const aboutYouID = user.email || user.id

  return (
    <Card className="orange">
      <CardHeader>
        <CardTitle>About You</CardTitle>

        <CardDescription>
          Your answers will be grouped together under the following identifier.
          You can reset this identifier at any time.{' '}
          <strong>
            When publishing any data, your identifier will be randomized to keep
            your anonymity.
          </strong>{' '}
          <Link href="/imprint" className="inline-block">
            Learn more…
          </Link>
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex gap-4 justify-between items-center">
        <P className="mb-0 font-bold">Your ID: {aboutYouID}</P>
        <Button
          variant="link"
          className="font-bold h-auto p-0"
          onClick={resetID}
        >
          Reset ID
        </Button>
      </CardFooter>
    </Card>
  )
}
