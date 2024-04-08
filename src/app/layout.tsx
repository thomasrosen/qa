import '@/app/globals.css'
import { Headline } from '@/components/Headline'
import { MainNav } from '@/components/MainNav'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Ubuntu } from 'next/font/google'

const fontSans = Ubuntu({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'Qroudsourced Answers',
  description: 'What is the question?',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn('bg-background font-sans antialiased', fontSans.variable)}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          storageKey="saved_theme"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <div className="min-h-screen max-w-full text-foreground flex flex-col items-center p-8 lg:p-16">
            <header>
              <Headline type="h1" className="mb-8 text-center">
                Qroudsourced Answers
              </Headline>

              <MainNav />
            </header>
            <main className="w-[500px] max-w-full">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
