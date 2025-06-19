-- Migration to fix signup issues and implement migration plan changes
-- Run this in Supabase SQL editor

-- 1. Update companies table structure
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'basic' CHECK (plan_type IN ('basic', 'premium', 'enterprise'));

-- Create unique index for slug if it doesn't exist  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'companies' AND indexname = 'companies_slug_key') THEN
        CREATE UNIQUE INDEX companies_slug_key ON public.companies(slug);
    END IF;
END $$;

-- 2. Update members table to include profile fields (migration plan consolidation)
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications_enabled": true, "email_reminders": true, "celebration_animations": true, "theme": "auto"}'::jsonb;

-- Make username unique if not already
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'members' AND indexname = 'members_username_key') THEN
        CREATE UNIQUE INDEX members_username_key ON public.members(username) WHERE username IS NOT NULL;
    END IF;
END $$;

-- 3. Fix companies RLS policies for public signup access
DROP POLICY IF EXISTS "Members can view their company" ON public.companies;
DROP POLICY IF EXISTS "Public can view companies for signup" ON public.companies;

-- Allow public read access for signup
CREATE POLICY "Public can view companies for signup" ON public.companies
    FOR SELECT USING (true);

-- 4. Ensure default company exists
INSERT INTO public.companies (id, name, slug, description, plan_type) VALUES 
('00000000-0000-0000-0000-000000000001', 'Demo Company', 'demo-company', 'Default company for new users', 'basic')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  plan_type = EXCLUDED.plan_type;

-- 5. Migrate existing member_profiles data to members table (if member_profiles exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'member_profiles') THEN
        -- Copy data from member_profiles to members
        UPDATE public.members m 
        SET 
            first_name = COALESCE(m.first_name, mp.first_name),
            last_name = COALESCE(m.last_name, mp.last_name),
            bio = COALESCE(m.bio, mp.bio),
            timezone = COALESCE(m.timezone, mp.timezone),
            preferences = COALESCE(m.preferences, mp.preferences),
            avatar_url = COALESCE(m.avatar_url, mp.avatar_url)
        FROM public.member_profiles mp
        WHERE m.id = mp.member_id;
        
        -- Update name field if empty
        UPDATE public.members 
        SET name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
        WHERE (name IS NULL OR name = '') AND (first_name IS NOT NULL OR last_name IS NOT NULL);
    END IF;
END $$;

-- 6. Update the handle_new_user function to use consolidated members table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into members table with all profile data inline
    INSERT INTO public.members (
        id, 
        email, 
        company_id, 
        first_name,
        last_name,
        name,
        level, 
        status,
        preferences
    )
    VALUES (
        NEW.id, 
        NEW.email,
        '00000000-0000-0000-0000-000000000001', -- Default to demo company
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        COALESCE(
            NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')), ''),
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')
        ),
        1, 
        'active',
        '{"notifications_enabled": true, "email_reminders": true, "celebration_animations": true, "theme": "auto"}'::jsonb
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
SELECT 'Migration completed successfully! Companies should now be accessible during signup.' as result; 