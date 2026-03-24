'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sidebar, SidebarContent, SidebarMenuItem, SidebarMenu, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar'
import { CheckCircle2, Edit2, Trash2, AlertCircle } from 'lucide-react'

const pendingFollowUps = [
  {
    id: 1,
    company: 'Acme Corp',
    role: 'Senior Engineer',
    draftPreview: 'Hi there, I wanted to follow up on my application for the Senior Engineer role. I remain very interested in the position and would love to discuss any next steps...',
  },
  {
    id: 2,
    company: 'TechFlow',
    role: 'Frontend Developer',
    draftPreview: 'Thank you for the opportunity to interview for the Frontend Developer position. I wanted to reiterate my enthusiasm for the role and the company...',
  },
  {
    id: 3,
    company: 'StartupX',
    role: 'Full Stack Dev',
    draftPreview: 'I hope this email finds you well. I am writing to follow up on my submission for the Full Stack Developer position from two weeks ago...',
  },
]

export default function FollowUpsPage() {
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
              <p className="text-slate-400 mt-1">Review and approve AI-drafted follow-up emails</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {/* Banner */}
            <Alert className="mb-8 bg-blue-600/20 border-blue-600/30">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300 ml-2">
                Your AI agent has drafted {pendingFollowUps.length} follow-ups waiting for your approval
              </AlertDescription>
            </Alert>

            {/* Follow-up Cards */}
            <div className="space-y-6">
              {pendingFollowUps.map((followUp) => (
                <Card key={followUp.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:border-blue-600/50 transition-colors">
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
                          AI-generated follow-up email
                        </CardDescription>
                      </div>
                      <div className="text-sm text-slate-500">Draft #{followUp.id}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Email Preview */}
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                        {followUp.draftPreview}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve & Send
                      </Button>
                      <Button variant="outline" className="border-slate-700 text-blue-400 hover:bg-slate-700 gap-2">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button variant="outline" className="border-slate-700 text-red-400 hover:bg-slate-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State Message */}
            {pendingFollowUps.length === 0 && (
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
