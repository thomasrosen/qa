import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Loading() {
  return (
    <div className="flex justify-center pt-8">
      <LoadingSpinner className="h-16 w-16" />
    </div>
  )
}
