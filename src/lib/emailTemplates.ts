import { EmailTemplate } from '@/types'

// Default email templates for network marketing
export const DEFAULT_EMAIL_TEMPLATES = [
  {
    name: 'Welcome New Contact',
    subject: 'Welcome to Our Amazing Community, {{firstName}}! 🎉',
    body_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
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
      </div>
    `,
    body_text: `Hi {{firstName}}!

I'm absolutely thrilled to welcome you to our incredible community! You've just taken the first step toward something amazing.

Here's what you can expect next:
• Personalized guidance to help you succeed
• Access to our exclusive training materials  
• Connection with our supportive community
• Opportunities to build your own success story

Get started now: {{baseUrl}}/{{username}}

I'm here to support you every step of the way. Feel free to reach out if you have any questions!

To your success,
{{senderName}}`,
    category: 'welcome',
    variables: ['firstName', 'senderName', 'username', 'baseUrl'],
    is_active: true,
  },
  
  {
    name: 'Follow Up - Day 3',
    subject: 'Quick Check-in: How Are You Doing, {{firstName}}? 💙',
    body_html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 25px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; font-size: 24px; margin: 0;">Checking In With You 💙</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #374151; font-size: 20px; margin-bottom: 20px;">Hi {{firstName}},</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            I wanted to reach out and see how you're settling in! It's been a few days since we connected.
          </p>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            I know starting something new can feel overwhelming, but remember - every success story started with a single step. You've already taken that step! 🎉
          </p>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            I'm here to help make this journey as smooth and successful as possible for you. Don't hesitate to reply!
          </p>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Cheering you on,<br>
            <strong>{{senderName}}</strong>
          </p>
        </div>
      </div>
    `,
    body_text: `Hi {{firstName}},

I wanted to reach out and see how you're settling in! It's been a few days since we connected.

I know starting something new can feel overwhelming, but remember - every success story started with a single step. You've already taken that step!

I'm here to help make this journey as smooth and successful as possible for you. Don't hesitate to reply!

Cheering you on,
{{senderName}}`,
    category: 'follow_up',
    variables: ['firstName', 'senderName'],
    is_active: true,
  },
] as any 