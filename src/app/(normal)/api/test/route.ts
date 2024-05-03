// import { prisma } from '@/lib/prisma'

import { similarTexts } from '@/lib/vectorStore'

export async function GET() {
  const result = await similarTexts()

  // const answers = await prisma.answer.findMany({
  //   relationLoadStrategy: 'join', // or 'query'
  //   where: {
  //     values: {
  //       some: {
  //         valueType: 'Thing',
  //       },
  //     },
  //   },
  //   take: 3,
  //   include: {
  //     values: true,
  //     context: true,
  //   },
  // })

  const data = { result }
  return Response.json(data)
}
