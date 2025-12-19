import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { jwt } from 'better-auth/plugins'
import { getDbPool } from '@/services/db/pool'
import { ensureUserProfile } from '@/services/users/userProfileService'

const pool = getDbPool()

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [jwt()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60,
      strategy: 'jwt',
      refreshCache: true,
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  hooks: {
    after: createAuthMiddleware(async ctx => {
      const newSession = ctx.context.newSession
      if (newSession?.user?.id) {
        await ensureUserProfile(newSession.user.id)
      }
    }),
  },
})
