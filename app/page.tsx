'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, TrendingDown, MessageSquare } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            HireLoop
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">
              Pricing
            </a>
            <Button variant="outline" asChild className="border-slate-700 text-blue-400 hover:bg-slate-800">
              <Link href="/dashboard">
                Login
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Your Job Search, Finally Under Control
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              HireLoop reads your Gmail, tracks every application, and tells you exactly why you're getting rejected.
            </p>
          </div>

          <div className="pt-8">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
              <Link href="/dashboard">
                Connect Gmail & Get Started
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">How HireLoop Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Auto-Categorize Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Automatically organize your job application emails into applied, rejected, and interview stages.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <TrendingDown className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Rejection Pattern Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Get AI-powered insights into why you're being rejected and identify patterns across companies.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Smart Follow-ups</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">
                  Let our AI agent draft follow-up emails and get your approval before sending to companies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-r from-blue-600/10 to-blue-400/10 rounded-2xl p-12 border border-blue-600/20">
          <h2 className="text-4xl font-bold text-white">Ready to land your next role?</h2>
          <p className="text-xl text-slate-300">Start tracking your applications with intelligence today.</p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
            <Link href="/dashboard">
              Get Started Free
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
