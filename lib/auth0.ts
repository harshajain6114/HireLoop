import { Auth0Client } from '@auth0/nextjs-auth0/server'

// Extract domain from issuer URL
const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL || ''
const domain = issuerBaseUrl.replace('https://', '')

if (!process.env.AUTH0_CLIENT_ID || !process.env.AUTH0_CLIENT_SECRET) {
  throw new Error('Missing required Auth0 environment variables')
}

export const auth0 = new Auth0Client({
  domain,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  baseURL: process.env.AUTH0_BASE_URL || 'https://hire-loop-4hp3.vercel.app',
})
