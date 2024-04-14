'use client'

import { suggestThing } from '@/actions/suggestThing'
import { ComboBoxBadge } from '@/components/ComboBoxBadge'
import { FormInput } from '@/components/FormInput'
import { AutoGrowTextarea } from '@/components/client/AutogrowTextarea'
import { Combobox } from '@/components/client/Combobox'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { DEFAULT_LOCALE, LOCALES } from '@/lib/constants'
import { intlDisplayNamesLanguage } from '@/lib/intlDisplayNamesLanguage'
import {
  SchemaTypeSchema,
  ThingSchema,
  type ThingSchemaType,
} from '@/lib/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function SuggestThingForm({
  thing,
}: {
  thing?: ThingSchemaType | null
}) {
  const form = useForm<ThingSchemaType>({
    resolver: zodResolver(ThingSchema),
    defaultValues: {
      type: undefined,
      name: '',
      locale: '',
      sameAs: [],
      jsonld: null,
      ...thing,
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
              selected={[field.value].filter(Boolean)}
              options={SchemaTypeSchema.options.map((option) => ({
                value: option,
              }))}
              placeholder="Select a SchemaType…"
              renderLabel={(option) => (
                <ComboBoxBadge>{option.value}</ComboBoxBadge>
              )}
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
                const onChange = (
                  event: React.ChangeEvent<HTMLTextAreaElement>
                ) => {
                  const newValue = event.target.value
                  values.splice(i, 1, newValue)
                  const uniqueValues = Array.from(new Set(values)).filter(
                    Boolean
                  )
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
