import { cookies } from 'next/headers'

export interface AuthSession {
  user: {
    sub: string
    name: string
    email: string
    picture?: string
  }
  accessToken: string
  expiresAt: number
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('auth-session')
    
    if (!sessionCookie?.value) {
      return null
    }

    // Parse the JSON string from the cookie
    const session = JSON.parse(sessionCookie.value) as AuthSession
    
    // Check if session is expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      return null
    }
    
    return session
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}
