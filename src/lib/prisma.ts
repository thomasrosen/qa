import { Prisma, PrismaClient } from '@prisma/client'
import { z } from 'zod'

export const prisma = new PrismaClient()
export { Prisma }

export const DataTypeSchema = z.enum(['String', 'Number', 'Boolean', 'Thing'])
export const SchemaTypeSchema = z.enum(['Person', 'DefinedTerm'])

export const QuestionSchema = z
  .object({
    expectedValueType: DataTypeSchema,
    /**
     * if the expectedValueType is Thing, this would be the possible types of the thing
     */
    expectedThingTypes: SchemaTypeSchema.array(),
    /**
     * similar to the schema.org SearchAction
     */
    // omitted: question_id: z.string().cuid(),
    // omitted: index: z.number().int(),
    // omitted: createdAt: z.coerce.date(),
    // omitted: updatedAt: z.coerce.date(),
    question: z
      .string()
      .min(10, { message: 'Question must be at least 10 characters long.' })
      .nullable(),
    description: z.string().nullable(),
    /**
     * any locale string ///
     */
    locale: z.string().min(2, { message: 'Locale must be at least 2 characters long.' }).nullable(),
    /**
     * if this question is a schema property, this would be the schema.org property name ///
     */
    asProperty: z
      .string()
      .regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, {
        message:
          'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.',
      })
      .nullable(),
  })
  .refine(
    (schema) =>
      schema.expectedValueType === 'Thing' ? schema.expectedThingTypes.length > 0 : true,
    {
      path: ['expectedThingTypes'],
      message: 'expectedThingTypes must be set when expectedValueType is Thing',
    }
  )
export type QuestionSchemaType = z.input<typeof QuestionSchema>
