import { SignIn } from '@/components/SignIn'
import { isSignedOut } from '@/lib/isSignedIn'
import { getServerSession } from 'next-auth'
import NextQuestion from './NextQuestion'

export default async function Questions() {
  const session = await getServerSession()

  if (isSignedOut(session)) {
    return <SignIn />
  }

  return <NextQuestion />
}
