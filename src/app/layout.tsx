import '@/app/globals.css'
import { Headline } from '@/components/Headline'
import { MainNav } from '@/components/MainNav'
import { ThemeProvider } from '@/components/client/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { TranslationStoreEntryPoint } from '@/translate/components/TranslationStoreEntryPoint'
import type { Metadata } from 'next'
import { Ubuntu } from 'next/font/google'
import Link from 'next/link'

const fontSans = Ubuntu({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'Qrowdsourced Answers',
  description: 'What is the question?',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={cn('bg-background font-sans antialiased', fontSans.variable)}
      >
        <TranslationStoreEntryPoint keys={['Combobox']}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            storageKey="saved_theme"
            enableSystem={true}
            disableTransitionOnChange={false}
          >
            <div className="min-h-screen max-w-full text-foreground flex flex-col items-center p-8 lg:p-16">
              <header>
                <Link href="/" className="no-underline">
                  <Headline type="h1" className="mb-8 text-center">
                    Qrowdsourced Answers
                  </Headline>
                </Link>

                <MainNav />
              </header>
              <main className="w-[500px] max-w-full">{children}</main>
            </div>
            <Toaster />
          </ThemeProvider>
        </TranslationStoreEntryPoint>
      </body>
    </html>
  )
}
