import { P } from '@/components/P'
import { getContrastTextColor } from '@/lib/getContrastTextColor'
import { getJsonLdValueAsString } from '@/lib/getJsonLdValue'
import { stringToColor } from '@/lib/stringToColour'
import { ThingSchemaType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { TC } from '@/translate/components/client/TClient'
import { CSSProperties } from 'react'

export function ThingRow({
  thing,
  className = '',
  ...props
}: {
  thing: ThingSchemaType
} & React.HTMLAttributes<HTMLDivElement>) {
  if (!thing) return null

  const description = getJsonLdValueAsString(thing.jsonld, 'description')

  const dotStyle: CSSProperties = {}
  if (thing.type === 'CategoryCode') {
    dotStyle.backgroundColor = stringToColor(thing.thing_id || '')
    dotStyle.color = getContrastTextColor(dotStyle.backgroundColor)
  }

  const translationKey = thing.thing_id

  return (
    <div
      className={cn(
        'w-full bg-card text-card-foreground rounded-xs px-3 py-1 text-start whitespace-normal font-normal',
        className
      )}
      {...props}
    >
      <div className="flex gap-2 items-center">
        {thing.type === 'CategoryCode' && (
          <span
            className="inline-block rounded-full w-3 h-3 shrink-0"
            style={dotStyle}
          />
        )}
        <strong>
          <TC keys={translationKey}>{thing.name}</TC>
          {thing.type === 'CategoryCode' && thing?._count?.isTagFor
            ? ` (${thing?._count?.isTagFor})`
            : ''}
        </strong>
      </div>
      {description && (
        <P type="muted" className="m-0 p-0">
          <TC keys={translationKey}>{description}</TC>
        </P>
      )}
      {/*
      <P type="ghost" className="m-0 p-0">
        <TC keys="ThingRow">{thing.type}</TC>
      </P>
      */}
    </div>
  )
}
