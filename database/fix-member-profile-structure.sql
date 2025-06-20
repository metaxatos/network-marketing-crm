-- Fix Member Profile Structure Issues
-- Run this in Supabase SQL editor to resolve schema inconsistencies

-- 1. Update existing members to have first_name/last_name from name field
UPDATE public.members 
SET 
  first_name = split_part(name, ' ', 1),
  last_name = CASE 
    WHEN position(' ' in name) > 0 THEN split_part(name, ' ', 2)
    ELSE NULL
  END
WHERE 
  first_name IS NULL 
  AND name IS NOT NULL 
  AND name != '';

-- 2. Ensure all members have proper email format
UPDATE public.members 
SET email = lower(trim(email))
WHERE email IS NOT NULL;

-- 3. Find and report orphaned auth users
SELECT 
  'Orphaned Auth Users' as issue_type,
  u.id,
  u.email,
  u.created_at,
  'User exists in auth.users but not in members table' as description
FROM auth.users u 
LEFT JOIN public.members m ON u.id = m.id 
WHERE m.id IS NULL;

-- 4. Find and report orphaned member records (shouldn't exist but good to check)
SELECT 
  'Orphaned Member Records' as issue_type,
  m.id,
  m.email,
  m.created_at,
  'Member exists but no corresponding auth user' as description
FROM public.members m 
LEFT JOIN auth.users u ON m.id = u.id 
WHERE u.id IS NULL;

-- 5. Check for members with incomplete profiles
SELECT 
  'Incomplete Member Profiles' as issue_type,
  id,
  email,
  CASE 
    WHEN first_name IS NULL OR first_name = '' THEN 'Missing first_name; '
    ELSE ''
  END ||
  CASE 
    WHEN last_name IS NULL OR last_name = '' THEN 'Missing last_name; '
    ELSE ''
  END ||
  CASE 
    WHEN status IS NULL THEN 'Missing status; '
    ELSE ''
  END as missing_fields
FROM public.members 
WHERE 
  first_name IS NULL OR first_name = '' OR
  last_name IS NULL OR last_name = '' OR
  status IS NULL;

-- 6. Ensure all members have active status if not specified
UPDATE public.members 
SET status = 'active' 
WHERE status IS NULL;

-- 7. Ensure all members have level set
UPDATE public.members 
SET level = 0 
WHERE level IS NULL;

-- 8. Add default preferences for members missing them
UPDATE public.members 
SET preferences = '{"notifications_enabled": true, "email_reminders": true, "celebration_animations": true, "theme": "auto"}'::jsonb
WHERE preferences IS NULL OR preferences = '{}'::jsonb;

-- 9. Summary report
SELECT 
  'Database Health Summary' as report_type,
  COUNT(*) as total_members,
  COUNT(CASE WHEN first_name IS NOT NULL AND first_name != '' THEN 1 END) as with_first_name,
  COUNT(CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 1 END) as with_last_name,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_members,
  COUNT(CASE WHEN preferences IS NOT NULL AND preferences != '{}'::jsonb THEN 1 END) as with_preferences
FROM public.members;

-- 10. Check for duplicate emails
SELECT 
  email,
  COUNT(*) as count,
  'Duplicate email addresses detected' as issue
FROM public.members 
WHERE email IS NOT NULL
GROUP BY email 
HAVING COUNT(*) > 1; 