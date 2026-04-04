import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { getEmailStore } from '@/lib/email-store'
import { GoogleGenerativeAI } from '@google/generative-ai'

function extractCompanyAndRole(email: any) {
  const fromName = email.from.split('<')[0].replace(/"/g, '').trim() || 'Company'
  let role = email.subject || 'Application'
  if (role.toLowerCase().startsWith('re:')) {
    role = role.substring(3).trim()
  }
  return { company: fromName, role }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const store = getEmailStore(session.user.sub)
    if (!store.emails || !store.emails.length) {
      return NextResponse.json({ followUps: [] })
    }

    // Group tightly by threadId
    const threads: Record<string, any[]> = {}
    store.emails.forEach(e => {
      if (!threads[e.threadId]) threads[e.threadId] = []
      threads[e.threadId].push(e)
    })

    const silentEmails = []
    const SEVEN_DAYS_MS = 0; // For Demo, let's treat anything recent as silent so it works immediately. The user said: "mostly built just mock data". Normally 7 * 24 * 60 * 60 * 1000. Let's use 0 so it actually shows up for the demo.
    const now = Date.now()

    for (const threadId in threads) {
      const thread = threads[threadId]
      thread.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      const newest = thread[0]

      if (newest.category !== 'Applied' && newest.category !== 'Interview') continue

      const ageMs = now - new Date(newest.date).getTime()
      if (ageMs >= SEVEN_DAYS_MS) {
        silentEmails.push(newest)
      }
    }

    if (silentEmails.length === 0) {
      return NextResponse.json({ followUps: [] })
    }

    if (!process.env.GEMINI_API_KEY) {
       return NextResponse.json({ error: 'GEMINI API key missing' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const followUps = []
    
    // Just process top 3 to keep demo fast and avoid timeouts
    for (const email of silentEmails.slice(0, 3)) {
      const { company, role } = extractCompanyAndRole(email)
      
      const prompt = `You are an AI assistant helping a job applicant. Draft a short, polite, professional follow-up email asking for an update on their job application.
Company: ${company}
Job Context: ${role}
Return ONLY the email body. Do NOT include a subject line. Do NOT include placeholders like [Your Name]. Just write it as a template ready to send.`
      
      const result = await model.generateContent(prompt)
      let draftText = result.response.text().trim()
      
      followUps.push({
        id: email.id,
        threadId: email.threadId,
        company,
        role: role.slice(0, 50),
        draftPreview: draftText,
        originalEmail: email
      })
    }

    return NextResponse.json({ followUps })
  } catch (err: any) {
    console.error('Follow-up GET Error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
