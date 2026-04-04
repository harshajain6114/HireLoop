'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sidebar, SidebarContent, SidebarMenuItem, SidebarMenu, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar'
import { CheckCircle2, Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [sendingId, setSendingId] = useState<string | null>(null)

  useEffect(() => {
    fetchFollowUps()
  }, [])

  async function fetchFollowUps() {
    try {
      const res = await fetch('/api/follow-ups')
      const data = await res.json()
      if (data.followUps) {
        setFollowUps(data.followUps)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load follow-ups')
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
        body: JSON.stringify({
          threadId: followUp.threadId,
          content,
          originalEmail: followUp.originalEmail
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send')
      }

      toast.success('Follow-up sent securely via Token Vault!')
      setFollowUps(prev => prev.filter(f => f.id !== followUp.id))
      setEditingId(null)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setSendingId(null)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-950">
        {/* Sidebar */}
        <Sidebar className="border-r border-slate-800 bg-slate-900">
          <SidebarContent>
            <div className="mb-8 px-4 pt-4">
              <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                HireLoop
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/applications">Applications</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/rejection-analysis">Rejection Analysis</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={true}>
                  <Link href="/follow-ups">Follow-ups</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings">Settings</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="px-8 py-6">
              <h1 className="text-3xl font-bold text-white">Pending Agent Actions</h1>
              <p className="text-slate-400 mt-1">Review and approve AI-drafted follow-up emails securely through Token Vault</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Banner */}
            {!loading && followUps.length > 0 && (
              <Alert className="mb-8 bg-blue-600/20 border-blue-600/30">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300 ml-2">
                  Your AI agent has drafted {followUps.length} follow-up{followUps.length === 1 ? '' : 's'}. Awaiting your async authorization to send.
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <Card className="bg-slate-800 border-slate-700 text-center py-12">
                <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin opacity-50" />
                <h3 className="text-lg font-semibold text-white mb-2">Agent is analyzing applications...</h3>
                <p className="text-slate-400">Drafting follow-ups for inactive applications.</p>
              </Card>
            )}

            {/* Follow-up Cards */}
            {!loading && (
              <div className="space-y-6">
                {followUps.map((followUp, index) => (
                  <Card key={followUp.id || index} className="bg-slate-800 border-slate-700 overflow-hidden hover:border-blue-600/50 transition-colors">
                    <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-white">{followUp.company}</CardTitle>
                            <Badge variant="outline" className="bg-slate-700/50 border-slate-600 text-slate-300">
                              {followUp.role}
                            </Badge>
                          </div>
                          <CardDescription className="text-slate-400">
                            AI-generated follow-up email ready for authorization
                          </CardDescription>
                        </div>
                        <div className="text-sm text-slate-500">Draft #{index + 1}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Email Preview */}
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        {editingId === followUp.id ? (
                          <Textarea 
                            className="bg-transparent border-none text-sm text-slate-300 min-h-[120px] focus-visible:ring-1 focus-visible:ring-blue-500"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          />
                        ) : (
                          <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {followUp.draftPreview}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        {editingId === followUp.id ? (
                          <>
                            <Button 
                              onClick={() => handleSend(followUp, editContent)}
                              disabled={sendingId === followUp.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                            >
                              {sendingId === followUp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Save & Send
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingId(null)}
                              className="border-slate-700 text-slate-300 hover:bg-slate-700"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              onClick={() => handleSend(followUp, followUp.draftPreview)}
                              disabled={sendingId === followUp.id}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                            >
                              {sendingId === followUp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Approve & Send
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setEditingId(followUp.id)
                                setEditContent(followUp.draftPreview)
                              }}
                              className="border-slate-700 text-blue-400 hover:bg-slate-700 gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setFollowUps(prev => prev.filter(f => f.id !== followUp.id))}
                              className="border-slate-700 text-red-400 hover:bg-slate-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State Message */}
            {!loading && followUps.length === 0 && (
              <Card className="bg-slate-800 border-slate-700 text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
                <p className="text-slate-400">No pending follow-ups at the moment. Check back soon.</p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
