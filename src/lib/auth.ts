import { createAnonymousUser } from '@/lib/createAnonymousUser'
import { UserSchemaType, prisma } from '@/lib/prisma'
import { sendVerificationRequest } from '@/lib/sendVerificationRequest'
import { type Adapter } from '@auth/core/adapters'
import CredentialsProvider from '@auth/core/providers/credentials'
import EmailProvider from '@auth/core/providers/nodemailer'
import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth, { NextAuthConfig } from 'next-auth'

export const authOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: 'anonymous',
      credentials: {},
      async authorize(credentials, req) {
        return await createAnonymousUser()
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || ''),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      return true
    },
    async jwt(options) {
      const { token, account, user, trigger } = options // profile
      const typedUser = user as UserSchemaType | undefined

      // at sign-in or sign-up, persist in the JWT the user details
      if (typedUser) {
        token.user = {
          id: user.id,
          email: user.email,
          createdAt: typedUser.createdAt,
        }
      }

      if (account) {
        token.account = account

        if (account?.expires_at && account?.type === 'oauth') {
          // at sign-in, persist in the JWT the GitHub account details to enable brokered requests in the future

          token.access_token = account.access_token
          token.expires_at = account.expires_at
          token.refresh_token = account.refresh_token
          token.refresh_token_expires_in = account.refresh_token_expires_in
          token.provider = 'oauth'
        }
        if (account?.type === 'email') {
          token.provider = account.provider
        }
      }

      if (!token.provider) {
        token.provider = 'anonymous'
      }

      return token
    },
    async session({ session, token }) {
      const { user, account } = token

      // check if user exists. otherwise delete the session
      const typedUser = user as UserSchemaType | undefined
      const user_id = typedUser?.id

      if (!user_id) {
        return {
          expires: new Date(0).toISOString(), // force session to expire
          user: undefined, // keep empty user object for nicer types
        }
      }

      const userExists = await prisma.user.findUnique({
        where: { id: user_id },
      })
      if (!userExists) {
        return {
          expires: new Date(0).toISOString(), // force session to expire
          user: undefined, // keep empty user object for nicer types
        }
      }

      return {
        ...session,
        user: {
          ...session.user,
          ...(user || {}),
          account,
        },
      }
    },
  },
  events: {
    // async signIn({
    //   user,
    //   account,
    //   profile,
    // }: {
    //   user: User
    //   account: Account | null
    //   profile?: Profile
    // }): Promise<void> {},
    // async signOut({ session, token }: { session: Session; token: JWT }): Promise<void> {},
  },
  session: {
    // use default, an encrypted JWT (JWE) store in the session cookie
    strategy: 'jwt',
  },
  theme: {
    colorScheme: 'auto',
    brandColor: '#6600CC',
    buttonText: '#fff',
  },
} satisfies NextAuthConfig

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions)
