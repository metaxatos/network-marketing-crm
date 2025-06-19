# Signup Company Dropdown Fixes & Migration Plan Updates

## 🚨 Issues Fixed

### 1. Company Dropdown Not Working
**Problem**: Sign up page company dropdown was empty due to RLS (Row Level Security) policies blocking access.

**Root Cause**: Companies table had restrictive RLS policy that only allowed viewing if user was already authenticated and had a company_id - creating a chicken-and-egg problem during signup.

**Solution**: Updated RLS policy to allow public read access for signup:
```sql
CREATE POLICY "Public can view companies for signup" ON public.companies
    FOR SELECT USING (true);
```

### 2. Migration Plan Implementation  
**Problem**: Database schema still used old structure with separate `member_profiles` table.

**Solution**: Consolidated `member_profiles` into `members` table as specified in migration plan:
- Added `first_name`, `last_name`, `bio`, `timezone`, `preferences` to members table
- Updated signup API to use consolidated structure
- Updated user store to remove profile dependency
- Made username unique

## 📝 Files Updated

### API Routes
1. **`src/app/api/companies/route.ts`**
   - Added fallback for RLS issues
   - Auto-creates default company if none exist
   - Better error handling and logging

2. **`src/app/api/auth/signup/route.ts`**
   - Updated to use consolidated members table
   - Added sponsor_id support
   - Consolidated profile data into members table
   - Removed dependency on member_profiles

### Database Schema
1. **`database/setup.sql`**
   - Updated members table with profile fields
   - Fixed companies RLS policy for public access
   - Updated trigger function for consolidated structure

2. **`database/migration-fix-auth.sql`**
   - Complete migration script for existing databases
   - Migrates member_profiles data to members
   - Creates proper indexes and policies
   - Ensures default company exists

### Store & State Management
1. **`src/stores/userStore.ts`**
   - Removed profile dependency
   - Simplified member data fetching  
   - Updated to use consolidated member structure
   - Improved error handling

## 🗄️ Database Changes Applied

### Members Table Updates
```sql
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications_enabled": true, "email_reminders": true, "celebration_animations": true, "theme": "auto"}'::jsonb;

-- Make username unique
CREATE UNIQUE INDEX members_username_key ON public.members(username) WHERE username IS NOT NULL;
```

### Companies Table & RLS
```sql
-- Allow public access for signup
CREATE POLICY "Public can view companies for signup" ON public.companies
    FOR SELECT USING (true);

-- Ensure default company exists
INSERT INTO public.companies (id, name, slug, description, plan_type) VALUES 
('00000000-0000-0000-0000-000000000001', 'Demo Company', 'demo-company', 'Default company for new users', 'basic')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
```

## ✅ Migration Plan Compliance

According to the MigrationPlan.md, these tables were consolidated:

### ✅ COMPLETED
- [x] `member_profiles` → merged into `members` 
- [x] Updated signup API to use consolidated structure
- [x] Updated user store to remove profile dependency
- [x] Fixed companies RLS for public signup access
- [x] TypeScript types already match migration plan

### 📋 To Apply Migration
To apply these changes to your Supabase database:

1. **Open Supabase SQL Editor**
2. **Run the migration script**: `database/migration-fix-auth.sql`
3. **Verify companies are accessible**: Test signup page

## 🧪 Testing

### Test Company Dropdown
1. Go to `/auth/signup`
2. Company dropdown should now populate with "Demo Company"
3. Signup should work end-to-end

### Test Updated Signup Flow
1. Fill out signup form with all fields
2. Select a company from dropdown
3. Submit form
4. Should redirect to dashboard successfully

## 🚀 What's Next

The signup page and companies dropdown should now work correctly! The migration plan consolidation is complete for the members/profiles structure.

### Additional Migration Tasks (if needed)
If you want to complete the full migration plan, you may also want to:
- Remove old `member_profiles` table after data migration
- Update any remaining references to old table structures
- Apply other table consolidations mentioned in migration plan

## 🔧 Troubleshooting

### If companies still don't load:
1. Check Supabase SQL editor for RLS policies
2. Verify default company exists in companies table
3. Check browser console for API errors

### If signup still fails:
1. Check member creation in members table
2. Verify all required fields are present
3. Check Supabase auth logs for errors 