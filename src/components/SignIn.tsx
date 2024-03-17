'use client'

import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Headline } from './Headline'
import { P } from './P'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'

export function SignIn() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  return (
    <section>
      <Headline type="h2">How should your answers be grouped?</Headline>
      <P>
        To learn insights, <strong>your answers are grouped to an identifier</strong>. Your privacy
        is important. So you can choose here between an anonymous identifier or your email address.
      </P>
      <P>
        The <strong>anonymous identifier</strong> is a random string and can’t be used to identify
        you. This also means, that we can’t delete or recover your answers if you lose the
        identifier.
      </P>
      <P>
        If you choose <strong>your email address</strong>, we will send you a confirmation email.
        You can login on other devices, and delete your answers.
      </P>
      <div className="flex gap-4 flex-col">
        <Card>
          <CardHeader>
            <CardTitle>Anonymously</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true)
                signIn('credentials', {})
              }}
            >
              Sign in Anonymously
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>With Email</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
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
              Sign in
            </Button>
          </CardContent>
        </Card>
        {loading && <P>Loading...</P>}
      </div>
    </section>
  )
}
