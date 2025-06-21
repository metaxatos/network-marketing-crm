-- Migration: Create Structured Training System
-- This adds the missing hierarchical structure: Courses → Modules (virtual) → Lessons

-- Create training_courses table (if not exists)
CREATE TABLE IF NOT EXISTS public.training_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id),
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

-- Create course_modules table
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

-- Create course_lessons table
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

-- Create member_course_progress table
CREATE TABLE IF NOT EXISTS public.member_course_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE NOT NULL,
    completion_percentage FLOAT DEFAULT 0.0,
    last_lesson_id UUID REFERENCES public.course_lessons(id),
    last_position_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, course_id)
);

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
    progress_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Training courses policies (public read for company members)
DROP POLICY IF EXISTS "Members can view courses for their company" ON public.training_courses;
CREATE POLICY "Members can view courses for their company" ON public.training_courses
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM public.members WHERE id = auth.uid())
        OR company_id IS NULL
    );

-- Course modules policies
DROP POLICY IF EXISTS "Members can view published modules" ON public.course_modules;
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
DROP POLICY IF EXISTS "Members can view published lessons" ON public.course_lessons;
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
DROP POLICY IF EXISTS "Users can view their own course progress" ON public.member_course_progress;
CREATE POLICY "Users can view their own course progress" ON public.member_course_progress
    FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can insert their own course progress" ON public.member_course_progress;
CREATE POLICY "Users can insert their own course progress" ON public.member_course_progress
    FOR INSERT WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can update their own course progress" ON public.member_course_progress;
CREATE POLICY "Users can update their own course progress" ON public.member_course_progress
    FOR UPDATE USING (auth.uid() = member_id);

-- Lesson progress policies
DROP POLICY IF EXISTS "Users can view their own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can view their own lesson progress" ON public.lesson_progress
    FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can insert their own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can insert their own lesson progress" ON public.lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can update their own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can update their own lesson progress" ON public.lesson_progress
    FOR UPDATE USING (auth.uid() = member_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_training_courses_company_id ON public.training_courses(company_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_member_course_progress_member_id ON public.member_course_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_member_course_progress_course_id ON public.member_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_member_id ON public.lesson_progress(member_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_updated_at ON public.training_courses;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.training_courses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.course_modules;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.course_modules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.course_lessons;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.course_lessons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.member_course_progress;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.member_course_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.lesson_progress;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.lesson_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data to populate the structured system
INSERT INTO public.training_courses (title, description, duration_minutes, order_index, is_required) VALUES
('Network Marketing Fundamentals', 'Master the basics of network marketing and build a solid foundation for your business success.', 150, 1, true),
('Advanced Sales Strategies', 'Learn proven sales techniques and closing strategies that top performers use to maximize their results.', 195, 2, false),
('Building Your Team', 'Discover how to recruit, train, and motivate a high-performing team that drives exponential growth.', 260, 3, false),
('Digital Marketing Mastery', 'Leverage social media and digital tools to build your brand and attract qualified prospects online.', 225, 4, false)
ON CONFLICT DO NOTHING;

-- Insert sample modules for the first course
INSERT INTO public.course_modules (course_id, title, order_index) 
SELECT tc.id, 'Getting Started', 1
FROM public.training_courses tc 
WHERE tc.title = 'Network Marketing Fundamentals'
ON CONFLICT DO NOTHING;

INSERT INTO public.course_modules (course_id, title, order_index) 
SELECT tc.id, 'Core Principles', 2
FROM public.training_courses tc 
WHERE tc.title = 'Network Marketing Fundamentals'
ON CONFLICT DO NOTHING;

-- Insert sample lessons for Getting Started module
INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_seconds, order_index)
SELECT cm.id, 'Welcome & Overview', 'Introduction to the course and what you''ll learn', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 600, 1
FROM public.course_modules cm
JOIN public.training_courses tc ON cm.course_id = tc.id
WHERE tc.title = 'Network Marketing Fundamentals' AND cm.title = 'Getting Started'
ON CONFLICT DO NOTHING;

INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_seconds, order_index)
SELECT cm.id, 'Setting Your Goals', 'Learn how to set SMART goals for your network marketing business', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 900, 2
FROM public.course_modules cm
JOIN public.training_courses tc ON cm.course_id = tc.id
WHERE tc.title = 'Network Marketing Fundamentals' AND cm.title = 'Getting Started'
ON CONFLICT DO NOTHING;

-- Insert sample lessons for Core Principles module
INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_seconds, order_index)
SELECT cm.id, 'Understanding Network Marketing', 'The fundamentals of how network marketing works', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1200, 1
FROM public.course_modules cm
JOIN public.training_courses tc ON cm.course_id = tc.id
WHERE tc.title = 'Network Marketing Fundamentals' AND cm.title = 'Core Principles'
ON CONFLICT DO NOTHING;

INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_seconds, order_index)
SELECT cm.id, 'Building Relationships', 'How to build genuine relationships in network marketing', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1500, 2
FROM public.course_modules cm
JOIN public.training_courses tc ON cm.course_id = tc.id
WHERE tc.title = 'Network Marketing Fundamentals' AND cm.title = 'Core Principles'
ON CONFLICT DO NOTHING; 