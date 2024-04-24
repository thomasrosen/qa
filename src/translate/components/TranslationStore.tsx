import { translate } from '@/actions/translate'
import { createStore } from 'zustand/vanilla'

export type TranslationOutputProps = {
  text: string
  parts: Record<string, string>
}
export type TranslationInputProps = {
  text: string | { text: string; mapping?: string }
  keys?: string[]
  options: Record<string, any>
}

export type TranslationStateTranslation = Record<string, TranslationOutputProps>

export type TranslationState = {
  translations: TranslationStateTranslation
}

export type TranslationActions = {
  requestTranslation: (props: TranslationInputProps) => void
}

export type TranslationStore = TranslationState & TranslationActions

export function getRequestDataAsKey(requestData: TranslationInputProps) {
  const keyData = {
    text: requestData.text || '',
    options: {
      locale: requestData.options.locale || '',
      formality: requestData.options.formality || '',
    },
  }
  return JSON.stringify(keyData)
}

export const fallbackInitState: TranslationState = {
  translations: {},
}

export const createTranslationStore = (
  initState: TranslationState = fallbackInitState
) => {
  return createStore<TranslationStore>()((set) => ({
    ...initState,
    requestTranslation: async (requestData: TranslationInputProps) => {
      console.info('requested translation for keys:', requestData.keys)

      const newTranslation = await translate(requestData)
      const requestDataAsKey = getRequestDataAsKey(requestData)

      set((state) => ({
        ...state.translations,
        [requestDataAsKey]: newTranslation,
      }))
    },
  }))
}
