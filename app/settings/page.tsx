'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Sidebar, SidebarContent, SidebarMenuItem, SidebarMenu, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar'

export default function SettingsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-950">
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
                <SidebarMenuButton asChild>
                  <Link href="/follow-ups">Follow-ups</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={true}>
                  <Link href="/settings">Settings</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1">
          <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="px-8 py-6">
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-slate-400 mt-1">Manage your account preferences and integrations</p>
            </div>
          </div>

          <div className="px-8 py-8">
            <Card className="bg-slate-800 border-slate-700 p-12 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Settings Page</h2>
              <p className="text-slate-400">Account settings, Gmail integration management, and notification preferences coming soon.</p>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
