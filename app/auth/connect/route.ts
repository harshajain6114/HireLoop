import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const domain = process.env.AUTH0_DOMAIN
  const clientId = process.env.AUTH0_CLIENT_ID
  const baseURL = process.env.AUTH0_BASE_URL || 'https://hire-loop-4hp3.vercel.app'

  const { searchParams } = new URL(request.url)
  const connection = searchParams.get('connection') || 'google-oauth2'

  const authorizeUrl = new URL(`https://${domain}/authorize`)
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', clientId!)
  authorizeUrl.searchParams.set('redirect_uri', `${baseURL}/auth/callback`)
  // offline_access = get refresh token for Token Vault
  authorizeUrl.searchParams.set('scope', 'openid profile email offline_access')
  authorizeUrl.searchParams.set('connection', connection)
  // Request Gmail scopes from Google via Auth0 Token Vault
  authorizeUrl.searchParams.set('connection_scope', 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send')
  authorizeUrl.searchParams.set('access_type', 'offline')
  authorizeUrl.searchParams.set('prompt', 'consent')

  return NextResponse.redirect(authorizeUrl.toString())
}
