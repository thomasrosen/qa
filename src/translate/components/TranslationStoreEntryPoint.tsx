import { TranslationStoreProvider } from '@/translate/components/client/TranslationStoreProvider'
import { loadInitialTranslations } from '@/translate/lib/loadInitialTranslations'

export async function TranslationStoreEntryPoint({
  keys,
  children,
}: {
  keys: string[] | string
  children: React.ReactNode
}) {
  const initialTranslations = await loadInitialTranslations({ keys })

  return (
    <TranslationStoreProvider initialValue={initialTranslations}>
      {children}
    </TranslationStoreProvider>
  )
}
