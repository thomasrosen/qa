import { ThingSchemaType } from '@/lib/prisma'

export function ThingRow({ thing }: { thing: ThingSchemaType }) {
  return (
    <div className="w-full bg-card text-card-foreground rounded-xs -ms-1 px-3 py-1">
      <strong>{thing.name}</strong>
      <br />
      {thing.type}
      <br />
      {thing.thing_id}
    </div>
  )
}
