import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-[#080c14] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.06] bg-[#080c14]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            HireLoop
          </span>
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 hidden sm:block">Hi, {session.user.name?.split(' ')[0]}! 👋</span>
              <Link href="/dashboard" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2 rounded-lg">
                Dashboard →
              </Link>
              <a href="/auth/logout" className="text-sm text-slate-400 hover:text-white transition-colors border border-white/10 hover:border-white/20 px-3 py-2 rounded-lg">
                Logout
              </a>
            </div>
          ) : (
            <a href="/auth/connect" className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2 rounded-lg">
              Get Started →
            </a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-6">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {session ? (
            <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-3 text-sm text-emerald-300 mb-4">
              {session.user.picture && (
                <img src={session.user.picture} className="w-7 h-7 rounded-full ring-2 ring-emerald-500/30" alt="avatar" />
              )}
              <span>Welcome back, <strong className="text-white">{session.user.name}</strong>! Your pipeline is ready.</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-4">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              Powered by Auth0 Token Vault + Gemini AI
            </div>
          )}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Your Job Search,{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Finally Intelligent
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            HireLoop reads your Gmail, auto-tracks every application, analyses why you're being rejected, and lets an AI agent draft follow-up emails -all with you in control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all px-8 py-4 rounded-xl text-base font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <a
                href="/auth/connect"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all px-8 py-4 rounded-xl text-base font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#a5b4fc" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#c4b5fd" d="M5.84 14.11c-.22-.67-.35-2.11V7.06H2.18a11.996 11.996 0 0 0 0 9.89l3.66-2.84z" />
                  <path fill="#ddd6fe" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Connect Gmail &amp; Get Started
              </a>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="features" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Three agents. One seamless pipeline.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📬',
                color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20',
                accent: 'text-blue-400',
                title: 'Auto-Categorize',
                desc: 'The Gmail Agent securely accesses your inbox via Auth0 Token Vault and auto-sorts every email into Applied, Interviewing, Rejected, or Offered.'
              },
              {
                icon: '🔍',
                color: 'from-violet-500/10 to-purple-500/10 border-violet-500/20',
                accent: 'text-violet-400',
                title: 'Rejection Analysis',
                desc: 'The Insight Agent reads your rejections and uses Gemini AI to tell you exactly where your funnel is breaking -and how to fix it.'
              },
              {
                icon: '✉️',
                color: 'from-pink-500/10 to-rose-500/10 border-pink-500/20',
                accent: 'text-pink-400',
                title: 'Human-in-the-Loop',
                desc: 'The Follow-up Agent drafts emails for silent applications. It pauses and waits for your approval before sending -async authorization via Token Vault.'
              }
            ].map(f => (
              <div key={f.title} className={`bg-gradient-to-br ${f.color} border rounded-2xl p-6 hover:scale-[1.02] transition-transform`}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className={`text-lg font-bold ${f.accent} mb-2`}>{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth0 Token Vault callout */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-indigo-600/10 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-10 text-center space-y-4">
          <div className="inline-block bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">Security First</div>
          <h2 className="text-2xl font-bold">Your tokens, never stored by us</h2>
          <p className="text-slate-400 leading-relaxed">
            HireLoop uses <strong className="text-white">Auth0 Token Vault</strong> to manage Google OAuth tokens. We never store your refresh tokens in our database. Every API call is authenticated on-the-fly through Auth0's secure vault -so your inbox stays yours.
          </p>
          <a href="/auth/connect" className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-500 transition-colors px-6 py-3 rounded-xl font-semibold text-sm">
            Get Started -It's Free →
          </a>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 px-6 text-center text-slate-600 text-sm">
        © 2026 HireLoop · Built for the Auth0 "Authorized to Act" Hackathon
      </footer>
    </div>
  )
}
