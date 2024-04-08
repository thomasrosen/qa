'use client'

import { Headline } from '@/components/Headline'
import { P } from '@/components/P'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export function SignIn() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  return (
    <section>
      <Headline type="h2">How should your answers be grouped?</Headline>
      <div className="flex gap-4 flex-col">
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
              variant="secondary"
              onClick={() => {
                setLoading(true)
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
            <div className="flex gap-4">
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
                variant="secondary"
                onClick={() => {
                  setLoading(true)
                  signIn('email', { email })
                }}
              >
                Group by Email
              </Button>
            </div>
          </CardContent>
        </Card>
        {loading && <P>Loading...</P>}
      </div>
    </section>
  )
}
