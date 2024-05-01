'use client'

import { savePreferredTags } from '@/actions/savePreferredTags'
import { FormInput } from '@/components/FormInput'
import { P } from '@/components/P'
import { ThingRow } from '@/components/ThingRow'
import { Combobox } from '@/components/client/Combobox'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { ThingSchemaType, UserSchema, UserSchemaType } from '@/lib/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { TC } from '../../translate/components/client/TClient'

export function PreferredTagsChooser({
  user,
  tagOptions,
}: {
  user: UserSchemaType
  tagOptions: ThingSchemaType[]
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<UserSchemaType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      ...user,
      preferredTags: (user.preferredTags || [])
        .filter(Boolean)
        .map((thing) => thing.thing_id),
    },
  })

  async function onSubmit(data: UserSchemaType) {
    setIsSubmitting(true)
    const submitted = await savePreferredTags(data)
    setIsSubmitting(false)

    if (submitted) {
      toast.success('Your preferred categories have been saved.')
      router.refresh()
    } else {
      toast.error('An error occurred while submitting your suggestion.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card
          className={isSubmitting ? 'animate-pulse pointer-events-none' : ''}
        >
          <CardHeader>
            <CardTitle>
              <TC keys="PreferredTagsChooser">Bevorzugte Kategorien</TC>
            </CardTitle>
            <CardDescription>
              <TC keys="PreferredTagsChooser">
                Wähle die Kategorien aus, zu denen du Fragen beantworten
                möchtest.
                <br />
                Wenn du alle Kategorien abwählst, werden nur allgemeine Fragen
                angezeigt.
              </TC>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FormInput
              form={form}
              name="preferredTags"
              inputHasFormControl={true}
              input={(field) => (
                <Combobox
                  multiple={true}
                  selected={field.value}
                  options={tagOptions.map((thing) => ({
                    value: thing.thing_id || '',
                    label: thing.name,
                    thing,
                  }))}
                  placeholder={
                    <TC keys="PreferredTagsChooser">Kategorien auswählen…</TC>
                  }
                  renderLabel={(option) => (
                    <ThingRow
                      className="inline-block w-auto"
                      thing={option.thing}
                    />
                  )}
                  onChange={(values) => field.onChange(values)}
                />
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-4 justify-between items-center">
            <Button className="w-full" type="submit">
              <TC keys="PreferredTagsChooser">Kategorien speichern</TC>
            </Button>

            {isSubmitting && (
              <P type="ghost" className="m-0 text-center">
                <TC keys="PreferredTagsChooser">Laden…</TC>
              </P>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
