import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UserSchemaType } from '@/lib/prisma'
import { TS } from '@/translate/components/TServer'
import { DeleteAccountButton } from './client/DeleteAccountButton'
import { Button } from './ui/button'

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
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <TS keys="deleteAccount">Delete my Account…</TS>
            </Button>
          </DialogTrigger>
          <DialogContent className="red text-primary">
            <DialogHeader>
              <DialogTitle>
                <TS keys="deleteAccount">
                  Bist du dir sicher, dass du deinen Account löschen möchtest?
                </TS>
              </DialogTitle>
              <DialogDescription>
                <TS keys="deleteAccount">
                  This action cannot be undone. This will permanently delete
                  your account and remove your answers from our database.
                </TS>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="justify-end">
              <DialogClose asChild>
                <Button variant="outline">Nicht löschen</Button>
              </DialogClose>
              <DeleteAccountButton
                loading={<TS keys="deleteAccount">Deleting your Account…</TS>}
              >
                <TS keys="deleteAccount">Delete my Account</TS>
              </DeleteAccountButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
