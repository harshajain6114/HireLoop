import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { saveEmails, categorizeEmail, isJobRelated, JobEmail } from '@/lib/email-store'

async function getGoogleAccessToken(userSub: string): Promise<string | null> {
  const domain = process.env.AUTH0_DOMAIN
  const clientId = process.env.AUTH0_MGMT_CLIENT_ID
  const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET

  try {
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

    if (!mgmtRes.ok) return null
    const { access_token: mgmtToken } = await mgmtRes.json()

    const userRes = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(userSub)}`, {
      headers: { Authorization: `Bearer ${mgmtToken}` },
    })

    if (!userRes.ok) return null
    const userData = await userRes.json()

    const googleIdentity = userData.identities?.find((id: any) => id.provider === 'google-oauth2')
    if (!googleIdentity?.access_token) return null
    return googleIdentity.access_token
  } catch (e: any) {
    return null
  }
}

interface GmailMessage {
  id: string
  threadId: string
}

interface GmailHeader {
  name: string
  value: string
}

interface GmailMessageDetail {
  id: string
  threadId: string
  snippet: string
  payload: {
    headers: GmailHeader[]
  }
}

function getHeader(headers: GmailHeader[], name: string): string {
  return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''
}

async function fetchEmailMetadata(
  accessToken: string,
  messageIds: string[]
): Promise<JobEmail[]> {
  const results: JobEmail[] = []
  const syncedAt = new Date().toISOString()

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < messageIds.length; i += batchSize) {
    const batch = messageIds.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (id) => {
        const res = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        if (!res.ok) return null
        const data: GmailMessageDetail = await res.json()
        const headers = data.payload?.headers || []
        const subject = getHeader(headers, 'Subject') || '(No Subject)'
        const from = getHeader(headers, 'From') || ''
        const date = getHeader(headers, 'Date') || ''
        const snippet = data.snippet || ''

        if (!isJobRelated(subject, snippet)) return null

        const category = categorizeEmail(subject, snippet)

        return {
          id: data.id,
          threadId: data.threadId,
          subject,
          from,
          date,
          snippet,
          category,
          syncedAt,
        } satisfies JobEmail
      })
    )
    results.push(...batchResults.filter((r): r is JobEmail => r !== null))
  }

  return results
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get Gmail access token via Management API
    const gmailAccessToken = await getGoogleAccessToken(session.user.sub)

    if (!gmailAccessToken) {
      return NextResponse.json({ needsReconnect: true, error: 'No Gmail token from Token Vault. Please log in again.' }, { status: 401 })
    }

    // Build a query string to filter for potential job-related emails AT THE GMAIL LEVEL
    const jobKeywords = [
      'application', 'position', 'interview', 'unfortunately', 'regret', 
      'offer', 'applied', 'hiring', 'recruiter', 'resume', 'candidate',
      '"not moving forward"', '"careful review"', 'rejection', 'assessment', 'exam', 'test', 'assignment'
    ]
    const searchQuery = '{' + jobKeywords.join(' ') + '}'
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=500&q=${encodeURIComponent(searchQuery)}`

    // Fetch last 500 matching message IDs
    const listRes = await fetch(
      listUrl,
      { headers: { Authorization: `Bearer ${gmailAccessToken}` } }
    )
    const listData = await listRes.json()
    const messageIds: string[] = (listData.messages || []).map((m: GmailMessage) => m.id)

    // Fetch full metadata for each and categorize
    const jobEmails = await fetchEmailMetadata(gmailAccessToken, messageIds)

    // Sort by date descending (newest first)
    jobEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Save to per-user JSON file
    saveEmails(session.user.sub, jobEmails)

    const counts = {
      total: jobEmails.length,
      Applied: jobEmails.filter(e => e.category === 'Applied').length,
      Interview: jobEmails.filter(e => e.category === 'Interview').length,
      Rejected: jobEmails.filter(e => e.category === 'Rejected').length,
      Offered: jobEmails.filter(e => e.category === 'Offered').length,
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${messageIds.length} emails, found ${jobEmails.length} job-related`,
      counts,
      emails: jobEmails,
    })
  } catch (error: any) {
    console.error('Gmail sync error:', error)
    if (error?.code === 'failed_to_exchange_refresh_token' || String(error).includes('failed_to_exchange_refresh_token')) {
      return NextResponse.json({ needsReconnect: true, error: 'Re-authorization required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 500 })
  }
}
