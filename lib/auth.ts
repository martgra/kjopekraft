import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { jwt } from 'better-auth/plugins'
import { getDbPool } from '@/services/db/pool'
import { ensureUserProfile } from '@/services/users/userProfileService'

let authInstance: ReturnType<typeof betterAuth> | null = null

export function getAuth() {
  if (authInstance) {
    return authInstance
  }

  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error('BETTER_AUTH_SECRET is not set.')
  }

  const githubClientId = process.env.GH_CLIENT_ID
  const githubClientSecret = process.env.GH_CLIENT_SECRET
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!githubClientId || !githubClientSecret) {
    throw new Error('GitHub OAuth env vars are not set.')
  }

  if (!googleClientId || !googleClientSecret) {
    throw new Error('Google OAuth env vars are not set.')
  }

  // Determine base URL for OAuth callbacks
  const baseURL =
    process.env.BETTER_AUTH_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://kjopekraft.no' : 'http://localhost:3000')

  authInstance = betterAuth({
    database: getDbPool(),
    secret,
    baseURL,
    trustedOrigins: ['https://kjopekraft.no'],
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
        clientId: githubClientId,
        clientSecret: githubClientSecret,
      },
      google: {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
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

  return authInstance
}
