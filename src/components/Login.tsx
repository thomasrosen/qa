'use client'

import { useCallback, useState } from 'react'

export function Login() {
  const [email, setEmail] = useState('')
  const login = useCallback(() => {
    signIn('ses', {
      email: email,
      callbackUrl: 'callbackUrl',
    })
  }, [email])

  return (
    <>
      <strong>Email: </strong>
      <input
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="username@domain.tld"
      />
      <br />
      <button onClick={login}>Login</button>
    </>
  )
}
