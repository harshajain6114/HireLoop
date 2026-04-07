import { NextResponse } from 'next/server'

export async function GET() {
  const baseURL = process.env.AUTH0_BASE_URL || 'http://localhost:3000'

  // Redirect home and clear the session cookie on that same response
  const response = NextResponse.redirect(new URL('/', baseURL))
  response.cookies.set('auth-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
    expires: new Date(0),
  })

  return response
}
