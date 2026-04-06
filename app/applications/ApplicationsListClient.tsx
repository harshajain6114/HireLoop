'use client'

import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'

const CATEGORY_STYLE: Record<string, { color: string; bg: string; dot: string }> = {
  Applied:   { color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    dot: 'bg-blue-400' },
  Interview: { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',  dot: 'bg-amber-400' },
  Rejected:  { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',      dot: 'bg-red-400' },
  Offered:   { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  Other:     { color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20',  dot: 'bg-slate-400' },
}

export default function ApplicationsListClient({ initialEmails }: { initialEmails: any[] }) {
  const [emails, setEmails] = useState(initialEmails);

  const downloadCSV = () => {
    const csvData = [
      ['Date', 'Company/Sender', 'Subject', 'Category', 'Snippet'],
      ...emails.map(e => {
        const fromName = e.from.split('<')[0].replace(/"/g, '').trim() || e.from;
        const date = new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        return [
          `"${date}"`,
          `"${fromName.replace(/"/g, '""')}"`,
          `"${e.subject.replace(/"/g, '""')}"`,
          `"${e.category}"`,
          `"${(e.snippet || '').replace(/"/g, '""')}"`
        ];
      })
    ].map(row => row.join(",")).join("\n");
                
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tracked-applications.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const removeEmail = (id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id));
  };

  if (emails.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-16 text-center">
        <p className="text-slate-500 mb-4">No applications tracked currently.</p>
        <a href="/api/gmail" className="text-sm bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-5 py-2.5 rounded-xl transition-colors">
          Sync Gmail →
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 text-sm bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
        >
          Download Excel (CSV)
        </button>
      </div>
      <div className="space-y-2">
        {emails.map(email => {
          const s = CATEGORY_STYLE[email.category] || CATEGORY_STYLE.Other
          const fromName = email.from.split('<')[0].replace(/"/g, '').trim() || email.from
          const date = new Date(email.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          return (
            <div key={email.id} className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.07] rounded-xl px-5 py-4 flex items-start gap-4 transition-colors">
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="font-semibold text-white truncate">{fromName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${s.bg} ${s.color}`}>{email.category}</span>
                </div>
                <p className="text-sm text-slate-400 truncate">{email.subject}</p>
                {email.snippet && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{email.snippet}</p>
                )}
              </div>
              <div className="flex flex-col items-end shrink-0 gap-2">
                <div className="text-xs text-slate-600 mt-1">{date}</div>
                <button
                  onClick={() => removeEmail(email.id)}
                  title="Remove from tracking"
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  );
}
