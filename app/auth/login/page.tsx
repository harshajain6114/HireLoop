'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Chrome } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 tracking-tight">
              HireLoop
            </h1>
          </Link>
          <p className="text-muted-foreground text-sm font-medium">
            Your AI-Powered Job Search Co-pilot
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-violet-500/10 opacity-50 pointer-events-none" />
          
          <CardHeader className="space-y-1 relative z-10">
            <CardTitle className="text-2xl font-bold text-center text-white">Welcome back</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Sign in to manage your applications and analyze rejections
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 relative z-10">
            <Button 
               asChild
               size="lg" 
               className="w-full h-14 bg-white hover:bg-slate-100 text-slate-900 font-semibold flex items-center justify-center gap-3 transition-all active:scale-[0.982] shadow-lg shadow-white/5"
            >
              <a href="/auth/connect">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.06H2.18a11.996 11.996 0 0 0 0 9.89l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </a>
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500 font-medium">Securely managed by Auth0</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 relative z-10 border-t border-slate-800/50 pt-6">
            <p className="text-xs text-center text-slate-500 px-8">
              By signing in, you agree to our{' '}
              <Link href="#" className="underline underline-offset-4 hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="underline underline-offset-4 hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
        
        {/* Back Link */}
        <div className="text-center">
          <Link 
            href="/" 
            className="text-sm text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
