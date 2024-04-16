import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import React from 'react'
import { ControllerRenderProps, FieldValues } from 'react-hook-form'

type InputProps = {
  form: any // can be any useForm().form
  name: string
  label?: string
  description?: React.ReactNode
  input?: (field: ControllerRenderProps<FieldValues, string>) => React.ReactNode
  inputHasFormControl?: boolean
  className?: string
}
export function FormInput({
  form,
  name,
  label,
  description,
  input,
  inputHasFormControl = false,
  className,
}: InputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          {description && <FormDescription>{description}</FormDescription>}
          {inputHasFormControl ? (
            input && input(field)
          ) : (
            <FormControl>{input && input(field)}</FormControl>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
