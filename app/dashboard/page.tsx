import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            HireLoop
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">Welcome, {session.user.name}!</span>
            <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
              <Link href="/auth/logout">
                Logout
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>
            
            <div className="space-y-4">
              <p className="text-slate-300">
                <strong>Email:</strong> {session.user.email}
              </p>
              <p className="text-slate-300">
                <strong>Name:</strong> {session.user.name}
              </p>
              <p className="text-slate-300">
                <strong>Auth ID:</strong> {session.user.sub}
              </p>
            </div>

            <div className="mt-8">
              <div className="bg-slate-900/50 border border-slate-700 rounded p-4">
                <h2 className="text-xl font-semibold text-white mb-2">Session Active ✓</h2>
                <p className="text-slate-400 text-sm">
                  You're successfully logged in with Auth0! Your session will expire in {Math.round((session.expiresAt - Date.now()) / 60000)} minutes.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
