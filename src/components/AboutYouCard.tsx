import { HideFromTranslation } from '@/components/HideFromTranslation'
import { P } from '@/components/P'
import { SignOutButton } from '@/components/client/SignOutButton'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserSchemaType } from '@/lib/prisma'
import { TS } from '@/translate/components/TServer'
import Link from 'next/link'
import { Button } from './ui/button'

export async function AboutYouCard({ user }: { user: UserSchemaType }) {
  const aboutYouID = user.email || user.id

  return (
    <Card className="orange">
      <CardHeader>
        <CardTitle>
          <TS keys="aboutYou">About You</TS>
        </CardTitle>

        <CardDescription>
          <TS keys="aboutYou">
            Your answers will be grouped together under the following
            identifier. You can reset this identifier at any time.{' '}
            <strong>
              When publishing any data, your identifier will be randomized to
              keep your anonymity.
            </strong>{' '}
            <Link href="/imprint" className="inline-block">
              Learn more…
            </Link>
          </TS>
        </CardDescription>
      </CardHeader>

      <CardFooter className="flex-col flex gap-4 items-stretch">
        <P className="mb-0 font-bold">
          <TS keys="aboutYou">
            Your ID:{' '}
            <HideFromTranslation real={aboutYouID}>
              email@email.com
            </HideFromTranslation>
          </TS>
        </P>
        <div className="flex flex-row gap-2 flex-wrap">
          <SignOutButton>
            <TS keys="aboutYou">Logout</TS>
          </SignOutButton>
          <Link href="/api/export" target="_blank" download>
            <Button variant="outline">
              <TS keys="aboutYou">Download your Data</TS>
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
