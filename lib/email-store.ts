import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const EMAILS_FILE = path.join(DATA_DIR, 'job-emails.json')

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

export function saveEmails(emails: JobEmail[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  const store: EmailStore = {
    lastSynced: new Date().toISOString(),
    emails,
  }
  fs.writeFileSync(EMAILS_FILE, JSON.stringify(store, null, 2))
}

export function getEmailStore(): EmailStore {
  if (!fs.existsSync(EMAILS_FILE)) {
    return { lastSynced: '', emails: [] }
  }
  try {
    const data = fs.readFileSync(EMAILS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { lastSynced: '', emails: [] }
  }
}

export function categorizeEmail(subject: string, snippet: string): EmailCategory {
  const text = (subject + ' ' + snippet).toLowerCase()

  // Order matters — more specific patterns first
  if (/unfortunately|regret|not moving forward|not selected|not proceed|other candidates|appreciate your interest|will not be|decided not to|not a fit|decline|not shortlisted/.test(text)) {
    return 'Rejected'
  }
  if (/offer letter|job offer|offer of employment|pleased to offer|formally offer|extend.*offer|congratulations.*offer|welcome aboard|join.*team.*offer/.test(text)) {
    return 'Offered'
  }
  if (/congratulations|you.*passed|moving forward|next round|selected.*interview/.test(text) && !/offer/.test(text)) {
    return 'Interview'
  }
  if (/interview|schedule.*call|phone screen|video call|meet with|speaking with|next steps.*call|virtual.*meeting|hiring.*call|technical.*screen|recruiter.*call/.test(text)) {
    return 'Interview'
  }
  if (/application received|thank you for apply|applied for|we received your application|application for the|your application to|confirming your application|application.*submitted|resume.*received/.test(text)) {
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
    'vacancy', 'employment', 'opening', 'applicant', 'screening',
  ]
  return keywords.some(kw => text.includes(kw))
}
