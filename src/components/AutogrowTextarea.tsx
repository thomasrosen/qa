'use client'

import { useRef } from 'react'
import { resize } from 'react-expanding-textarea'
import { Textarea } from './ui/textarea'

import * as React from 'react'

export interface AutoGrowTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const AutoGrowTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoGrowTextareaProps
>(({ onChange, ...props }, ref) => {
  const refTextarea = useRef<HTMLTextAreaElement>(null)

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    resize(0, refTextarea.current)
    onChange?.(event)
  }

  return (
    <Textarea
      {...props}
      className="min-h-[0px] resize-none"
      rows={1}
      ref={refTextarea}
      onChange={handleChange}
    />
  )
})
AutoGrowTextarea.displayName = 'AutoGrowTextarea'

export { AutoGrowTextarea }
