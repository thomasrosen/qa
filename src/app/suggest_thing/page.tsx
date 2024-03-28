'use client'

import { suggestThing } from '@/actions/suggestThing'
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
import { SchemaTypeSchema, ThingSchema, type ThingSchemaType } from '@/lib/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

function InputForm() {
  const form = useForm<ThingSchemaType>({
    resolver: zodResolver(ThingSchema),
    defaultValues: {
      type: 'DefinedTerm',
      name: '',
      locale: 'en',
      sameAs: [],
      jsonld: null,
    },
  })

  async function onSubmit(data: ThingSchemaType) {
    const submitted = await suggestThing(data)

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
          name="type"
          label="Type"
          inputHasFormControl={true}
          input={(field) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a SchemaType…" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SchemaTypeSchema.options.map((option) => (
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
          name="name"
          label="Name / Title"
          input={(field) => <Input {...field} value={field.value || ''} />}
        />

        <FormInput
          form={form}
          name="locale"
          label="Locale"
          input={(field) => <Input type="text" {...field} value={field.value || ''} />}
        />

        <FormInput
          form={form}
          name="jsonld"
          label="JSON-LD (schema.org)"
          input={(field) => <Textarea className="font-mono" {...field} value={field.value || ''} />}
        />

        <FormInput
          form={form}
          name="sameAs"
          label="sameAs"
          inputHasFormControl={true}
          input={(field) => {
            const values = field.value || []
            return [...new Array(values.length + 1)]
              .map((_, i) => {
                const value = values[i] || ''
                const onChange = (event: ChangeEvent<HTMLInputElement>) => {
                  const newValue = event.target.value
                  values.splice(i, 1, newValue)
                  const uniqueValues = Array.from(new Set(values)).filter(Boolean)
                  field.onChange(uniqueValues)
                }

                return (
                  <Input
                    key={i}
                    type="text"
                    {...field}
                    placeholder="https://www.wikidata.org/wiki/Q1"
                    onChange={onChange}
                    value={value}
                  />
                )
              })
              .filter(Boolean)
          }}
        />

        <Button type="submit">Suggest Thing</Button>
      </form>
    </Form>
  )
}

export default function Suggest() {
  return (
    <section className="flex flex-col gap-4">
      <Headline type="h2">Suggest a Thing</Headline>
      <InputForm />
    </section>
  )
}
