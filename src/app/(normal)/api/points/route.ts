import { auth } from '@/lib/auth'
import { isSignedOut } from '@/lib/isSignedIn'
import { prisma } from '@/lib/prisma'

export async function GET() {
  let points = 0

  const session = await auth()
  if (isSignedOut(session)) {
    return Response.json({ points })
  }
  // @ts-ignore Is already checked in isSignedOut()
  const user_id = session.user.id

  if (!user_id) {
    return Response.json({ points })
  }

  const answersCount = await prisma.answer.count({
    where: { createdBy_id: user_id },
  })

  points = answersCount * 10 // times ten, so we can introduce smaller amounts later on

  const data = { points }
  return Response.json(data)
}
