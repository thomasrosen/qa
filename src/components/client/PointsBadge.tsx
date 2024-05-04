'use client'

import { useEffect, useState } from 'react'

export function PointsBadge() {
  const [points, setPoints] = useState(0)

  useEffect(() => {
    fetch('/api/points', { next: { tags: ['points'] } })
      .then((res) => res.json())
      .then((data) => {
        setPoints(data.points)
      })
      .catch((error) => {
        console.error('Error:', error)
        setPoints(0)
      })
  }, [])

  if (points === 0) {
    return null
  }

  return (
    <span className="bg-primary text-primary-foreground py-1 font-bold orange rounded-md px-2 -mr-2">
      {points === 1 ? '1 Punkt' : `${points} Punkte`}
    </span>
  )
}
