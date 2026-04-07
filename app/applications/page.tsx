import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getEmailStore } from '@/lib/email-store'
import { redirect } from 'next/navigation'

import ApplicationsListClient from './ApplicationsListClient'

const CATEGORY_STYLE: Record<string, { color: string; bg: string; dot: string }> = {
  Applied:   { color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    dot: 'bg-blue-400' },
  Interview: { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',  dot: 'bg-amber-400' },
  Rejected:  { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',      dot: 'bg-red-400' },
  Offered:   { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  Other:     { color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20',  dot: 'bg-slate-400' },
}

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const store = getEmailStore(session.user.sub)
  const emails = store.emails.filter(e => e.category !== 'Other')
  
  const counts = {
    Applied:   emails.filter(e => e.category === 'Applied').length,
    Interview: emails.filter(e => e.category === 'Interview').length,
    Rejected:  emails.filter(e => e.category === 'Rejected').length,
    Offered:   emails.filter(e => e.category === 'Offered').length,
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <nav className="fixed top-0 w-full z-50 bg-[#080c14]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            HireLoop
          </Link>
          <a href="/auth/logout" className="text-sm text-slate-400 hover:text-white transition-colors border border-white/10 hover:border-white/25 px-4 py-1.5 rounded-lg">
            Logout
          </a>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-300 transition-colors mb-3 inline-block">← Dashboard</Link>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-slate-500 text-sm mt-1">All job-related emails tracked from your Gmail</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {Object.entries(counts).map(([label, count]) => {
            const s = CATEGORY_STYLE[label]
            return (
              <div key={label} className={`rounded-2xl p-4 border ${s.bg}`}>
                <div className={`text-2xl font-extrabold ${s.color}`}>{count}</div>
                <div className="text-xs text-slate-400 mt-1">{label}</div>
              </div>
            )
          })}
        </div>

        <ApplicationsListClient initialEmails={emails} />
      </div>
    </div>
  )
}
