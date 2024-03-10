import { ControllerRenderProps, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'

type InputProps = {
  form: any // can be any useForm().form
  name: string
  label?: string
  description?: string
  input?: (field: ControllerRenderProps<FieldValues, string>) => React.ReactNode
  inputHasFormControl?: boolean
}
export function FormInput({
  form,
  name,
  label,
  description,
  input,
  inputHasFormControl = false,
}: InputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          {inputHasFormControl ? (
            input && input(field)
          ) : (
            <FormControl>{input && input(field)}</FormControl>
          )}

          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// <Input placeholder="" {...field} value={field.value ?? defaultValue} />
