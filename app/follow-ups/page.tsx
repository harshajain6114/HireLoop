'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Edit2, Trash2, Loader2, BotMessageSquare, ShieldCheck, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [sendingId, setSendingId] = useState<string | null>(null)

  useEffect(() => { fetchFollowUps() }, [])

  async function fetchFollowUps() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/follow-ups')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setFollowUps(data.followUps || [])
    } catch (e: any) {
      console.error('Follow-ups fetch error:', e)
      if (followUps.length === 0) {
        setError(e.message || 'Unknown error -check browser console')
      } else {
        toast.error('Refresh failed: ' + e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(followUp: any, content: string) {
    setSendingId(followUp.id)
    try {
      const res = await fetch('/api/follow-ups/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: followUp.threadId, content, originalEmail: followUp.originalEmail })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      toast.success('✅ Follow-up sent securely via Token Vault!')
      setFollowUps(prev => prev.filter(f => f.id !== followUp.id))
      setEditingId(null)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#080c14]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            HireLoop
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <BotMessageSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold">Pending Agent Actions</h1>
            </div>
            <p className="text-slate-500">Your AI agent has drafted follow-ups for silent applications. Review and approve each before it sends.</p>
          </div>
          {followUps.length > 0 && (
            <button
              onClick={() => {
                const csvData = [
                  ['Company', 'Role', 'Draft Preview', 'Status'],
                  ...followUps.map(f => [
                    `"${f.company.replace(/"/g, '""')}"`,
                    `"${f.role.replace(/"/g, '""')}"`,
                    `"${f.draftPreview.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                    'Pending'
                  ])
                ].map(e => e.join(",")).join("\n");
                
                const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", "follow-up-drafts.csv");
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('Excel/CSV Downloaded successfully!');
              }}
              className="flex items-center gap-2 text-sm bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
            >
              Download Excel (CSV)
            </button>
          )}
        </div>

        {/* How it works banner */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-300 mb-1">Async Authorization via Auth0 Token Vault</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              The AI agent has drafted these emails but <strong className="text-white">cannot send without your explicit approval</strong>. Once you click "Approve & Send", your Google token is retrieved securely from Token Vault and the email is dispatched.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-16 text-center">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="font-semibold text-white mb-1">Agent is analyzing your pipeline...</p>
            <p className="text-sm text-slate-500">Drafting follow-ups for applications with no reply.</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-semibold mb-2">Failed to load follow-ups</p>
            <p className="text-sm text-slate-400 mb-4">{error}</p>
            <button onClick={fetchFollowUps} className="text-sm bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 px-4 py-2 rounded-lg transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Follow-up cards */}
        {!loading && !error && followUps.length > 0 && (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">{followUps.length} draft{followUps.length > 1 ? 's' : ''} awaiting your authorization</p>
            {followUps.map((fu, i) => (
              <div key={fu.id || i} className="bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/30 rounded-2xl overflow-hidden transition-colors">
                {/* Card top accent */}
                <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

                <div className="p-6">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg">{fu.company}</h3>
                        <span className="text-xs bg-slate-700/60 text-slate-300 px-2.5 py-0.5 rounded-full border border-white/10 truncate max-w-[200px]">{fu.role}</span>
                      </div>
                      <p className="text-xs text-slate-500">AI-drafted follow-up · no reply detected</p>
                    </div>
                    <span className="text-xs text-slate-600 font-mono">#{i + 1}</span>
                  </div>

                  {/* Email body */}
                  <div className="bg-[#0d1117] border border-white/[0.06] rounded-xl p-4 mb-4 font-mono text-sm leading-relaxed">
                    {editingId === fu.id ? (
                      <textarea
                        className="w-full bg-transparent text-slate-300 min-h-[140px] resize-y outline-none"
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                      />
                    ) : (
                      <p className="text-slate-300 whitespace-pre-wrap">{fu.draftPreview}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {editingId === fu.id ? (
                      <>
                        <button
                          onClick={() => handleSend(fu, editContent)}
                          disabled={sendingId === fu.id}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105"
                        >
                          {sendingId === fu.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          Save & Send
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            // Synchronous window.open to bypass popup blockers
                            const threadIdUrl = fu.originalEmail?.threadId ? fu.originalEmail.threadId : fu.threadId;
                            const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${threadIdUrl}`;
                            window.open(gmailUrl, '_blank');
                            
                            // Async clipboard write
                            navigator.clipboard.writeText(fu.draftPreview).then(() => {
                              toast.success('✨ Draft copied to clipboard! Paste it to reply.');
                              setFollowUps(prev => prev.filter(f => f.id !== fu.id));
                            }).catch(error => {
                              console.error('Failed to copy to clipboard:', error);
                              toast.error('Failed to copy draft to clipboard. Please try again.');
                            });
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve and send via token vault
                        </button>
                        <button
                          onClick={() => { setEditingId(fu.id); setEditContent(fu.draftPreview) }}
                          className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 border border-white/10 hover:border-indigo-500/40 px-4 py-2.5 rounded-xl transition-colors"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            setFollowUps(prev => prev.filter(f => f.id !== fu.id));
                            toast.success('Removed successfully');
                          }}
                          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 px-3 py-2.5 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && followUps.length === 0 && (
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
            <p className="font-semibold text-white mb-1">All caught up!</p>
            <p className="text-sm text-slate-500 mb-6">No applications need a follow-up right now. Sync your Gmail to check for new ones.</p>
            <a href="/api/gmail" className="text-sm bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-5 py-2.5 rounded-xl transition-colors">
              Sync Gmail
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
