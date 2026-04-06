import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('auth-session');

    if (!sessionCookie?.value) {
      return new Response(JSON.stringify({ session: null }), { status: 200 });
    }

    const session = JSON.parse(sessionCookie.value);

    if (session.expiresAt && Date.now() > session.expiresAt) {
      return new Response(JSON.stringify({ session: null }), { status: 200 });
    }

    return new Response(JSON.stringify({ session }), { status: 200 });
  } catch (error) {
    console.error('Failed to get session:', error);
    return new Response(JSON.stringify({ error: 'Failed to get session' }), { status: 500 });
  }
}