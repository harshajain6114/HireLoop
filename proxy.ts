import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/applications', '/rejection-analysis', '/follow-ups', '/settings', '/emails']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some(route => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  const session = request.cookies.get('auth-session')
  if (!session?.value) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    const parsed = JSON.parse(session.value)
    if (!parsed?.user?.sub || (parsed.expiresAt && Date.now() > parsed.expiresAt)) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('auth-session')
      return response
    }
  } catch {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/applications/:path*', '/rejection-analysis/:path*', '/follow-ups/:path*', '/settings/:path*', '/emails/:path*'],
}
