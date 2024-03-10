import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.function(z.tuple([]), z.any()) }),
    z.record(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const ThingScalarFieldEnumSchema = z.enum(['thing_id','index','createdAt','updatedAt','type','name','locale','sameAs','jsonld']);

export const QuestionScalarFieldEnumSchema = z.enum(['question_id','index','createdAt','updatedAt','question','description','locale','asProperty','expectedValueType','expectedThingTypes']);

export const AnswerScalarFieldEnumSchema = z.enum(['answer_id','index','createdAt','updatedAt','isAnswering_id','isAbout_id','isAnsweredByAgent_id']);

export const ValueScalarFieldEnumSchema = z.enum(['value_id','index','createdAt','updatedAt','valueType','valueAsString','valueAsNumber','valueAsBoolean','valueAsThing_id','isValueFor_id']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullableJsonNullValueInputSchema = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const JsonNullValueFilterSchema = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.JsonNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const NullsOrderSchema = z.enum(['first','last']);

export const DataTypeSchema = z.enum(['String','Number','Boolean','Thing']);

export type DataTypeType = `${z.infer<typeof DataTypeSchema>}`

export const SchemaTypeSchema = z.enum(['Person','DefinedTerm']);

export type SchemaTypeType = `${z.infer<typeof SchemaTypeSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// THING SCHEMA
/////////////////////////////////////////

export const ThingSchema = z.object({
  /**
   * empty is just a generic thing
   */
  type: SchemaTypeSchema.nullable(),
  /**
   * similar to the schema.org Thing
   */
  thing_id: z.string().cuid(),
  index: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  name: z.string().nullable(),
  /**
   * any locale string
   */
  locale: z.string().nullable(),
  /**
   * could a wikidata-url
   */
  sameAs: z.string().array(),
  /**
   * JSON-LD: For a word/DefinedTerm this could contain a wikidata-id as the termCode. Or an email for a person.
   */
  jsonld: JsonValueSchema,
})

export type Thing = z.infer<typeof ThingSchema>

/////////////////////////////////////////
// QUESTION SCHEMA
/////////////////////////////////////////

export const QuestionSchema = z.object({
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
  question: z.string().min(10, { message: 'Question must be at least 10 characters long.' }).nullable(),
  description: z.string().nullable(),
  /**
   * any locale string ///
   */
  locale: z.string().min(2, { message: 'Locale must be at least 2 characters long.' }).nullable(),
  /**
   * if this question is a schema property, this would be the schema.org property name ///
   */
  asProperty: z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }).nullable(),
})

export type Question = z.infer<typeof QuestionSchema>

/////////////////////////////////////////
// QUESTION CUSTOM VALIDATORS SCHEMA
/////////////////////////////////////////

export const QuestionCustomValidatorsSchema = QuestionSchema.refine(schema => schema.expectedValueType === 'Thing' ? schema.expectedThingTypes.length > 0 : true, { path: ['expectedThingTypes'], message: 'expectedThingTypes must be set when expectedValueType is Thing' })

export type QuestionCustomValidators = z.infer<typeof QuestionCustomValidatorsSchema>

/////////////////////////////////////////
// ANSWER SCHEMA
/////////////////////////////////////////

export const AnswerSchema = z.object({
  /**
   * similar to the schema.org FindAction
   */
  answer_id: z.string().cuid(),
  index: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isAnswering_id: z.string(),
  isAbout_id: z.string().nullable(),
  isAnsweredByAgent_id: z.string(),
})

export type Answer = z.infer<typeof AnswerSchema>

/////////////////////////////////////////
// VALUE SCHEMA
/////////////////////////////////////////

export const ValueSchema = z.object({
  valueType: DataTypeSchema,
  value_id: z.string().cuid(),
  index: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  valueAsString: z.string().nullable(),
  valueAsNumber: z.number().nullable(),
  valueAsBoolean: z.boolean().nullable(),
  valueAsThing_id: z.string().nullable(),
  isValueFor_id: z.string(),
})

export type Value = z.infer<typeof ValueSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// THING
//------------------------------------------------------

export const ThingIncludeSchema: z.ZodType<Prisma.ThingInclude> = z.object({
  Answer_isAnsweredByAgent: z.union([z.boolean(),z.lazy(() => AnswerFindManyArgsSchema)]).optional(),
  Answer_isAbout: z.union([z.boolean(),z.lazy(() => AnswerFindManyArgsSchema)]).optional(),
  isUsedInValues: z.union([z.boolean(),z.lazy(() => ValueFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ThingCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const ThingArgsSchema: z.ZodType<Prisma.ThingDefaultArgs> = z.object({
  select: z.lazy(() => ThingSelectSchema).optional(),
  include: z.lazy(() => ThingIncludeSchema).optional(),
}).strict();

export const ThingCountOutputTypeArgsSchema: z.ZodType<Prisma.ThingCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ThingCountOutputTypeSelectSchema).nullish(),
}).strict();

export const ThingCountOutputTypeSelectSchema: z.ZodType<Prisma.ThingCountOutputTypeSelect> = z.object({
  Answer_isAnsweredByAgent: z.boolean().optional(),
  Answer_isAbout: z.boolean().optional(),
  isUsedInValues: z.boolean().optional(),
}).strict();

export const ThingSelectSchema: z.ZodType<Prisma.ThingSelect> = z.object({
  thing_id: z.boolean().optional(),
  index: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  type: z.boolean().optional(),
  name: z.boolean().optional(),
  locale: z.boolean().optional(),
  sameAs: z.boolean().optional(),
  jsonld: z.boolean().optional(),
  Answer_isAnsweredByAgent: z.union([z.boolean(),z.lazy(() => AnswerFindManyArgsSchema)]).optional(),
  Answer_isAbout: z.union([z.boolean(),z.lazy(() => AnswerFindManyArgsSchema)]).optional(),
  isUsedInValues: z.union([z.boolean(),z.lazy(() => ValueFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ThingCountOutputTypeArgsSchema)]).optional(),
}).strict()

// QUESTION
//------------------------------------------------------

export const QuestionIncludeSchema: z.ZodType<Prisma.QuestionInclude> = z.object({
  Answer_isAnswering: z.union([z.boolean(),z.lazy(() => AnswerFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => QuestionCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const QuestionArgsSchema: z.ZodType<Prisma.QuestionDefaultArgs> = z.object({
  select: z.lazy(() => QuestionSelectSchema).optional(),
  include: z.lazy(() => QuestionIncludeSchema).optional(),
}).strict();

export const QuestionCountOutputTypeArgsSchema: z.ZodType<Prisma.QuestionCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => QuestionCountOutputTypeSelectSchema).nullish(),
}).strict();

export const QuestionCountOutputTypeSelectSchema: z.ZodType<Prisma.QuestionCountOutputTypeSelect> = z.object({
  Answer_isAnswering: z.boolean().optional(),
}).strict();

export const QuestionSelectSchema: z.ZodType<Prisma.QuestionSelect> = z.object({
  question_id: z.boolean().optional(),
  index: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  question: z.boolean().optional(),
  description: z.boolean().optional(),
  locale: z.boolean().optional(),
  asProperty: z.boolean().optional(),
  expectedValueType: z.boolean().optional(),
  expectedThingTypes: z.boolean().optional(),
  Answer_isAnswering: z.union([z.boolean(),z.lazy(() => AnswerFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => QuestionCountOutputTypeArgsSchema)]).optional(),
}).strict()

// ANSWER
//------------------------------------------------------

export const AnswerIncludeSchema: z.ZodType<Prisma.AnswerInclude> = z.object({
  values: z.union([z.boolean(),z.lazy(() => ValueFindManyArgsSchema)]).optional(),
  isAnswering: z.union([z.boolean(),z.lazy(() => QuestionArgsSchema)]).optional(),
  isAbout: z.union([z.boolean(),z.lazy(() => ThingArgsSchema)]).optional(),
  isAnsweredByAgent: z.union([z.boolean(),z.lazy(() => ThingArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => AnswerCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const AnswerArgsSchema: z.ZodType<Prisma.AnswerDefaultArgs> = z.object({
  select: z.lazy(() => AnswerSelectSchema).optional(),
  include: z.lazy(() => AnswerIncludeSchema).optional(),
}).strict();

export const AnswerCountOutputTypeArgsSchema: z.ZodType<Prisma.AnswerCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => AnswerCountOutputTypeSelectSchema).nullish(),
}).strict();

export const AnswerCountOutputTypeSelectSchema: z.ZodType<Prisma.AnswerCountOutputTypeSelect> = z.object({
  values: z.boolean().optional(),
}).strict();

export const AnswerSelectSchema: z.ZodType<Prisma.AnswerSelect> = z.object({
  answer_id: z.boolean().optional(),
  index: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  isAnswering_id: z.boolean().optional(),
  isAbout_id: z.boolean().optional(),
  isAnsweredByAgent_id: z.boolean().optional(),
  values: z.union([z.boolean(),z.lazy(() => ValueFindManyArgsSchema)]).optional(),
  isAnswering: z.union([z.boolean(),z.lazy(() => QuestionArgsSchema)]).optional(),
  isAbout: z.union([z.boolean(),z.lazy(() => ThingArgsSchema)]).optional(),
  isAnsweredByAgent: z.union([z.boolean(),z.lazy(() => ThingArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => AnswerCountOutputTypeArgsSchema)]).optional(),
}).strict()

// VALUE
//------------------------------------------------------

export const ValueIncludeSchema: z.ZodType<Prisma.ValueInclude> = z.object({
  valueAsThing: z.union([z.boolean(),z.lazy(() => ThingArgsSchema)]).optional(),
  isValueFor: z.union([z.boolean(),z.lazy(() => AnswerArgsSchema)]).optional(),
}).strict()

export const ValueArgsSchema: z.ZodType<Prisma.ValueDefaultArgs> = z.object({
  select: z.lazy(() => ValueSelectSchema).optional(),
  include: z.lazy(() => ValueIncludeSchema).optional(),
}).strict();

export const ValueSelectSchema: z.ZodType<Prisma.ValueSelect> = z.object({
  value_id: z.boolean().optional(),
  index: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  valueType: z.boolean().optional(),
  valueAsString: z.boolean().optional(),
  valueAsNumber: z.boolean().optional(),
  valueAsBoolean: z.boolean().optional(),
  valueAsThing_id: z.boolean().optional(),
  isValueFor_id: z.boolean().optional(),
  valueAsThing: z.union([z.boolean(),z.lazy(() => ThingArgsSchema)]).optional(),
  isValueFor: z.union([z.boolean(),z.lazy(() => AnswerArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const ThingWhereInputSchema: z.ZodType<Prisma.ThingWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ThingWhereInputSchema),z.lazy(() => ThingWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ThingWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ThingWhereInputSchema),z.lazy(() => ThingWhereInputSchema).array() ]).optional(),
  thing_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  index: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  type: z.union([ z.lazy(() => EnumSchemaTypeNullableFilterSchema),z.lazy(() => SchemaTypeSchema) ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  locale: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  sameAs: z.lazy(() => StringNullableListFilterSchema).optional(),
  jsonld: z.lazy(() => JsonNullableFilterSchema).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerListRelationFilterSchema).optional(),
  Answer_isAbout: z.lazy(() => AnswerListRelationFilterSchema).optional(),
  isUsedInValues: z.lazy(() => ValueListRelationFilterSchema).optional()
}).strict();

export const ThingOrderByWithRelationInputSchema: z.ZodType<Prisma.ThingOrderByWithRelationInput> = z.object({
  thing_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  locale: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  sameAs: z.lazy(() => SortOrderSchema).optional(),
  jsonld: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerOrderByRelationAggregateInputSchema).optional(),
  Answer_isAbout: z.lazy(() => AnswerOrderByRelationAggregateInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueOrderByRelationAggregateInputSchema).optional()
}).strict();

export const ThingWhereUniqueInputSchema: z.ZodType<Prisma.ThingWhereUniqueInput> = z.object({
  thing_id: z.string().cuid()
})
.and(z.object({
  thing_id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => ThingWhereInputSchema),z.lazy(() => ThingWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ThingWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ThingWhereInputSchema),z.lazy(() => ThingWhereInputSchema).array() ]).optional(),
  index: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  type: z.union([ z.lazy(() => EnumSchemaTypeNullableFilterSchema),z.lazy(() => SchemaTypeSchema) ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  locale: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  sameAs: z.lazy(() => StringNullableListFilterSchema).optional(),
  jsonld: z.lazy(() => JsonNullableFilterSchema).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerListRelationFilterSchema).optional(),
  Answer_isAbout: z.lazy(() => AnswerListRelationFilterSchema).optional(),
  isUsedInValues: z.lazy(() => ValueListRelationFilterSchema).optional()
}).strict());

export const ThingOrderByWithAggregationInputSchema: z.ZodType<Prisma.ThingOrderByWithAggregationInput> = z.object({
  thing_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  name: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  locale: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  sameAs: z.lazy(() => SortOrderSchema).optional(),
  jsonld: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => ThingCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ThingAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ThingMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ThingMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ThingSumOrderByAggregateInputSchema).optional()
}).strict();

export const ThingScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ThingScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ThingScalarWhereWithAggregatesInputSchema),z.lazy(() => ThingScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ThingScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ThingScalarWhereWithAggregatesInputSchema),z.lazy(() => ThingScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  thing_id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  index: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  type: z.union([ z.lazy(() => EnumSchemaTypeNullableWithAggregatesFilterSchema),z.lazy(() => SchemaTypeSchema) ]).optional().nullable(),
  name: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  locale: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  sameAs: z.lazy(() => StringNullableListFilterSchema).optional(),
  jsonld: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional()
}).strict();

export const QuestionWhereInputSchema: z.ZodType<Prisma.QuestionWhereInput> = z.object({
  AND: z.union([ z.lazy(() => QuestionWhereInputSchema),z.lazy(() => QuestionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => QuestionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => QuestionWhereInputSchema),z.lazy(() => QuestionWhereInputSchema).array() ]).optional(),
  question_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  index: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  question: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  locale: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  asProperty: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  expectedValueType: z.union([ z.lazy(() => EnumDataTypeFilterSchema),z.lazy(() => DataTypeSchema) ]).optional(),
  expectedThingTypes: z.lazy(() => EnumSchemaTypeNullableListFilterSchema).optional(),
  Answer_isAnswering: z.lazy(() => AnswerListRelationFilterSchema).optional()
}).strict();

export const QuestionOrderByWithRelationInputSchema: z.ZodType<Prisma.QuestionOrderByWithRelationInput> = z.object({
  question_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  question: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  locale: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  asProperty: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  expectedValueType: z.lazy(() => SortOrderSchema).optional(),
  expectedThingTypes: z.lazy(() => SortOrderSchema).optional(),
  Answer_isAnswering: z.lazy(() => AnswerOrderByRelationAggregateInputSchema).optional()
}).strict();

export const QuestionWhereUniqueInputSchema: z.ZodType<Omit<Prisma.QuestionWhereUniqueInput, "question_id" | "index" | "createdAt" | "updatedAt">> = z.object({
  // omitted: question_id: z.string().cuid()
})
.and(z.object({
  // omitted: question_id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => QuestionWhereInputSchema),z.lazy(() => QuestionWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => QuestionWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => QuestionWhereInputSchema),z.lazy(() => QuestionWhereInputSchema).array() ]).optional(),
  // omitted: index: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  // omitted: createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  // omitted: updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  question: z.union([ z.lazy(() => StringNullableFilterSchema),z.string().min(10, { message: 'Question must be at least 10 characters long.' }) ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  locale: z.union([ z.lazy(() => StringNullableFilterSchema),z.string().min(2, { message: 'Locale must be at least 2 characters long.' }) ]).optional().nullable(),
  asProperty: z.union([ z.lazy(() => StringNullableFilterSchema),z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }) ]).optional().nullable(),
  expectedValueType: z.union([ z.lazy(() => EnumDataTypeFilterSchema),z.lazy(() => DataTypeSchema) ]).optional(),
  expectedThingTypes: z.lazy(() => EnumSchemaTypeNullableListFilterSchema).optional(),
  Answer_isAnswering: z.lazy(() => AnswerListRelationFilterSchema).optional()
}).strict());

export const QuestionOrderByWithAggregationInputSchema: z.ZodType<Prisma.QuestionOrderByWithAggregationInput> = z.object({
  question_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  question: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  locale: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  asProperty: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  expectedValueType: z.lazy(() => SortOrderSchema).optional(),
  expectedThingTypes: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => QuestionCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => QuestionAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => QuestionMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => QuestionMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => QuestionSumOrderByAggregateInputSchema).optional()
}).strict();

export const QuestionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.QuestionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => QuestionScalarWhereWithAggregatesInputSchema),z.lazy(() => QuestionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => QuestionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => QuestionScalarWhereWithAggregatesInputSchema),z.lazy(() => QuestionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  question_id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  index: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  question: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  locale: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  asProperty: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  expectedValueType: z.union([ z.lazy(() => EnumDataTypeWithAggregatesFilterSchema),z.lazy(() => DataTypeSchema) ]).optional(),
  expectedThingTypes: z.lazy(() => EnumSchemaTypeNullableListFilterSchema).optional()
}).strict();

export const AnswerWhereInputSchema: z.ZodType<Prisma.AnswerWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AnswerWhereInputSchema),z.lazy(() => AnswerWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnswerWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnswerWhereInputSchema),z.lazy(() => AnswerWhereInputSchema).array() ]).optional(),
  answer_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  index: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  isAnswering_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isAbout_id: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isAnsweredByAgent_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  values: z.lazy(() => ValueListRelationFilterSchema).optional(),
  isAnswering: z.union([ z.lazy(() => QuestionRelationFilterSchema),z.lazy(() => QuestionWhereInputSchema) ]).optional(),
  isAbout: z.union([ z.lazy(() => ThingNullableRelationFilterSchema),z.lazy(() => ThingWhereInputSchema) ]).optional().nullable(),
  isAnsweredByAgent: z.union([ z.lazy(() => ThingRelationFilterSchema),z.lazy(() => ThingWhereInputSchema) ]).optional(),
}).strict();

export const AnswerOrderByWithRelationInputSchema: z.ZodType<Prisma.AnswerOrderByWithRelationInput> = z.object({
  answer_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  isAnswering_id: z.lazy(() => SortOrderSchema).optional(),
  isAbout_id: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isAnsweredByAgent_id: z.lazy(() => SortOrderSchema).optional(),
  values: z.lazy(() => ValueOrderByRelationAggregateInputSchema).optional(),
  isAnswering: z.lazy(() => QuestionOrderByWithRelationInputSchema).optional(),
  isAbout: z.lazy(() => ThingOrderByWithRelationInputSchema).optional(),
  isAnsweredByAgent: z.lazy(() => ThingOrderByWithRelationInputSchema).optional()
}).strict();

export const AnswerWhereUniqueInputSchema: z.ZodType<Prisma.AnswerWhereUniqueInput> = z.object({
  answer_id: z.string().cuid()
})
.and(z.object({
  answer_id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => AnswerWhereInputSchema),z.lazy(() => AnswerWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnswerWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnswerWhereInputSchema),z.lazy(() => AnswerWhereInputSchema).array() ]).optional(),
  index: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  isAnswering_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isAbout_id: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isAnsweredByAgent_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  values: z.lazy(() => ValueListRelationFilterSchema).optional(),
  isAnswering: z.union([ z.lazy(() => QuestionRelationFilterSchema),z.lazy(() => QuestionWhereInputSchema) ]).optional(),
  isAbout: z.union([ z.lazy(() => ThingNullableRelationFilterSchema),z.lazy(() => ThingWhereInputSchema) ]).optional().nullable(),
  isAnsweredByAgent: z.union([ z.lazy(() => ThingRelationFilterSchema),z.lazy(() => ThingWhereInputSchema) ]).optional(),
}).strict());

export const AnswerOrderByWithAggregationInputSchema: z.ZodType<Prisma.AnswerOrderByWithAggregationInput> = z.object({
  answer_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  isAnswering_id: z.lazy(() => SortOrderSchema).optional(),
  isAbout_id: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isAnsweredByAgent_id: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => AnswerCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => AnswerAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => AnswerMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => AnswerMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => AnswerSumOrderByAggregateInputSchema).optional()
}).strict();

export const AnswerScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.AnswerScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => AnswerScalarWhereWithAggregatesInputSchema),z.lazy(() => AnswerScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnswerScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnswerScalarWhereWithAggregatesInputSchema),z.lazy(() => AnswerScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  answer_id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  index: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  isAnswering_id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  isAbout_id: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  isAnsweredByAgent_id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const ValueWhereInputSchema: z.ZodType<Prisma.ValueWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ValueWhereInputSchema),z.lazy(() => ValueWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ValueWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ValueWhereInputSchema),z.lazy(() => ValueWhereInputSchema).array() ]).optional(),
  value_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  index: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  valueType: z.union([ z.lazy(() => EnumDataTypeFilterSchema),z.lazy(() => DataTypeSchema) ]).optional(),
  valueAsString: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  valueAsNumber: z.union([ z.lazy(() => FloatNullableFilterSchema),z.number() ]).optional().nullable(),
  valueAsBoolean: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  valueAsThing_id: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isValueFor_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  valueAsThing: z.union([ z.lazy(() => ThingNullableRelationFilterSchema),z.lazy(() => ThingWhereInputSchema) ]).optional().nullable(),
  isValueFor: z.union([ z.lazy(() => AnswerRelationFilterSchema),z.lazy(() => AnswerWhereInputSchema) ]).optional(),
}).strict();

export const ValueOrderByWithRelationInputSchema: z.ZodType<Prisma.ValueOrderByWithRelationInput> = z.object({
  value_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  valueType: z.lazy(() => SortOrderSchema).optional(),
  valueAsString: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  valueAsNumber: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  valueAsBoolean: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  valueAsThing_id: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isValueFor_id: z.lazy(() => SortOrderSchema).optional(),
  valueAsThing: z.lazy(() => ThingOrderByWithRelationInputSchema).optional(),
  isValueFor: z.lazy(() => AnswerOrderByWithRelationInputSchema).optional()
}).strict();

export const ValueWhereUniqueInputSchema: z.ZodType<Prisma.ValueWhereUniqueInput> = z.object({
  value_id: z.string().cuid()
})
.and(z.object({
  value_id: z.string().cuid().optional(),
  AND: z.union([ z.lazy(() => ValueWhereInputSchema),z.lazy(() => ValueWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ValueWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ValueWhereInputSchema),z.lazy(() => ValueWhereInputSchema).array() ]).optional(),
  index: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  valueType: z.union([ z.lazy(() => EnumDataTypeFilterSchema),z.lazy(() => DataTypeSchema) ]).optional(),
  valueAsString: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  valueAsNumber: z.union([ z.lazy(() => FloatNullableFilterSchema),z.number() ]).optional().nullable(),
  valueAsBoolean: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  valueAsThing_id: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isValueFor_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  valueAsThing: z.union([ z.lazy(() => ThingNullableRelationFilterSchema),z.lazy(() => ThingWhereInputSchema) ]).optional().nullable(),
  isValueFor: z.union([ z.lazy(() => AnswerRelationFilterSchema),z.lazy(() => AnswerWhereInputSchema) ]).optional(),
}).strict());

export const ValueOrderByWithAggregationInputSchema: z.ZodType<Prisma.ValueOrderByWithAggregationInput> = z.object({
  value_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  valueType: z.lazy(() => SortOrderSchema).optional(),
  valueAsString: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  valueAsNumber: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  valueAsBoolean: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  valueAsThing_id: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  isValueFor_id: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ValueCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ValueAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ValueMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ValueMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ValueSumOrderByAggregateInputSchema).optional()
}).strict();

export const ValueScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ValueScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ValueScalarWhereWithAggregatesInputSchema),z.lazy(() => ValueScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ValueScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ValueScalarWhereWithAggregatesInputSchema),z.lazy(() => ValueScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  value_id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  index: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  valueType: z.union([ z.lazy(() => EnumDataTypeWithAggregatesFilterSchema),z.lazy(() => DataTypeSchema) ]).optional(),
  valueAsString: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  valueAsNumber: z.union([ z.lazy(() => FloatNullableWithAggregatesFilterSchema),z.number() ]).optional().nullable(),
  valueAsBoolean: z.union([ z.lazy(() => BoolNullableWithAggregatesFilterSchema),z.boolean() ]).optional().nullable(),
  valueAsThing_id: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  isValueFor_id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export const ThingCreateInputSchema: z.ZodType<Prisma.ThingCreateInput> = z.object({
  thing_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  type: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  name: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingCreatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerCreateNestedManyWithoutIsAnsweredByAgentInputSchema).optional(),
  Answer_isAbout: z.lazy(() => AnswerCreateNestedManyWithoutIsAboutInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueCreateNestedManyWithoutValueAsThingInputSchema).optional()
}).strict();

export const ThingUncheckedCreateInputSchema: z.ZodType<Prisma.ThingUncheckedCreateInput> = z.object({
  thing_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  type: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  name: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingCreatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerUncheckedCreateNestedManyWithoutIsAnsweredByAgentInputSchema).optional(),
  Answer_isAbout: z.lazy(() => AnswerUncheckedCreateNestedManyWithoutIsAboutInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueUncheckedCreateNestedManyWithoutValueAsThingInputSchema).optional()
}).strict();

export const ThingUpdateInputSchema: z.ZodType<Prisma.ThingUpdateInput> = z.object({
  thing_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NullableEnumSchemaTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingUpdatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerUpdateManyWithoutIsAnsweredByAgentNestedInputSchema).optional(),
  Answer_isAbout: z.lazy(() => AnswerUpdateManyWithoutIsAboutNestedInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueUpdateManyWithoutValueAsThingNestedInputSchema).optional()
}).strict();

export const ThingUncheckedUpdateInputSchema: z.ZodType<Prisma.ThingUncheckedUpdateInput> = z.object({
  thing_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NullableEnumSchemaTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingUpdatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerUncheckedUpdateManyWithoutIsAnsweredByAgentNestedInputSchema).optional(),
  Answer_isAbout: z.lazy(() => AnswerUncheckedUpdateManyWithoutIsAboutNestedInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueUncheckedUpdateManyWithoutValueAsThingNestedInputSchema).optional()
}).strict();

export const ThingCreateManyInputSchema: z.ZodType<Prisma.ThingCreateManyInput> = z.object({
  thing_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  type: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  name: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingCreatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const ThingUpdateManyMutationInputSchema: z.ZodType<Prisma.ThingUpdateManyMutationInput> = z.object({
  thing_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NullableEnumSchemaTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingUpdatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const ThingUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ThingUncheckedUpdateManyInput> = z.object({
  thing_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NullableEnumSchemaTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingUpdatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export const QuestionCreateInputSchema: z.ZodType<Omit<Prisma.QuestionCreateInput, "question_id" | "index" | "createdAt" | "updatedAt">> = z.object({
  // omitted: question_id: z.string().cuid().optional(),
  // omitted: index: z.number().int().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  question: z.string().min(10, { message: 'Question must be at least 10 characters long.' }).optional().nullable(),
  description: z.string().optional().nullable(),
  locale: z.string().min(2, { message: 'Locale must be at least 2 characters long.' }).optional().nullable(),
  asProperty: z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }).optional().nullable(),
  expectedValueType: z.lazy(() => DataTypeSchema),
  expectedThingTypes: z.union([ z.lazy(() => QuestionCreateexpectedThingTypesInputSchema),z.lazy(() => SchemaTypeSchema).array() ]).optional(),
  Answer_isAnswering: z.lazy(() => AnswerCreateNestedManyWithoutIsAnsweringInputSchema).optional()
}).strict();

export const QuestionUncheckedCreateInputSchema: z.ZodType<Omit<Prisma.QuestionUncheckedCreateInput, "question_id" | "index" | "createdAt" | "updatedAt">> = z.object({
  // omitted: question_id: z.string().cuid().optional(),
  // omitted: index: z.number().int().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  question: z.string().min(10, { message: 'Question must be at least 10 characters long.' }).optional().nullable(),
  description: z.string().optional().nullable(),
  locale: z.string().min(2, { message: 'Locale must be at least 2 characters long.' }).optional().nullable(),
  asProperty: z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }).optional().nullable(),
  expectedValueType: z.lazy(() => DataTypeSchema),
  expectedThingTypes: z.union([ z.lazy(() => QuestionCreateexpectedThingTypesInputSchema),z.lazy(() => SchemaTypeSchema).array() ]).optional(),
  Answer_isAnswering: z.lazy(() => AnswerUncheckedCreateNestedManyWithoutIsAnsweringInputSchema).optional()
}).strict();

export const QuestionUpdateInputSchema: z.ZodType<Omit<Prisma.QuestionUpdateInput, "question_id" | "index" | "createdAt" | "updatedAt">> = z.object({
  // omitted: question_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  question: z.union([ z.string().min(10, { message: 'Question must be at least 10 characters long.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string().min(2, { message: 'Locale must be at least 2 characters long.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  asProperty: z.union([ z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expectedValueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  expectedThingTypes: z.union([ z.lazy(() => QuestionUpdateexpectedThingTypesInputSchema),z.lazy(() => SchemaTypeSchema).array() ]).optional(),
  Answer_isAnswering: z.lazy(() => AnswerUpdateManyWithoutIsAnsweringNestedInputSchema).optional()
}).strict();

export const QuestionUncheckedUpdateInputSchema: z.ZodType<Omit<Prisma.QuestionUncheckedUpdateInput, "question_id" | "index" | "createdAt" | "updatedAt">> = z.object({
  // omitted: question_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  question: z.union([ z.string().min(10, { message: 'Question must be at least 10 characters long.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string().min(2, { message: 'Locale must be at least 2 characters long.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  asProperty: z.union([ z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expectedValueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  expectedThingTypes: z.union([ z.lazy(() => QuestionUpdateexpectedThingTypesInputSchema),z.lazy(() => SchemaTypeSchema).array() ]).optional(),
  Answer_isAnswering: z.lazy(() => AnswerUncheckedUpdateManyWithoutIsAnsweringNestedInputSchema).optional()
}).strict();

export const QuestionCreateManyInputSchema: z.ZodType<Omit<Prisma.QuestionCreateManyInput, "question_id" | "index" | "createdAt" | "updatedAt">> = z.object({
  // omitted: question_id: z.string().cuid().optional(),
  // omitted: index: z.number().int().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  question: z.string().min(10, { message: 'Question must be at least 10 characters long.' }).optional().nullable(),
  description: z.string().optional().nullable(),
  locale: z.string().min(2, { message: 'Locale must be at least 2 characters long.' }).optional().nullable(),
  asProperty: z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }).optional().nullable(),
  expectedValueType: z.lazy(() => DataTypeSchema),
  expectedThingTypes: z.union([ z.lazy(() => QuestionCreateexpectedThingTypesInputSchema),z.lazy(() => SchemaTypeSchema).array() ]).optional(),
}).strict();

export const QuestionUpdateManyMutationInputSchema: z.ZodType<Omit<Prisma.QuestionUpdateManyMutationInput, "question_id" | "index" | "createdAt" | "updatedAt">> = z.object({
  // omitted: question_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  question: z.union([ z.string().min(10, { message: 'Question must be at least 10 characters long.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string().min(2, { message: 'Locale must be at least 2 characters long.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  asProperty: z.union([ z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expectedValueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  expectedThingTypes: z.union([ z.lazy(() => QuestionUpdateexpectedThingTypesInputSchema),z.lazy(() => SchemaTypeSchema).array() ]).optional(),
}).strict();

export const QuestionUncheckedUpdateManyInputSchema: z.ZodType<Omit<Prisma.QuestionUncheckedUpdateManyInput, "question_id" | "index" | "createdAt" | "updatedAt">> = z.object({
  // omitted: question_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  question: z.union([ z.string().min(10, { message: 'Question must be at least 10 characters long.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string().min(2, { message: 'Locale must be at least 2 characters long.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  asProperty: z.union([ z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expectedValueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  expectedThingTypes: z.union([ z.lazy(() => QuestionUpdateexpectedThingTypesInputSchema),z.lazy(() => SchemaTypeSchema).array() ]).optional(),
}).strict();

export const AnswerCreateInputSchema: z.ZodType<Prisma.AnswerCreateInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  values: z.lazy(() => ValueCreateNestedManyWithoutIsValueForInputSchema).optional(),
  isAnswering: z.lazy(() => QuestionCreateNestedOneWithoutAnswer_isAnsweringInputSchema),
  isAbout: z.lazy(() => ThingCreateNestedOneWithoutAnswer_isAboutInputSchema).optional(),
  isAnsweredByAgent: z.lazy(() => ThingCreateNestedOneWithoutAnswer_isAnsweredByAgentInputSchema)
}).strict();

export const AnswerUncheckedCreateInputSchema: z.ZodType<Prisma.AnswerUncheckedCreateInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  isAnswering_id: z.string(),
  isAbout_id: z.string().optional().nullable(),
  isAnsweredByAgent_id: z.string(),
  values: z.lazy(() => ValueUncheckedCreateNestedManyWithoutIsValueForInputSchema).optional()
}).strict();

export const AnswerUpdateInputSchema: z.ZodType<Prisma.AnswerUpdateInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  values: z.lazy(() => ValueUpdateManyWithoutIsValueForNestedInputSchema).optional(),
  isAnswering: z.lazy(() => QuestionUpdateOneRequiredWithoutAnswer_isAnsweringNestedInputSchema).optional(),
  isAbout: z.lazy(() => ThingUpdateOneWithoutAnswer_isAboutNestedInputSchema).optional(),
  isAnsweredByAgent: z.lazy(() => ThingUpdateOneRequiredWithoutAnswer_isAnsweredByAgentNestedInputSchema).optional()
}).strict();

export const AnswerUncheckedUpdateInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAnswering_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isAbout_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isAnsweredByAgent_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  values: z.lazy(() => ValueUncheckedUpdateManyWithoutIsValueForNestedInputSchema).optional()
}).strict();

export const AnswerCreateManyInputSchema: z.ZodType<Prisma.AnswerCreateManyInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  isAnswering_id: z.string(),
  isAbout_id: z.string().optional().nullable(),
  isAnsweredByAgent_id: z.string()
}).strict();

export const AnswerUpdateManyMutationInputSchema: z.ZodType<Prisma.AnswerUpdateManyMutationInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnswerUncheckedUpdateManyInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateManyInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAnswering_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isAbout_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isAnsweredByAgent_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ValueCreateInputSchema: z.ZodType<Prisma.ValueCreateInput> = z.object({
  value_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  valueType: z.lazy(() => DataTypeSchema),
  valueAsString: z.string().optional().nullable(),
  valueAsNumber: z.number().optional().nullable(),
  valueAsBoolean: z.boolean().optional().nullable(),
  valueAsThing: z.lazy(() => ThingCreateNestedOneWithoutIsUsedInValuesInputSchema).optional(),
  isValueFor: z.lazy(() => AnswerCreateNestedOneWithoutValuesInputSchema)
}).strict();

export const ValueUncheckedCreateInputSchema: z.ZodType<Prisma.ValueUncheckedCreateInput> = z.object({
  value_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  valueType: z.lazy(() => DataTypeSchema),
  valueAsString: z.string().optional().nullable(),
  valueAsNumber: z.number().optional().nullable(),
  valueAsBoolean: z.boolean().optional().nullable(),
  valueAsThing_id: z.string().optional().nullable(),
  isValueFor_id: z.string()
}).strict();

export const ValueUpdateInputSchema: z.ZodType<Prisma.ValueUpdateInput> = z.object({
  value_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  valueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  valueAsString: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsNumber: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsBoolean: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsThing: z.lazy(() => ThingUpdateOneWithoutIsUsedInValuesNestedInputSchema).optional(),
  isValueFor: z.lazy(() => AnswerUpdateOneRequiredWithoutValuesNestedInputSchema).optional()
}).strict();

export const ValueUncheckedUpdateInputSchema: z.ZodType<Prisma.ValueUncheckedUpdateInput> = z.object({
  value_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  valueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  valueAsString: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsNumber: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsBoolean: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsThing_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isValueFor_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ValueCreateManyInputSchema: z.ZodType<Prisma.ValueCreateManyInput> = z.object({
  value_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  valueType: z.lazy(() => DataTypeSchema),
  valueAsString: z.string().optional().nullable(),
  valueAsNumber: z.number().optional().nullable(),
  valueAsBoolean: z.boolean().optional().nullable(),
  valueAsThing_id: z.string().optional().nullable(),
  isValueFor_id: z.string()
}).strict();

export const ValueUpdateManyMutationInputSchema: z.ZodType<Prisma.ValueUpdateManyMutationInput> = z.object({
  value_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  valueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  valueAsString: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsNumber: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsBoolean: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ValueUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ValueUncheckedUpdateManyInput> = z.object({
  value_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  valueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  valueAsString: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsNumber: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsBoolean: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsThing_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isValueFor_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const EnumSchemaTypeNullableFilterSchema: z.ZodType<Prisma.EnumSchemaTypeNullableFilter> = z.object({
  equals: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  in: z.lazy(() => SchemaTypeSchema).array().optional().nullable(),
  notIn: z.lazy(() => SchemaTypeSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NestedEnumSchemaTypeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z.object({
  equals: z.string().array().optional().nullable(),
  has: z.string().optional().nullable(),
  hasEvery: z.string().array().optional(),
  hasSome: z.string().array().optional(),
  isEmpty: z.boolean().optional()
}).strict();

export const JsonNullableFilterSchema: z.ZodType<Prisma.JsonNullableFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional()
}).strict();

export const AnswerListRelationFilterSchema: z.ZodType<Prisma.AnswerListRelationFilter> = z.object({
  every: z.lazy(() => AnswerWhereInputSchema).optional(),
  some: z.lazy(() => AnswerWhereInputSchema).optional(),
  none: z.lazy(() => AnswerWhereInputSchema).optional()
}).strict();

export const ValueListRelationFilterSchema: z.ZodType<Prisma.ValueListRelationFilter> = z.object({
  every: z.lazy(() => ValueWhereInputSchema).optional(),
  some: z.lazy(() => ValueWhereInputSchema).optional(),
  none: z.lazy(() => ValueWhereInputSchema).optional()
}).strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.object({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional()
}).strict();

export const AnswerOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AnswerOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ValueOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ValueOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ThingCountOrderByAggregateInputSchema: z.ZodType<Prisma.ThingCountOrderByAggregateInput> = z.object({
  thing_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  sameAs: z.lazy(() => SortOrderSchema).optional(),
  jsonld: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ThingAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ThingAvgOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ThingMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ThingMaxOrderByAggregateInput> = z.object({
  thing_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ThingMinOrderByAggregateInputSchema: z.ZodType<Prisma.ThingMinOrderByAggregateInput> = z.object({
  thing_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ThingSumOrderByAggregateInputSchema: z.ZodType<Prisma.ThingSumOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const EnumSchemaTypeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.EnumSchemaTypeNullableWithAggregatesFilter> = z.object({
  equals: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  in: z.lazy(() => SchemaTypeSchema).array().optional().nullable(),
  notIn: z.lazy(() => SchemaTypeSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NestedEnumSchemaTypeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumSchemaTypeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumSchemaTypeNullableFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const JsonNullableWithAggregatesFilterSchema: z.ZodType<Prisma.JsonNullableWithAggregatesFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedJsonNullableFilterSchema).optional()
}).strict();

export const EnumDataTypeFilterSchema: z.ZodType<Prisma.EnumDataTypeFilter> = z.object({
  equals: z.lazy(() => DataTypeSchema).optional(),
  in: z.lazy(() => DataTypeSchema).array().optional(),
  notIn: z.lazy(() => DataTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => NestedEnumDataTypeFilterSchema) ]).optional(),
}).strict();

export const EnumSchemaTypeNullableListFilterSchema: z.ZodType<Prisma.EnumSchemaTypeNullableListFilter> = z.object({
  equals: z.lazy(() => SchemaTypeSchema).array().optional().nullable(),
  has: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  hasEvery: z.lazy(() => SchemaTypeSchema).array().optional(),
  hasSome: z.lazy(() => SchemaTypeSchema).array().optional(),
  isEmpty: z.boolean().optional()
}).strict();

export const QuestionCountOrderByAggregateInputSchema: z.ZodType<Prisma.QuestionCountOrderByAggregateInput> = z.object({
  question_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  question: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  asProperty: z.lazy(() => SortOrderSchema).optional(),
  expectedValueType: z.lazy(() => SortOrderSchema).optional(),
  expectedThingTypes: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const QuestionAvgOrderByAggregateInputSchema: z.ZodType<Prisma.QuestionAvgOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const QuestionMaxOrderByAggregateInputSchema: z.ZodType<Prisma.QuestionMaxOrderByAggregateInput> = z.object({
  question_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  question: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  asProperty: z.lazy(() => SortOrderSchema).optional(),
  expectedValueType: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const QuestionMinOrderByAggregateInputSchema: z.ZodType<Prisma.QuestionMinOrderByAggregateInput> = z.object({
  question_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  question: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  asProperty: z.lazy(() => SortOrderSchema).optional(),
  expectedValueType: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const QuestionSumOrderByAggregateInputSchema: z.ZodType<Prisma.QuestionSumOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const EnumDataTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumDataTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => DataTypeSchema).optional(),
  in: z.lazy(() => DataTypeSchema).array().optional(),
  notIn: z.lazy(() => DataTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => NestedEnumDataTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumDataTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumDataTypeFilterSchema).optional()
}).strict();

export const QuestionRelationFilterSchema: z.ZodType<Prisma.QuestionRelationFilter> = z.object({
  is: z.lazy(() => QuestionWhereInputSchema).optional(),
  isNot: z.lazy(() => QuestionWhereInputSchema).optional()
}).strict();

export const ThingNullableRelationFilterSchema: z.ZodType<Prisma.ThingNullableRelationFilter> = z.object({
  is: z.lazy(() => ThingWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ThingWhereInputSchema).optional().nullable()
}).strict();

export const ThingRelationFilterSchema: z.ZodType<Prisma.ThingRelationFilter> = z.object({
  is: z.lazy(() => ThingWhereInputSchema).optional(),
  isNot: z.lazy(() => ThingWhereInputSchema).optional()
}).strict();

export const AnswerCountOrderByAggregateInputSchema: z.ZodType<Prisma.AnswerCountOrderByAggregateInput> = z.object({
  answer_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  isAnswering_id: z.lazy(() => SortOrderSchema).optional(),
  isAbout_id: z.lazy(() => SortOrderSchema).optional(),
  isAnsweredByAgent_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AnswerAvgOrderByAggregateInputSchema: z.ZodType<Prisma.AnswerAvgOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AnswerMaxOrderByAggregateInputSchema: z.ZodType<Prisma.AnswerMaxOrderByAggregateInput> = z.object({
  answer_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  isAnswering_id: z.lazy(() => SortOrderSchema).optional(),
  isAbout_id: z.lazy(() => SortOrderSchema).optional(),
  isAnsweredByAgent_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AnswerMinOrderByAggregateInputSchema: z.ZodType<Prisma.AnswerMinOrderByAggregateInput> = z.object({
  answer_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  isAnswering_id: z.lazy(() => SortOrderSchema).optional(),
  isAbout_id: z.lazy(() => SortOrderSchema).optional(),
  isAnsweredByAgent_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const AnswerSumOrderByAggregateInputSchema: z.ZodType<Prisma.AnswerSumOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FloatNullableFilterSchema: z.ZodType<Prisma.FloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const BoolNullableFilterSchema: z.ZodType<Prisma.BoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const AnswerRelationFilterSchema: z.ZodType<Prisma.AnswerRelationFilter> = z.object({
  is: z.lazy(() => AnswerWhereInputSchema).optional(),
  isNot: z.lazy(() => AnswerWhereInputSchema).optional()
}).strict();

export const ValueCountOrderByAggregateInputSchema: z.ZodType<Prisma.ValueCountOrderByAggregateInput> = z.object({
  value_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  valueType: z.lazy(() => SortOrderSchema).optional(),
  valueAsString: z.lazy(() => SortOrderSchema).optional(),
  valueAsNumber: z.lazy(() => SortOrderSchema).optional(),
  valueAsBoolean: z.lazy(() => SortOrderSchema).optional(),
  valueAsThing_id: z.lazy(() => SortOrderSchema).optional(),
  isValueFor_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ValueAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ValueAvgOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional(),
  valueAsNumber: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ValueMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ValueMaxOrderByAggregateInput> = z.object({
  value_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  valueType: z.lazy(() => SortOrderSchema).optional(),
  valueAsString: z.lazy(() => SortOrderSchema).optional(),
  valueAsNumber: z.lazy(() => SortOrderSchema).optional(),
  valueAsBoolean: z.lazy(() => SortOrderSchema).optional(),
  valueAsThing_id: z.lazy(() => SortOrderSchema).optional(),
  isValueFor_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ValueMinOrderByAggregateInputSchema: z.ZodType<Prisma.ValueMinOrderByAggregateInput> = z.object({
  value_id: z.lazy(() => SortOrderSchema).optional(),
  index: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  valueType: z.lazy(() => SortOrderSchema).optional(),
  valueAsString: z.lazy(() => SortOrderSchema).optional(),
  valueAsNumber: z.lazy(() => SortOrderSchema).optional(),
  valueAsBoolean: z.lazy(() => SortOrderSchema).optional(),
  valueAsThing_id: z.lazy(() => SortOrderSchema).optional(),
  isValueFor_id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ValueSumOrderByAggregateInputSchema: z.ZodType<Prisma.ValueSumOrderByAggregateInput> = z.object({
  index: z.lazy(() => SortOrderSchema).optional(),
  valueAsNumber: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const FloatNullableWithAggregatesFilterSchema: z.ZodType<Prisma.FloatNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatNullableFilterSchema).optional()
}).strict();

export const BoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.BoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional()
}).strict();

export const ThingCreatesameAsInputSchema: z.ZodType<Prisma.ThingCreatesameAsInput> = z.object({
  set: z.string().array()
}).strict();

export const AnswerCreateNestedManyWithoutIsAnsweredByAgentInputSchema: z.ZodType<Prisma.AnswerCreateNestedManyWithoutIsAnsweredByAgentInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerCreateWithoutIsAnsweredByAgentInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyIsAnsweredByAgentInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AnswerCreateNestedManyWithoutIsAboutInputSchema: z.ZodType<Prisma.AnswerCreateNestedManyWithoutIsAboutInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAboutInputSchema),z.lazy(() => AnswerCreateWithoutIsAboutInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutIsAboutInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAboutInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutIsAboutInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutIsAboutInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyIsAboutInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ValueCreateNestedManyWithoutValueAsThingInputSchema: z.ZodType<Prisma.ValueCreateNestedManyWithoutValueAsThingInput> = z.object({
  create: z.union([ z.lazy(() => ValueCreateWithoutValueAsThingInputSchema),z.lazy(() => ValueCreateWithoutValueAsThingInputSchema).array(),z.lazy(() => ValueUncheckedCreateWithoutValueAsThingInputSchema),z.lazy(() => ValueUncheckedCreateWithoutValueAsThingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ValueCreateOrConnectWithoutValueAsThingInputSchema),z.lazy(() => ValueCreateOrConnectWithoutValueAsThingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ValueCreateManyValueAsThingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AnswerUncheckedCreateNestedManyWithoutIsAnsweredByAgentInputSchema: z.ZodType<Prisma.AnswerUncheckedCreateNestedManyWithoutIsAnsweredByAgentInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerCreateWithoutIsAnsweredByAgentInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyIsAnsweredByAgentInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AnswerUncheckedCreateNestedManyWithoutIsAboutInputSchema: z.ZodType<Prisma.AnswerUncheckedCreateNestedManyWithoutIsAboutInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAboutInputSchema),z.lazy(() => AnswerCreateWithoutIsAboutInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutIsAboutInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAboutInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutIsAboutInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutIsAboutInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyIsAboutInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ValueUncheckedCreateNestedManyWithoutValueAsThingInputSchema: z.ZodType<Prisma.ValueUncheckedCreateNestedManyWithoutValueAsThingInput> = z.object({
  create: z.union([ z.lazy(() => ValueCreateWithoutValueAsThingInputSchema),z.lazy(() => ValueCreateWithoutValueAsThingInputSchema).array(),z.lazy(() => ValueUncheckedCreateWithoutValueAsThingInputSchema),z.lazy(() => ValueUncheckedCreateWithoutValueAsThingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ValueCreateOrConnectWithoutValueAsThingInputSchema),z.lazy(() => ValueCreateOrConnectWithoutValueAsThingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ValueCreateManyValueAsThingInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const NullableEnumSchemaTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableEnumSchemaTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => SchemaTypeSchema).optional().nullable()
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable()
}).strict();

export const ThingUpdatesameAsInputSchema: z.ZodType<Prisma.ThingUpdatesameAsInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const AnswerUpdateManyWithoutIsAnsweredByAgentNestedInputSchema: z.ZodType<Prisma.AnswerUpdateManyWithoutIsAnsweredByAgentNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerCreateWithoutIsAnsweredByAgentInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AnswerUpsertWithWhereUniqueWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUpsertWithWhereUniqueWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyIsAnsweredByAgentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AnswerUpdateWithWhereUniqueWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUpdateWithWhereUniqueWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AnswerUpdateManyWithWhereWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUpdateManyWithWhereWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AnswerScalarWhereInputSchema),z.lazy(() => AnswerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AnswerUpdateManyWithoutIsAboutNestedInputSchema: z.ZodType<Prisma.AnswerUpdateManyWithoutIsAboutNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAboutInputSchema),z.lazy(() => AnswerCreateWithoutIsAboutInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutIsAboutInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAboutInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutIsAboutInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutIsAboutInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AnswerUpsertWithWhereUniqueWithoutIsAboutInputSchema),z.lazy(() => AnswerUpsertWithWhereUniqueWithoutIsAboutInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyIsAboutInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AnswerUpdateWithWhereUniqueWithoutIsAboutInputSchema),z.lazy(() => AnswerUpdateWithWhereUniqueWithoutIsAboutInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AnswerUpdateManyWithWhereWithoutIsAboutInputSchema),z.lazy(() => AnswerUpdateManyWithWhereWithoutIsAboutInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AnswerScalarWhereInputSchema),z.lazy(() => AnswerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ValueUpdateManyWithoutValueAsThingNestedInputSchema: z.ZodType<Prisma.ValueUpdateManyWithoutValueAsThingNestedInput> = z.object({
  create: z.union([ z.lazy(() => ValueCreateWithoutValueAsThingInputSchema),z.lazy(() => ValueCreateWithoutValueAsThingInputSchema).array(),z.lazy(() => ValueUncheckedCreateWithoutValueAsThingInputSchema),z.lazy(() => ValueUncheckedCreateWithoutValueAsThingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ValueCreateOrConnectWithoutValueAsThingInputSchema),z.lazy(() => ValueCreateOrConnectWithoutValueAsThingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ValueUpsertWithWhereUniqueWithoutValueAsThingInputSchema),z.lazy(() => ValueUpsertWithWhereUniqueWithoutValueAsThingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ValueCreateManyValueAsThingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ValueUpdateWithWhereUniqueWithoutValueAsThingInputSchema),z.lazy(() => ValueUpdateWithWhereUniqueWithoutValueAsThingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ValueUpdateManyWithWhereWithoutValueAsThingInputSchema),z.lazy(() => ValueUpdateManyWithWhereWithoutValueAsThingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ValueScalarWhereInputSchema),z.lazy(() => ValueScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AnswerUncheckedUpdateManyWithoutIsAnsweredByAgentNestedInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateManyWithoutIsAnsweredByAgentNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerCreateWithoutIsAnsweredByAgentInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AnswerUpsertWithWhereUniqueWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUpsertWithWhereUniqueWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyIsAnsweredByAgentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AnswerUpdateWithWhereUniqueWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUpdateWithWhereUniqueWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AnswerUpdateManyWithWhereWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUpdateManyWithWhereWithoutIsAnsweredByAgentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AnswerScalarWhereInputSchema),z.lazy(() => AnswerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AnswerUncheckedUpdateManyWithoutIsAboutNestedInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateManyWithoutIsAboutNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAboutInputSchema),z.lazy(() => AnswerCreateWithoutIsAboutInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutIsAboutInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAboutInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutIsAboutInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutIsAboutInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AnswerUpsertWithWhereUniqueWithoutIsAboutInputSchema),z.lazy(() => AnswerUpsertWithWhereUniqueWithoutIsAboutInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyIsAboutInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AnswerUpdateWithWhereUniqueWithoutIsAboutInputSchema),z.lazy(() => AnswerUpdateWithWhereUniqueWithoutIsAboutInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AnswerUpdateManyWithWhereWithoutIsAboutInputSchema),z.lazy(() => AnswerUpdateManyWithWhereWithoutIsAboutInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AnswerScalarWhereInputSchema),z.lazy(() => AnswerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ValueUncheckedUpdateManyWithoutValueAsThingNestedInputSchema: z.ZodType<Prisma.ValueUncheckedUpdateManyWithoutValueAsThingNestedInput> = z.object({
  create: z.union([ z.lazy(() => ValueCreateWithoutValueAsThingInputSchema),z.lazy(() => ValueCreateWithoutValueAsThingInputSchema).array(),z.lazy(() => ValueUncheckedCreateWithoutValueAsThingInputSchema),z.lazy(() => ValueUncheckedCreateWithoutValueAsThingInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ValueCreateOrConnectWithoutValueAsThingInputSchema),z.lazy(() => ValueCreateOrConnectWithoutValueAsThingInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ValueUpsertWithWhereUniqueWithoutValueAsThingInputSchema),z.lazy(() => ValueUpsertWithWhereUniqueWithoutValueAsThingInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ValueCreateManyValueAsThingInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ValueUpdateWithWhereUniqueWithoutValueAsThingInputSchema),z.lazy(() => ValueUpdateWithWhereUniqueWithoutValueAsThingInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ValueUpdateManyWithWhereWithoutValueAsThingInputSchema),z.lazy(() => ValueUpdateManyWithWhereWithoutValueAsThingInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ValueScalarWhereInputSchema),z.lazy(() => ValueScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const QuestionCreateexpectedThingTypesInputSchema: z.ZodType<Prisma.QuestionCreateexpectedThingTypesInput> = z.object({
  set: z.lazy(() => SchemaTypeSchema).array()
}).strict();

export const AnswerCreateNestedManyWithoutIsAnsweringInputSchema: z.ZodType<Prisma.AnswerCreateNestedManyWithoutIsAnsweringInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAnsweringInputSchema),z.lazy(() => AnswerCreateWithoutIsAnsweringInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweringInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweringInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweringInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyIsAnsweringInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const AnswerUncheckedCreateNestedManyWithoutIsAnsweringInputSchema: z.ZodType<Prisma.AnswerUncheckedCreateNestedManyWithoutIsAnsweringInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAnsweringInputSchema),z.lazy(() => AnswerCreateWithoutIsAnsweringInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweringInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweringInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweringInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyIsAnsweringInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const EnumDataTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumDataTypeFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => DataTypeSchema).optional()
}).strict();

export const QuestionUpdateexpectedThingTypesInputSchema: z.ZodType<Prisma.QuestionUpdateexpectedThingTypesInput> = z.object({
  set: z.lazy(() => SchemaTypeSchema).array().optional(),
  push: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => SchemaTypeSchema).array() ]).optional(),
}).strict();

export const AnswerUpdateManyWithoutIsAnsweringNestedInputSchema: z.ZodType<Prisma.AnswerUpdateManyWithoutIsAnsweringNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAnsweringInputSchema),z.lazy(() => AnswerCreateWithoutIsAnsweringInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweringInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweringInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweringInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AnswerUpsertWithWhereUniqueWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUpsertWithWhereUniqueWithoutIsAnsweringInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyIsAnsweringInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AnswerUpdateWithWhereUniqueWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUpdateWithWhereUniqueWithoutIsAnsweringInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AnswerUpdateManyWithWhereWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUpdateManyWithWhereWithoutIsAnsweringInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AnswerScalarWhereInputSchema),z.lazy(() => AnswerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const AnswerUncheckedUpdateManyWithoutIsAnsweringNestedInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateManyWithoutIsAnsweringNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAnsweringInputSchema),z.lazy(() => AnswerCreateWithoutIsAnsweringInputSchema).array(),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweringInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweringInputSchema),z.lazy(() => AnswerCreateOrConnectWithoutIsAnsweringInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => AnswerUpsertWithWhereUniqueWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUpsertWithWhereUniqueWithoutIsAnsweringInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AnswerCreateManyIsAnsweringInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => AnswerWhereUniqueInputSchema),z.lazy(() => AnswerWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => AnswerUpdateWithWhereUniqueWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUpdateWithWhereUniqueWithoutIsAnsweringInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => AnswerUpdateManyWithWhereWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUpdateManyWithWhereWithoutIsAnsweringInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => AnswerScalarWhereInputSchema),z.lazy(() => AnswerScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ValueCreateNestedManyWithoutIsValueForInputSchema: z.ZodType<Prisma.ValueCreateNestedManyWithoutIsValueForInput> = z.object({
  create: z.union([ z.lazy(() => ValueCreateWithoutIsValueForInputSchema),z.lazy(() => ValueCreateWithoutIsValueForInputSchema).array(),z.lazy(() => ValueUncheckedCreateWithoutIsValueForInputSchema),z.lazy(() => ValueUncheckedCreateWithoutIsValueForInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ValueCreateOrConnectWithoutIsValueForInputSchema),z.lazy(() => ValueCreateOrConnectWithoutIsValueForInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ValueCreateManyIsValueForInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const QuestionCreateNestedOneWithoutAnswer_isAnsweringInputSchema: z.ZodType<Prisma.QuestionCreateNestedOneWithoutAnswer_isAnsweringInput> = z.object({
  create: z.union([ z.lazy(() => QuestionCreateWithoutAnswer_isAnsweringInputSchema),z.lazy(() => QuestionUncheckedCreateWithoutAnswer_isAnsweringInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => QuestionCreateOrConnectWithoutAnswer_isAnsweringInputSchema).optional(),
  connect: z.lazy(() => QuestionWhereUniqueInputSchema).optional()
}).strict();

export const ThingCreateNestedOneWithoutAnswer_isAboutInputSchema: z.ZodType<Prisma.ThingCreateNestedOneWithoutAnswer_isAboutInput> = z.object({
  create: z.union([ z.lazy(() => ThingCreateWithoutAnswer_isAboutInputSchema),z.lazy(() => ThingUncheckedCreateWithoutAnswer_isAboutInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ThingCreateOrConnectWithoutAnswer_isAboutInputSchema).optional(),
  connect: z.lazy(() => ThingWhereUniqueInputSchema).optional()
}).strict();

export const ThingCreateNestedOneWithoutAnswer_isAnsweredByAgentInputSchema: z.ZodType<Prisma.ThingCreateNestedOneWithoutAnswer_isAnsweredByAgentInput> = z.object({
  create: z.union([ z.lazy(() => ThingCreateWithoutAnswer_isAnsweredByAgentInputSchema),z.lazy(() => ThingUncheckedCreateWithoutAnswer_isAnsweredByAgentInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ThingCreateOrConnectWithoutAnswer_isAnsweredByAgentInputSchema).optional(),
  connect: z.lazy(() => ThingWhereUniqueInputSchema).optional()
}).strict();

export const ValueUncheckedCreateNestedManyWithoutIsValueForInputSchema: z.ZodType<Prisma.ValueUncheckedCreateNestedManyWithoutIsValueForInput> = z.object({
  create: z.union([ z.lazy(() => ValueCreateWithoutIsValueForInputSchema),z.lazy(() => ValueCreateWithoutIsValueForInputSchema).array(),z.lazy(() => ValueUncheckedCreateWithoutIsValueForInputSchema),z.lazy(() => ValueUncheckedCreateWithoutIsValueForInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ValueCreateOrConnectWithoutIsValueForInputSchema),z.lazy(() => ValueCreateOrConnectWithoutIsValueForInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ValueCreateManyIsValueForInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export const ValueUpdateManyWithoutIsValueForNestedInputSchema: z.ZodType<Prisma.ValueUpdateManyWithoutIsValueForNestedInput> = z.object({
  create: z.union([ z.lazy(() => ValueCreateWithoutIsValueForInputSchema),z.lazy(() => ValueCreateWithoutIsValueForInputSchema).array(),z.lazy(() => ValueUncheckedCreateWithoutIsValueForInputSchema),z.lazy(() => ValueUncheckedCreateWithoutIsValueForInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ValueCreateOrConnectWithoutIsValueForInputSchema),z.lazy(() => ValueCreateOrConnectWithoutIsValueForInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ValueUpsertWithWhereUniqueWithoutIsValueForInputSchema),z.lazy(() => ValueUpsertWithWhereUniqueWithoutIsValueForInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ValueCreateManyIsValueForInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ValueUpdateWithWhereUniqueWithoutIsValueForInputSchema),z.lazy(() => ValueUpdateWithWhereUniqueWithoutIsValueForInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ValueUpdateManyWithWhereWithoutIsValueForInputSchema),z.lazy(() => ValueUpdateManyWithWhereWithoutIsValueForInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ValueScalarWhereInputSchema),z.lazy(() => ValueScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const QuestionUpdateOneRequiredWithoutAnswer_isAnsweringNestedInputSchema: z.ZodType<Prisma.QuestionUpdateOneRequiredWithoutAnswer_isAnsweringNestedInput> = z.object({
  create: z.union([ z.lazy(() => QuestionCreateWithoutAnswer_isAnsweringInputSchema),z.lazy(() => QuestionUncheckedCreateWithoutAnswer_isAnsweringInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => QuestionCreateOrConnectWithoutAnswer_isAnsweringInputSchema).optional(),
  upsert: z.lazy(() => QuestionUpsertWithoutAnswer_isAnsweringInputSchema).optional(),
  connect: z.lazy(() => QuestionWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => QuestionUpdateToOneWithWhereWithoutAnswer_isAnsweringInputSchema),z.lazy(() => QuestionUpdateWithoutAnswer_isAnsweringInputSchema),z.lazy(() => QuestionUncheckedUpdateWithoutAnswer_isAnsweringInputSchema) ]).optional(),
}).strict();

export const ThingUpdateOneWithoutAnswer_isAboutNestedInputSchema: z.ZodType<Prisma.ThingUpdateOneWithoutAnswer_isAboutNestedInput> = z.object({
  create: z.union([ z.lazy(() => ThingCreateWithoutAnswer_isAboutInputSchema),z.lazy(() => ThingUncheckedCreateWithoutAnswer_isAboutInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ThingCreateOrConnectWithoutAnswer_isAboutInputSchema).optional(),
  upsert: z.lazy(() => ThingUpsertWithoutAnswer_isAboutInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ThingWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ThingWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ThingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ThingUpdateToOneWithWhereWithoutAnswer_isAboutInputSchema),z.lazy(() => ThingUpdateWithoutAnswer_isAboutInputSchema),z.lazy(() => ThingUncheckedUpdateWithoutAnswer_isAboutInputSchema) ]).optional(),
}).strict();

export const ThingUpdateOneRequiredWithoutAnswer_isAnsweredByAgentNestedInputSchema: z.ZodType<Prisma.ThingUpdateOneRequiredWithoutAnswer_isAnsweredByAgentNestedInput> = z.object({
  create: z.union([ z.lazy(() => ThingCreateWithoutAnswer_isAnsweredByAgentInputSchema),z.lazy(() => ThingUncheckedCreateWithoutAnswer_isAnsweredByAgentInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ThingCreateOrConnectWithoutAnswer_isAnsweredByAgentInputSchema).optional(),
  upsert: z.lazy(() => ThingUpsertWithoutAnswer_isAnsweredByAgentInputSchema).optional(),
  connect: z.lazy(() => ThingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ThingUpdateToOneWithWhereWithoutAnswer_isAnsweredByAgentInputSchema),z.lazy(() => ThingUpdateWithoutAnswer_isAnsweredByAgentInputSchema),z.lazy(() => ThingUncheckedUpdateWithoutAnswer_isAnsweredByAgentInputSchema) ]).optional(),
}).strict();

export const ValueUncheckedUpdateManyWithoutIsValueForNestedInputSchema: z.ZodType<Prisma.ValueUncheckedUpdateManyWithoutIsValueForNestedInput> = z.object({
  create: z.union([ z.lazy(() => ValueCreateWithoutIsValueForInputSchema),z.lazy(() => ValueCreateWithoutIsValueForInputSchema).array(),z.lazy(() => ValueUncheckedCreateWithoutIsValueForInputSchema),z.lazy(() => ValueUncheckedCreateWithoutIsValueForInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ValueCreateOrConnectWithoutIsValueForInputSchema),z.lazy(() => ValueCreateOrConnectWithoutIsValueForInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => ValueUpsertWithWhereUniqueWithoutIsValueForInputSchema),z.lazy(() => ValueUpsertWithWhereUniqueWithoutIsValueForInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ValueCreateManyIsValueForInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => ValueWhereUniqueInputSchema),z.lazy(() => ValueWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => ValueUpdateWithWhereUniqueWithoutIsValueForInputSchema),z.lazy(() => ValueUpdateWithWhereUniqueWithoutIsValueForInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => ValueUpdateManyWithWhereWithoutIsValueForInputSchema),z.lazy(() => ValueUpdateManyWithWhereWithoutIsValueForInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => ValueScalarWhereInputSchema),z.lazy(() => ValueScalarWhereInputSchema).array() ]).optional(),
}).strict();

export const ThingCreateNestedOneWithoutIsUsedInValuesInputSchema: z.ZodType<Prisma.ThingCreateNestedOneWithoutIsUsedInValuesInput> = z.object({
  create: z.union([ z.lazy(() => ThingCreateWithoutIsUsedInValuesInputSchema),z.lazy(() => ThingUncheckedCreateWithoutIsUsedInValuesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ThingCreateOrConnectWithoutIsUsedInValuesInputSchema).optional(),
  connect: z.lazy(() => ThingWhereUniqueInputSchema).optional()
}).strict();

export const AnswerCreateNestedOneWithoutValuesInputSchema: z.ZodType<Prisma.AnswerCreateNestedOneWithoutValuesInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutValuesInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutValuesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AnswerCreateOrConnectWithoutValuesInputSchema).optional(),
  connect: z.lazy(() => AnswerWhereUniqueInputSchema).optional()
}).strict();

export const NullableFloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableFloatFieldUpdateOperationsInput> = z.object({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const NullableBoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableBoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional().nullable()
}).strict();

export const ThingUpdateOneWithoutIsUsedInValuesNestedInputSchema: z.ZodType<Prisma.ThingUpdateOneWithoutIsUsedInValuesNestedInput> = z.object({
  create: z.union([ z.lazy(() => ThingCreateWithoutIsUsedInValuesInputSchema),z.lazy(() => ThingUncheckedCreateWithoutIsUsedInValuesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => ThingCreateOrConnectWithoutIsUsedInValuesInputSchema).optional(),
  upsert: z.lazy(() => ThingUpsertWithoutIsUsedInValuesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => ThingWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => ThingWhereInputSchema) ]).optional(),
  connect: z.lazy(() => ThingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => ThingUpdateToOneWithWhereWithoutIsUsedInValuesInputSchema),z.lazy(() => ThingUpdateWithoutIsUsedInValuesInputSchema),z.lazy(() => ThingUncheckedUpdateWithoutIsUsedInValuesInputSchema) ]).optional(),
}).strict();

export const AnswerUpdateOneRequiredWithoutValuesNestedInputSchema: z.ZodType<Prisma.AnswerUpdateOneRequiredWithoutValuesNestedInput> = z.object({
  create: z.union([ z.lazy(() => AnswerCreateWithoutValuesInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutValuesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AnswerCreateOrConnectWithoutValuesInputSchema).optional(),
  upsert: z.lazy(() => AnswerUpsertWithoutValuesInputSchema).optional(),
  connect: z.lazy(() => AnswerWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => AnswerUpdateToOneWithWhereWithoutValuesInputSchema),z.lazy(() => AnswerUpdateWithoutValuesInputSchema),z.lazy(() => AnswerUncheckedUpdateWithoutValuesInputSchema) ]).optional(),
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedEnumSchemaTypeNullableFilterSchema: z.ZodType<Prisma.NestedEnumSchemaTypeNullableFilter> = z.object({
  equals: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  in: z.lazy(() => SchemaTypeSchema).array().optional().nullable(),
  notIn: z.lazy(() => SchemaTypeSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NestedEnumSchemaTypeNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedEnumSchemaTypeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumSchemaTypeNullableWithAggregatesFilter> = z.object({
  equals: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  in: z.lazy(() => SchemaTypeSchema).array().optional().nullable(),
  notIn: z.lazy(() => SchemaTypeSchema).array().optional().nullable(),
  not: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NestedEnumSchemaTypeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumSchemaTypeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumSchemaTypeNullableFilterSchema).optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional()
}).strict();

export const NestedJsonNullableFilterSchema: z.ZodType<Prisma.NestedJsonNullableFilter> = z.object({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional()
}).strict();

export const NestedEnumDataTypeFilterSchema: z.ZodType<Prisma.NestedEnumDataTypeFilter> = z.object({
  equals: z.lazy(() => DataTypeSchema).optional(),
  in: z.lazy(() => DataTypeSchema).array().optional(),
  notIn: z.lazy(() => DataTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => NestedEnumDataTypeFilterSchema) ]).optional(),
}).strict();

export const NestedEnumDataTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumDataTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => DataTypeSchema).optional(),
  in: z.lazy(() => DataTypeSchema).array().optional(),
  notIn: z.lazy(() => DataTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => NestedEnumDataTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumDataTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumDataTypeFilterSchema).optional()
}).strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedBoolNullableFilterSchema: z.ZodType<Prisma.NestedBoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
}).strict();

export const NestedFloatNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatNullableWithAggregatesFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatNullableFilterSchema).optional()
}).strict();

export const NestedBoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional()
}).strict();

export const AnswerCreateWithoutIsAnsweredByAgentInputSchema: z.ZodType<Prisma.AnswerCreateWithoutIsAnsweredByAgentInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  values: z.lazy(() => ValueCreateNestedManyWithoutIsValueForInputSchema).optional(),
  isAnswering: z.lazy(() => QuestionCreateNestedOneWithoutAnswer_isAnsweringInputSchema),
  isAbout: z.lazy(() => ThingCreateNestedOneWithoutAnswer_isAboutInputSchema).optional()
}).strict();

export const AnswerUncheckedCreateWithoutIsAnsweredByAgentInputSchema: z.ZodType<Prisma.AnswerUncheckedCreateWithoutIsAnsweredByAgentInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  isAnswering_id: z.string(),
  isAbout_id: z.string().optional().nullable(),
  values: z.lazy(() => ValueUncheckedCreateNestedManyWithoutIsValueForInputSchema).optional()
}).strict();

export const AnswerCreateOrConnectWithoutIsAnsweredByAgentInputSchema: z.ZodType<Prisma.AnswerCreateOrConnectWithoutIsAnsweredByAgentInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweredByAgentInputSchema) ]),
}).strict();

export const AnswerCreateManyIsAnsweredByAgentInputEnvelopeSchema: z.ZodType<Prisma.AnswerCreateManyIsAnsweredByAgentInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AnswerCreateManyIsAnsweredByAgentInputSchema),z.lazy(() => AnswerCreateManyIsAnsweredByAgentInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const AnswerCreateWithoutIsAboutInputSchema: z.ZodType<Prisma.AnswerCreateWithoutIsAboutInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  values: z.lazy(() => ValueCreateNestedManyWithoutIsValueForInputSchema).optional(),
  isAnswering: z.lazy(() => QuestionCreateNestedOneWithoutAnswer_isAnsweringInputSchema),
  isAnsweredByAgent: z.lazy(() => ThingCreateNestedOneWithoutAnswer_isAnsweredByAgentInputSchema)
}).strict();

export const AnswerUncheckedCreateWithoutIsAboutInputSchema: z.ZodType<Prisma.AnswerUncheckedCreateWithoutIsAboutInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  isAnswering_id: z.string(),
  isAnsweredByAgent_id: z.string(),
  values: z.lazy(() => ValueUncheckedCreateNestedManyWithoutIsValueForInputSchema).optional()
}).strict();

export const AnswerCreateOrConnectWithoutIsAboutInputSchema: z.ZodType<Prisma.AnswerCreateOrConnectWithoutIsAboutInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAboutInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAboutInputSchema) ]),
}).strict();

export const AnswerCreateManyIsAboutInputEnvelopeSchema: z.ZodType<Prisma.AnswerCreateManyIsAboutInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AnswerCreateManyIsAboutInputSchema),z.lazy(() => AnswerCreateManyIsAboutInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const ValueCreateWithoutValueAsThingInputSchema: z.ZodType<Prisma.ValueCreateWithoutValueAsThingInput> = z.object({
  value_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  valueType: z.lazy(() => DataTypeSchema),
  valueAsString: z.string().optional().nullable(),
  valueAsNumber: z.number().optional().nullable(),
  valueAsBoolean: z.boolean().optional().nullable(),
  isValueFor: z.lazy(() => AnswerCreateNestedOneWithoutValuesInputSchema)
}).strict();

export const ValueUncheckedCreateWithoutValueAsThingInputSchema: z.ZodType<Prisma.ValueUncheckedCreateWithoutValueAsThingInput> = z.object({
  value_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  valueType: z.lazy(() => DataTypeSchema),
  valueAsString: z.string().optional().nullable(),
  valueAsNumber: z.number().optional().nullable(),
  valueAsBoolean: z.boolean().optional().nullable(),
  isValueFor_id: z.string()
}).strict();

export const ValueCreateOrConnectWithoutValueAsThingInputSchema: z.ZodType<Prisma.ValueCreateOrConnectWithoutValueAsThingInput> = z.object({
  where: z.lazy(() => ValueWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ValueCreateWithoutValueAsThingInputSchema),z.lazy(() => ValueUncheckedCreateWithoutValueAsThingInputSchema) ]),
}).strict();

export const ValueCreateManyValueAsThingInputEnvelopeSchema: z.ZodType<Prisma.ValueCreateManyValueAsThingInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ValueCreateManyValueAsThingInputSchema),z.lazy(() => ValueCreateManyValueAsThingInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const AnswerUpsertWithWhereUniqueWithoutIsAnsweredByAgentInputSchema: z.ZodType<Prisma.AnswerUpsertWithWhereUniqueWithoutIsAnsweredByAgentInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AnswerUpdateWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUncheckedUpdateWithoutIsAnsweredByAgentInputSchema) ]),
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweredByAgentInputSchema) ]),
}).strict();

export const AnswerUpdateWithWhereUniqueWithoutIsAnsweredByAgentInputSchema: z.ZodType<Prisma.AnswerUpdateWithWhereUniqueWithoutIsAnsweredByAgentInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AnswerUpdateWithoutIsAnsweredByAgentInputSchema),z.lazy(() => AnswerUncheckedUpdateWithoutIsAnsweredByAgentInputSchema) ]),
}).strict();

export const AnswerUpdateManyWithWhereWithoutIsAnsweredByAgentInputSchema: z.ZodType<Prisma.AnswerUpdateManyWithWhereWithoutIsAnsweredByAgentInput> = z.object({
  where: z.lazy(() => AnswerScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AnswerUpdateManyMutationInputSchema),z.lazy(() => AnswerUncheckedUpdateManyWithoutIsAnsweredByAgentInputSchema) ]),
}).strict();

export const AnswerScalarWhereInputSchema: z.ZodType<Prisma.AnswerScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => AnswerScalarWhereInputSchema),z.lazy(() => AnswerScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => AnswerScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => AnswerScalarWhereInputSchema),z.lazy(() => AnswerScalarWhereInputSchema).array() ]).optional(),
  answer_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  index: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  isAnswering_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isAbout_id: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isAnsweredByAgent_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const AnswerUpsertWithWhereUniqueWithoutIsAboutInputSchema: z.ZodType<Prisma.AnswerUpsertWithWhereUniqueWithoutIsAboutInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AnswerUpdateWithoutIsAboutInputSchema),z.lazy(() => AnswerUncheckedUpdateWithoutIsAboutInputSchema) ]),
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAboutInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAboutInputSchema) ]),
}).strict();

export const AnswerUpdateWithWhereUniqueWithoutIsAboutInputSchema: z.ZodType<Prisma.AnswerUpdateWithWhereUniqueWithoutIsAboutInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AnswerUpdateWithoutIsAboutInputSchema),z.lazy(() => AnswerUncheckedUpdateWithoutIsAboutInputSchema) ]),
}).strict();

export const AnswerUpdateManyWithWhereWithoutIsAboutInputSchema: z.ZodType<Prisma.AnswerUpdateManyWithWhereWithoutIsAboutInput> = z.object({
  where: z.lazy(() => AnswerScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AnswerUpdateManyMutationInputSchema),z.lazy(() => AnswerUncheckedUpdateManyWithoutIsAboutInputSchema) ]),
}).strict();

export const ValueUpsertWithWhereUniqueWithoutValueAsThingInputSchema: z.ZodType<Prisma.ValueUpsertWithWhereUniqueWithoutValueAsThingInput> = z.object({
  where: z.lazy(() => ValueWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ValueUpdateWithoutValueAsThingInputSchema),z.lazy(() => ValueUncheckedUpdateWithoutValueAsThingInputSchema) ]),
  create: z.union([ z.lazy(() => ValueCreateWithoutValueAsThingInputSchema),z.lazy(() => ValueUncheckedCreateWithoutValueAsThingInputSchema) ]),
}).strict();

export const ValueUpdateWithWhereUniqueWithoutValueAsThingInputSchema: z.ZodType<Prisma.ValueUpdateWithWhereUniqueWithoutValueAsThingInput> = z.object({
  where: z.lazy(() => ValueWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ValueUpdateWithoutValueAsThingInputSchema),z.lazy(() => ValueUncheckedUpdateWithoutValueAsThingInputSchema) ]),
}).strict();

export const ValueUpdateManyWithWhereWithoutValueAsThingInputSchema: z.ZodType<Prisma.ValueUpdateManyWithWhereWithoutValueAsThingInput> = z.object({
  where: z.lazy(() => ValueScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ValueUpdateManyMutationInputSchema),z.lazy(() => ValueUncheckedUpdateManyWithoutValueAsThingInputSchema) ]),
}).strict();

export const ValueScalarWhereInputSchema: z.ZodType<Prisma.ValueScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ValueScalarWhereInputSchema),z.lazy(() => ValueScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ValueScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ValueScalarWhereInputSchema),z.lazy(() => ValueScalarWhereInputSchema).array() ]).optional(),
  value_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  index: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  valueType: z.union([ z.lazy(() => EnumDataTypeFilterSchema),z.lazy(() => DataTypeSchema) ]).optional(),
  valueAsString: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  valueAsNumber: z.union([ z.lazy(() => FloatNullableFilterSchema),z.number() ]).optional().nullable(),
  valueAsBoolean: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  valueAsThing_id: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  isValueFor_id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const AnswerCreateWithoutIsAnsweringInputSchema: z.ZodType<Prisma.AnswerCreateWithoutIsAnsweringInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  values: z.lazy(() => ValueCreateNestedManyWithoutIsValueForInputSchema).optional(),
  isAbout: z.lazy(() => ThingCreateNestedOneWithoutAnswer_isAboutInputSchema).optional(),
  isAnsweredByAgent: z.lazy(() => ThingCreateNestedOneWithoutAnswer_isAnsweredByAgentInputSchema)
}).strict();

export const AnswerUncheckedCreateWithoutIsAnsweringInputSchema: z.ZodType<Prisma.AnswerUncheckedCreateWithoutIsAnsweringInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  isAbout_id: z.string().optional().nullable(),
  isAnsweredByAgent_id: z.string(),
  values: z.lazy(() => ValueUncheckedCreateNestedManyWithoutIsValueForInputSchema).optional()
}).strict();

export const AnswerCreateOrConnectWithoutIsAnsweringInputSchema: z.ZodType<Prisma.AnswerCreateOrConnectWithoutIsAnsweringInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweringInputSchema) ]),
}).strict();

export const AnswerCreateManyIsAnsweringInputEnvelopeSchema: z.ZodType<Prisma.AnswerCreateManyIsAnsweringInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => AnswerCreateManyIsAnsweringInputSchema),z.lazy(() => AnswerCreateManyIsAnsweringInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const AnswerUpsertWithWhereUniqueWithoutIsAnsweringInputSchema: z.ZodType<Prisma.AnswerUpsertWithWhereUniqueWithoutIsAnsweringInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => AnswerUpdateWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUncheckedUpdateWithoutIsAnsweringInputSchema) ]),
  create: z.union([ z.lazy(() => AnswerCreateWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutIsAnsweringInputSchema) ]),
}).strict();

export const AnswerUpdateWithWhereUniqueWithoutIsAnsweringInputSchema: z.ZodType<Prisma.AnswerUpdateWithWhereUniqueWithoutIsAnsweringInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => AnswerUpdateWithoutIsAnsweringInputSchema),z.lazy(() => AnswerUncheckedUpdateWithoutIsAnsweringInputSchema) ]),
}).strict();

export const AnswerUpdateManyWithWhereWithoutIsAnsweringInputSchema: z.ZodType<Prisma.AnswerUpdateManyWithWhereWithoutIsAnsweringInput> = z.object({
  where: z.lazy(() => AnswerScalarWhereInputSchema),
  data: z.union([ z.lazy(() => AnswerUpdateManyMutationInputSchema),z.lazy(() => AnswerUncheckedUpdateManyWithoutIsAnsweringInputSchema) ]),
}).strict();

export const ValueCreateWithoutIsValueForInputSchema: z.ZodType<Prisma.ValueCreateWithoutIsValueForInput> = z.object({
  value_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  valueType: z.lazy(() => DataTypeSchema),
  valueAsString: z.string().optional().nullable(),
  valueAsNumber: z.number().optional().nullable(),
  valueAsBoolean: z.boolean().optional().nullable(),
  valueAsThing: z.lazy(() => ThingCreateNestedOneWithoutIsUsedInValuesInputSchema).optional()
}).strict();

export const ValueUncheckedCreateWithoutIsValueForInputSchema: z.ZodType<Prisma.ValueUncheckedCreateWithoutIsValueForInput> = z.object({
  value_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  valueType: z.lazy(() => DataTypeSchema),
  valueAsString: z.string().optional().nullable(),
  valueAsNumber: z.number().optional().nullable(),
  valueAsBoolean: z.boolean().optional().nullable(),
  valueAsThing_id: z.string().optional().nullable()
}).strict();

export const ValueCreateOrConnectWithoutIsValueForInputSchema: z.ZodType<Prisma.ValueCreateOrConnectWithoutIsValueForInput> = z.object({
  where: z.lazy(() => ValueWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ValueCreateWithoutIsValueForInputSchema),z.lazy(() => ValueUncheckedCreateWithoutIsValueForInputSchema) ]),
}).strict();

export const ValueCreateManyIsValueForInputEnvelopeSchema: z.ZodType<Prisma.ValueCreateManyIsValueForInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ValueCreateManyIsValueForInputSchema),z.lazy(() => ValueCreateManyIsValueForInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export const QuestionCreateWithoutAnswer_isAnsweringInputSchema: z.ZodType<Omit<Prisma.QuestionCreateWithoutAnswer_isAnsweringInput, "question_id" | "index" | "createdAt" | "updatedAt">> = z.object({
  // omitted: question_id: z.string().cuid().optional(),
  // omitted: index: z.number().int().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  question: z.string().min(10, { message: 'Question must be at least 10 characters long.' }).optional().nullable(),
  description: z.string().optional().nullable(),
  locale: z.string().min(2, { message: 'Locale must be at least 2 characters long.' }).optional().nullable(),
  asProperty: z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }).optional().nullable(),
  expectedValueType: z.lazy(() => DataTypeSchema),
  expectedThingTypes: z.union([ z.lazy(() => QuestionCreateexpectedThingTypesInputSchema),z.lazy(() => SchemaTypeSchema).array() ]).optional(),
}).strict();

export const QuestionUncheckedCreateWithoutAnswer_isAnsweringInputSchema: z.ZodType<Omit<Prisma.QuestionUncheckedCreateWithoutAnswer_isAnsweringInput, "question_id" | "index" | "createdAt" | "updatedAt">> = z.object({
  // omitted: question_id: z.string().cuid().optional(),
  // omitted: index: z.number().int().optional(),
  // omitted: createdAt: z.coerce.date().optional(),
  // omitted: updatedAt: z.coerce.date().optional(),
  question: z.string().min(10, { message: 'Question must be at least 10 characters long.' }).optional().nullable(),
  description: z.string().optional().nullable(),
  locale: z.string().min(2, { message: 'Locale must be at least 2 characters long.' }).optional().nullable(),
  asProperty: z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }).optional().nullable(),
  expectedValueType: z.lazy(() => DataTypeSchema),
  expectedThingTypes: z.union([ z.lazy(() => QuestionCreateexpectedThingTypesInputSchema),z.lazy(() => SchemaTypeSchema).array() ]).optional(),
}).strict();

export const QuestionCreateOrConnectWithoutAnswer_isAnsweringInputSchema: z.ZodType<Prisma.QuestionCreateOrConnectWithoutAnswer_isAnsweringInput> = z.object({
  where: z.lazy(() => QuestionWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => QuestionCreateWithoutAnswer_isAnsweringInputSchema),z.lazy(() => QuestionUncheckedCreateWithoutAnswer_isAnsweringInputSchema) ]),
}).strict();

export const ThingCreateWithoutAnswer_isAboutInputSchema: z.ZodType<Prisma.ThingCreateWithoutAnswer_isAboutInput> = z.object({
  thing_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  type: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  name: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingCreatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerCreateNestedManyWithoutIsAnsweredByAgentInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueCreateNestedManyWithoutValueAsThingInputSchema).optional()
}).strict();

export const ThingUncheckedCreateWithoutAnswer_isAboutInputSchema: z.ZodType<Prisma.ThingUncheckedCreateWithoutAnswer_isAboutInput> = z.object({
  thing_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  type: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  name: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingCreatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerUncheckedCreateNestedManyWithoutIsAnsweredByAgentInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueUncheckedCreateNestedManyWithoutValueAsThingInputSchema).optional()
}).strict();

export const ThingCreateOrConnectWithoutAnswer_isAboutInputSchema: z.ZodType<Prisma.ThingCreateOrConnectWithoutAnswer_isAboutInput> = z.object({
  where: z.lazy(() => ThingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ThingCreateWithoutAnswer_isAboutInputSchema),z.lazy(() => ThingUncheckedCreateWithoutAnswer_isAboutInputSchema) ]),
}).strict();

export const ThingCreateWithoutAnswer_isAnsweredByAgentInputSchema: z.ZodType<Prisma.ThingCreateWithoutAnswer_isAnsweredByAgentInput> = z.object({
  thing_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  type: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  name: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingCreatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAbout: z.lazy(() => AnswerCreateNestedManyWithoutIsAboutInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueCreateNestedManyWithoutValueAsThingInputSchema).optional()
}).strict();

export const ThingUncheckedCreateWithoutAnswer_isAnsweredByAgentInputSchema: z.ZodType<Prisma.ThingUncheckedCreateWithoutAnswer_isAnsweredByAgentInput> = z.object({
  thing_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  type: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  name: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingCreatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAbout: z.lazy(() => AnswerUncheckedCreateNestedManyWithoutIsAboutInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueUncheckedCreateNestedManyWithoutValueAsThingInputSchema).optional()
}).strict();

export const ThingCreateOrConnectWithoutAnswer_isAnsweredByAgentInputSchema: z.ZodType<Prisma.ThingCreateOrConnectWithoutAnswer_isAnsweredByAgentInput> = z.object({
  where: z.lazy(() => ThingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ThingCreateWithoutAnswer_isAnsweredByAgentInputSchema),z.lazy(() => ThingUncheckedCreateWithoutAnswer_isAnsweredByAgentInputSchema) ]),
}).strict();

export const ValueUpsertWithWhereUniqueWithoutIsValueForInputSchema: z.ZodType<Prisma.ValueUpsertWithWhereUniqueWithoutIsValueForInput> = z.object({
  where: z.lazy(() => ValueWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => ValueUpdateWithoutIsValueForInputSchema),z.lazy(() => ValueUncheckedUpdateWithoutIsValueForInputSchema) ]),
  create: z.union([ z.lazy(() => ValueCreateWithoutIsValueForInputSchema),z.lazy(() => ValueUncheckedCreateWithoutIsValueForInputSchema) ]),
}).strict();

export const ValueUpdateWithWhereUniqueWithoutIsValueForInputSchema: z.ZodType<Prisma.ValueUpdateWithWhereUniqueWithoutIsValueForInput> = z.object({
  where: z.lazy(() => ValueWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => ValueUpdateWithoutIsValueForInputSchema),z.lazy(() => ValueUncheckedUpdateWithoutIsValueForInputSchema) ]),
}).strict();

export const ValueUpdateManyWithWhereWithoutIsValueForInputSchema: z.ZodType<Prisma.ValueUpdateManyWithWhereWithoutIsValueForInput> = z.object({
  where: z.lazy(() => ValueScalarWhereInputSchema),
  data: z.union([ z.lazy(() => ValueUpdateManyMutationInputSchema),z.lazy(() => ValueUncheckedUpdateManyWithoutIsValueForInputSchema) ]),
}).strict();

export const QuestionUpsertWithoutAnswer_isAnsweringInputSchema: z.ZodType<Prisma.QuestionUpsertWithoutAnswer_isAnsweringInput> = z.object({
  update: z.union([ z.lazy(() => QuestionUpdateWithoutAnswer_isAnsweringInputSchema),z.lazy(() => QuestionUncheckedUpdateWithoutAnswer_isAnsweringInputSchema) ]),
  create: z.union([ z.lazy(() => QuestionCreateWithoutAnswer_isAnsweringInputSchema),z.lazy(() => QuestionUncheckedCreateWithoutAnswer_isAnsweringInputSchema) ]),
  where: z.lazy(() => QuestionWhereInputSchema).optional()
}).strict();

export const QuestionUpdateToOneWithWhereWithoutAnswer_isAnsweringInputSchema: z.ZodType<Prisma.QuestionUpdateToOneWithWhereWithoutAnswer_isAnsweringInput> = z.object({
  where: z.lazy(() => QuestionWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => QuestionUpdateWithoutAnswer_isAnsweringInputSchema),z.lazy(() => QuestionUncheckedUpdateWithoutAnswer_isAnsweringInputSchema) ]),
}).strict();

export const QuestionUpdateWithoutAnswer_isAnsweringInputSchema: z.ZodType<Omit<Prisma.QuestionUpdateWithoutAnswer_isAnsweringInput, "question_id" | "index" | "createdAt" | "updatedAt">> = z.object({
  // omitted: question_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  question: z.union([ z.string().min(10, { message: 'Question must be at least 10 characters long.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string().min(2, { message: 'Locale must be at least 2 characters long.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  asProperty: z.union([ z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expectedValueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  expectedThingTypes: z.union([ z.lazy(() => QuestionUpdateexpectedThingTypesInputSchema),z.lazy(() => SchemaTypeSchema).array() ]).optional(),
}).strict();

export const QuestionUncheckedUpdateWithoutAnswer_isAnsweringInputSchema: z.ZodType<Omit<Prisma.QuestionUncheckedUpdateWithoutAnswer_isAnsweringInput, "question_id" | "index" | "createdAt" | "updatedAt">> = z.object({
  // omitted: question_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  // omitted: updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  question: z.union([ z.string().min(10, { message: 'Question must be at least 10 characters long.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string().min(2, { message: 'Locale must be at least 2 characters long.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  asProperty: z.union([ z.string().regex(/^([a-z]+(?:[A-Z][a-z]*)*)?$/, { message: 'asProperty must be a valid schema.org property name. These must be lowerCamelCase and only a-Z and A-Z are allowed.' }),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  expectedValueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  expectedThingTypes: z.union([ z.lazy(() => QuestionUpdateexpectedThingTypesInputSchema),z.lazy(() => SchemaTypeSchema).array() ]).optional(),
}).strict();

export const ThingUpsertWithoutAnswer_isAboutInputSchema: z.ZodType<Prisma.ThingUpsertWithoutAnswer_isAboutInput> = z.object({
  update: z.union([ z.lazy(() => ThingUpdateWithoutAnswer_isAboutInputSchema),z.lazy(() => ThingUncheckedUpdateWithoutAnswer_isAboutInputSchema) ]),
  create: z.union([ z.lazy(() => ThingCreateWithoutAnswer_isAboutInputSchema),z.lazy(() => ThingUncheckedCreateWithoutAnswer_isAboutInputSchema) ]),
  where: z.lazy(() => ThingWhereInputSchema).optional()
}).strict();

export const ThingUpdateToOneWithWhereWithoutAnswer_isAboutInputSchema: z.ZodType<Prisma.ThingUpdateToOneWithWhereWithoutAnswer_isAboutInput> = z.object({
  where: z.lazy(() => ThingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ThingUpdateWithoutAnswer_isAboutInputSchema),z.lazy(() => ThingUncheckedUpdateWithoutAnswer_isAboutInputSchema) ]),
}).strict();

export const ThingUpdateWithoutAnswer_isAboutInputSchema: z.ZodType<Prisma.ThingUpdateWithoutAnswer_isAboutInput> = z.object({
  thing_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NullableEnumSchemaTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingUpdatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerUpdateManyWithoutIsAnsweredByAgentNestedInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueUpdateManyWithoutValueAsThingNestedInputSchema).optional()
}).strict();

export const ThingUncheckedUpdateWithoutAnswer_isAboutInputSchema: z.ZodType<Prisma.ThingUncheckedUpdateWithoutAnswer_isAboutInput> = z.object({
  thing_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NullableEnumSchemaTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingUpdatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerUncheckedUpdateManyWithoutIsAnsweredByAgentNestedInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueUncheckedUpdateManyWithoutValueAsThingNestedInputSchema).optional()
}).strict();

export const ThingUpsertWithoutAnswer_isAnsweredByAgentInputSchema: z.ZodType<Prisma.ThingUpsertWithoutAnswer_isAnsweredByAgentInput> = z.object({
  update: z.union([ z.lazy(() => ThingUpdateWithoutAnswer_isAnsweredByAgentInputSchema),z.lazy(() => ThingUncheckedUpdateWithoutAnswer_isAnsweredByAgentInputSchema) ]),
  create: z.union([ z.lazy(() => ThingCreateWithoutAnswer_isAnsweredByAgentInputSchema),z.lazy(() => ThingUncheckedCreateWithoutAnswer_isAnsweredByAgentInputSchema) ]),
  where: z.lazy(() => ThingWhereInputSchema).optional()
}).strict();

export const ThingUpdateToOneWithWhereWithoutAnswer_isAnsweredByAgentInputSchema: z.ZodType<Prisma.ThingUpdateToOneWithWhereWithoutAnswer_isAnsweredByAgentInput> = z.object({
  where: z.lazy(() => ThingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ThingUpdateWithoutAnswer_isAnsweredByAgentInputSchema),z.lazy(() => ThingUncheckedUpdateWithoutAnswer_isAnsweredByAgentInputSchema) ]),
}).strict();

export const ThingUpdateWithoutAnswer_isAnsweredByAgentInputSchema: z.ZodType<Prisma.ThingUpdateWithoutAnswer_isAnsweredByAgentInput> = z.object({
  thing_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NullableEnumSchemaTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingUpdatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAbout: z.lazy(() => AnswerUpdateManyWithoutIsAboutNestedInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueUpdateManyWithoutValueAsThingNestedInputSchema).optional()
}).strict();

export const ThingUncheckedUpdateWithoutAnswer_isAnsweredByAgentInputSchema: z.ZodType<Prisma.ThingUncheckedUpdateWithoutAnswer_isAnsweredByAgentInput> = z.object({
  thing_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NullableEnumSchemaTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingUpdatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAbout: z.lazy(() => AnswerUncheckedUpdateManyWithoutIsAboutNestedInputSchema).optional(),
  isUsedInValues: z.lazy(() => ValueUncheckedUpdateManyWithoutValueAsThingNestedInputSchema).optional()
}).strict();

export const ThingCreateWithoutIsUsedInValuesInputSchema: z.ZodType<Prisma.ThingCreateWithoutIsUsedInValuesInput> = z.object({
  thing_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  type: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  name: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingCreatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerCreateNestedManyWithoutIsAnsweredByAgentInputSchema).optional(),
  Answer_isAbout: z.lazy(() => AnswerCreateNestedManyWithoutIsAboutInputSchema).optional()
}).strict();

export const ThingUncheckedCreateWithoutIsUsedInValuesInputSchema: z.ZodType<Prisma.ThingUncheckedCreateWithoutIsUsedInValuesInput> = z.object({
  thing_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  type: z.lazy(() => SchemaTypeSchema).optional().nullable(),
  name: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingCreatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerUncheckedCreateNestedManyWithoutIsAnsweredByAgentInputSchema).optional(),
  Answer_isAbout: z.lazy(() => AnswerUncheckedCreateNestedManyWithoutIsAboutInputSchema).optional()
}).strict();

export const ThingCreateOrConnectWithoutIsUsedInValuesInputSchema: z.ZodType<Prisma.ThingCreateOrConnectWithoutIsUsedInValuesInput> = z.object({
  where: z.lazy(() => ThingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => ThingCreateWithoutIsUsedInValuesInputSchema),z.lazy(() => ThingUncheckedCreateWithoutIsUsedInValuesInputSchema) ]),
}).strict();

export const AnswerCreateWithoutValuesInputSchema: z.ZodType<Prisma.AnswerCreateWithoutValuesInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  isAnswering: z.lazy(() => QuestionCreateNestedOneWithoutAnswer_isAnsweringInputSchema),
  isAbout: z.lazy(() => ThingCreateNestedOneWithoutAnswer_isAboutInputSchema).optional(),
  isAnsweredByAgent: z.lazy(() => ThingCreateNestedOneWithoutAnswer_isAnsweredByAgentInputSchema)
}).strict();

export const AnswerUncheckedCreateWithoutValuesInputSchema: z.ZodType<Prisma.AnswerUncheckedCreateWithoutValuesInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  isAnswering_id: z.string(),
  isAbout_id: z.string().optional().nullable(),
  isAnsweredByAgent_id: z.string()
}).strict();

export const AnswerCreateOrConnectWithoutValuesInputSchema: z.ZodType<Prisma.AnswerCreateOrConnectWithoutValuesInput> = z.object({
  where: z.lazy(() => AnswerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => AnswerCreateWithoutValuesInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutValuesInputSchema) ]),
}).strict();

export const ThingUpsertWithoutIsUsedInValuesInputSchema: z.ZodType<Prisma.ThingUpsertWithoutIsUsedInValuesInput> = z.object({
  update: z.union([ z.lazy(() => ThingUpdateWithoutIsUsedInValuesInputSchema),z.lazy(() => ThingUncheckedUpdateWithoutIsUsedInValuesInputSchema) ]),
  create: z.union([ z.lazy(() => ThingCreateWithoutIsUsedInValuesInputSchema),z.lazy(() => ThingUncheckedCreateWithoutIsUsedInValuesInputSchema) ]),
  where: z.lazy(() => ThingWhereInputSchema).optional()
}).strict();

export const ThingUpdateToOneWithWhereWithoutIsUsedInValuesInputSchema: z.ZodType<Prisma.ThingUpdateToOneWithWhereWithoutIsUsedInValuesInput> = z.object({
  where: z.lazy(() => ThingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => ThingUpdateWithoutIsUsedInValuesInputSchema),z.lazy(() => ThingUncheckedUpdateWithoutIsUsedInValuesInputSchema) ]),
}).strict();

export const ThingUpdateWithoutIsUsedInValuesInputSchema: z.ZodType<Prisma.ThingUpdateWithoutIsUsedInValuesInput> = z.object({
  thing_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NullableEnumSchemaTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingUpdatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerUpdateManyWithoutIsAnsweredByAgentNestedInputSchema).optional(),
  Answer_isAbout: z.lazy(() => AnswerUpdateManyWithoutIsAboutNestedInputSchema).optional()
}).strict();

export const ThingUncheckedUpdateWithoutIsUsedInValuesInputSchema: z.ZodType<Prisma.ThingUncheckedUpdateWithoutIsUsedInValuesInput> = z.object({
  thing_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.lazy(() => SchemaTypeSchema),z.lazy(() => NullableEnumSchemaTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  name: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  locale: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  sameAs: z.union([ z.lazy(() => ThingUpdatesameAsInputSchema),z.string().array() ]).optional(),
  jsonld: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  Answer_isAnsweredByAgent: z.lazy(() => AnswerUncheckedUpdateManyWithoutIsAnsweredByAgentNestedInputSchema).optional(),
  Answer_isAbout: z.lazy(() => AnswerUncheckedUpdateManyWithoutIsAboutNestedInputSchema).optional()
}).strict();

export const AnswerUpsertWithoutValuesInputSchema: z.ZodType<Prisma.AnswerUpsertWithoutValuesInput> = z.object({
  update: z.union([ z.lazy(() => AnswerUpdateWithoutValuesInputSchema),z.lazy(() => AnswerUncheckedUpdateWithoutValuesInputSchema) ]),
  create: z.union([ z.lazy(() => AnswerCreateWithoutValuesInputSchema),z.lazy(() => AnswerUncheckedCreateWithoutValuesInputSchema) ]),
  where: z.lazy(() => AnswerWhereInputSchema).optional()
}).strict();

export const AnswerUpdateToOneWithWhereWithoutValuesInputSchema: z.ZodType<Prisma.AnswerUpdateToOneWithWhereWithoutValuesInput> = z.object({
  where: z.lazy(() => AnswerWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => AnswerUpdateWithoutValuesInputSchema),z.lazy(() => AnswerUncheckedUpdateWithoutValuesInputSchema) ]),
}).strict();

export const AnswerUpdateWithoutValuesInputSchema: z.ZodType<Prisma.AnswerUpdateWithoutValuesInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAnswering: z.lazy(() => QuestionUpdateOneRequiredWithoutAnswer_isAnsweringNestedInputSchema).optional(),
  isAbout: z.lazy(() => ThingUpdateOneWithoutAnswer_isAboutNestedInputSchema).optional(),
  isAnsweredByAgent: z.lazy(() => ThingUpdateOneRequiredWithoutAnswer_isAnsweredByAgentNestedInputSchema).optional()
}).strict();

export const AnswerUncheckedUpdateWithoutValuesInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateWithoutValuesInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAnswering_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isAbout_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isAnsweredByAgent_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnswerCreateManyIsAnsweredByAgentInputSchema: z.ZodType<Prisma.AnswerCreateManyIsAnsweredByAgentInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  isAnswering_id: z.string(),
  isAbout_id: z.string().optional().nullable()
}).strict();

export const AnswerCreateManyIsAboutInputSchema: z.ZodType<Prisma.AnswerCreateManyIsAboutInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  isAnswering_id: z.string(),
  isAnsweredByAgent_id: z.string()
}).strict();

export const ValueCreateManyValueAsThingInputSchema: z.ZodType<Prisma.ValueCreateManyValueAsThingInput> = z.object({
  value_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  valueType: z.lazy(() => DataTypeSchema),
  valueAsString: z.string().optional().nullable(),
  valueAsNumber: z.number().optional().nullable(),
  valueAsBoolean: z.boolean().optional().nullable(),
  isValueFor_id: z.string()
}).strict();

export const AnswerUpdateWithoutIsAnsweredByAgentInputSchema: z.ZodType<Prisma.AnswerUpdateWithoutIsAnsweredByAgentInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  values: z.lazy(() => ValueUpdateManyWithoutIsValueForNestedInputSchema).optional(),
  isAnswering: z.lazy(() => QuestionUpdateOneRequiredWithoutAnswer_isAnsweringNestedInputSchema).optional(),
  isAbout: z.lazy(() => ThingUpdateOneWithoutAnswer_isAboutNestedInputSchema).optional()
}).strict();

export const AnswerUncheckedUpdateWithoutIsAnsweredByAgentInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateWithoutIsAnsweredByAgentInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAnswering_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isAbout_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  values: z.lazy(() => ValueUncheckedUpdateManyWithoutIsValueForNestedInputSchema).optional()
}).strict();

export const AnswerUncheckedUpdateManyWithoutIsAnsweredByAgentInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateManyWithoutIsAnsweredByAgentInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAnswering_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isAbout_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const AnswerUpdateWithoutIsAboutInputSchema: z.ZodType<Prisma.AnswerUpdateWithoutIsAboutInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  values: z.lazy(() => ValueUpdateManyWithoutIsValueForNestedInputSchema).optional(),
  isAnswering: z.lazy(() => QuestionUpdateOneRequiredWithoutAnswer_isAnsweringNestedInputSchema).optional(),
  isAnsweredByAgent: z.lazy(() => ThingUpdateOneRequiredWithoutAnswer_isAnsweredByAgentNestedInputSchema).optional()
}).strict();

export const AnswerUncheckedUpdateWithoutIsAboutInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateWithoutIsAboutInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAnswering_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isAnsweredByAgent_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  values: z.lazy(() => ValueUncheckedUpdateManyWithoutIsValueForNestedInputSchema).optional()
}).strict();

export const AnswerUncheckedUpdateManyWithoutIsAboutInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateManyWithoutIsAboutInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAnswering_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isAnsweredByAgent_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ValueUpdateWithoutValueAsThingInputSchema: z.ZodType<Prisma.ValueUpdateWithoutValueAsThingInput> = z.object({
  value_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  valueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  valueAsString: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsNumber: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsBoolean: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isValueFor: z.lazy(() => AnswerUpdateOneRequiredWithoutValuesNestedInputSchema).optional()
}).strict();

export const ValueUncheckedUpdateWithoutValueAsThingInputSchema: z.ZodType<Prisma.ValueUncheckedUpdateWithoutValueAsThingInput> = z.object({
  value_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  valueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  valueAsString: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsNumber: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsBoolean: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isValueFor_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ValueUncheckedUpdateManyWithoutValueAsThingInputSchema: z.ZodType<Prisma.ValueUncheckedUpdateManyWithoutValueAsThingInput> = z.object({
  value_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  valueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  valueAsString: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsNumber: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsBoolean: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isValueFor_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const AnswerCreateManyIsAnsweringInputSchema: z.ZodType<Prisma.AnswerCreateManyIsAnsweringInput> = z.object({
  answer_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  isAbout_id: z.string().optional().nullable(),
  isAnsweredByAgent_id: z.string()
}).strict();

export const AnswerUpdateWithoutIsAnsweringInputSchema: z.ZodType<Prisma.AnswerUpdateWithoutIsAnsweringInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  values: z.lazy(() => ValueUpdateManyWithoutIsValueForNestedInputSchema).optional(),
  isAbout: z.lazy(() => ThingUpdateOneWithoutAnswer_isAboutNestedInputSchema).optional(),
  isAnsweredByAgent: z.lazy(() => ThingUpdateOneRequiredWithoutAnswer_isAnsweredByAgentNestedInputSchema).optional()
}).strict();

export const AnswerUncheckedUpdateWithoutIsAnsweringInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateWithoutIsAnsweringInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAbout_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isAnsweredByAgent_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  values: z.lazy(() => ValueUncheckedUpdateManyWithoutIsValueForNestedInputSchema).optional()
}).strict();

export const AnswerUncheckedUpdateManyWithoutIsAnsweringInputSchema: z.ZodType<Prisma.AnswerUncheckedUpdateManyWithoutIsAnsweringInput> = z.object({
  answer_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  isAbout_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isAnsweredByAgent_id: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ValueCreateManyIsValueForInputSchema: z.ZodType<Prisma.ValueCreateManyIsValueForInput> = z.object({
  value_id: z.string().cuid().optional(),
  index: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  valueType: z.lazy(() => DataTypeSchema),
  valueAsString: z.string().optional().nullable(),
  valueAsNumber: z.number().optional().nullable(),
  valueAsBoolean: z.boolean().optional().nullable(),
  valueAsThing_id: z.string().optional().nullable()
}).strict();

export const ValueUpdateWithoutIsValueForInputSchema: z.ZodType<Prisma.ValueUpdateWithoutIsValueForInput> = z.object({
  value_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  valueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  valueAsString: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsNumber: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsBoolean: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsThing: z.lazy(() => ThingUpdateOneWithoutIsUsedInValuesNestedInputSchema).optional()
}).strict();

export const ValueUncheckedUpdateWithoutIsValueForInputSchema: z.ZodType<Prisma.ValueUncheckedUpdateWithoutIsValueForInput> = z.object({
  value_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  valueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  valueAsString: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsNumber: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsBoolean: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsThing_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const ValueUncheckedUpdateManyWithoutIsValueForInputSchema: z.ZodType<Prisma.ValueUncheckedUpdateManyWithoutIsValueForInput> = z.object({
  value_id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  index: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  valueType: z.union([ z.lazy(() => DataTypeSchema),z.lazy(() => EnumDataTypeFieldUpdateOperationsInputSchema) ]).optional(),
  valueAsString: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsNumber: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsBoolean: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  valueAsThing_id: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const ThingFindFirstArgsSchema: z.ZodType<Prisma.ThingFindFirstArgs> = z.object({
  select: ThingSelectSchema.optional(),
  include: ThingIncludeSchema.optional(),
  where: ThingWhereInputSchema.optional(),
  orderBy: z.union([ ThingOrderByWithRelationInputSchema.array(),ThingOrderByWithRelationInputSchema ]).optional(),
  cursor: ThingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ThingScalarFieldEnumSchema,ThingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ThingFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ThingFindFirstOrThrowArgs> = z.object({
  select: ThingSelectSchema.optional(),
  include: ThingIncludeSchema.optional(),
  where: ThingWhereInputSchema.optional(),
  orderBy: z.union([ ThingOrderByWithRelationInputSchema.array(),ThingOrderByWithRelationInputSchema ]).optional(),
  cursor: ThingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ThingScalarFieldEnumSchema,ThingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ThingFindManyArgsSchema: z.ZodType<Prisma.ThingFindManyArgs> = z.object({
  select: ThingSelectSchema.optional(),
  include: ThingIncludeSchema.optional(),
  where: ThingWhereInputSchema.optional(),
  orderBy: z.union([ ThingOrderByWithRelationInputSchema.array(),ThingOrderByWithRelationInputSchema ]).optional(),
  cursor: ThingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ThingScalarFieldEnumSchema,ThingScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ThingAggregateArgsSchema: z.ZodType<Prisma.ThingAggregateArgs> = z.object({
  where: ThingWhereInputSchema.optional(),
  orderBy: z.union([ ThingOrderByWithRelationInputSchema.array(),ThingOrderByWithRelationInputSchema ]).optional(),
  cursor: ThingWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ThingGroupByArgsSchema: z.ZodType<Prisma.ThingGroupByArgs> = z.object({
  where: ThingWhereInputSchema.optional(),
  orderBy: z.union([ ThingOrderByWithAggregationInputSchema.array(),ThingOrderByWithAggregationInputSchema ]).optional(),
  by: ThingScalarFieldEnumSchema.array(),
  having: ThingScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ThingFindUniqueArgsSchema: z.ZodType<Prisma.ThingFindUniqueArgs> = z.object({
  select: ThingSelectSchema.optional(),
  include: ThingIncludeSchema.optional(),
  where: ThingWhereUniqueInputSchema,
}).strict() ;

export const ThingFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ThingFindUniqueOrThrowArgs> = z.object({
  select: ThingSelectSchema.optional(),
  include: ThingIncludeSchema.optional(),
  where: ThingWhereUniqueInputSchema,
}).strict() ;

export const QuestionFindFirstArgsSchema: z.ZodType<Prisma.QuestionFindFirstArgs> = z.object({
  select: QuestionSelectSchema.optional(),
  include: QuestionIncludeSchema.optional(),
  where: QuestionWhereInputSchema.optional(),
  orderBy: z.union([ QuestionOrderByWithRelationInputSchema.array(),QuestionOrderByWithRelationInputSchema ]).optional(),
  cursor: QuestionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ QuestionScalarFieldEnumSchema,QuestionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const QuestionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.QuestionFindFirstOrThrowArgs> = z.object({
  select: QuestionSelectSchema.optional(),
  include: QuestionIncludeSchema.optional(),
  where: QuestionWhereInputSchema.optional(),
  orderBy: z.union([ QuestionOrderByWithRelationInputSchema.array(),QuestionOrderByWithRelationInputSchema ]).optional(),
  cursor: QuestionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ QuestionScalarFieldEnumSchema,QuestionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const QuestionFindManyArgsSchema: z.ZodType<Prisma.QuestionFindManyArgs> = z.object({
  select: QuestionSelectSchema.optional(),
  include: QuestionIncludeSchema.optional(),
  where: QuestionWhereInputSchema.optional(),
  orderBy: z.union([ QuestionOrderByWithRelationInputSchema.array(),QuestionOrderByWithRelationInputSchema ]).optional(),
  cursor: QuestionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ QuestionScalarFieldEnumSchema,QuestionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const QuestionAggregateArgsSchema: z.ZodType<Prisma.QuestionAggregateArgs> = z.object({
  where: QuestionWhereInputSchema.optional(),
  orderBy: z.union([ QuestionOrderByWithRelationInputSchema.array(),QuestionOrderByWithRelationInputSchema ]).optional(),
  cursor: QuestionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const QuestionGroupByArgsSchema: z.ZodType<Prisma.QuestionGroupByArgs> = z.object({
  where: QuestionWhereInputSchema.optional(),
  orderBy: z.union([ QuestionOrderByWithAggregationInputSchema.array(),QuestionOrderByWithAggregationInputSchema ]).optional(),
  by: QuestionScalarFieldEnumSchema.array(),
  having: QuestionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const QuestionFindUniqueArgsSchema: z.ZodType<Prisma.QuestionFindUniqueArgs> = z.object({
  select: QuestionSelectSchema.optional(),
  include: QuestionIncludeSchema.optional(),
  where: QuestionWhereUniqueInputSchema,
}).strict() ;

export const QuestionFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.QuestionFindUniqueOrThrowArgs> = z.object({
  select: QuestionSelectSchema.optional(),
  include: QuestionIncludeSchema.optional(),
  where: QuestionWhereUniqueInputSchema,
}).strict() ;

export const AnswerFindFirstArgsSchema: z.ZodType<Prisma.AnswerFindFirstArgs> = z.object({
  select: AnswerSelectSchema.optional(),
  include: AnswerIncludeSchema.optional(),
  where: AnswerWhereInputSchema.optional(),
  orderBy: z.union([ AnswerOrderByWithRelationInputSchema.array(),AnswerOrderByWithRelationInputSchema ]).optional(),
  cursor: AnswerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AnswerScalarFieldEnumSchema,AnswerScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const AnswerFindFirstOrThrowArgsSchema: z.ZodType<Prisma.AnswerFindFirstOrThrowArgs> = z.object({
  select: AnswerSelectSchema.optional(),
  include: AnswerIncludeSchema.optional(),
  where: AnswerWhereInputSchema.optional(),
  orderBy: z.union([ AnswerOrderByWithRelationInputSchema.array(),AnswerOrderByWithRelationInputSchema ]).optional(),
  cursor: AnswerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AnswerScalarFieldEnumSchema,AnswerScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const AnswerFindManyArgsSchema: z.ZodType<Prisma.AnswerFindManyArgs> = z.object({
  select: AnswerSelectSchema.optional(),
  include: AnswerIncludeSchema.optional(),
  where: AnswerWhereInputSchema.optional(),
  orderBy: z.union([ AnswerOrderByWithRelationInputSchema.array(),AnswerOrderByWithRelationInputSchema ]).optional(),
  cursor: AnswerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ AnswerScalarFieldEnumSchema,AnswerScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const AnswerAggregateArgsSchema: z.ZodType<Prisma.AnswerAggregateArgs> = z.object({
  where: AnswerWhereInputSchema.optional(),
  orderBy: z.union([ AnswerOrderByWithRelationInputSchema.array(),AnswerOrderByWithRelationInputSchema ]).optional(),
  cursor: AnswerWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const AnswerGroupByArgsSchema: z.ZodType<Prisma.AnswerGroupByArgs> = z.object({
  where: AnswerWhereInputSchema.optional(),
  orderBy: z.union([ AnswerOrderByWithAggregationInputSchema.array(),AnswerOrderByWithAggregationInputSchema ]).optional(),
  by: AnswerScalarFieldEnumSchema.array(),
  having: AnswerScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const AnswerFindUniqueArgsSchema: z.ZodType<Prisma.AnswerFindUniqueArgs> = z.object({
  select: AnswerSelectSchema.optional(),
  include: AnswerIncludeSchema.optional(),
  where: AnswerWhereUniqueInputSchema,
}).strict() ;

export const AnswerFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.AnswerFindUniqueOrThrowArgs> = z.object({
  select: AnswerSelectSchema.optional(),
  include: AnswerIncludeSchema.optional(),
  where: AnswerWhereUniqueInputSchema,
}).strict() ;

export const ValueFindFirstArgsSchema: z.ZodType<Prisma.ValueFindFirstArgs> = z.object({
  select: ValueSelectSchema.optional(),
  include: ValueIncludeSchema.optional(),
  where: ValueWhereInputSchema.optional(),
  orderBy: z.union([ ValueOrderByWithRelationInputSchema.array(),ValueOrderByWithRelationInputSchema ]).optional(),
  cursor: ValueWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ValueScalarFieldEnumSchema,ValueScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ValueFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ValueFindFirstOrThrowArgs> = z.object({
  select: ValueSelectSchema.optional(),
  include: ValueIncludeSchema.optional(),
  where: ValueWhereInputSchema.optional(),
  orderBy: z.union([ ValueOrderByWithRelationInputSchema.array(),ValueOrderByWithRelationInputSchema ]).optional(),
  cursor: ValueWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ValueScalarFieldEnumSchema,ValueScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ValueFindManyArgsSchema: z.ZodType<Prisma.ValueFindManyArgs> = z.object({
  select: ValueSelectSchema.optional(),
  include: ValueIncludeSchema.optional(),
  where: ValueWhereInputSchema.optional(),
  orderBy: z.union([ ValueOrderByWithRelationInputSchema.array(),ValueOrderByWithRelationInputSchema ]).optional(),
  cursor: ValueWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ValueScalarFieldEnumSchema,ValueScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export const ValueAggregateArgsSchema: z.ZodType<Prisma.ValueAggregateArgs> = z.object({
  where: ValueWhereInputSchema.optional(),
  orderBy: z.union([ ValueOrderByWithRelationInputSchema.array(),ValueOrderByWithRelationInputSchema ]).optional(),
  cursor: ValueWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ValueGroupByArgsSchema: z.ZodType<Prisma.ValueGroupByArgs> = z.object({
  where: ValueWhereInputSchema.optional(),
  orderBy: z.union([ ValueOrderByWithAggregationInputSchema.array(),ValueOrderByWithAggregationInputSchema ]).optional(),
  by: ValueScalarFieldEnumSchema.array(),
  having: ValueScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export const ValueFindUniqueArgsSchema: z.ZodType<Prisma.ValueFindUniqueArgs> = z.object({
  select: ValueSelectSchema.optional(),
  include: ValueIncludeSchema.optional(),
  where: ValueWhereUniqueInputSchema,
}).strict() ;

export const ValueFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ValueFindUniqueOrThrowArgs> = z.object({
  select: ValueSelectSchema.optional(),
  include: ValueIncludeSchema.optional(),
  where: ValueWhereUniqueInputSchema,
}).strict() ;

export const ThingCreateArgsSchema: z.ZodType<Prisma.ThingCreateArgs> = z.object({
  select: ThingSelectSchema.optional(),
  include: ThingIncludeSchema.optional(),
  data: z.union([ ThingCreateInputSchema,ThingUncheckedCreateInputSchema ]),
}).strict() ;

export const ThingUpsertArgsSchema: z.ZodType<Prisma.ThingUpsertArgs> = z.object({
  select: ThingSelectSchema.optional(),
  include: ThingIncludeSchema.optional(),
  where: ThingWhereUniqueInputSchema,
  create: z.union([ ThingCreateInputSchema,ThingUncheckedCreateInputSchema ]),
  update: z.union([ ThingUpdateInputSchema,ThingUncheckedUpdateInputSchema ]),
}).strict() ;

export const ThingCreateManyArgsSchema: z.ZodType<Prisma.ThingCreateManyArgs> = z.object({
  data: z.union([ ThingCreateManyInputSchema,ThingCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ThingDeleteArgsSchema: z.ZodType<Prisma.ThingDeleteArgs> = z.object({
  select: ThingSelectSchema.optional(),
  include: ThingIncludeSchema.optional(),
  where: ThingWhereUniqueInputSchema,
}).strict() ;

export const ThingUpdateArgsSchema: z.ZodType<Prisma.ThingUpdateArgs> = z.object({
  select: ThingSelectSchema.optional(),
  include: ThingIncludeSchema.optional(),
  data: z.union([ ThingUpdateInputSchema,ThingUncheckedUpdateInputSchema ]),
  where: ThingWhereUniqueInputSchema,
}).strict() ;

export const ThingUpdateManyArgsSchema: z.ZodType<Prisma.ThingUpdateManyArgs> = z.object({
  data: z.union([ ThingUpdateManyMutationInputSchema,ThingUncheckedUpdateManyInputSchema ]),
  where: ThingWhereInputSchema.optional(),
}).strict() ;

export const ThingDeleteManyArgsSchema: z.ZodType<Prisma.ThingDeleteManyArgs> = z.object({
  where: ThingWhereInputSchema.optional(),
}).strict() ;

export const QuestionCreateArgsSchema: z.ZodType<Omit<Prisma.QuestionCreateArgs, "data"> & { data: z.infer<typeof QuestionCreateInputSchema> | z.infer<typeof QuestionUncheckedCreateInputSchema> }> = z.object({
  select: QuestionSelectSchema.optional(),
  include: QuestionIncludeSchema.optional(),
  data: z.union([ QuestionCreateInputSchema,QuestionUncheckedCreateInputSchema ]),
}).strict() ;

export const QuestionUpsertArgsSchema: z.ZodType<Omit<Prisma.QuestionUpsertArgs, "create" | "update"> & { create: z.infer<typeof QuestionCreateInputSchema> | z.infer<typeof QuestionUncheckedCreateInputSchema>, update: z.infer<typeof QuestionUpdateInputSchema> | z.infer<typeof QuestionUncheckedUpdateInputSchema> }> = z.object({
  select: QuestionSelectSchema.optional(),
  include: QuestionIncludeSchema.optional(),
  where: QuestionWhereUniqueInputSchema,
  create: z.union([ QuestionCreateInputSchema,QuestionUncheckedCreateInputSchema ]),
  update: z.union([ QuestionUpdateInputSchema,QuestionUncheckedUpdateInputSchema ]),
}).strict() ;

export const QuestionCreateManyArgsSchema: z.ZodType<Omit<Prisma.QuestionCreateManyArgs, "data"> & { data: z.infer<typeof QuestionCreateManyInputSchema> | z.infer<typeof QuestionCreateManyInputSchema>[] }> = z.object({
  data: z.union([ QuestionCreateManyInputSchema,QuestionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const QuestionDeleteArgsSchema: z.ZodType<Prisma.QuestionDeleteArgs> = z.object({
  select: QuestionSelectSchema.optional(),
  include: QuestionIncludeSchema.optional(),
  where: QuestionWhereUniqueInputSchema,
}).strict() ;

export const QuestionUpdateArgsSchema: z.ZodType<Omit<Prisma.QuestionUpdateArgs, "data"> & { data: z.infer<typeof QuestionUpdateInputSchema> | z.infer<typeof QuestionUncheckedUpdateInputSchema> }> = z.object({
  select: QuestionSelectSchema.optional(),
  include: QuestionIncludeSchema.optional(),
  data: z.union([ QuestionUpdateInputSchema,QuestionUncheckedUpdateInputSchema ]),
  where: QuestionWhereUniqueInputSchema,
}).strict() ;

export const QuestionUpdateManyArgsSchema: z.ZodType<Omit<Prisma.QuestionUpdateManyArgs, "data"> & { data: z.infer<typeof QuestionUpdateManyMutationInputSchema> | z.infer<typeof QuestionUncheckedUpdateManyInputSchema> }> = z.object({
  data: z.union([ QuestionUpdateManyMutationInputSchema,QuestionUncheckedUpdateManyInputSchema ]),
  where: QuestionWhereInputSchema.optional(),
}).strict() ;

export const QuestionDeleteManyArgsSchema: z.ZodType<Prisma.QuestionDeleteManyArgs> = z.object({
  where: QuestionWhereInputSchema.optional(),
}).strict() ;

export const AnswerCreateArgsSchema: z.ZodType<Prisma.AnswerCreateArgs> = z.object({
  select: AnswerSelectSchema.optional(),
  include: AnswerIncludeSchema.optional(),
  data: z.union([ AnswerCreateInputSchema,AnswerUncheckedCreateInputSchema ]),
}).strict() ;

export const AnswerUpsertArgsSchema: z.ZodType<Prisma.AnswerUpsertArgs> = z.object({
  select: AnswerSelectSchema.optional(),
  include: AnswerIncludeSchema.optional(),
  where: AnswerWhereUniqueInputSchema,
  create: z.union([ AnswerCreateInputSchema,AnswerUncheckedCreateInputSchema ]),
  update: z.union([ AnswerUpdateInputSchema,AnswerUncheckedUpdateInputSchema ]),
}).strict() ;

export const AnswerCreateManyArgsSchema: z.ZodType<Prisma.AnswerCreateManyArgs> = z.object({
  data: z.union([ AnswerCreateManyInputSchema,AnswerCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const AnswerDeleteArgsSchema: z.ZodType<Prisma.AnswerDeleteArgs> = z.object({
  select: AnswerSelectSchema.optional(),
  include: AnswerIncludeSchema.optional(),
  where: AnswerWhereUniqueInputSchema,
}).strict() ;

export const AnswerUpdateArgsSchema: z.ZodType<Prisma.AnswerUpdateArgs> = z.object({
  select: AnswerSelectSchema.optional(),
  include: AnswerIncludeSchema.optional(),
  data: z.union([ AnswerUpdateInputSchema,AnswerUncheckedUpdateInputSchema ]),
  where: AnswerWhereUniqueInputSchema,
}).strict() ;

export const AnswerUpdateManyArgsSchema: z.ZodType<Prisma.AnswerUpdateManyArgs> = z.object({
  data: z.union([ AnswerUpdateManyMutationInputSchema,AnswerUncheckedUpdateManyInputSchema ]),
  where: AnswerWhereInputSchema.optional(),
}).strict() ;

export const AnswerDeleteManyArgsSchema: z.ZodType<Prisma.AnswerDeleteManyArgs> = z.object({
  where: AnswerWhereInputSchema.optional(),
}).strict() ;

export const ValueCreateArgsSchema: z.ZodType<Prisma.ValueCreateArgs> = z.object({
  select: ValueSelectSchema.optional(),
  include: ValueIncludeSchema.optional(),
  data: z.union([ ValueCreateInputSchema,ValueUncheckedCreateInputSchema ]),
}).strict() ;

export const ValueUpsertArgsSchema: z.ZodType<Prisma.ValueUpsertArgs> = z.object({
  select: ValueSelectSchema.optional(),
  include: ValueIncludeSchema.optional(),
  where: ValueWhereUniqueInputSchema,
  create: z.union([ ValueCreateInputSchema,ValueUncheckedCreateInputSchema ]),
  update: z.union([ ValueUpdateInputSchema,ValueUncheckedUpdateInputSchema ]),
}).strict() ;

export const ValueCreateManyArgsSchema: z.ZodType<Prisma.ValueCreateManyArgs> = z.object({
  data: z.union([ ValueCreateManyInputSchema,ValueCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export const ValueDeleteArgsSchema: z.ZodType<Prisma.ValueDeleteArgs> = z.object({
  select: ValueSelectSchema.optional(),
  include: ValueIncludeSchema.optional(),
  where: ValueWhereUniqueInputSchema,
}).strict() ;

export const ValueUpdateArgsSchema: z.ZodType<Prisma.ValueUpdateArgs> = z.object({
  select: ValueSelectSchema.optional(),
  include: ValueIncludeSchema.optional(),
  data: z.union([ ValueUpdateInputSchema,ValueUncheckedUpdateInputSchema ]),
  where: ValueWhereUniqueInputSchema,
}).strict() ;

export const ValueUpdateManyArgsSchema: z.ZodType<Prisma.ValueUpdateManyArgs> = z.object({
  data: z.union([ ValueUpdateManyMutationInputSchema,ValueUncheckedUpdateManyInputSchema ]),
  where: ValueWhereInputSchema.optional(),
}).strict() ;

export const ValueDeleteManyArgsSchema: z.ZodType<Prisma.ValueDeleteManyArgs> = z.object({
  where: ValueWhereInputSchema.optional(),
}).strict() ;