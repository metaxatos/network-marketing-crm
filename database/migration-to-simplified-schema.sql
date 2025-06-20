-- Migration to Simplified Schema (10 tables)
-- This implements the new simplified structure that the application code expects

-- First, create the new tables that are missing

-- 1. Communications table (consolidates sent_emails, email_clicks, contact_interactions)
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'call', 'text', 'meeting', 'note')),
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    content TEXT,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'completed')),
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Training Videos table (flattened from courses/modules/lessons)
CREATE TABLE IF NOT EXISTS public.training_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    duration_minutes INTEGER,
    category VARCHAR(100),
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 10),
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Member Progress table (simplified from lesson_progress/course_progress)
CREATE TABLE IF NOT EXISTS public.member_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.training_videos(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed BOOLEAN DEFAULT false,
    last_position_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, video_id)
);

-- 4. Email Templates table (enhanced to support personal templates)
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for global templates
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Landing Pages table (simplified)
CREATE TABLE IF NOT EXISTS public.landing_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing tables

-- Add notes column to contacts (consolidates contact_notes)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'notes') THEN
        ALTER TABLE public.contacts ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Add company_id to contacts if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'company_id') THEN
        ALTER TABLE public.contacts ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Update members table to include profile fields directly
DO $$ 
BEGIN
    -- Add first_name if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'first_name') THEN
        ALTER TABLE public.members ADD COLUMN first_name VARCHAR(100);
    END IF;
    
    -- Add last_name if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'last_name') THEN
        ALTER TABLE public.members ADD COLUMN last_name VARCHAR(100);
    END IF;
    
    -- Add name if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'name') THEN
        ALTER TABLE public.members ADD COLUMN name VARCHAR(200);
    END IF;
    
    -- Add preferences if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'preferences') THEN
        ALTER TABLE public.members ADD COLUMN preferences JSONB DEFAULT '{"notifications_enabled": true, "email_reminders": true}';
    END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables

-- Communications policies
CREATE POLICY "Users can view their own communications" ON public.communications
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own communications" ON public.communications
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own communications" ON public.communications
    FOR UPDATE USING (auth.uid() = member_id);

CREATE POLICY "Users can delete their own communications" ON public.communications
    FOR DELETE USING (auth.uid() = member_id);

-- Training Videos policies
CREATE POLICY "Members can view published videos for their company" ON public.training_videos
    FOR SELECT USING (
        is_published = true AND
        (company_id IN (SELECT company_id FROM public.members WHERE id = auth.uid()) OR company_id IS NULL)
    );

-- Member Progress policies
CREATE POLICY "Users can view their own progress" ON public.member_progress
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own progress" ON public.member_progress
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own progress" ON public.member_progress
    FOR UPDATE USING (auth.uid() = member_id);

-- Email Templates policies
CREATE POLICY "Users can view global and their own templates" ON public.email_templates
    FOR SELECT USING (
        member_id IS NULL OR auth.uid() = member_id OR
        company_id IN (SELECT company_id FROM public.members WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert their own templates" ON public.email_templates
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own templates" ON public.email_templates
    FOR UPDATE USING (auth.uid() = member_id);

CREATE POLICY "Users can delete their own templates" ON public.email_templates
    FOR DELETE USING (auth.uid() = member_id);

-- Landing Pages policies
CREATE POLICY "Users can view public landing pages" ON public.landing_pages
    FOR SELECT USING (is_published = true);

CREATE POLICY "Users can view their own landing pages" ON public.landing_pages
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own landing pages" ON public.landing_pages
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own landing pages" ON public.landing_pages
    FOR UPDATE USING (auth.uid() = member_id);

CREATE POLICY "Users can delete their own landing pages" ON public.landing_pages
    FOR DELETE USING (auth.uid() = member_id);

-- Add updated_at triggers for new tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.communications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.training_videos
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.member_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.email_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.landing_pages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_communications_member_id ON public.communications(member_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON public.communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_contact_id ON public.communications(contact_id);
CREATE INDEX IF NOT EXISTS idx_communications_sent_at ON public.communications(sent_at);

CREATE INDEX IF NOT EXISTS idx_training_videos_company_id ON public.training_videos(company_id);
CREATE INDEX IF NOT EXISTS idx_training_videos_category ON public.training_videos(category);
CREATE INDEX IF NOT EXISTS idx_training_videos_published ON public.training_videos(is_published);

CREATE INDEX IF NOT EXISTS idx_member_progress_member_id ON public.member_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_member_progress_video_id ON public.member_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_member_progress_completed ON public.member_progress(completed);

CREATE INDEX IF NOT EXISTS idx_email_templates_member_id ON public.email_templates(member_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_company_id ON public.email_templates(company_id);

CREATE INDEX IF NOT EXISTS idx_landing_pages_member_id ON public.landing_pages(member_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON public.landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_published ON public.landing_pages(is_published);

-- Create some sample training videos for testing
INSERT INTO public.training_videos (company_id, title, description, category, level, is_published, duration_minutes, order_index)
VALUES 
    (NULL, 'Getting Started with Network Marketing', 'Learn the basics of building your network marketing business', 'Basics', 1, true, 15, 1),
    (NULL, 'Effective Communication Skills', 'Master the art of connecting with prospects', 'Skills', 2, true, 25, 2),
    (NULL, 'Building Your Team', 'Strategies for recruiting and training your team', 'Leadership', 3, true, 30, 3),
    (NULL, 'Advanced Closing Techniques', 'Close more deals with proven techniques', 'Sales', 4, true, 20, 4)
ON CONFLICT DO NOTHING;

-- Create sample email templates
INSERT INTO public.email_templates (member_id, company_id, name, subject, content, category)
VALUES 
    (NULL, NULL, 'Welcome Template', 'Welcome to our amazing community!', 'Hi {{first_name}},\n\nWelcome to our community! We''re excited to have you on board.\n\nBest regards,\n{{sender_name}}', 'welcome'),
    (NULL, NULL, 'Follow Up Template', 'Following up on our conversation', 'Hi {{first_name}},\n\nI wanted to follow up on our conversation about your goals.\n\nLet me know if you have any questions!\n\nBest,\n{{sender_name}}', 'follow-up'),
    (NULL, NULL, 'Training Reminder', 'Don''t forget about today''s training!', 'Hi {{first_name}},\n\nJust a friendly reminder about today''s training session.\n\nSee you there!\n{{sender_name}}', 'training')
ON CONFLICT DO NOTHING; 