import { ThingSchemaType } from '@/lib/prisma'
import { cn } from '@/lib/utils'

export function ThingRow({
  thing,
  className,
}: {
  thing: ThingSchemaType
  className?: string
}) {
  if (!thing) return null

  return (
    <div
      className={cn(
        'w-full bg-card text-card-foreground rounded-xs -ms-1 px-3 py-1 text-start',
        className
      )}
    >
      <strong>{thing.name}</strong>
      <br />
      <span className="font-normal">{thing.type}</span>
    </div>
  )
}
