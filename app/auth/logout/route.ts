import { NextResponse } from 'next/server'

export async function GET() {
  const domain = process.env.AUTH0_DOMAIN
  const baseURL = process.env.AUTH0_BASE_URL || 'http://localhost:3000'
  const clientId = process.env.AUTH0_CLIENT_ID

  // Create response that clears the session cookie
  const response = NextResponse.redirect(new URL('/', baseURL))
  
  // Clear the session cookie
  response.cookies.delete('auth-session')

  // Generate the Auth0 logout URL
  const logoutUrl = new URL(`https://${domain}/v2/logout`)
  logoutUrl.searchParams.set('client_id', clientId!)
  logoutUrl.searchParams.set('returnTo', `${baseURL}/`)

  // Return a redirect to the Auth0 logout page
  return NextResponse.redirect(logoutUrl.toString())
}
