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
    
    // Dynamically determine baseURL from the request to fix Vercel deployment issues
    const baseURL = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.AUTH0_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`);

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
      const error = await userResponse.json()
      console.error('Failed to fetch user info:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user info' },
        { status: 500 }
      )
    }

    const user = await userResponse.json()

    // Set session cookie
    const sessionData = {
      user,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    }

    const response = NextResponse.redirect(new URL('/', baseURL))
    response.cookies.set('auth-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: tokens.expires_in,
    })

    return response
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json(
      { error: 'An error occurred during authentication' },
      { status: 500 }
    )
  }
}
