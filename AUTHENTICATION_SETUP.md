# Authentication Setup Guide

## Overview
Your Network Marketing CRM now has a complete authentication system powered by Supabase. This guide will help you set up the database and start using the authentication features.

## Features Implemented

### ✅ Authentication Pages
- **Login Page** (`/auth/login`) - Sign in with email/password
- **Signup Page** (`/auth/signup`) - Create new account with email confirmation
- **Forgot Password** (`/auth/forgot-password`) - Request password reset
- **Reset Password** (`/auth/reset-password`) - Set new password from email link

### ✅ Authentication Features
- Email/password authentication
- Email confirmation for new accounts
- Password reset via email
- Automatic redirects for authenticated/unauthenticated users
- Session management with automatic refresh
- Route protection middleware

### ✅ User Experience
- Celebration-focused UI consistent with your app theme
- Loading states and error handling
- Mobile-responsive design
- Logout functionality in dashboard
- Personalized greetings using user's first name

## Database Setup

### Step 1: Run the Database Setup Script
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/setup.sql`
4. Run the script to create all necessary tables and policies

### Step 2: Configure Email Templates (Optional)
1. In Supabase dashboard, go to Authentication > Email Templates
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link (if you want to add this later)

## Environment Variables
Your app is already configured with the necessary environment variables in `src/lib/config.ts`:

```typescript
database: {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://utvasathtyasoxelnxuf.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
}
```

## How to Test

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Create a New Account
1. Navigate to `http://localhost:3001` (or your dev URL)
2. You'll be redirected to `/auth/login`
3. Click "Start Your Journey" to go to signup
4. Fill out the signup form with:
   - First Name
   - Last Name  
   - Email
   - Password (minimum 6 characters)
5. Check your email for confirmation link (if email confirmation is enabled)
6. Once confirmed, you'll be redirected to the dashboard

### 3. Test Login
1. Go to `/auth/login`
2. Enter your email and password
3. You should be redirected to `/dashboard`
4. You'll see a personalized greeting with your first name
5. Test the logout button in the top-right corner

### 4. Test Password Reset
1. Go to `/auth/forgot-password`
2. Enter your email address
3. Check your email for reset link
4. Click the link to set a new password
5. You'll be redirected to dashboard after successful reset

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Signup page
│   │   ├── forgot-password/page.tsx # Forgot password
│   │   └── reset-password/page.tsx  # Reset password
│   ├── dashboard/page.tsx          # Protected dashboard
│   ├── layout.tsx                  # Root layout with AuthProvider
│   └── page.tsx                    # Home page with auth redirects
├── components/
│   └── auth/
│       └── LogoutButton.tsx        # Logout component
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   └── server.ts              # Server Supabase client
│   ├── supabase.ts                # Main Supabase client
│   └── config.ts                  # App configuration
├── providers/
│   └── AuthProvider.tsx           # Authentication context
└── middleware.ts                  # Route protection middleware
```

## Security Features

### Row Level Security (RLS)
- All database tables have RLS enabled
- Users can only access their own data
- Automatic profile creation on signup
- Secure password reset flow

### Route Protection
- Middleware protects all dashboard routes
- Automatic redirects for unauthenticated users
- Session validation on every request

### Data Privacy
- User data is isolated by user ID
- No cross-user data access
- Secure session management

## Next Steps

### 1. Customize Email Templates
- Update Supabase email templates with your branding
- Add your company logo and colors
- Customize the email content

### 2. Add Social Authentication (Optional)
- Configure Google, Facebook, or other providers in Supabase
- Add social login buttons to your auth pages

### 3. Implement Profile Management
- Create a profile settings page
- Allow users to update their information
- Add avatar upload functionality

### 4. Connect to Real Data
- Update the events system to use real Supabase data
- Replace mock data with actual database queries
- Implement real-time features with Supabase subscriptions

## Troubleshooting

### Common Issues

1. **"Invalid login credentials"**
   - Make sure the user has confirmed their email
   - Check if the password is correct
   - Verify the user exists in Supabase Auth

2. **Redirect loops**
   - Clear browser cookies and localStorage
   - Check middleware configuration
   - Verify Supabase URL and keys

3. **Email not sending**
   - Check Supabase email settings
   - Verify SMTP configuration
   - Check spam folder

4. **Database errors**
   - Ensure the setup script ran successfully
   - Check RLS policies are enabled
   - Verify table permissions

### Getting Help
- Check Supabase documentation: https://supabase.com/docs
- Review the console for error messages
- Test with Supabase's built-in auth UI first

## Success! 🎉
Your authentication system is now fully operational. Users can sign up, log in, reset passwords, and access the protected dashboard. The system automatically creates user profiles and maintains secure sessions across the application. 