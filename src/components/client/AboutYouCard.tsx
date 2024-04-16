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
import { SessionSchemaType } from '@/lib/prisma'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

type SessionWithNull = SessionSchemaType | null
export function AboutYouCard({
  session: providedSession = null,
}: {
  session: SessionWithNull
}) {
  const [session, setSession] = useState<SessionWithNull>(providedSession)
  const fetchingSession = useRef(false)

  const resetID = useCallback(() => {
    signOut()
  }, [])

  useEffect(() => {
    if (!session && !fetchingSession.current) {
      fetchingSession.current = true
      // fetch the user's ID form /api/auth/session
      const fetchSession = async () => {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        fetchingSession.current = false
        setSession(data)
      }
      fetchSession()
    }
  }, [session])

  if (!session) {
    return null
  }

  if (!session.user) {
    return null
  }

  const aboutYouID = session.user.email || session.user.id

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
