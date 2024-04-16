import { P } from '@/components/P'
import { ThingSchemaType } from '@/lib/types'
import { cn } from '@/lib/utils'

export function ThingRow({
  thing,
  className,
}: {
  thing: ThingSchemaType
  className?: string
}) {
  if (!thing) return null

  const description = JSON.parse(thing.jsonld)?.description

  return (
    <div
      className={cn(
        'w-full bg-card text-card-foreground rounded-xs -ms-1 px-3 py-1 text-start whitespace-normal font-normal',
        className
      )}
    >
      <strong>{thing.name}</strong>
      <br />
      {description && (
        <P type="muted" className="m-0 p-0">
          {description}
        </P>
      )}
      <P type="ghost" className="m-0 p-0">
        {thing.type}
      </P>
    </div>
  )
}
