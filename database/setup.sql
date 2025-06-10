-- Network Marketing CRM Database Setup
-- Run this in your Supabase SQL editor to set up the basic tables

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create members table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    company_id UUID,
    level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    sponsor_id UUID REFERENCES public.members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member profiles table
CREATE TABLE IF NOT EXISTS public.member_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'customer', 'team_member', 'inactive')),
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table (for the events system we built)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('team_meeting', 'opportunity_presentation', 'product_presentation', 'training_workshop', 'local_meetup', 'national_event', 'company_event')),
    format TEXT NOT NULL CHECK (format IN ('online', 'in_person')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    meeting_url TEXT,
    meeting_platform TEXT DEFAULT 'jitsi',
    max_attendees INTEGER,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no_show', 'cancelled')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, member_id)
);

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Members policies
CREATE POLICY "Users can view their own member record" ON public.members
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own member record" ON public.members
    FOR UPDATE USING (auth.uid() = id);

-- Member profiles policies
CREATE POLICY "Users can view their own profile" ON public.member_profiles
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own profile" ON public.member_profiles
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own profile" ON public.member_profiles
    FOR UPDATE USING (auth.uid() = member_id);

-- Contacts policies
CREATE POLICY "Users can view their own contacts" ON public.contacts
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own contacts" ON public.contacts
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own contacts" ON public.contacts
    FOR UPDATE USING (auth.uid() = member_id);

CREATE POLICY "Users can delete their own contacts" ON public.contacts
    FOR DELETE USING (auth.uid() = member_id);

-- Events policies
CREATE POLICY "Users can view public events and their own events" ON public.events
    FOR SELECT USING (is_public = true OR auth.uid() = member_id);

CREATE POLICY "Users can insert their own events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (auth.uid() = member_id);

CREATE POLICY "Users can delete their own events" ON public.events
    FOR DELETE USING (auth.uid() = member_id);

-- Event registrations policies
CREATE POLICY "Users can view registrations for their events or their own registrations" ON public.event_registrations
    FOR SELECT USING (
        auth.uid() = member_id OR 
        auth.uid() IN (SELECT member_id FROM public.events WHERE id = event_id)
    );

CREATE POLICY "Users can register for events" ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own registrations" ON public.event_registrations
    FOR UPDATE USING (auth.uid() = member_id);

CREATE POLICY "Users can cancel their own registrations" ON public.event_registrations
    FOR DELETE USING (auth.uid() = member_id);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into members table
    INSERT INTO public.members (id, level, status)
    VALUES (NEW.id, 1, 'active');
    
    -- Insert into member_profiles table
    INSERT INTO public.member_profiles (member_id, first_name, last_name, preferences)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
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

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.members
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.member_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_company_id ON public.members(company_id);
CREATE INDEX IF NOT EXISTS idx_members_sponsor_id ON public.members(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_member_profiles_member_id ON public.member_profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_contacts_member_id ON public.contacts(member_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_events_member_id ON public.events(member_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_member_id ON public.event_registrations(member_id);

-- Insert some sample data (optional)
-- You can uncomment this if you want some test data

/*
-- Sample company (you can update this with your actual company info)
INSERT INTO public.companies (id, name, description) VALUES 
('00000000-0000-0000-0000-000000000000', 'Demo Company', 'Sample company for testing')
ON CONFLICT (id) DO NOTHING;
*/ 