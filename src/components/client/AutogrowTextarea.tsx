'use client'

import { Textarea } from '@/components/ui/textarea'
import { useCallback, useEffect, useRef } from 'react'
import { resize } from 'react-expanding-textarea'

import { cn } from '@/lib/utils'
import * as React from 'react'

export interface AutoGrowTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const AutoGrowTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoGrowTextareaProps
>(({ onChange, className, ...props }, ref) => {
  const refTextarea = useRef<HTMLTextAreaElement>(null)

  const handleChange = useCallback(
    (event?: React.ChangeEvent<HTMLTextAreaElement>) => {
      resize(0, refTextarea.current)
      if (event) {
        onChange?.(event)
      }
    },
    [onChange]
  )

  useEffect(() => {
    handleChange()
  }, [handleChange])

  return (
    <Textarea
      {...props}
      className={cn('min-h-[0px] resize-none', className)}
      rows={1}
      ref={refTextarea}
      onChange={handleChange}
    />
  )
})
AutoGrowTextarea.displayName = 'AutoGrowTextarea'

export { AutoGrowTextarea }
