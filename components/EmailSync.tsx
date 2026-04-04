'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SyncResult {
  success: boolean
  message: string
  counts?: {
    total: number
    Applied: number
    Interview: number
    Rejected: number
    Offered: number
  }
}

export default function EmailSync() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const router = useRouter()

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)
    try {
      const res = await fetch('/api/gmail')
      const data = await res.json()
      if (data.needsReconnect) {
        window.location.href = '/api/connected-accounts/connect'
        return
      }
      if (data.success) {
        setResult(data)
        router.refresh()
      } else {
        setResult({ success: false, message: data.error || 'Sync failed' })
      }
    } catch {
      setResult({ success: false, message: 'Network error' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 active:scale-95 disabled:cursor-not-allowed"
      >
        {syncing ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Syncing Gmail...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
            </svg>
            Sync Gmail Now
          </>
        )}
      </button>

      {result && (
        <div className={`text-sm px-4 py-2 rounded-lg ${result.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {result.message}
          {result.counts && (
            <span className="ml-2 text-xs opacity-75">
              · {result.counts.Applied} applied, {result.counts.Interview} interviews, {result.counts.Rejected} rejected, {result.counts.Offered} offered
            </span>
          )}
        </div>
      )}
    </div>
  )
}
