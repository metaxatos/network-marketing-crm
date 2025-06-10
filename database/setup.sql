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

-- Create training courses table
CREATE TABLE IF NOT EXISTS public.training_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course modules table
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course lessons table
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    video_platform TEXT DEFAULT 'youtube' CHECK (video_platform IN ('youtube', 'vimeo', 'wistia')),
    duration_seconds INTEGER,
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create member course progress table
CREATE TABLE IF NOT EXISTS public.member_course_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE NOT NULL,
    completion_percentage FLOAT DEFAULT 0.0,
    last_video_id UUID REFERENCES public.course_lessons(id),
    last_position_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, course_id)
);

-- Create lesson progress table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
    watch_time_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

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

-- Training courses policies (public read for company members)
CREATE POLICY "Members can view courses for their company" ON public.training_courses
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.members WHERE id = auth.uid())
        OR company_id IS NULL
    );

-- Course modules policies
CREATE POLICY "Members can view published modules" ON public.course_modules
    FOR SELECT USING (
        is_published = true AND
        course_id IN (
            SELECT id FROM public.training_courses
            WHERE company_id IN (SELECT company_id FROM public.members WHERE id = auth.uid())
            OR company_id IS NULL
        )
    );

-- Course lessons policies
CREATE POLICY "Members can view published lessons" ON public.course_lessons
    FOR SELECT USING (
        is_published = true AND
        module_id IN (
            SELECT cm.id FROM public.course_modules cm
            JOIN public.training_courses tc ON cm.course_id = tc.id
            WHERE cm.is_published = true
            AND (tc.company_id IN (SELECT company_id FROM public.members WHERE id = auth.uid())
                 OR tc.company_id IS NULL)
        )
    );

-- Member course progress policies
CREATE POLICY "Users can view their own course progress" ON public.member_course_progress
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own course progress" ON public.member_course_progress
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own course progress" ON public.member_course_progress
    FOR UPDATE USING (auth.uid() = member_id);

-- Lesson progress policies
CREATE POLICY "Users can view their own lesson progress" ON public.lesson_progress
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own lesson progress" ON public.lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own lesson progress" ON public.lesson_progress
    FOR UPDATE USING (auth.uid() = member_id);

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

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.training_courses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.course_modules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.course_lessons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.member_course_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.lesson_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_company_id ON public.members(company_id);
CREATE INDEX IF NOT EXISTS idx_member_profiles_member_id ON public.member_profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_contacts_member_id ON public.contacts(member_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_events_member_id ON public.events(member_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_member_id ON public.event_registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_training_courses_company_id ON public.training_courses(company_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_member_course_progress_member_id ON public.member_course_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_member_course_progress_course_id ON public.member_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_member_id ON public.lesson_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);

-- Insert sample training courses (optional - for demo purposes)
INSERT INTO public.training_courses (title, description, duration_minutes, order_index, is_required) VALUES
('Network Marketing Fundamentals', 'Master the basics of network marketing and build a solid foundation for your business success.', 150, 1, true),
('Advanced Sales Strategies', 'Learn proven sales techniques and closing strategies that top performers use to maximize their results.', 195, 2, false),
('Building Your Team', 'Discover how to recruit, train, and motivate a high-performing team that drives exponential growth.', 260, 3, false),
('Digital Marketing Mastery', 'Leverage social media and digital tools to build your brand and attract qualified prospects online.', 225, 4, false)
ON CONFLICT DO NOTHING; 