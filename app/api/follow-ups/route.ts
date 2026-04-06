import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getEmailStore } from '@/lib/email-store'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

function extractCompanyAndRole(email: any) {
  const fromName = email.from.split('<')[0].replace(/\"/g, '').trim() || 'Company'
  let role = email.subject || 'Application'
  if (role.toLowerCase().startsWith('re:')) {
    role = role.substring(3).trim()
  }
  return { company: fromName, role }
}

function buildFallbackDraft(company: string, role: string): string {
  return `I hope this message finds you well. I wanted to follow up on my application for the ${role} position at ${company}. I remain very interested in the opportunity and would love to discuss how my background aligns with your team's needs. Please let me know if there's any additional information I can provide or if there's an update on my application status. Thank you for your time and consideration.`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const store = getEmailStore(session.user.sub)
    if (!store.emails || !store.emails.length) {
      return NextResponse.json({ followUps: [] })
    }

    // Group by threadId
    const threads: Record<string, any[]> = {}
    store.emails.forEach(e => {
      if (!threads[e.threadId]) threads[e.threadId] = []
      threads[e.threadId].push(e)
    })

    const silentEmails: any[] = []
    const now = Date.now()

    for (const threadId in threads) {
      const thread = threads[threadId]
      thread.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      const newest = thread[0]
      // Process all tracked job emails (Applied, Interview, Rejected, Offered) ignoring "Other"
      if (newest.category === 'Other') continue
      const ageMs = now - new Date(newest.date).getTime()
      if (ageMs >= 0) silentEmails.push(newest) 
    }

    if (silentEmails.length === 0) {
      return NextResponse.json({ followUps: [] })
    }

    const top2 = silentEmails.slice(0, 10); // Allow more follow ups generated now!

    // Try Gemini -gracefully fall back to template drafts if it fails
    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      console.warn('No GEMINI_API_KEY -using fallback drafts')
      const fallbacks = top2.map(email => {
        const { company, role } = extractCompanyAndRole(email)
        return {
          id: email.id,
          threadId: email.threadId,
          company,
          role: role.slice(0, 50),
          draftPreview: buildFallbackDraft(company, role),
          originalEmail: email,
          isFallback: true,
        }
      })
      return NextResponse.json({ followUps: fallbacks })
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const results = []
      for (const email of top2) {
        const { company, role } = extractCompanyAndRole(email)
        let prompt = `Write a short (3-4 sentences) professional follow-up email body for a job application. Company: ${company}. Role: ${role}. Return ONLY the email body text, nothing else.`
        
        if (email.category === 'Rejected') {
            prompt = `Write a short (2-3 sentences) professional and polite email thanking the recruiter for their time, acknowledging the rejection for the ${role} position at ${company}, and expressing interest in future opportunities. Return ONLY the email body text, nothing else.`
        } else if (email.category === 'Interview') {
            prompt = `Write a short (2-3 sentences) professional email confirming availability for the interview for the ${role} position at ${company}. Return ONLY the email body text, nothing else.`
        } else if (email.category === 'Offered') {
            prompt = `Write a short (3-4 sentences) professional and enthusiastic email acknowledging the job offer for the ${role} position at ${company}. Return ONLY the email body text, nothing else.`
        }

        try {
          const result = await model.generateContent(prompt)
          results.push({
            id: email.id,
            threadId: email.threadId,
            company,
            role: role.slice(0, 50),
            draftPreview: result.response.text().trim(),
            originalEmail: email,
          })
          // Small delay to prevent rate limit (429) issues on free tier
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (geminiErr: any) {
          console.error(`Gemini failed for ${company}:`, geminiErr.message)
          results.push({
            id: email.id,
            threadId: email.threadId,
            company,
            role: role.slice(0, 50),
            draftPreview: buildFallbackDraft(company, role),
            originalEmail: email,
            isFallback: true,
          })
        }
      }

      return NextResponse.json({ followUps: results })
    } catch (geminiError: any) {
      console.error('Gemini initialization failed:', geminiError.message)
      // Return fallback drafts so the UI still works
      const fallbacks = top2.map(email => {
        const { company, role } = extractCompanyAndRole(email)
        return {
          id: email.id,
          threadId: email.threadId,
          company,
          role: role.slice(0, 50),
          draftPreview: buildFallbackDraft(company, role),
          originalEmail: email,
          isFallback: true,
        }
      })
      return NextResponse.json({ followUps: fallbacks })
    }
  } catch (err: any) {
    console.error('Follow-up GET Error:', err.message, err.stack)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
