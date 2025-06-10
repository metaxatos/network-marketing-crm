-- Additional tables needed for realtime functionality
-- Run this after the main setup.sql

-- Create member_activities table for tracking user activities
CREATE TABLE IF NOT EXISTS public.member_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'contact_added', 'email_sent', 'training_completed', 
        'goal_achieved', 'milestone_reached', 'login', 'logout', 'signup'
    )),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sent_emails table for email tracking
CREATE TABLE IF NOT EXISTS public.sent_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    template_id UUID, -- Could reference email_templates if that table exists
    subject TEXT NOT NULL,
    body_html TEXT,
    body_text TEXT,
    status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    click_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_clicks table for detailed click tracking
CREATE TABLE IF NOT EXISTS public.email_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_id UUID REFERENCES public.sent_emails(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create email_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    category TEXT DEFAULT 'general',
    variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.member_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for member_activities
CREATE POLICY "Users can view their own activities" ON public.member_activities
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own activities" ON public.member_activities
    FOR INSERT WITH CHECK (auth.uid() = member_id);

-- Create RLS Policies for sent_emails
CREATE POLICY "Users can view their own sent emails" ON public.sent_emails
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own sent emails" ON public.sent_emails
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own sent emails" ON public.sent_emails
    FOR UPDATE USING (auth.uid() = member_id);

-- Create RLS Policies for email_clicks
CREATE POLICY "Users can view clicks on their emails" ON public.email_clicks
    FOR SELECT USING (
        auth.uid() IN (
            SELECT member_id FROM public.sent_emails WHERE id = email_id
        )
    );

CREATE POLICY "Anyone can insert email clicks" ON public.email_clicks
    FOR INSERT WITH CHECK (true); -- Public endpoint for tracking

-- Create RLS Policies for email_templates
CREATE POLICY "Users can view their own templates" ON public.email_templates
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Users can insert their own templates" ON public.email_templates
    FOR INSERT WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can update their own templates" ON public.email_templates
    FOR UPDATE USING (auth.uid() = member_id);

CREATE POLICY "Users can delete their own templates" ON public.email_templates
    FOR DELETE USING (auth.uid() = member_id);

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.sent_emails
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.email_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_member_activities_member_id ON public.member_activities(member_id);
CREATE INDEX IF NOT EXISTS idx_member_activities_member_date ON public.member_activities(member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_activities_type ON public.member_activities(activity_type);

CREATE INDEX IF NOT EXISTS idx_sent_emails_member_id ON public.sent_emails(member_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_member_date ON public.sent_emails(member_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sent_emails_contact_id ON public.sent_emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_status ON public.sent_emails(status);

CREATE INDEX IF NOT EXISTS idx_email_clicks_email_id ON public.email_clicks(email_id);
CREATE INDEX IF NOT EXISTS idx_email_clicks_contact_id ON public.email_clicks(contact_id);

CREATE INDEX IF NOT EXISTS idx_email_templates_member_id ON public.email_templates(member_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates(is_active);

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.member_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sent_emails;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;

-- Add some default email templates
INSERT INTO public.email_templates (member_id, name, subject, body_html, body_text, category) 
SELECT 
    id as member_id,
    'Welcome Message' as name,
    'Welcome to our team!' as subject,
    '<h1>Welcome!</h1><p>We''re excited to have you on board.</p>' as body_html,
    'Welcome! We''re excited to have you on board.' as body_text,
    'welcome' as category
FROM public.members 
WHERE NOT EXISTS (
    SELECT 1 FROM public.email_templates 
    WHERE member_id = public.members.id AND name = 'Welcome Message'
);

INSERT INTO public.email_templates (member_id, name, subject, body_html, body_text, category) 
SELECT 
    id as member_id,
    'Follow Up' as name,
    'Following up on our conversation' as subject,
    '<p>Hi there,</p><p>I wanted to follow up on our recent conversation...</p>' as body_html,
    'Hi there, I wanted to follow up on our recent conversation...' as body_text,
    'follow_up' as category
FROM public.members 
WHERE NOT EXISTS (
    SELECT 1 FROM public.email_templates 
    WHERE member_id = public.members.id AND name = 'Follow Up'
); 