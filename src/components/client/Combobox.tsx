'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'
import React, { useState } from 'react'

type Option = {
  value: string
  keywords?: string[]
  [key: string]: any
}
type ComboboxProps = {
  options: Option[]
  searchFallback?: React.ReactNode
  renderLabel?: (
    chosenOption: Option,
    infos: { place: 'button' | 'list' }
  ) => React.ReactNode
  placeholder?: string
  onChange?: (value: string[]) => void
  multiple?: boolean
  selected: string[]
  allowCustom?: boolean | null
}
export function Combobox({
  options,
  searchFallback,
  renderLabel,
  placeholder,
  onChange,
  multiple = false,
  selected = [],
  allowCustom = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  let chosenOptions: Option[] = []
  if (Array.isArray(selected)) {
    chosenOptions = selected.map(
      (value) => options.find((option) => option.value === value) ?? { value }
    )
  }

  const additionalChosenOptions = chosenOptions.filter(
    (option) => !options.includes(option)
  )

  const optionsFromSearch: Option[] = [
    {
      value: search,
    },
  ].filter(
    (option) =>
      allowCustom === true &&
      option.value !== '' &&
      additionalChosenOptions
        .concat(options)
        .find((o) => o.value === option.value) === undefined
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="input"
          size="input"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-start flex"
        >
          <span className="gap-2 flex flex-wrap items-center grow-1 w-full">
            {chosenOptions.length > 0 ? (
              typeof renderLabel === 'function' ? (
                chosenOptions.map((chosenOption, index) => (
                  <React.Fragment key={index}>
                    {renderLabel(chosenOption, {
                      place: 'button',
                    })}
                  </React.Fragment>
                ))
              ) : (
                selected.join(', ')
              )
            ) : (
              // text-foreground/20
              <span className="opacity-30">{placeholder ?? 'Select…'}</span>
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={
              allowCustom === true ? 'Search or create new…' : 'Search...'
            }
          />
          <CommandEmpty>{searchFallback ?? 'Nothing found.'}</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {[
                ...optionsFromSearch,
                ...additionalChosenOptions,
                ...options,
              ].map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={option.keywords ?? []}
                  onSelect={(currentValue) => {
                    let newValues = [...selected]
                    if (multiple) {
                      newValues.includes(currentValue)
                        ? newValues.splice(newValues.indexOf(currentValue), 1)
                        : newValues.push(currentValue)
                    } else {
                      newValues.includes(currentValue)
                        ? (newValues = [])
                        : (newValues = [currentValue])
                    }
                    onChange?.(newValues)
                    setOpen(multiple)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected.includes(option.value)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {renderLabel?.(option, {
                    place: 'list',
                  }) ?? option.value}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
