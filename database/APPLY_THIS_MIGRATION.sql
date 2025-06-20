-- NETWORK MARKETING CRM - DATABASE MIGRATION
-- Run this in Supabase SQL Editor to create missing tables
-- Make sure to run each section separately if you encounter errors

-- ============================================
-- SECTION 1: CREATE CORE TABLES
-- ============================================

-- Communications table (consolidates sent_emails, email_clicks, contact_interactions)
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

-- Training Videos table (flattened from courses/modules/lessons)
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

-- Member Progress table (simplified from lesson_progress/course_progress)
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

-- ============================================
-- SECTION 2: ALTER EXISTING TABLES
-- ============================================

-- Add missing columns to existing tables
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'notes') THEN
        ALTER TABLE public.contacts ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'company_id') THEN
        ALTER TABLE public.contacts ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- SECTION 3: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 4: CREATE RLS POLICIES
-- ============================================

-- Communications policies
DROP POLICY IF EXISTS "Users can view their own communications" ON public.communications;
CREATE POLICY "Users can view their own communications" ON public.communications
    FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can insert their own communications" ON public.communications;
CREATE POLICY "Users can insert their own communications" ON public.communications
    FOR INSERT WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can update their own communications" ON public.communications;
CREATE POLICY "Users can update their own communications" ON public.communications
    FOR UPDATE USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can delete their own communications" ON public.communications;
CREATE POLICY "Users can delete their own communications" ON public.communications
    FOR DELETE USING (auth.uid() = member_id);

-- Training Videos policies
DROP POLICY IF EXISTS "Members can view published videos for their company" ON public.training_videos;
CREATE POLICY "Members can view published videos for their company" ON public.training_videos
    FOR SELECT USING (
        is_published = true AND
        (company_id IN (SELECT company_id FROM public.members WHERE id = auth.uid()) OR company_id IS NULL)
    );

-- Member Progress policies
DROP POLICY IF EXISTS "Users can view their own progress" ON public.member_progress;
CREATE POLICY "Users can view their own progress" ON public.member_progress
    FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can insert their own progress" ON public.member_progress;
CREATE POLICY "Users can insert their own progress" ON public.member_progress
    FOR INSERT WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.member_progress;
CREATE POLICY "Users can update their own progress" ON public.member_progress
    FOR UPDATE USING (auth.uid() = member_id);

-- ============================================
-- SECTION 5: CREATE TRIGGERS
-- ============================================

-- Add updated_at triggers for new tables
DROP TRIGGER IF EXISTS handle_updated_at ON public.communications;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.communications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.training_videos;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.training_videos
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.member_progress;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.member_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 6: CREATE INDEXES
-- ============================================

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

-- ============================================
-- SECTION 7: INSERT SAMPLE DATA
-- ============================================

INSERT INTO public.training_videos (company_id, title, description, category, level, is_published, duration_minutes, order_index)
VALUES 
    (NULL, 'Getting Started with Network Marketing', 'Learn the basics of building your network marketing business', 'Basics', 1, true, 15, 1),
    (NULL, 'Effective Communication Skills', 'Master the art of connecting with prospects', 'Skills', 2, true, 25, 2),
    (NULL, 'Building Your Team', 'Strategies for recruiting and training your team', 'Leadership', 3, true, 30, 3),
    (NULL, 'Advanced Closing Techniques', 'Close more deals with proven techniques', 'Sales', 4, true, 20, 4)
ON CONFLICT DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- All tables and data have been created successfully.
-- Your dashboard should now load without errors. 