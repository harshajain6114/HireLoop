import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { getEmailStore } from '@/lib/email-store'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    const { emails: selectedEmails } = await request.json()

    let emailsToAnalyze = [];

    // If emails are not passed in request, use the local store's Rejected emails
    if (!selectedEmails || selectedEmails.length === 0) {
      const store = getEmailStore(session.user.sub)
      emailsToAnalyze = store.emails.filter(e => e.category === 'Rejected')
    } else {
      emailsToAnalyze = selectedEmails
    }

    if (emailsToAnalyze.length === 0) {
      return NextResponse.json({ error: 'No rejected emails found to analyze' }, { status: 400 })
    }

    // Prepare email data for the prompt
    const emailDataText = emailsToAnalyze.map((e: any, i: number) => `Email ${i + 1}:\nSubject: ${e.subject}\nSnippet: ${e.snippet}\n`).join('\n')

    const prompt = `
You are an expert career coach and tech recruiter. Here are job rejection emails received by an applicant.
Analyze patterns in these rejections.

${emailDataText}

What reasons are mentioned? What stage are rejections happening at (Resume/Screening, Technical Interview, Culture Fit, Offer)? Give 3 specific actionable recommendations.

You MUST respond ONLY with a raw, valid JSON object without any backticks, markdown formatting, or markdown codeblocks (do NOT put \`\`\`json around it).

JSON Structure:
{
  "reasons": [
    { "name": "Lack of Specific Experience", "count": 2 },
    { "name": "Position Filled", "count": 1 }
  ],
  "stages": [
    { "name": "Resume / Initial Screening", "count": 3 },
    { "name": "Given after Interview", "count": 0 }
  ],
  "recommendations": [
    "string recommendation 1",
    "string recommendation 2",
    "string recommendation 3"
  ]
}
`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    let responseText = result.response.text()
    
    // Clean up potential markdown formatting that Gemini might output despite instructions
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let analysisResult;
    try {
       analysisResult = JSON.parse(responseText)
    } catch {
       return NextResponse.json({ error: 'Failed to parse AI response into JSON. AI Output: ' + responseText }, { status: 500 })
    }

    return NextResponse.json({ success: true, analysis: analysisResult })
  } catch (error: any) {
    console.error('LLM Analysis Error:', error)
    return NextResponse.json({ error: 'Server error during analysis', details: error.message || String(error) }, { status: 500 })
  }
}
