# Network Marketing CRM - Troubleshooting Guide

## Current Issue: User Seeing Simple Signup Form

**Problem**: User sees only basic fields (First Name, Last Name, Email, Password) instead of comprehensive form with username, phone, etc.

### Immediate Steps

1. **Clear Browser Cache**
   - Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac) to hard refresh
   - Or go to browser settings and clear cache/cookies for the site
   - Try opening in incognito/private mode

2. **Check URL**
   - Make sure you're at the correct signup URL
   - Expected: `yoursite.com/signup` or `yoursite.com/(auth)/signup`

3. **Check Console for Errors**
   - Open F12 Developer Tools
   - Look for JavaScript errors preventing form from loading
   - Check Network tab for failed resource loads

### If Still Seeing Simple Form

The comprehensive signup form should include these fields:
- ✅ First Name *
- ✅ Last Name *  
- ✅ Email Address *
- ✅ Username * (with availability checking)
- ✅ Phone Number *
- ✅ Password *
- ✅ Confirm Password *
- ✅ Advanced Options (Company ID, Sponsor ID)

If you're still seeing the old form:

1. **Check if comprehensive form is deployed**:
   ```bash
   # In project directory
   git status
   git log --oneline -5
   ```

2. **Verify deployment status**:
   - Check if latest changes are pushed to GitHub
   - Verify Vercel/Netlify deployment completed successfully

3. **Temporary workaround**:
   - Use the login form if you already have an account
   - Contact support for manual account creation

### 500 Error on Signup

If getting "Database error saving new user" with 500 status:

1. **Check database connection**
2. **Verify all required tables exist**:
   - `members`
   - `member_profiles` 
   - `companies`
   - `member_activities`

3. **Check environment variables**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Realtime Issues

**Currently disabled** to focus on signup issues. Will re-enable after signup is working.

Symptoms of realtime issues:
- Infinite "Loading your success..." screens
- Multiple WebSocket connection errors
- Channel cleanup messages in console

### Recovery Steps

1. **If stuck on loading screen**:
   - Hard refresh the page (`Ctrl+Shift+R`)
   - Clear browser cache
   - Try incognito mode

2. **If login fails**:
   - Check credentials are correct
   - Try password reset if needed
   - Check if email verification is required

3. **Emergency access**:
   - Database admin can manually verify accounts
   - Check Supabase dashboard for user status

---

## Debug Checklist

- [ ] Hard refresh browser (`Ctrl+Shift+R`)
- [ ] Try incognito/private mode
- [ ] Check console for errors (F12)
- [ ] Verify correct URL
- [ ] Check if latest code is deployed
- [ ] Verify database tables exist
- [ ] Check environment variables
- [ ] Try different browser

## Contact Support

If none of these steps work:
1. Take screenshot of the signup form you see
2. Copy any console errors 
3. Note your browser and operating system
4. Report via GitHub issues or support channel

---
*Updated: December 2024* 