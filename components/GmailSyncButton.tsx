'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

export const GmailSyncButton = () => {
  const syncGmail = async () => {
    try {
      const response = await fetch('/api/gmail')
      const data = await response.json()
      
      console.log('Gmail sync response:', data)
      
      if (data.success) {
        alert(`Success! Fetched ${data.messageCount} messages.`)
      } else {
        alert(`Error syncing Gmail: ${data.error}`)
      }
    } catch (error) {
      console.error('Error syncing Gmail:', error)
      alert('Failed to sync Gmail. Check console for details.')
    }
  }

  return (
    <Button 
      onClick={syncGmail}
      className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-all shadow-lg hover:shadow-red-500/20 active:scale-95"
    >
      <div className="flex items-center gap-2">
        <svg 
          viewBox="0 0 24 24" 
          className="w-5 h-5 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.573l8.073-6.08c1.618-1.214 3.927-.059 3.927 1.964z"/>
        </svg>
        Sync Gmail
      </div>
    </Button>
  )
}
