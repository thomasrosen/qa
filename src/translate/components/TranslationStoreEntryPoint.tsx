// import { TranslationStoreProvider } from '@/translate/components/client/TranslationStoreProvider'
// import { loadInitialTranslations } from '@/translate/lib/loadInitialTranslations'

// @ts-ignore
export async function TranslationStoreEntryPoint({
  keys,
  children,
}: {
  keys: string[] | string
  children: React.ReactNode
}) {
  return children

  // const initialTranslations = await loadInitialTranslations({ keys })

  // return (
  //   <TranslationStoreProvider initialValue={initialTranslations}>
  //     {children}
  //   </TranslationStoreProvider>
  // )
}
