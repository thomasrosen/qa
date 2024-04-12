import { Prisma, PrismaClient, type Prisma as PrismaType } from '@prisma/client'
import { z } from 'zod'

export { PrismaType }

const prismaClientSingleton = () => {
  // source: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
  return new PrismaClient()
}
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()
export { Prisma, prisma }
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

export const DataTypeSchema = z.enum(['String', 'Number', 'Boolean', 'Thing'])
export const SchemaTypeSchema = z.enum([
  'Person',
  'DefinedTerm',
  'Country',
  'City',
])
export type SchemaTypeSchemaType = z.input<typeof SchemaTypeSchema>

export const SchemaTypeArraySchema = z
  .array(z.any())
  .transform(
    (as) =>
      as.filter(
        (a) => SchemaTypeSchema.safeParse(a).success
      ) as SchemaTypeSchemaType[]
  )
export type SchemaTypeArraySchemaType = z.input<typeof SchemaTypeArraySchema>

export const JsonValueSchema: z.ZodType<PrismaType.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
)

export const UserSchema = z.object({
  id: z.string().refine((val) => val.length > 0, { message: 'id is required' }),
  index: z.number().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
})
export type UserSchemaType = z.input<typeof UserSchema>

export const SessionSchema = z.object({
  user: UserSchema.nullable(),
  expires: z.date().nullable(),
})
export type SessionSchemaType = z.input<typeof SessionSchema>

export const QuestionSchema = z
  .object({
    question_id: z.string().optional(),
    question: z
      .string()
      .min(10, { message: 'Question must be at least 10 characters long.' })
      .nullable(),
    description: z.string().nullable(),
    locale: z
      .string()
      .min(2, { message: 'Locale must be at least 2 characters long.' })
      .nullable(),
    asProperty: z
      .string()
      .regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, {
        message:
          'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.',
      })
      .nullable(),
    aboutThingTypes: SchemaTypeSchema.array(),
    answerType: DataTypeSchema,
    answerThingTypes: SchemaTypeSchema.array(),
    answerThingOptions: z.any().array().optional(), // TODO can the any be removed?
    answerStringOptions: z.string().array().optional(),
    allowCreateNewOption: z.boolean().nullable().optional(),
  })
  .refine(
    (schema) =>
      schema.answerType === 'Thing' ? schema.answerThingTypes.length > 0 : true,
    {
      path: ['answerThingTypes'],
      message: 'answerThingTypes must be set when answerType is "Thing".',
    }
  )
export type QuestionSchemaType = z.input<typeof QuestionSchema>

export const ThingSchema = z.object({
  thing_id: z.string().optional(),
  type: SchemaTypeSchema.nullable(),
  name: z
    .string()
    .min(1, { message: 'Name must be at least 1 character long.' })
    .nullable(),
  locale: z
    .string()
    .min(2, { message: 'Locale must be at least 2 characters long.' })
    .nullable(),
  sameAs: z.string().array(),
  jsonld: z.any().nullable().optional(), // JsonValueSchema.optional(),
})
export type ThingSchemaType = z.input<typeof ThingSchema>

export const ValueSchema = z.object({
  valueType: DataTypeSchema,
  valueAsString: z.string().nullable(),
  valueAsNumber: z.number().nullable(),
  valueAsBoolean: z.boolean().nullable(),
  valueAsThing: ThingSchema.nullable().optional(),
  valueAsThing_id: z.string().nullable().optional(),
  createdBy: UserSchema.nullable().optional(),
  createdBy_id: z.string().nullable().optional(),
})
export type ValueSchemaType = z.input<typeof ValueSchema>
export type ExtendedValueSchemaType = ValueSchemaType & {
  valueAsThing?: any
  _count: {
    _all: number
  }
}

export const ContextSchema = z.object({
  time: z.date().nullable(),
  geoJson: z.any(),
  aboutThing: ThingSchema.nullable().optional(),
  aboutThing_id: z.string().nullable().optional(),
  createdBy: UserSchema.nullable().optional(),
  createdBy_id: z.string().nullable().optional(),
})
export type ContextSchemaType = z.input<typeof ContextSchema>
export type ExtendedContextSchemaType = ContextSchemaType & {
  _count: {
    _all: number
  }
}

export type AnswerType = {
  answer_id?: string
  isAnswering?: QuestionSchemaType | null
  context?: ContextSchemaType[]
  values?: ValueSchemaType[]
  isAnsweredByAgent?: UserSchemaType | null
}

export const SaveAnswerSchema = z.object({
  isAnswering_id: z.string().nullable().optional(),
  values: ValueSchema.array(),
  context: ContextSchema.array(),
})
export type SaveAnswerSchemaType = z.input<typeof SaveAnswerSchema>
