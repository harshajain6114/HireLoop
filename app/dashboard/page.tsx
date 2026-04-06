import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getEmailStore } from '@/lib/email-store'
import { redirect } from 'next/navigation'

const NAV_PAGES = [
  { href: '/emails',            emoji: '📬', label: 'Job Emails',        desc: 'All categorized job emails from Gmail',         color: 'hover:border-blue-500/40' },
  { href: '/applications',      emoji: '📋', label: 'Applications',      desc: 'Manage and track your job applications',        color: 'hover:border-violet-500/40' },
  { href: '/rejection-analysis',emoji: '🔍', label: 'Rejection Analysis',desc: 'AI-powered breakdown of why you get rejected',  color: 'hover:border-pink-500/40' },
  { href: '/follow-ups',        emoji: '✉️', label: 'AI Follow-ups',     desc: 'Agent-drafted emails awaiting your approval',   color: 'hover:border-emerald-500/40' },
  { href: '/settings',          emoji: '⚙️', label: 'Settings',          desc: 'Account & preferences',                        color: 'hover:border-slate-500/40' },
]

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  const store = getEmailStore(session.user.sub)
  const counts = {
    Applied:   store.emails.filter(e => e.category === 'Applied').length,
    Interview: store.emails.filter(e => e.category === 'Interview').length,
    Rejected:  store.emails.filter(e => e.category === 'Rejected').length,
    Offered:   store.emails.filter(e => e.category === 'Offered').length,
  }
  const total = counts.Applied + counts.Interview + counts.Rejected + counts.Offered

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Top nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#080c14]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            HireLoop
          </Link>
          <div className="flex items-center gap-4">
            {session.user.picture && (
              <img src={session.user.picture} className="w-8 h-8 rounded-full ring-2 ring-indigo-500/30" alt="avatar" />
            )}
            <span className="text-slate-400 text-sm hidden sm:block">{session.user.name}</span>
            <a href="/auth/logout" className="text-sm text-slate-400 hover:text-white transition-colors border border-white/10 hover:border-white/25 px-4 py-1.5 rounded-lg">
              Logout
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">{session.user.email}</p>
        </div>

        {/* Gmail not synced banner */}
        {!store.lastSynced && (
          <div className="mb-8 bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-indigo-300">📥 Sync your Gmail to get started</h3>
              <p className="text-sm text-slate-400 mt-1">Connect Gmail so HireLoop can track your applications automatically via Token Vault.</p>
            </div>
            <a href="/api/gmail" className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2 rounded-xl transition-all hover:scale-105 whitespace-nowrap">
              Sync Gmail →
            </a>
          </div>
        )}

        {/* Stats */}
        {store.lastSynced && (
          <>
            <div className="mb-2 text-xs text-slate-600 uppercase tracking-wider font-semibold">Pipeline Overview</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {[
                { label: 'Applied',    count: counts.Applied,   color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',    glow: '' },
                { label: 'Interviews', count: counts.Interview, color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',  glow: '' },
                { label: 'Rejected',   count: counts.Rejected,  color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',      glow: '' },
                { label: 'Offered 🎉', count: counts.Offered,   color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20',glow: '' },
              ].map(item => (
                <Link key={item.label} href="/emails" className={`rounded-2xl p-5 border ${item.bg} hover:scale-105 transition-all duration-200 group`}>
                  <div className={`text-3xl font-extrabold ${item.color} mb-1`}>{item.count}</div>
                  <div className="text-xs text-slate-400 font-medium">{item.label}</div>
                  {total > 0 && (
                    <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color.replace('text-', 'bg-')} rounded-full`} style={{ width: `${Math.round((item.count / total) * 100)}%` }} />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Nav cards */}
        <div className="mb-3 text-xs text-slate-600 uppercase tracking-wider font-semibold">Tools</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_PAGES.map(page => (
            <Link
              key={page.href}
              href={page.href}
              className={`group bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] ${page.color} rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className="text-3xl mb-3">{page.emoji}</div>
              <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1">{page.label}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{page.desc}</div>
            </Link>
          ))}

          {/* Re-sync card */}
          <a
            href="/api/gmail"
            className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.07] hover:border-indigo-500/40 rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="text-3xl mb-3">🔄</div>
            <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1">Sync Gmail</div>
            <div className="text-xs text-slate-500 leading-relaxed">Pull latest emails securely via Token Vault</div>
          </a>
        </div>

        {/* Last synced */}
        {store.lastSynced && (
          <p className="text-xs text-slate-700 mt-8 text-right">
            Last synced: {new Date(store.lastSynced).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}
