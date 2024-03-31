import { SignIn } from '@/components/SignIn'
import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import NextQuestion from './NextQuestion'

export const dynamic = true

export default async function Questions() {
  const session = await auth()

  if (isSignedOut(session)) {
    return <SignIn />
  }

  return <NextQuestion />
}
