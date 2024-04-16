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
        <Card
          className={isSubmitting ? 'animate-pulse pointer-events-none' : ''}
        >
          <CardHeader>
            <CardTitle>Preferred Categories</CardTitle>
            <CardDescription>
              Choose the categories you want to answer questions about.
              <br />
              If you deselect all categories, we will only show general
              questions.
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
                  placeholder="Select Categories…"
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
              Save Categories
            </Button>

            {isSubmitting && (
              <P type="ghost" className="m-0">
                Loading…
              </P>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
