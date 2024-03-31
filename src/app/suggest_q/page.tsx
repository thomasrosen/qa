'use client'

import { suggest } from '@/actions/suggest'
import { AutoGrowTextarea } from '@/components/AutogrowTextarea'
import { ComboBoxBadge } from '@/components/ComboBoxBadge'
import { Combobox } from '@/components/Combobox'
import { FormInput } from '@/components/FormInput'
import { Headline } from '@/components/Headline'
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
import {
  DataTypeSchema,
  QuestionSchema,
  SchemaTypeSchema,
  ThingSchemaType,
  type QuestionSchemaType,
} from '@/lib/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

function InputForm() {
  const [thingOptions, setThingOptions] = useState<ThingSchemaType[]>([])
  const [answerType, setAnswerType] = useState<string | null>(null)
  const answerThingTypes = useRef<string[]>([])

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

  const form = useForm<QuestionSchemaType>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      question: '',
      description: '',
      locale: 'en',
      asProperty: 'knowsAbout',
      aboutThingTypes: ['DefinedTerm'],
      answerType: 'Boolean',
      answerThingTypes: [],
    },
  })

  async function onSubmit(data: QuestionSchemaType) {
    const submitted = await suggest(data)

    if (submitted) {
      form.reset()
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
          label="Locale"
          input={(field) => (
            <Input type="text" {...field} value={field.value || ''} placeholder="en / de / …" />
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

        <FormInput
          form={form}
          name="aboutThingTypes"
          label="What type of data is the question about?"
          inputHasFormControl={true}
          input={(field) => (
            <Combobox
              selected={field.value || []}
              options={SchemaTypeSchema.options.map((option) => ({ value: option }))}
              placeholder="Select a SchemaType…"
              renderLabel={(option) => <ComboBoxBadge>{option.value}</ComboBoxBadge>}
              multiple={true}
              onChange={(values) => field.onChange(values)}
            />
          )}
        />

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
                    placeholder={<span className="text-foreground/20">Select a DataType…</span>}
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
                  options={SchemaTypeSchema.options.map((option) => ({ value: option }))}
                  placeholder="Select a SchemaType…"
                  renderLabel={(option) => <ComboBoxBadge>{option.value}</ComboBoxBadge>}
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
                      keywords: [option.name, option.type, option.thing_id] as string[],
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

        <Button type="submit">Suggest Question</Button>
      </form>
    </Form>
  )
}

export default function Suggest() {
  return (
    <section className="flex flex-col gap-4">
      <Headline type="h2">Suggest a Question</Headline>
      <InputForm />
    </section>
  )
}
