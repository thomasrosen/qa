import { HideFromTranslation } from '@/components/HideFromTranslation'
import { P } from '@/components/P'
import { SignOutButton } from '@/components/client/SignOutButton'
import { TS } from '@/components/translate/TServer'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserSchemaType } from '@/lib/prisma'
import Link from 'next/link'

export async function AboutYouCard({ user }: { user: UserSchemaType }) {
  const aboutYouID = user.email || user.id

  return (
    <Card className="orange">
      <CardHeader>
        <CardTitle>
          <TS>About You</TS>
        </CardTitle>

        <CardDescription>
          <TS>
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

      <CardFooter className="flex gap-4 justify-between items-center">
        <P className="mb-0 font-bold">
          <TS>
            Your ID:{' '}
            <HideFromTranslation real={aboutYouID}>
              email@email.com
            </HideFromTranslation>
          </TS>
        </P>
        <SignOutButton>
          <TS>Reset ID</TS>
        </SignOutButton>
      </CardFooter>
    </Card>
  )
}
