import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { saveEmails, categorizeEmail, isJobRelated, JobEmail } from '@/lib/email-store'

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
    const session = await auth0.getSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get Gmail access token from Token Vault
    const { token: gmailAccessToken } = await auth0.getAccessTokenForConnection({
      connection: 'google-oauth2',
    })

    if (!gmailAccessToken) {
      return NextResponse.json({ error: 'No Gmail token from Token Vault' }, { status: 400 })
    }

    // Fetch last 50 message IDs
    const listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50',
      { headers: { Authorization: `Bearer ${gmailAccessToken}` } }
    )
    const listData = await listRes.json()
    const messageIds: string[] = (listData.messages || []).map((m: GmailMessage) => m.id)

    // Fetch full metadata for each and categorize
    const jobEmails = await fetchEmailMetadata(gmailAccessToken, messageIds)

    // Sort by date descending (newest first)
    jobEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Save to JSON file
    saveEmails(jobEmails)

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
  } catch (error) {
    console.error('Gmail sync error:', error)
    return NextResponse.json({ error: 'Server error', details: String(error) }, { status: 500 })
  }
}
