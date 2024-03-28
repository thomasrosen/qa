'use client'

import { suggest } from '@/actions/suggest'
import { Combobox } from '@/components/Combobox'
import { FormInput } from '@/components/FormInput'
import { Headline } from '@/components/Headline'
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
import { Textarea } from '@/components/ui/textarea'
import {
  DataTypeSchema,
  QuestionSchema,
  SchemaTypeSchema,
  type QuestionSchemaType,
} from '@/lib/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

const frameworks = [
  {
    value: 'next.js',
    data: 'Next.js',
  },
  {
    value: 'sveltekit',
    data: 'SvelteKit',
  },
  {
    value: 'nuxt.js',
    data: 'Nuxt.js',
  },
  {
    value: 'remix',
    data: 'Remix',
  },
  {
    value: 'astro',
    data: 'Astro',
  },
]

function InputForm() {
  const [thingOptions, setThingOptions] = useState<string[]>([])
  const [answerType, setAnswerType] = useState<string | null>(null)
  const answerThingTypes = useRef<string[]>([])

  const fetchThingOptions = useCallback(() => {
    async function fetchOptions() {
      const url = new URL('/api/thingOptions', window.location.href)
      for (const type of answerThingTypes.current) {
        url.searchParams.append('t', type)
      }

      const response = await fetch(url.href)
      const { things } = await response.json()
      console.log('things', things)
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
        <Combobox
          options={frameworks}
          placeholder="Select framework…"
          renderLabel={(option) => <span>{option.data}</span>}
          multiple
          onChange={(value) => console.log('value', value)}
        />

        <FormInput
          form={form}
          name="question"
          label="Question"
          input={(field) => <Textarea {...field} value={field.value || ''} />}
        />

        <FormInput
          form={form}
          name="description"
          label="Description"
          input={(field) => <Textarea {...field} value={field.value || ''} />}
        />

        <FormInput
          form={form}
          name="locale"
          label="Locale"
          input={(field) => <Input type="text" {...field} value={field.value || ''} />}
        />

        <FormInput
          form={form}
          name="asProperty"
          label="asProperty"
          input={(field) => <Input type="text" {...field} value={field.value || ''} />}
        />

        <FormInput
          form={form}
          name="aboutThingTypes"
          label="What type of data is the question about?"
          inputHasFormControl={true}
          input={(field) => {
            const values = field.value || []
            return [...new Array(values.length + 1)]
              .map((_, i) => {
                const value = values[i] || ''
                const onChange = (value: string) => {
                  if (value === 'DESELECT') {
                    value = ''
                  }
                  values.splice(i, 1, value)
                  const uniqueValues = Array.from(new Set(values)).filter(Boolean)
                  field.onChange(uniqueValues)
                }
                const possibleOptions = SchemaTypeSchema.options
                  .filter((options) => !values.includes(options) || options === value)
                  .sort()

                if (!value && possibleOptions.length === 0) {
                  return null
                }

                return (
                  <Select key={i} onValueChange={onChange} value={value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a SchemaType…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {value && (
                        <>
                          <SelectItem value="DESELECT">Deselect Value</SelectItem>
                          <SelectItem value="-" disabled>
                            —————
                          </SelectItem>
                        </>
                      )}
                      {possibleOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              })
              .filter(Boolean)
          }}
        />

        <FormInput
          form={form}
          name="answerType"
          label="With which type of data can the question be answered?"
          inputHasFormControl={true}
          input={(field) => (
            <Select
              onValueChange={(newValue) => {
                console.log('newValue', newValue)
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
                  <SelectValue placeholder="Select a DataType…" />
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

        <FormInput
          form={form}
          name="answerThingTypes"
          label="If it's a thing, which types are allowed?"
          inputHasFormControl={true}
          input={(field) => {
            const values = field.value || []

            return (
              <Combobox
                options={SchemaTypeSchema.options.map((option) => ({ value: option }))}
                placeholder="Select a SchemaType…"
                renderLabel={(option) => <span>{option.value}</span>}
                multiple
                onChange={(values) => {
                  console.log('values', values)
                  field.onChange(values)
                }}
              />
            )

            return [...new Array(values.length + 1)]
              .map((_, i) => {
                const value = values[i] || ''
                const onChange = (value: string) => {
                  if (value === 'DESELECT') {
                    value = ''
                  }
                  values.splice(i, 1, value)
                  const uniqueValues = Array.from(new Set(values)).filter(Boolean) as string[]
                  field.onChange(uniqueValues)
                  answerThingTypes.current = uniqueValues
                }
                const possibleOptions = SchemaTypeSchema.options
                  .filter((options) => !values.includes(options) || options === value)
                  .sort()

                if (!value && possibleOptions.length === 0) {
                  return null
                }

                return (
                  <Select key={i} onValueChange={onChange} value={value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a SchemaType…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {value && (
                        <>
                          <SelectItem value="DESELECT">Deselect Value</SelectItem>
                          <SelectItem value="-" disabled>
                            —————
                          </SelectItem>
                        </>
                      )}
                      {possibleOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              })
              .filter(Boolean)
          }}
        />

        <FormInput
          form={form}
          name="answerThingTypes"
          label="If it's a thing, which types are allowed?"
          inputHasFormControl={true}
          input={(field) => {
            const values = field.value || []
            return [...new Array(values.length + 1)]
              .map((_, i) => {
                const value = values[i] || ''
                const onChange = (value: string) => {
                  if (value === 'DESELECT') {
                    value = ''
                  }
                  values.splice(i, 1, value)
                  const uniqueValues = Array.from(new Set(values)).filter(Boolean) as string[]
                  field.onChange(uniqueValues)
                  answerThingTypes.current = uniqueValues
                }
                const possibleOptions = SchemaTypeSchema.options
                  .filter((options) => !values.includes(options) || options === value)
                  .sort()

                if (!value && possibleOptions.length === 0) {
                  return null
                }

                return (
                  <Select key={i} onValueChange={onChange} value={value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a SchemaType…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {value && (
                        <>
                          <SelectItem value="DESELECT">Deselect Value</SelectItem>
                          <SelectItem value="-" disabled>
                            —————
                          </SelectItem>
                        </>
                      )}
                      {possibleOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              })
              .filter(Boolean)
          }}
        />

        {thingOptions.length > 0 && (
          <FormInput
            form={form}
            name="answerThingOptions"
            label="If it's a thing, which types are allowed?"
            inputHasFormControl={true}
            input={(field) => {
              const values = field.value || []
              return [...new Array(values.length + 1)]
                .map((_, i) => {
                  const value = values[i] || ''
                  const onChange = (value: string) => {
                    if (value === 'DESELECT') {
                      value = ''
                    }
                    values.splice(i, 1, value)
                    const uniqueValues = Array.from(new Set(values)).filter(Boolean)
                    field.onChange(uniqueValues)
                  }
                  const possibleOptions = SchemaTypeSchema.options
                    .filter((options) => !values.includes(options) || options === value)
                    .sort()

                  if (!value && possibleOptions.length === 0) {
                    return null
                  }

                  return (
                    <Select key={i} onValueChange={onChange} value={value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a SchemaType…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {value && (
                          <>
                            <SelectItem value="DESELECT">Deselect Value</SelectItem>
                            <SelectItem value="-" disabled>
                              —————
                            </SelectItem>
                          </>
                        )}
                        {possibleOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                })
                .filter(Boolean)
            }}
          />
        )}

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
