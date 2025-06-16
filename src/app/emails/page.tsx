'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/ui/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Send, Users, ChevronRight, FileText, AlertCircle } from 'lucide-react'
import { useContacts } from '@/hooks/queries/useContacts'
import { useToast } from '@/hooks/use-toast'

interface EmailTemplate {
  id: string
  name: string
  category: string
  preview: string
}

export default function EmailsPage() {
  const { user, loading: authLoading } = useAppAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  const { data: contacts = [], isLoading: contactsLoading } = useContacts()

  // Fetch email templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true)
        const response = await fetch('/api/email-templates')
        
        if (!response.ok) {
          throw new Error('Failed to fetch templates')
        }
        
        const data = await response.json()
        setTemplates(data.data?.templates || [])
      } catch (error) {
        console.error('Error fetching templates:', error)
        toast({
          title: 'Error',
          description: 'Failed to load email templates',
          variant: 'destructive',
        })
      } finally {
        setTemplatesLoading(false)
      }
    }

    if (user) {
      fetchTemplates()
    }
  }, [user, toast])

  // Load template details when selected
  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) {
      setEmailSubject('')
      setEmailBody('')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/email-templates/${templateId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch template details')
      }
      
      const data = await response.json()
      const template = data.data
      
      setSelectedTemplate(templateId)
      setEmailSubject(template.subject)
      setEmailBody(template.body_html)
    } catch (error) {
      console.error('Error loading template:', error)
      toast({
        title: 'Error',
        description: 'Failed to load template details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle sending email
  const handleSendEmail = async () => {
    if (selectedContacts.length === 0) {
      toast({
        title: 'No recipients',
        description: 'Please select at least one contact',
        variant: 'destructive',
      })
      return
    }

    if (!emailSubject || !emailBody) {
      toast({
        title: 'Missing content',
        description: 'Please add a subject and message',
        variant: 'destructive',
      })
      return
    }

    try {
      setSending(true)
      
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactIds: selectedContacts,
          subject: emailSubject,
          body: emailBody,
          templateId: selectedTemplate || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send emails')
      }

      const result = await response.json()
      
      toast({
        title: 'Success!',
        description: `Email sent to ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}`,
      })

      // Reset form
      setSelectedContacts([])
      setSelectedTemplate('')
      setEmailSubject('')
      setEmailBody('')
      
    } catch (error) {
      console.error('Error sending email:', error)
      toast({
        title: 'Error',
        description: 'Failed to send emails. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-main flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-main">
      <DashboardLayout user={user || undefined}>
        <div className="pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mx-4 md:mx-0 mb-8">
              <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
                Send Email
              </h1>
              <p className="text-text-secondary">
                Connect with your contacts through personalized emails
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-4 md:mx-0">
              {/* Email Composer */}
              <div className="lg:col-span-2 space-y-6">
                {/* Template Selection */}
                <Card className="bg-glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-action-purple" />
                      Email Template
                    </CardTitle>
                    <CardDescription>
                      Start with a template or write from scratch
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {templatesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : templates.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                        <p className="text-text-secondary mb-2">No templates available</p>
                        <p className="text-sm text-text-secondary">
                          Contact your admin to add email templates
                        </p>
                      </div>
                    ) : (
                      <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template or start blank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Start from scratch</SelectItem>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} ({template.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>

                {/* Email Content */}
                <Card className="bg-glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-action-coral" />
                      Email Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Enter email subject..."
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="body">Message</Label>
                      <Textarea
                        id="body"
                        placeholder="Write your email message..."
                        className="min-h-[300px]"
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recipients Selection */}
              <div className="space-y-6">
                <Card className="bg-glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-action-teal" />
                      Recipients
                    </CardTitle>
                    <CardDescription>
                      Select contacts to send this email to
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contactsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : contacts.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-text-secondary mb-4">No contacts yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/contacts')}
                        >
                          Add Contacts
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {contacts.map((contact) => (
                          <label
                            key={contact.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={selectedContacts.includes(contact.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedContacts([...selectedContacts, contact.id])
                                } else {
                                  setSelectedContacts(selectedContacts.filter(id => id !== contact.id))
                                }
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-text-primary">{contact.name}</p>
                              {contact.email && (
                                <p className="text-sm text-text-secondary">{contact.email}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {contacts.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-text-secondary">
                          {selectedContacts.length} of {contacts.length} selected
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Send Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSendEmail}
                  disabled={sending || selectedContacts.length === 0 || !emailSubject || !emailBody}
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  )
}
