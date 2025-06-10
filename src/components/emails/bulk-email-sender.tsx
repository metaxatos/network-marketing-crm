'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Contact } from '@/types'

interface BulkEmailSenderProps {
  contacts: Contact[]
  onClose: () => void
  onSend?: (data: { subject: string; content: string; recipients: string[] }) => void
}

export function BulkEmailSender({ contacts, onClose, onSend }: BulkEmailSenderProps) {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [recipients, setRecipients] = useState<string[]>([])

  const handleSend = () => {
    if (onSend) {
      onSend({ subject, content, recipients })
    }
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Send to {contacts.length} contacts</h3>
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
      </div>
      
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter email subject"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter email content"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Recipients ({contacts.length})</h4>
        <div className="max-h-32 overflow-y-auto">
          {contacts.slice(0, 10).map((contact) => (
            <div key={contact.id} className="text-sm text-gray-600">
              {contact.name} {contact.email && `(${contact.email})`}
            </div>
          ))}
          {contacts.length > 10 && (
            <div className="text-sm text-gray-500 mt-2">
              +{contacts.length - 10} more contacts
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={handleSend}
        disabled={!subject || !content || contacts.length === 0}
        className="w-full"
      >
        Send to {contacts.length} Contacts
      </Button>
    </div>
  )
} 