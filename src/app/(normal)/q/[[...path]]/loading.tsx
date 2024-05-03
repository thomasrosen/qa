import { LoadingSpinner } from '@/components/LoadingSpinner'
import { P } from '@/components/P'
import { TS } from '@/translate/components/TServer'

export default function LoadingQuestion() {
  return (
    <div className="flex flex-col items-center pt-8">
      <LoadingSpinner className="h-16 w-16" />
      <P type="ghost" className="text-center">
        <TS key="loading">Loading Question…</TS>
      </P>
    </div>
  )
}
