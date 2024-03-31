'use client'

import { suggestThing } from '@/actions/suggestThing'
import { AutoGrowTextarea } from '@/components/AutogrowTextarea'
import { ComboBoxBadge } from '@/components/ComboBoxBadge'
import { Combobox } from '@/components/Combobox'
import { FormInput } from '@/components/FormInput'
import { Headline } from '@/components/Headline'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { SchemaTypeSchema, ThingSchema, type ThingSchemaType } from '@/lib/prisma'
import { zodResolver } from '@hookform/resolvers/zod'
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
            <Combobox
              selected={[field.value]}
              options={SchemaTypeSchema.options.map((option) => ({ value: option }))}
              placeholder="Select a SchemaType…"
              renderLabel={(option) => <ComboBoxBadge>{option.value}</ComboBoxBadge>}
              onChange={(values) => field.onChange(values[0])}
            />
          )}
        />

        <FormInput
          form={form}
          name="name"
          label="Name / Title"
          input={(field) => (
            <AutoGrowTextarea
              autoFocus
              {...field}
              value={field.value || ''}
              placeholder="Universe / Nature / Antarktis / …"
            />
          )}
        />

        {/* <FormInput
          form={form}
          name="locale"
          label="Locale"
          input={(field) => (
            <Input type="text" {...field} value={field.value || ''} placeholder="en / de / …" />
          )}
        /> */}

        <FormInput
          form={form}
          name="locale"
          label="Locale"
          inputHasFormControl={true}
          input={(field) => (
            <Combobox
              selected={[field.value]}
              options={['en', 'de'].map((option) => ({ value: option }))}
              placeholder="Select a Locale…"
              renderLabel={(option) => <ComboBoxBadge>{option.value}</ComboBoxBadge>}
              onChange={(values) => field.onChange(values[0])}
              allowCustom={true}
            />
          )}
        />

        <FormInput
          form={form}
          name="jsonld"
          label="JSON-LD (schema.org)"
          input={(field) => (
            <AutoGrowTextarea
              className="font-mono"
              {...field}
              value={field.value || ''}
              placeholder={`{ "@context": "https://schema.org", … }`}
            />
          )}
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
                const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  const newValue = event.target.value
                  values.splice(i, 1, newValue)
                  const uniqueValues = Array.from(new Set(values)).filter(Boolean)
                  field.onChange(uniqueValues)
                }

                return (
                  <AutoGrowTextarea
                    key={i}
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
