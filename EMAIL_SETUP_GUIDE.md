# Email Setup Guide - Resend Integration

## 🎯 Current Status

Your email templates are now loading correctly, but emails are not being sent because **Resend API is not configured**.

## 🔧 Step-by-Step Setup

### 1. Get Resend API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Sign up/Login to your account
3. Create a new API key:
   - Name: "OurTeam Production"
   - Permission: "Sending access"
4. Copy the API key (starts with `re_`)

### 2. Verify Your Domain (Important!)

1. In Resend dashboard, go to [Domains](https://resend.com/domains)
2. Add your domain: `ourteam.gr`
3. Follow their DNS setup instructions to verify ownership
4. Once verified, you can send from `noreply@ourteam.gr`

### 3. Add Environment Variable to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site "ourteammlm"
3. Go to **Site configuration** → **Environment variables**
4. Click **"Add a variable"**
5. Add:
   ```
   Key: RESEND_API_KEY
   Value: [your API key from step 1]
   ```
6. Click **Save**

### 4. Optional: Custom From Email

If you want to use a custom email address:
1. Add another environment variable:
   ```
   Key: RESEND_FROM_EMAIL
   Value: noreply@yourcompany.com
   ```

### 5. Deploy and Test

1. After adding the environment variable, trigger a new deploy:
   - Go to **Deploys** tab in Netlify
   - Click **"Trigger deploy"** → **"Deploy site"**

2. Wait for deployment (2-3 minutes)

3. Test the configuration:
   - Visit: `https://ourteam.gr/api/emails/config`
   - Should show: `"resend_configured": true`

4. Test sending an email:
   - Go to your emails page
   - Select a template and contact
   - Send a test email

## 🐛 Troubleshooting

### Check Configuration Status
Visit: `https://ourteam.gr/api/emails/config`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "resend_configured": true,
    "from_email": "noreply@ourteam.gr",
    "environment": "production",
    "message": "Email service is properly configured"
  }
}
```

### Check Email Send Logs
After attempting to send an email, check the Netlify function logs:
1. Go to Netlify Dashboard → Your Site → Functions
2. Look for recent function executions
3. Check logs for any error messages

### Common Issues

1. **Domain Not Verified**: Emails will fail if `ourteam.gr` is not verified in Resend
2. **Wrong API Key**: Make sure you copied the full API key starting with `re_`
3. **Environment Variable Not Set**: Ensure the variable is added in Netlify and deployment is complete

## 📧 Email Flow

1. User selects template and contacts
2. API creates communication records in database
3. API calls Resend to send emails
4. Communication records updated with status (sent/failed)
5. User sees confirmation message

## 🔍 Current Implementation

- ✅ Email templates loading correctly
- ✅ Contact selection working
- ✅ Database communication records created
- ✅ Resend integration code implemented
- ❌ **Missing**: RESEND_API_KEY environment variable
- ❌ **Missing**: Domain verification in Resend

## 📋 Next Steps

1. Set up Resend account and domain verification
2. Add RESEND_API_KEY to Netlify environment variables
3. Deploy and test email sending
4. Monitor email delivery rates and troubleshoot any issues

Once completed, your email system will be fully functional! 🚀 