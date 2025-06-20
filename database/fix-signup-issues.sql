-- Fix signup issues: RLS infinite recursion and missing columns
-- Run this in Supabase SQL editor

-- 1. First, disable RLS temporarily and fix members table structure
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;

-- Ensure all required columns exist in members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications_enabled": true, "email_reminders": true, "celebration_animations": true, "theme": "auto"}'::jsonb;

-- 2. Drop all existing RLS policies on members to avoid infinite recursion
DROP POLICY IF EXISTS "Members can view their own profile" ON public.members;
DROP POLICY IF EXISTS "Members can update their own profile" ON public.members;
DROP POLICY IF EXISTS "Users can view their member profile" ON public.members;
DROP POLICY IF EXISTS "Users can update their member profile" ON public.members;
DROP POLICY IF EXISTS "Members can view members in same company" ON public.members;
DROP POLICY IF EXISTS "Users can insert their own member profile" ON public.members;

-- 3. Create simple, non-recursive RLS policies
CREATE POLICY "Enable read access for authenticated users" ON public.members
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Enable insert for authenticated users" ON public.members
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Enable update for users based on id" ON public.members
    FOR UPDATE USING (auth.uid()::text = id::text);

-- 4. Re-enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 5. Fix companies RLS policies (ensure public access for signup)
DROP POLICY IF EXISTS "Members can view their company" ON public.companies;
DROP POLICY IF EXISTS "Public can view companies for signup" ON public.companies;

CREATE POLICY "Public can view companies for signup" ON public.companies
    FOR SELECT USING (true);

-- 6. Ensure username checking works - create a simple policy for username checks
-- Create a function for safe username checking
CREATE OR REPLACE FUNCTION public.check_username_availability(username_to_check text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT NOT EXISTS (
        SELECT 1 FROM public.members 
        WHERE username = username_to_check
    );
$$;

-- Grant execute permission to anon
GRANT EXECUTE ON FUNCTION public.check_username_availability(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_username_availability(text) TO authenticated;

-- 7. Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 8. Create default companies if they don't exist
INSERT INTO public.companies (id, name, slug, description, plan_type) VALUES 
('00000000-0000-0000-0000-000000000001', 'Demo Company', 'demo-company', 'Default company for new users', 'basic'),
('00000000-0000-0000-0000-000000000002', 'Neumi', 'neumi', 'Network marketing company', 'premium'),
('00000000-0000-0000-0000-000000000003', 'Acme Corp', 'acme-corp', 'Sample company for testing', 'basic')
ON CONFLICT (id) DO NOTHING;

-- 9. Update the user creation trigger to handle the new structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into members table with consolidated profile fields
    INSERT INTO public.members (
        id, 
        email, 
        company_id, 
        first_name,
        last_name,
        name,
        username,
        level, 
        status,
        preferences
    )
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(
            (NEW.raw_user_meta_data->>'company_id')::uuid,
            '00000000-0000-0000-0000-000000000001'
        ),
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        COALESCE(
            NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')), ''),
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')
        ),
        NEW.raw_user_meta_data->>'username',
        1, 
        'active',
        '{"notifications_enabled": true, "email_reminders": true, "celebration_animations": true, "theme": "auto"}'::jsonb
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
SELECT 'Signup issues fixed! RLS policies simplified, columns added, schema cache refreshed.' as result; 