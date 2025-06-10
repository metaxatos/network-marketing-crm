import { EmailTemplate } from '@/types'

// Default email templates for network marketing
export const DEFAULT_EMAIL_TEMPLATES: Omit<EmailTemplate, 'id' | 'company_id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Welcome New Contact',
    subject: 'Welcome to Our Amazing Community, {{firstName}}! 🎉',
    body_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; font-size: 28px; margin: 0;">Welcome to Our Team! 🌟</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #374151; font-size: 24px; margin-bottom: 20px;">Hi {{firstName}}!</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            I'm absolutely thrilled to welcome you to our incredible community! 🎊 You've just taken the first step toward something amazing.
          </p>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Here's what you can expect next:
          </p>
          
          <ul style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            <li>🎯 Personalized guidance to help you succeed</li>
            <li>🎓 Access to our exclusive training materials</li>
            <li>👥 Connection with our supportive community</li>
            <li>🚀 Opportunities to build your own success story</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{baseUrl}}/{{username}}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
              Get Started Now 🚀
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            I'm here to support you every step of the way. Feel free to reach out if you have any questions!
          </p>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            To your success,<br>
            <strong>{{senderName}}</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px;">
          <p style="color: #9ca3af; font-size: 14px;">
            You're receiving this because you showed interest in our opportunity.
          </p>
        </div>
      </div>
    `,
    body_text: `
Hi {{firstName}}!

I'm absolutely thrilled to welcome you to our incredible community! You've just taken the first step toward something amazing.

Here's what you can expect next:
• Personalized guidance to help you succeed
• Access to our exclusive training materials  
• Connection with our supportive community
• Opportunities to build your own success story

Get started now: {{baseUrl}}/{{username}}

I'm here to support you every step of the way. Feel free to reach out if you have any questions!

To your success,
{{senderName}}
    `,
    category: 'welcome',
    variables: ['firstName', 'senderName', 'username', 'baseUrl'],
    is_active: true,
  },
  
  {
    name: 'Follow Up - Day 3',
    subject: 'Quick Check-in: How Are You Doing, {{firstName}}? 💙',
    body_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 25px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; font-size: 24px; margin: 0;">Checking In With You 💙</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 20px;">Hi {{firstName}},</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            I wanted to reach out and see how you're settling in! It's been a few days since we connected, and I'm curious about your thoughts so far.
          </p>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            I know starting something new can feel overwhelming, but remember - every success story started with a single step. You've already taken that step! 🎉
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Quick Questions:</h3>
            <ul style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              <li>What questions do you have so far?</li>
              <li>Is there anything you'd like to learn more about?</li>
              <li>Would you like to schedule a quick chat?</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            I'm here to help make this journey as smooth and successful as possible for you. Don't hesitate to reply to this email or give me a call!
          </p>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Cheering you on,<br>
            <strong>{{senderName}}</strong>
          </p>
        </div>
      </div>
    `,
    body_text: `
Hi {{firstName}},

I wanted to reach out and see how you're settling in! It's been a few days since we connected, and I'm curious about your thoughts so far.

I know starting something new can feel overwhelming, but remember - every success story started with a single step. You've already taken that step!

Quick Questions:
• What questions do you have so far?
• Is there anything you'd like to learn more about?  
• Would you like to schedule a quick chat?

I'm here to help make this journey as smooth and successful as possible for you. Don't hesitate to reply to this email or give me a call!

Cheering you on,
{{senderName}}
    `,
    category: 'follow_up',
    variables: ['firstName', 'senderName'],
    is_active: true,
  },
  
  {
    name: 'Thank You - Post Meeting',
    subject: 'Thank You for Your Time Today! Next Steps Inside 🎯',
    body_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; font-size: 24px; margin: 0;">Thank You! 🙏</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 20px;">Hi {{firstName}},</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you so much for taking the time to chat with me today! I really enjoyed our conversation and I'm excited about the possibilities ahead.
          </p>
          
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
            <h3 style="color: #065f46; font-size: 18px; margin-bottom: 15px;">What We Discussed:</h3>
            <p style="color: #047857; font-size: 16px; line-height: 1.6; margin: 0;">
              {{meetingNotes}}
            </p>
          </div>
          
          <h3 style="color: #374151; font-size: 18px; margin: 25px 0 15px 0;">Next Steps:</h3>
          <ul style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            <li>✅ Review the information I'm sending you</li>
            <li>🎓 Watch the introductory training video</li>
            <li>📱 Join our private community group</li>
            <li>📅 Schedule our follow-up call for {{followUpDate}}</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resourceLink}}" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
              Access Your Resources 🎁
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            I'm here to support you every step of the way. If any questions come up before our next call, don't hesitate to reach out!
          </p>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            To your success,<br>
            <strong>{{senderName}}</strong>
          </p>
        </div>
      </div>
    `,
    body_text: `
