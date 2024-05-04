'use client'

import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  return (
    <section>
      <Headline type="h2">How should your answers be grouped?</Headline>
      <div
        className={cn(
          'flex gap-4 flex-col',
          isLoading ? 'motion-safe:animate-pulse pointer-events-none' : ''
        )}
      >
        <Card>
          <CardHeader>
            <CardTitle>Anonymously</CardTitle>
          </CardHeader>
          <CardContent>
            <P>
              The anonymous identifier is a random string. Your answers can not
              easily traced back to you.
            </P>
            <Button
              variant="default"
              onClick={() => {
                setIsLoading(true)
                signIn('credentials', {})
              }}
            >
              Group Anonymously
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>With my Email</CardTitle>
          </CardHeader>
          <CardContent>
            <P>
              The email option allows login on other devices and future deletion
              of your answers. In the published dataset, your email is replaced
              by an anonymous-id. Your email address will never be published.
            </P>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.tld"
                autoComplete="email"
                autoFocus
                aria-label="Email"
              />
              <Button
                variant="default"
                onClick={() => {
                  setIsLoading(true)
                  signIn('nodemailer', { email })
                }}
              >
                Group by Email
              </Button>
            </div>
          </CardContent>
        </Card>
        {isLoading && (
          <P type="large" className="text-center">
            Loading...
          </P>
        )}
      </div>
    </section>
  )
}
