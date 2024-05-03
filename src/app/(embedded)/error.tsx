'use client'

export default function Error(...error: any[]) {
  return <pre>{JSON.stringify(error, null, 2)}</pre>
}
