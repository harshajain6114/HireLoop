import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code received' },
        { status: 400 }
      )
    }

    // Exchange code for tokens
    const domain = process.env.AUTH0_DOMAIN
    const clientId = process.env.AUTH0_CLIENT_ID
    const clientSecret = process.env.AUTH0_CLIENT_SECRET
    const baseURL = process.env.AUTH0_BASE_URL || 'http://localhost:3000'

    const tokenResponse = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${baseURL}/auth/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      console.error('Token exchange failed:', error)
      return NextResponse.json(
        { error: 'Failed to exchange code for tokens' },
        { status: 500 }
      )
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch(`https://${domain}/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userResponse.ok) {
      console.error('Failed to fetch user info')
      return NextResponse.json(
        { error: 'Failed to fetch user info' },
        { status: 500 }
      )
    }

    const user = await userResponse.json()

    // Create response and set secure cookie with session data
    const response = NextResponse.redirect(new URL('/', request.url))
    
    // Store session data as JSON string
    const sessionData = {
      user: {
        sub: user.sub,
        name: user.name,
        email: user.email,
        picture: user.picture || '',
      },
      accessToken: tokens.access_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    }
    
    response.cookies.set('auth-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokens.expires_in,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