Hi {{firstName}},

Thank you so much for taking the time to chat with me today! I really enjoyed our conversation and I'm excited about the possibilities ahead.

What We Discussed:
{{meetingNotes}}

Next Steps:
✅ Review the information I'm sending you
🎓 Watch the introductory training video  
📱 Join our private community group
📅 Schedule our follow-up call for {{followUpDate}}

Access your resources: {{resourceLink}}

I'm here to support you every step of the way. If any questions come up before our next call, don't hesitate to reach out!

To your success,
{{senderName}}
    `,
    category: 'thank_you',
    variables: ['firstName', 'senderName', 'meetingNotes', 'followUpDate', 'resourceLink'],
    is_active: true,
  },
  
  {
    name: 'Training Reminder',
    subject: 'Your Training Session Starts Soon! 🎓',
    body_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 25px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; font-size: 24px; margin: 0;">Training Time! 🎓</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 20px;">Hi {{firstName}},</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Just a friendly reminder that your training session "{{trainingTitle}}" starts in {{timeUntil}}!
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h3 style="color: #374151; font-size: 18px; margin-bottom: 10px;">📅 Session Details</h3>
            <p style="color: #6b7280; font-size: 16px; margin: 5px 0;"><strong>Topic:</strong> {{trainingTitle}}</p>
            <p style="color: #6b7280; font-size: 16px; margin: 5px 0;"><strong>Time:</strong> {{startTime}}</p>
            <p style="color: #6b7280; font-size: 16px; margin: 5px 0;"><strong>Duration:</strong> {{duration}}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{joinLink}}" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
              Join Training Now 🚀
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Can't make it? No worries! The recording will be available in your training dashboard within 24 hours.
          </p>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            See you there!<br>
            <strong>{{senderName}}</strong>
          </p>
        </div>
      </div>
    `,
    body_text: `
Hi {{firstName}},

Just a friendly reminder that your training session "{{trainingTitle}}" starts in {{timeUntil}}!

Session Details:
Topic: {{trainingTitle}}
Time: {{startTime}}
Duration: {{duration}}

Join here: {{joinLink}}

Can't make it? No worries! The recording will be available in your training dashboard within 24 hours.

See you there!
{{senderName}}
    `,
    category: 'training',
    variables: ['firstName', 'senderName', 'trainingTitle', 'timeUntil', 'startTime', 'duration', 'joinLink'],
    is_active: true,
  },
  
  {
    name: 'Personal Touch - Birthday',
    subject: 'Happy Birthday, {{firstName}}! 🎂🎉',
    body_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; font-size: 28px; margin: 0;">🎂 Happy Birthday! 🎉</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #374151; font-size: 24px; margin-bottom: 20px; text-align: center;">Happy Birthday, {{firstName}}! 🎈</h2>
          
          <p style="color: #6b7280; font-size: 18px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
            I hope your special day is filled with wonderful moments, laughter, and all your favorite things! 🌟
          </p>
          
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); padding: 25px; border-radius: 15px; margin: 25px 0; text-align: center;">
            <p style="color: #92400e; font-size: 20px; font-weight: bold; margin: 0;">
              🎁 Birthday Surprise Inside! 🎁
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            As a special birthday gift, I wanted to share something that might interest you - a little opportunity that's been creating some amazing results for people just like you.
          </p>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            No pressure at all - today is about celebrating YOU! But when you have a few minutes, I'd love to tell you about how {{birthdayGift}}.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{giftLink}}" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
              Unwrap Your Gift 🎁
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
            Wishing you the happiest of birthdays and an absolutely amazing year ahead!
          </p>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-top: 30px; text-align: center;">
            With birthday wishes,<br>
            <strong>{{senderName}}</strong> 🎂
          </p>
        </div>
      </div>
    `,
    body_text: `
Happy Birthday, {{firstName}}! 🎂🎉

I hope your special day is filled with wonderful moments, laughter, and all your favorite things!

🎁 Birthday Surprise Inside! 🎁

As a special birthday gift, I wanted to share something that might interest you - a little opportunity that's been creating some amazing results for people just like you.

No pressure at all - today is about celebrating YOU! But when you have a few minutes, I'd love to tell you about how {{birthdayGift}}.

Unwrap your gift: {{giftLink}}

Wishing you the happiest of birthdays and an absolutely amazing year ahead!

With birthday wishes,
{{senderName}} 🎂
    `,
    category: 'follow_up',
    variables: ['firstName', 'senderName', 'birthdayGift', 'giftLink'],
    is_active: true,
  },
]

// Function to create default templates for a company
export async function createDefaultTemplates(companyId: string) {
  // This would be implemented with Supabase insert
  return DEFAULT_EMAIL_TEMPLATES.map(template => ({
    ...template,
    id: crypto.randomUUID(),
    company_id: companyId,
    created_at: new Date().toISOString(),
  }))
} 