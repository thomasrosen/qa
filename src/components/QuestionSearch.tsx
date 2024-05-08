'use client'

import Link from 'next/link'
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'
import { P } from './P'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function QuestionSearch() {
  const [results, setResults] = useState<any[]>([])

  const [isShowingSearchButton, setIsShowingSearchButton] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const triggerSearchTimeout = useRef<NodeJS.Timeout | null>(null)
  const currentValueRef = useRef('')
  const [startedSearch, setStartedSearch] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const doTheSearch = useCallback(async (newValue?: string) => {
    setStartedSearch(true)
    setIsLoading(true)
    setResults([])
    console.log('searching for:', newValue)

    if (typeof newValue !== 'string' || newValue.length === 0) {
      setResults([])
      return
    }

    try {
      const amount = 5
      const response = await fetch(
        `/api/search?ac&amount=${amount}&q=${encodeURIComponent(newValue)}`
      )

      const data = await response.json()
      console.log('results:', data)
      if (currentValueRef.current === newValue) {
        setResults(data)
      }
    } catch (error) {
      console.error('error:', error)
    }

    setIsLoading(false)
  }, [])
  const searchHandler = useCallback(
    (
      event: ChangeEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>
    ) => {
      const newValue = event.currentTarget.value
      if (currentValueRef.current !== newValue) {
        setStartedSearch(false)
      }

      currentValueRef.current = newValue

      if (newValue.length === 0) {
        setHasValue(false)
        setIsShowingSearchButton(true)
        setResults([])
        return
      }
      setHasValue(true)
      setIsShowingSearchButton(true)

      // if (triggerSearchTimeout.current) {
      //   clearTimeout(triggerSearchTimeout.current)
      // }
      // triggerSearchTimeout.current = setTimeout(() => {
      //   doTheSearch(newValue)
      // }, 500)
    },
    []
  )
  const startSearchHandler = useCallback(() => {
    if (triggerSearchTimeout.current) {
      clearTimeout(triggerSearchTimeout.current)
    }
    doTheSearch(currentValueRef.current)
  }, [doTheSearch])

  return (
    <div className="flex flex-col justify-center mb-8 gap-4">
      <div className="flex gap-4">
        <Input
          type="search"
          placeholder="Suche nach einer Frage..."
          className="w-full"
          onChange={searchHandler}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              startSearchHandler()
            }
          }}
        />
        {isShowingSearchButton && (
          <Button onClick={startSearchHandler}>Suchen</Button>
        )}
      </div>

      {results.length > 0
        ? results.map((q) => (
            <div key={q.question_id}>
              <Link
                href={`/q/${q.question_id}`}
                target="_blank"
                className="no-underline"
              >
                {q.question}
              </Link>
            </div>
          ))
        : null}

      {results.length === 0 && isLoading && hasValue && startedSearch ? (
        <P className="text-center">Lade...</P>
      ) : null}

      {results.length === 0 && !isLoading && hasValue && startedSearch ? (
        <P className="text-center">Keine Ergebnisse</P>
      ) : null}
    </div>
  )
}
