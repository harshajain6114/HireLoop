'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sidebar, SidebarContent, SidebarMenuItem, SidebarMenu, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar'
import { Zap, AlertCircle, LightbulbIcon } from 'lucide-react'

const rejectionEmails = [
  { id: 1, company: 'TechCorp', date: 'Mar 19', subject: 'Application Status Update' },
  { id: 2, company: 'DataFlow', date: 'Mar 17', subject: 'Regarding Your Application' },
  { id: 3, company: 'CloudPlatform', date: 'Mar 15', subject: 'Next Steps in Your Application' },
  { id: 4, company: 'StartupAI', date: 'Mar 12', subject: 'Application Decision' },
  { id: 5, company: 'WebServices', date: 'Mar 10', subject: 'Thank You for Applying' },
]

const insights = [
  {
    title: 'Stage of Rejection',
    icon: AlertCircle,
    content: '60% of rejections occur after the initial screening phase. Consider strengthening your resume technical skills section.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Company Type Pattern',
    icon: Zap,
    content: 'You have a higher rejection rate from Series A startups (75%) compared to established companies (45%).',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Actionable Recommendations',
    icon: LightbulbIcon,
    content: 'Add more quantifiable achievements to your experience. Companies mention "lack of specific metrics" in 40% of rejections.',
    color: 'from-emerald-500 to-emerald-600',
  },
]

export default function RejectionAnalysisPage() {
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
                <SidebarMenuButton asChild isActive={true}>
                  <Link href="/rejection-analysis">Rejection Analysis</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
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
            <div className="px-8 py-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Why You're Getting Rejected</h1>
                <p className="text-slate-400 mt-1">AI-powered analysis of your rejection patterns</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Run Analysis
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Rejection Emails List */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800 border-slate-700 h-full">
                  <CardHeader>
                    <CardTitle className="text-white">Rejection Emails</CardTitle>
                    <CardDescription className="text-slate-400">
                      {rejectionEmails.length} rejection emails analyzed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
                      {rejectionEmails.map((email) => (
                        <button
                          key={email.id}
                          className="w-full px-6 py-4 text-left hover:bg-slate-700/50 transition-colors border-l-2 border-blue-600 last:border-b-0 hover:border-blue-400"
                        >
                          <div className="font-semibold text-white truncate">{email.company}</div>
                          <div className="text-sm text-slate-400 truncate mt-1">{email.subject}</div>
                          <div className="text-xs text-slate-500 mt-2">{email.date}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Results */}
              <div className="lg:col-span-2 space-y-6">
                {insights.map((insight, index) => {
                  const Icon = insight.icon
                  return (
                    <Card key={index} className="bg-slate-800 border-slate-700 overflow-hidden">
                      <div className={`h-1 bg-gradient-to-r ${insight.color}`} />
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${insight.color} bg-opacity-20`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <CardTitle className="text-white">{insight.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 leading-relaxed">
                          {insight.content}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Additional Stats */}
                <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Average Time to Rejection</div>
                        <div className="text-2xl font-bold text-white">7.2 days</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Most Common Stage</div>
                        <div className="text-2xl font-bold text-white">Initial Screen</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Industries Analyzed</div>
                        <div className="text-2xl font-bold text-white">12</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Success Rate</div>
                        <div className="text-2xl font-bold text-blue-400">8%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
