import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserSchemaType } from '@/lib/prisma'
import { TS } from '@/translate/components/TServer'
import { DeleteAccountButton } from './client/DeleteAccountButton'

export async function DeleteAccount({ user }: { user: UserSchemaType }) {
  const aboutYouID = user.email || user.id

  return (
    <Card className="red">
      <CardHeader>
        <CardTitle>
          <TS keys="deleteAccount">Delete Account</TS>
        </CardTitle>

        <CardDescription>
          <TS keys="deleteAccount">
            You can delete your answers and account at any time, on this screen.
            If you are logged in with an email address, you can also delete your
            data by sending an email requesting deletion to{' '}
            <a href="mailto:hello@thomasrosen.me">hello@thomasrosen.me</a>.
          </TS>
        </CardDescription>
      </CardHeader>

      <CardFooter>
        <DeleteAccountButton
          loading={<TS keys="deleteAccount">Deleting your Account…</TS>}
        >
          <TS keys="deleteAccount">Delete my Account</TS>
        </DeleteAccountButton>
      </CardFooter>
    </Card>
  )
}
