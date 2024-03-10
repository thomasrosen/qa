'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // useEffect(() => {
  //   function setThemeOnEvent(event: MediaQueryList | MediaQueryListEvent) {
  //     if (event.matches) {
  //       document.documentElement.classList.add('dark')
  //     } else {
  //       document.documentElement.classList.remove('dark')
  //     }
  //   }
  //
  //   const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  //   console.log(darkModeQuery)
  //   darkModeQuery.addEventListener('change', setThemeOnEvent)
  //   setThemeOnEvent(darkModeQuery)
  //
  //   return () => {
  //     darkModeQuery.removeEventListener('change', setThemeOnEvent)
  //   }
  // }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
