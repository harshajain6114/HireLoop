'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid } from 'recharts'

export default function RejectionAnalysisPage() {
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setError('')
    try {
      // Intentionally passing empty request to let server fetch the emails for safety
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      const data = await res.json()
      
      if (data.success) {
        setAnalysis(data.analysis)
      } else {
        setError(data.error + (data.details ? ` (${data.details})` : '') || 'Failed to analyze')
      }
    } catch (e) {
      setError('Network error occurred during analysis.')
    } finally {
      setAnalyzing(false)
    }
  }

  const COLORS = ['#818cf8', '#34d399', '#f87171', '#fbbf24', '#a78bfa', '#f472b6']

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Header */}
      <nav className="border-b border-white/[0.06] bg-[#0a0f1e]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
              ← Dashboard
            </a>
            <div className="w-px h-5 bg-white/10" />
            <div>
              <h1 className="text-lg font-bold text-white">AI Rejection Analysis</h1>
              <p className="text-xs text-slate-500">Uncover patterns in your applications</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-10">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold mb-2">Why are you getting rejected?</h2>
            <p className="text-slate-400">
              Our AI reads between the lines of standard HR rejection emails to figure out what went wrong. We analyze patterns to tell you if the issue is your resume, technical skills, or culture fit.
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 active:scale-95 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                AI is Reading Emails...
              </>
            ) : (
              <>
                <span className="text-xl">✨</span> Run AI Analysis
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8">
            {error} 
            {error.includes('GEMINI_API_KEY') && ' - You need to add GEMINI_API_KEY to your .env.local file!'}
          </div>
        )}

        {!analysis && !analyzing && !error && (
          <div className="text-center py-24 bg-white/[0.02] border border-white/[0.05] rounded-3xl mt-8">
            <div className="text-6xl mb-6">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              Click the button above to feed your rejected emails into the LLM and generate a personalized improvement report.
            </p>
          </div>
        )}

        {analysis && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Actionable Recommendations */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-indigo-500/30 p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
                <span className="text-[200px] leading-none">✨</span>
              </div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">💡</div>
                AI Action Plan
              </h3>
              <div className="grid gap-4 relative z-10">
                {analysis.recommendations.map((rec: string, i: number) => (
                  <div key={i} className="flex gap-4 items-start bg-white/[0.03] p-4 rounded-2xl border border-white/[0.05]">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-slate-200 leading-relaxed text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Rejection Stage Bar Chart */}
              <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6">Rejections by Stage</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.stages} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        cursor={{ fill: '#ffffff05' }}
                      />
                      <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]}>
                        {analysis.stages.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Underlying Reasons Pie Chart */}
              <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-3xl">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6">Suspected Reasons</h3>
                <div className="h-64 flex">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysis.reasons}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        stroke="none"
                      >
                        {analysis.reasons.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}
