import { prisma } from '@/lib/prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { type GetServerSidePropsContext, type NextApiRequest, type NextApiResponse } from 'next'
import {
  Account,
  Profile,
  Session,
  SessionStrategy,
  User,
  getServerSession,
  type NextAuthOptions,
} from 'next-auth'
import { AdapterUser, type Adapter } from 'next-auth/adapters'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
// import { sendVerificationRequest } from './sendVerificationRequest'
import { createAnonymousUser } from './createAnonymousUser'

// You'll need to import and pass this to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // {
    //   id: 'email',
    //   type: 'email',
    //   name: 'Email',
    //   server: '',
    //   options: {},
    //   from: 'hello@thomasrosen.me',
    //   maxAge: 0,
    //   sendVerificationRequest,
    // },
    CredentialsProvider({
      name: 'anonymous',
      credentials: {},
      async authorize(credentials, req) {
        return createAnonymousUser()
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT
      account: Account | null
      profile?: Profile
    }): Promise<JWT> {
      console.log('token', token)
      console.log('account', account)
      console.log('profile', profile)
      if (account && account?.expires_at && account?.type === 'oauth') {
        // at sign-in, persist in the JWT the GitHub account details to enable brokered requests in the future
        token.access_token = account.access_token
        token.expires_at = account.expires_at
        token.refresh_token = account.refresh_token
        token.refresh_token_expires_in = account.refresh_token_expires_in
        token.provider = ''
      }
      if (!token.provider) {
        token.provider = 'anonymous'
      }
      return token
    },
    async session({
      session,
      token,
      user,
    }: {
      session: Session
      token: JWT
      user: AdapterUser
    }): Promise<Session> {
      console.log('session', session)
      console.log('token', token)
      console.log('user', user)
      // don't make the token (JWT) contents available to the client session (JWT), but flag that they're server-side
      // if (token.provider) {
      //   session.token_provider = token.provider
      // }
      return session
    },
  },
  events: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: User
      account: Account | null
      profile?: Profile
    }): Promise<void> {
      console.log('signIn')
      console.log('user', user)
      console.log('account', account)
      console.log('profile', profile)
    },
    async signOut({ session, token }: { session: Session; token: JWT }): Promise<void> {
      console.log('signOut')
      console.log('session', session)
      console.log('token', token)
    },
  },
  session: {
    // use default, an encrypted JWT (JWE) store in the session cookie
    strategy: 'jwt' as SessionStrategy,
  },
} satisfies NextAuthOptions

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions)
}
