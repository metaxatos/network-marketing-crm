-- Migration to fix auth loading issues
-- Run this in your Supabase SQL editor

-- 1. Add missing columns to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'basic' CHECK (plan_type IN ('basic', 'premium', 'enterprise'));

-- 2. Add missing columns to members table  
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Update the default company
UPDATE public.companies 
SET slug = 'demo-company', plan_type = 'basic' 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 4. Create a unique index on company slug if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'companies_slug_key' AND n.nspname = 'public') THEN
        CREATE UNIQUE INDEX companies_slug_key ON public.companies(slug);
    END IF;
END $$;

-- 5. Update the trigger function to populate the name field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into members table
    INSERT INTO public.members (id, email, company_id, level, status, name)
    VALUES (
        NEW.id, 
        NEW.email,
        '00000000-0000-0000-0000-000000000001', -- Default to demo company
        1, 
        'active',
        COALESCE(
            NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name', '')), ''),
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')
        )
    );
    
    -- Insert into member_profiles table
    INSERT INTO public.member_profiles (member_id, first_name, last_name, preferences)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        '{
            "notifications_enabled": true,
            "email_reminders": true,
            "celebration_animations": true,
            "theme": "light"
        }'::jsonb
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update existing members that might be missing the name field
UPDATE public.members 
SET name = COALESCE(name, email, 'User ' || SUBSTRING(id::text, 1, 8))
WHERE name IS NULL OR name = '';

-- 7. Create a function to check auth context (for debugging)
CREATE OR REPLACE FUNCTION public.check_auth_uid()
RETURNS TABLE(current_user_id uuid, has_auth boolean) AS $$
BEGIN
    RETURN QUERY SELECT 
        auth.uid() as current_user_id,
        auth.uid() IS NOT NULL as has_auth;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Migration completed successfully! You can now test the auth fixes.' as status; 