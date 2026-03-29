import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'

// Step 1: Initiate the Connected Accounts flow
export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the Auth0 refresh token from session
    const refreshToken = session.tokenSet?.refreshToken
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token in session' }, { status: 400 })
    }

    const domain = process.env.AUTH0_DOMAIN
    const clientId = process.env.AUTH0_CLIENT_ID
    const clientSecret = process.env.AUTH0_CLIENT_SECRET
    const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000'

    // Step 1: Exchange Auth0 refresh token for My Account API access token
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

    if (!myAccountToken.access_token) {
      return NextResponse.json({ 
        error: 'Could not get My Account API token', 
        details: myAccountToken 
      }, { status: 400 })
    }

    // Step 2: Initiate Connected Account for google-oauth2
    const connectRes = await fetch(`https://${domain}/me/v1/connected-accounts/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${myAccountToken.access_token}`,
      },
      body: JSON.stringify({
        connection: 'google-oauth2',
        redirect_uri: `${baseUrl}/api/connected-accounts/callback`,
        state: 'gmail-connect',
        scopes: [
          'openid',
          'profile',
          'email',
          'https://www.googleapis.com/auth/gmail.readonly',
        ],
      }),
    })

    const connectData = await connectRes.json()

    if (!connectData.connect_uri) {
      return NextResponse.json({ 
        error: 'Could not initiate Connected Account', 
        details: connectData 
      }, { status: 400 })
    }

    // Store auth_session in a cookie for later use
    const response = NextResponse.redirect(
      `${connectData.connect_uri}?ticket=${connectData.connect_params?.ticket}`
    )
    response.cookies.set('ca_auth_session', connectData.auth_session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Connect error:', error)
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 500 })
  }
}
