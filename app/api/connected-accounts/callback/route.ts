import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'

// Step 2: Complete the Connected Accounts flow after Google redirect
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const connectCode = searchParams.get('connect_code')  // Auth0 sends 'connect_code' not 'code'
    const cookieAuthSession = request.cookies.get('ca_auth_session')?.value

    console.log('Callback received - connect_code:', connectCode, 'auth_session:', cookieAuthSession)

    if (!connectCode || !cookieAuthSession) {
      return NextResponse.redirect(new URL('/dashboard?error=missing_params', request.url))
    }

    const session = await auth0.getSession()
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const domain = process.env.AUTH0_DOMAIN
    const clientId = process.env.AUTH0_CLIENT_ID
    const clientSecret = process.env.AUTH0_CLIENT_SECRET
    const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000'
    const refreshToken = session.tokenSet?.refreshToken

    // Re-exchange refresh token for My Account API token
    const myAccountTokenRes = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        audience: `https://${domain}/me/`,
        scope: 'openid profile offline_access create:me:connected_accounts read:me:connected_accounts',
      }),
    })

    const myAccountToken = await myAccountTokenRes.json()
    console.log('My Account API token (callback):', myAccountToken.access_token ? 'obtained' : myAccountToken)

    if (!myAccountToken.access_token) {
      return NextResponse.redirect(new URL('/dashboard?error=token_failed', request.url))
    }

    // Complete the Connected Account
    const completeRes = await fetch(`https://${domain}/me/v1/connected-accounts/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${myAccountToken.access_token}`,
      },
      body: JSON.stringify({
        auth_session: cookieAuthSession,
        connect_code: connectCode,
        redirect_uri: `${baseUrl}/api/connected-accounts/callback`,
      }),
    })

    const completeData = await completeRes.json()
    console.log('Connected Account complete response:', JSON.stringify(completeData, null, 2))

    // Clear the auth_session cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard?gmail=connected', request.url))
    response.cookies.delete('ca_auth_session')

    return response
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=callback_failed', request.url))
  }
}
