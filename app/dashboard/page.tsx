'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sidebar, SidebarContent, SidebarMenuItem, SidebarMenu, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar'
import { MoreVertical, RefreshCw, Clock, CheckCircle2, XCircle, Trophy } from 'lucide-react'

const stats = [
  { label: 'Applied', value: '24', icon: Clock, color: 'bg-blue-600' },
  { label: 'Interviewing', value: '5', icon: CheckCircle2, color: 'bg-emerald-600' },
  { label: 'Rejected', value: '18', icon: XCircle, color: 'bg-red-600' },
  { label: 'Offered', value: '2', icon: Trophy, color: 'bg-amber-600' },
]

const applications = [
  { id: 1, company: 'Acme Corp', role: 'Senior Engineer', status: 'Applied', lastActivity: '2 hours ago', date: 'Mar 20' },
  { id: 2, company: 'TechFlow', role: 'Frontend Developer', status: 'Interviewing', lastActivity: '1 day ago', date: 'Mar 18' },
  { id: 3, company: 'StartupX', role: 'Full Stack Dev', status: 'Rejected', lastActivity: '3 days ago', date: 'Mar 17' },
  { id: 4, company: 'CloudSync', role: 'Backend Engineer', status: 'Offered', lastActivity: '2 days ago', date: 'Mar 19' },
  { id: 5, company: 'DataViz', role: 'ML Engineer', status: 'Applied', lastActivity: '5 hours ago', date: 'Mar 21' },
  { id: 6, company: 'WebPro', role: 'React Developer', status: 'Interviewing', lastActivity: '1 day ago', date: 'Mar 18' },
  { id: 7, company: 'AppStudio', role: 'Mobile Developer', status: 'Applied', lastActivity: '1 day ago', date: 'Mar 18' },
  { id: 8, company: 'DevShop', role: 'DevOps Engineer', status: 'Rejected', lastActivity: '4 days ago', date: 'Mar 16' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Applied':
      return 'bg-blue-600/20 text-blue-300 border-blue-600/30'
    case 'Interviewing':
      return 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30'
    case 'Rejected':
      return 'bg-red-600/20 text-red-300 border-red-600/30'
    case 'Offered':
      return 'bg-amber-600/20 text-amber-300 border-amber-600/30'
    default:
      return 'bg-slate-600/20 text-slate-300 border-slate-600/30'
  }
}

export default function DashboardPage() {
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
                <SidebarMenuButton asChild isActive={true}>
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
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">Track your job applications and progress</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <RefreshCw className="w-4 h-4" />
                Sync Gmail
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-400 text-sm font-medium">
                          {stat.label}
                        </CardTitle>
                        <div className={`${stat.color} p-2 rounded-lg`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">{stat.value}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Applications Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Applications</CardTitle>
                <CardDescription className="text-slate-400">
                  Showing {applications.length} applications from your job search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-transparent">
                        <TableHead className="text-slate-300">Company</TableHead>
                        <TableHead className="text-slate-300">Role</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Last Activity</TableHead>
                        <TableHead className="text-slate-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id} className="border-slate-700 hover:bg-slate-700/50">
                          <TableCell className="font-semibold text-white">{app.company}</TableCell>
                          <TableCell className="text-slate-300">{app.role}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(app.status)}>
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">{app.lastActivity}</TableCell>
                          <TableCell className="text-right">
                            <button className="text-slate-400 hover:text-white transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
