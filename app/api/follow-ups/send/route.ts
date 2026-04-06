import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function getGoogleAccessToken(userSub: string): Promise<string | null> {
  const domain = process.env.AUTH0_DOMAIN
  const clientId = process.env.AUTH0_MGMT_CLIENT_ID
  const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET

  try {
    // Step 1: Get Auth0 Management API token via client_credentials (machine-to-machine)
    const mgmtRes = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        audience: `https://${domain}/api/v2/`,
      }),
    })

    if (!mgmtRes.ok) {
      console.error('Management API token failed:', await mgmtRes.text())
      return null
    }

    const { access_token: mgmtToken } = await mgmtRes.json()

    // Step 2: Fetch user profile from Management API -contains Google access_token
    const userRes = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(userSub)}`, {
      headers: { Authorization: `Bearer ${mgmtToken}` },
    })

    if (!userRes.ok) {
      console.error('Management API user fetch failed:', await userRes.text())
      return null
    }

    const userData = await userRes.json()

    // Find the Google identity and extract its access_token
    const googleIdentity = userData.identities?.find(
      (id: any) => id.provider === 'google-oauth2'
    )

    if (!googleIdentity?.access_token) {
      console.warn('No Google access_token found in user identities')
      return null
    }

    console.log('✅ Auth0 Management API: Got Google access token for user')
    return googleIdentity.access_token
  } catch (e: any) {
    console.error('getGoogleAccessToken error:', e.message)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { threadId, content, originalEmail } = await request.json()

    // Get the real Google OAuth token from Auth0 Management API
    console.log('🔐 Fetching Google token from Auth0 for:', session.user.email)
    const gmailAccessToken = await getGoogleAccessToken(session.user.sub)

    if (!gmailAccessToken) {
      // Can't get the token -log out tells user to re-auth with Gmail scopes
      return NextResponse.json({
        error: 'Could not retrieve Gmail token. Please log out and sign in again to grant Gmail permissions.',
      }, { status: 400 })
    }

    // Build RFC 2822 email
    const toMatch = originalEmail.from.match(/<([^>]+)>/)
    const to = toMatch ? toMatch[1] : originalEmail.from
    const emailLines = [
      `To: ${to}`,
      `Subject: Re: ${originalEmail.subject.replace(/^Re:\s*/i, '')}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      '',
      content,
    ]
    const rawEmail = Buffer.from(emailLines.join('\r\n')).toString('base64url')

    // Send via Gmail API
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gmailAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: rawEmail, threadId }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Gmail send failed:', res.status, err)

      // If 401/403 -the token doesn't have gmail.send scope yet
      // This means: user needs to re-login AND gmail.send must be in GCP OAuth consent screen
      if (res.status === 401 || res.status === 403) {
        const parsed = JSON.parse(err)
        const reason = parsed?.error?.errors?.[0]?.reason || 'insufficient scope'
        return NextResponse.json({
          error: `Gmail rejected the token (${reason}). You need to: 1) Add gmail.send scope in Google Cloud Console → OAuth Consent Screen, 2) Log out and sign in again.`
        }, { status: 403 })
      }

      return NextResponse.json({ error: 'Gmail error: ' + err }, { status: 500 })
    }

    console.log('✅ Email sent successfully via Gmail!')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Send route error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
