'use client'

import { suggest } from '@/actions/suggest'
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
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

function InputForm() {
  const form = useForm<QuestionSchemaType>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      question: '',
      description: '',
      locale: '',
      asProperty: '',
      expectedValueType: 'Thing',
      expectedThingTypes: [],
    },
  })

  async function onSubmit(data: QuestionSchemaType) {
    console.log('data', data)
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
          name="expectedValueType"
          label="expectedValueType"
          inputHasFormControl={true}
          input={(field) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          name="expectedThingTypes"
          label="expectedThingTypes"
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

        <Button type="submit">Suggest</Button>
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
