import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

// Sanitize userId for safe use as a filename (e.g. google-oauth2|123 → google-oauth2_123)
function getUserFilePath(userId: string): string {
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '_')
  return path.join(DATA_DIR, `emails-${safeId}.json`)
}

export type EmailCategory = 'Applied' | 'Interview' | 'Rejected' | 'Offered' | 'Other'

export interface JobEmail {
  id: string
  threadId: string
  subject: string
  from: string
  date: string
  snippet: string
  category: EmailCategory
  syncedAt: string
}

export interface EmailStore {
  lastSynced: string
  emails: JobEmail[]
}

export function saveEmails(userId: string, emails: JobEmail[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  const store: EmailStore = {
    lastSynced: new Date().toISOString(),
    emails,
  }
  fs.writeFileSync(getUserFilePath(userId), JSON.stringify(store, null, 2))
}

export function getEmailStore(userId: string): EmailStore {
  const filePath = getUserFilePath(userId)
  if (!fs.existsSync(filePath)) {
    return { lastSynced: '', emails: [] }
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { lastSynced: '', emails: [] }
  }
}

export function categorizeEmail(subject: string, snippet: string): EmailCategory {
  const text = (subject + ' ' + snippet).toLowerCase()

  // Order matters -more specific patterns first
  if (/unfortunately|regret to inform|not moving forward|not selected|not proceed|other candidates|appreciate your interest|will not be|decided not to|not a fit|decline|not shortlisted|position has been filled|do not meet|kept on file|wish you the best|we appreciate your interest but|we have decided|will not be moving|after careful consideration|we regret/.test(text)) {
    return 'Rejected'
  }
  if (/offer letter|job offer|offer of employment|pleased to offer|formally offer|extend.*offer|congratulations.*offer|welcome aboard|join.*team.*offer|welcome to the team|start date|compensation package|joining date|selected for the role|we are happy to offer/.test(text)) {
    return 'Offered'
  }
  if (/congratulations|you.*passed|moving forward|next round|selected.*interview/.test(text) && !/offer/.test(text)) {
    return 'Interview'
  }
  if (/interview|schedule.*call|schedule a call|phone screen|video call|meet with|speaking with|next steps.*call|virtual.*meeting|hiring.*call|technical.*screen|recruiter.*call|next round|technical round|hr round|shortlisted|move forward|next steps|pleased to inform|would like to invite/.test(text)) {
    return 'Interview'
  }
  if (/application received|thank you for applying|thank you for apply|applied for|we received your application|successfully applied|application submitted|application confirmed|thanks for your interest|your resume|job application|we got your application|application is under review|application for the|your application to|confirming your application|application.*submitted|resume.*received|assessment|coding test|online test|assignment/.test(text)) {
    return 'Applied'
  }
  return 'Other'
}

export function isJobRelated(subject: string, snippet: string): boolean {
  const text = (subject + ' ' + snippet).toLowerCase()
  const keywords = [
    'application', 'position', 'interview', 'unfortunately', 'regret',
    'offer', 'congratulations', 'applied', 'hiring', 'recruiter',
    'job', 'opportunity', 'candidate', 'resume', 'cv', 'role',
    'vacancy', 'employment', 'opening', 'applicant', 'screening', 'assessment', 'exam', 'test', 'assignment'
  ]
  return keywords.some(kw => text.includes(kw))
}
