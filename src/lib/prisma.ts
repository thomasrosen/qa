import { QuestionCustomValidatorsSchema as QuestionSchema } from '@/generated/zod'
import { Prisma, PrismaClient } from '@prisma/client'
import { z } from 'zod'

export const prisma = new PrismaClient()
export type QuestionCreateBody = Prisma.Args<typeof prisma.question, 'create'>['data']
export { Prisma, QuestionSchema }

// export const QuestionSchema = QuestionSchemaFull.omit({
//   question_id: true,
//   index: true,
//   createdAt: true,
//   updatedAt: true,
// })
export type QuestionSchemaType = z.input<typeof QuestionSchema>
