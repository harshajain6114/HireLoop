import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const domain = process.env.AUTH0_DOMAIN
  const clientId = process.env.AUTH0_CLIENT_ID
  
  // Dynamically determine baseURL from the request to fix Vercel deployment issues
  const baseURL = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : (process.env.AUTH0_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`)

  const { searchParams } = new URL(request.url)
  const connection = searchParams.get('connection') || 'google-oauth2'

  // Construct URL manually to avoid Native URL object replacing spaces with `+` characters, 
  // which causes strict Auth0/WAF rules to throw a 403 Forbidden error on cross-origin requests.
  const authorizeUrl = `https://${domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(`${baseURL}/auth/callback`)}&scope=openid%20profile%20email%20offline_access&connection=${connection}&connection_scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send')}&access_type=offline&prompt=consent`

  return NextResponse.redirect(authorizeUrl)
}
