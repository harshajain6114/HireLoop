import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import { getEmailStore, JobEmail, EmailCategory } from '@/lib/email-store'
import EmailSync from '@/components/EmailSync'
import Link from 'next/link'

const CATEGORY_CONFIG: Record<EmailCategory, {
  label: string
  color: string
  bg: string
  border: string
  dot: string
  icon: string
}> = {
  Applied: {
    label: 'Applied',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
    icon: '📤',
  },
  Interview: {
    label: 'Interview Scheduled',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
    icon: '🗓️',
  },
  Rejected: {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    dot: 'bg-red-400',
    icon: '❌',
  },
  Offered: {
    label: 'Offered',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    dot: 'bg-green-400',
    icon: '🎉',
  },
  Other: {
    label: 'Other',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    dot: 'bg-slate-400',
    icon: '📧',
  },
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

function formatFrom(from: string): string {
  // Extract display name or email
  const match = from.match(/^"?([^"<]+)"?\s*</)
  if (match) return match[1].trim()
  return from.replace(/<.*>/, '').trim() || from
}

function EmailCard({ email }: { email: JobEmail }) {
  const config = CATEGORY_CONFIG[email.category]
  return (
    <div className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-4 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
            {email.subject}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{formatFrom(email.from)}</p>
          {email.snippet && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
              {email.snippet}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-slate-500 whitespace-nowrap">{formatDate(email.date)}</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ category, count, emails }: { category: EmailCategory; count: number; emails: JobEmail[] }) {
  const config = CATEGORY_CONFIG[category]
  const latestEmail = emails[0]
  return (
    <div className={`rounded-xl p-4 border ${config.bg} ${config.border} flex items-center gap-4`}>
      <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-full ${config.bg} border ${config.border}`}>
        {config.icon}
      </div>
      <div>
        <div className={`text-3xl font-bold ${config.color}`}>{count}</div>
        <div className="text-sm text-slate-400 mt-0.5">{config.label}</div>
        {latestEmail && (
          <div className="text-xs text-slate-600 mt-0.5 truncate max-w-[120px]">{formatFrom(latestEmail.from)}</div>
        )}
      </div>
    </div>
  )
}

export default async function EmailsPage() {
  const session = await auth0.getSession()
  if (!session) redirect('/auth/login')

  const store = getEmailStore()
  const emails = store.emails
  const categories: EmailCategory[] = ['Applied', 'Interview', 'Rejected', 'Offered']

  const byCategory = (cat: EmailCategory) => emails.filter(e => e.category === cat)

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#0a0f1e]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
              ← Dashboard
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <div>
              <h1 className="text-lg font-bold text-white">Job Email Tracker</h1>
              <p className="text-xs text-slate-500">
                {store.lastSynced
                  ? `Last synced: ${new Date(store.lastSynced).toLocaleTimeString('en-IN')}`
                  : 'Not yet synced'}
              </p>
            </div>
          </div>
          <EmailSync />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map(cat => (
            <StatCard
              key={cat}
              category={cat}
              count={byCategory(cat).length}
              emails={byCategory(cat)}
            />
          ))}
        </div>

        {emails.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📬</div>
            <h2 className="text-xl font-semibold text-slate-300 mb-2">No job emails found yet</h2>
            <p className="text-slate-500 mb-6">Click "Sync Gmail Now" to scan your inbox for job-related emails</p>
          </div>
        ) : (
          <>
            {/* Total count */}
            <div className="text-sm text-slate-500 mb-5">
              Found <span className="text-white font-semibold">{emails.length}</span> job-related emails out of your last 50
            </div>

            {/* 4-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {categories.map(cat => {
                const catEmails = byCategory(cat)
                const config = CATEGORY_CONFIG[cat]
                return (
                  <div key={cat}>
                    <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${config.border}`}>
                      <span className="text-lg">{config.icon}</span>
                      <h2 className={`font-semibold text-sm ${config.color}`}>{config.label}</h2>
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {catEmails.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {catEmails.length === 0 ? (
                        <div className="text-center py-8 text-slate-600 text-sm">No emails</div>
                      ) : (
                        catEmails.map(email => (
                          <EmailCard key={email.id} email={email} />
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
