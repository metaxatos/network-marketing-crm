import { EmailTemplate } from '@/types'

// Default email templates for network marketing (simplified for migration)
export const DEFAULT_EMAIL_TEMPLATES: Omit<EmailTemplate, 'id' | 'company_id' | 'created_at' | 'updated_at'>[] = [
  {
    member_id: undefined,
    template_type: 'company',
    name: 'Welcome New Contact',
    subject: 'Welcome to Our Amazing Community, {{firstName}}! 🎉',
    body_html: '<p>Welcome {{firstName}}! We are excited to have you join our community.</p>',
    body_text: 'Welcome {{firstName}}! We are excited to have you join our community.',
    category: 'welcome',
    variables: ['firstName'],
    is_active: true,
  },
  {
    member_id: undefined,
    template_type: 'company',
    name: 'Follow Up - Day 3',
    subject: 'Quick Check-in: How Are You Doing, {{firstName}}? 💙',
    body_html: '<p>Hi {{firstName}}, checking in to see how you are doing!</p>',
    body_text: 'Hi {{firstName}}, checking in to see how you are doing!',
    category: 'follow_up',
    variables: ['firstName'],
    is_active: true,
  },
  {
    member_id: undefined,
    template_type: 'company',
    name: 'Thank You - Post Meeting',
    subject: 'Thank You for Your Time Today! Next Steps Inside 🎯',
    body_html: '<p>Thank you {{firstName}} for meeting with me today!</p>',
    body_text: 'Thank you {{firstName}} for meeting with me today!',
    category: 'thank_you',
    variables: ['firstName'],
    is_active: true,
  },
  {
    member_id: undefined,
    template_type: 'company',
    name: 'Training Invitation',
    subject: 'Exclusive Training Invitation for {{firstName}} 📚',
    body_html: '<p>Hi {{firstName}}, you are invited to our exclusive training!</p>',
    body_text: 'Hi {{firstName}}, you are invited to our exclusive training!',
    category: 'training',
    variables: ['firstName'],
    is_active: true,
  },
  {
    member_id: undefined,
    template_type: 'company',
    name: 'Follow Up - One Week',
    subject: 'One Week Check-in: Your Journey Continues, {{firstName}}! 🌟',
    body_html: '<p>Hi {{firstName}}, it has been one week since we last connected!</p>',
    body_text: 'Hi {{firstName}}, it has been one week since we last connected!',
    category: 'follow_up',
    variables: ['firstName'],
    is_active: true,
  },
]

// Define the template type for the DEFAULT_EMAIL_TEMPLATES
interface DefaultTemplateType {
  name: string
  subject: string
  body_html: string
  body_text: string
  category: string
  variables: string[]
  is_active: boolean
}

// Function to create default templates for a company
export async function createDefaultTemplates(companyId: string) {
  return DEFAULT_EMAIL_TEMPLATES.map((template) => ({
    ...template,
    id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    company_id: companyId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
} 