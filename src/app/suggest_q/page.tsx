'use client'

import { suggestQuestion } from '@/actions/suggestQuestion'
import { AutoGrowTextarea } from '@/components/AutogrowTextarea'
import { ComboBoxBadge } from '@/components/ComboBoxBadge'
import { Combobox } from '@/components/Combobox'
import { FormInput } from '@/components/FormInput'
import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { ThingRow } from '@/components/ThingRow'
import { Button } from '@/components/ui/button'
import { Form, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DEFAULT_LOCALE, LOCALES } from '@/lib/constants'
import { intlDisplayNamesLanguage } from '@/lib/intlDisplayNamesLanguage'
import {
  DataTypeSchema,
  QuestionSchema,
  SchemaTypeSchema,
  ThingSchemaType,
  type QuestionSchemaType,
} from '@/lib/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function InputForm({
  question,
}: {
  question?: QuestionSchemaType | null
}) {
  const [thingOptions, setThingOptions] = useState<ThingSchemaType[]>([])
  const [answerType, setAnswerType] = useState<string | null>(
    question?.answerType || null
  )
  const answerThingTypes = useRef<string[]>(question?.answerThingTypes || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<QuestionSchemaType>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      question: '',
      description: '',
      locale: '',
      asProperty: '',
      aboutThingTypes: [],
      answerType: undefined,
      answerThingTypes: [],
      ...question,
      answerThingOptions:
        (question?.answerThingOptions || []).map((thing) => thing.thing_id) ||
        [],
    },
  })

  const fetchThingOptions = useCallback(() => {
    async function fetchOptions() {
      if (answerThingTypes.current.length === 0) {
        // set things to an empty array if no types are selected
        setThingOptions([])
        return
      }

      const url = new URL('/api/thingOptions', window.location.href)
      for (const type of answerThingTypes.current) {
        url.searchParams.append('t', type)
      }

      const response = await fetch(url.href)
      const { things } = await response.json()
      setThingOptions(things)
    }

    if (answerType === 'Thing') {
      fetchOptions()
    }
  }, [answerType])

  useEffect(() => {
    fetchThingOptions()
  }, [fetchThingOptions])

  async function onSubmit(data: QuestionSchemaType) {
    setIsSubmitting(true)
    const submitted = await suggestQuestion(data)
    setIsSubmitting(false)

    if (submitted) {
      // form.reset()
      router.refresh()
      toast('You submitted the following values:', {
        description: (
          <pre className="mt-2">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        ),
      })
    } else {
      toast.error('An error occurred while submitting your suggestion.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          form={form}
          name="question"
          label="Question"
          input={(field) => (
            <AutoGrowTextarea
              {...field}
              autoFocus
              value={field.value || ''}
              placeholder="What / When / Where / Who / …"
            />
          )}
        />

        <FormInput
          form={form}
          name="description"
          label="Description"
          input={(field) => (
            <AutoGrowTextarea
              {...field}
              value={field.value || ''}
              placeholder="Information that are needed to understand the question."
            />
          )}
        />

        <FormInput
          form={form}
          name="locale"
          label="Locale of the question and description."
          inputHasFormControl={true}
          input={(field) => (
            <Combobox
              selected={[field.value].filter(Boolean)}
              options={LOCALES.sort().map((option) => ({
                value: option,
                label: intlDisplayNamesLanguage(DEFAULT_LOCALE, option),
                keywords: [
                  option,
                  intlDisplayNamesLanguage(option, option) || '',
                ].filter(Boolean),
              }))}
              placeholder="Select a Locale…"
              renderLabel={(option) => (
                <ComboBoxBadge>{option.label || option.value}</ComboBoxBadge>
              )}
              onChange={(values) => field.onChange(values[0])}
            />
          )}
        />

        <FormInput
          form={form}
          name="asProperty"
          label="asProperty"
          input={(field) => (
            <Input
              type="text"
              {...field}
              value={field.value || ''}
              placeholder="knows / likes / …"
            />
          )}
        />

        <Headline type="h3">About</Headline>
        <FormInput
          form={form}
          name="aboutThingTypes"
          label="What type of data is the question about?"
          inputHasFormControl={true}
          input={(field) => (
            <Combobox
              selected={field.value || []}
              options={SchemaTypeSchema.options.map((option) => ({
                value: option,
              }))}
              placeholder="Select a SchemaType…"
              renderLabel={(option) => (
                <ComboBoxBadge>{option.value}</ComboBoxBadge>
              )}
              multiple={true}
              onChange={(values) => field.onChange(values)}
            />
          )}
        />

        <Headline type="h3">Answer</Headline>
        <FormInput
          form={form}
          name="answerType"
          label="With which type of data can the question be answered?"
          inputHasFormControl={true}
          input={(field) => (
            <Select
              onValueChange={(newValue) => {
                field.onChange(newValue)
                setAnswerType(newValue)
                if (newValue === 'Thing') {
                  fetchThingOptions()
                }
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      <span className="text-foreground/20">
                        Select a DataType…
                      </span>
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {DataTypeSchema.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        {answerType === 'Thing' ? (
          <>
            <FormInput
              form={form}
              name="answerThingTypes"
              label="If it's a thing, which types are allowed?"
              inputHasFormControl={true}
              input={(field) => (
                <Combobox
                  selected={field.value || []}
                  options={SchemaTypeSchema.options.map((option) => ({
                    value: option,
                  }))}
                  placeholder="Select a SchemaType…"
                  renderLabel={(option) => (
                    <ComboBoxBadge>{option.value}</ComboBoxBadge>
                  )}
                  multiple={true}
                  onChange={(values) => {
                    field.onChange(values)
                    answerThingTypes.current = values
                    fetchThingOptions()
                  }}
                />
              )}
            />

            {thingOptions.length > 0 && (
              <FormInput
                form={form}
                name="answerThingOptions"
                label="Which things are allowed? (leave empty for all)"
                inputHasFormControl={true}
                input={(field) => (
                  <Combobox
                    selected={field.value || []}
                    options={thingOptions.map((option) => ({
                      value: option.thing_id || '', // should always be set. just to make types happy
                      keywords: [
                        option.name,
                        option.type,
                        option.thing_id,
                      ] as string[],
                      data: option,
                    }))}
                    placeholder="Select a SchemaType…"
                    renderLabel={(option) => <ThingRow thing={option.data} />}
                    multiple={true}
                    onChange={(values) => field.onChange(values)}
                  />
                )}
              />
            )}
          </>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          Suggest Question
        </Button>
        {isSubmitting ? <P>Sending your suggestion…</P> : null}
      </form>
    </Form>
  )
}

export default function SuggestQuestion() {
  return (
    <section className="flex flex-col gap-4">
      <Headline type="h2">Suggest a Question</Headline>
      <InputForm />
    </section>
  )
}
