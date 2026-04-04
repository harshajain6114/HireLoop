import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { threadId, content, originalEmail } = await request.json()

    // Get the Gmail Access Token from Token Vault via Auth0
    const { token: gmailAccessToken } = await auth0.getAccessTokenForConnection({
      connection: 'google-oauth2',
    })

    if (!gmailAccessToken) {
      return NextResponse.json({ error: 'No Gmail token found in Token Vault' }, { status: 400 })
    }

    // Extract email from "Name <email@domain.com>" or just "email@domain.com"
    const toMatch = originalEmail.from.match(/<([^>]+)>/)
    const to = toMatch ? toMatch[1] : originalEmail.from
    
    // Create base64url encoded email string according to RFC 2822
    const emailLines = []
    emailLines.push(`To: ${to}`)
    emailLines.push(`Subject: Re: ${originalEmail.subject.replace(/^Re:\s*/i, '')}`)
    // This connects it strictly to the thread
    // Note: If original message-id is available, it would go into In-Reply-To and References.
    emailLines.push(`Content-Type: text/plain; charset="UTF-8"`)
    emailLines.push('')
    emailLines.push(content)

    // In a real production app we'd also include References and In-Reply-To headers based on original headers
    
    const rawEmail = Buffer.from(emailLines.join('\r\n')).toString('base64url')

    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gmailAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: rawEmail,
        threadId: threadId
      })
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Gmail send error', err)
      return NextResponse.json({ error: 'Failed to send via Gmail: ' + err }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Follow-up Send Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
