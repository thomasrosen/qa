'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore, type StoreApi } from 'zustand'

import {
  createTranslationStore,
  type TranslationState,
  type TranslationStore,
} from '../TranslationStore'

export const TranslationStoreContext =
  createContext<StoreApi<TranslationStore> | null>(null)

export interface TranslationStoreProviderProps {
  children: ReactNode
  initialValue?: TranslationState
}

export const TranslationStoreProvider = ({
  children,
  initialValue,
}: TranslationStoreProviderProps) => {
  const storeRef = useRef<StoreApi<TranslationStore>>(
    createTranslationStore(initialValue)
  )

  return (
    <TranslationStoreContext.Provider value={storeRef.current}>
      {children}
    </TranslationStoreContext.Provider>
  )
}

export const useTranslationStore = <T,>(
  selector: (store: TranslationStore) => T
): T => {
  const translationStoreContext = useContext(TranslationStoreContext)

  if (!translationStoreContext) {
    throw new Error(
      `useTranslationStore must be use within TranslationStoreProvider`
    )
  }

  return useStore(translationStoreContext, selector)
}
