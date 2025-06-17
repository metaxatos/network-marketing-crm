-- Apply database fixes for contacts and email templates
-- Run this in your Supabase SQL editor

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

-- Create sent_emails table for email tracking
CREATE TABLE IF NOT EXISTS public.sent_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
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

-- Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_clicks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for email_templates
DROP POLICY IF EXISTS "Users can view their own templates" ON public.email_templates;
CREATE POLICY "Users can view their own templates" ON public.email_templates
    FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can insert their own templates" ON public.email_templates;
CREATE POLICY "Users can insert their own templates" ON public.email_templates
    FOR INSERT WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can update their own templates" ON public.email_templates;
CREATE POLICY "Users can update their own templates" ON public.email_templates
    FOR UPDATE USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can delete their own templates" ON public.email_templates;
CREATE POLICY "Users can delete their own templates" ON public.email_templates
    FOR DELETE USING (auth.uid() = member_id);

-- Create RLS Policies for sent_emails
DROP POLICY IF EXISTS "Users can view their own sent emails" ON public.sent_emails;
CREATE POLICY "Users can view their own sent emails" ON public.sent_emails
    FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can insert their own sent emails" ON public.sent_emails;
CREATE POLICY "Users can insert their own sent emails" ON public.sent_emails
    FOR INSERT WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can update their own sent emails" ON public.sent_emails;
CREATE POLICY "Users can update their own sent emails" ON public.sent_emails
    FOR UPDATE USING (auth.uid() = member_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_member_id ON public.email_templates(member_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_sent_emails_member_id ON public.sent_emails(member_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_contact_id ON public.sent_emails(contact_id);

-- Add some default email templates for existing users
INSERT INTO public.email_templates (member_id, name, subject, body_html, body_text, category) 
SELECT 
    id as member_id,
    'Welcome Message' as name,
    'Welcome to our team!' as subject,
    '<h1>Welcome!</h1><p>We''re excited to have you on board. Let''s start this amazing journey together!</p><p>Best regards,<br>Your Team</p>' as body_html,
    'Welcome! We''re excited to have you on board. Let''s start this amazing journey together! Best regards, Your Team' as body_text,
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
    '<p>Hi there,</p><p>I wanted to follow up on our recent conversation. I hope you''re doing well!</p><p>Do you have any questions about what we discussed?</p><p>Best regards,<br>Your Name</p>' as body_html,
    'Hi there, I wanted to follow up on our recent conversation. I hope you''re doing well! Do you have any questions about what we discussed? Best regards, Your Name' as body_text,
    'follow_up' as category
FROM public.members 
WHERE NOT EXISTS (
    SELECT 1 FROM public.email_templates 
    WHERE member_id = public.members.id AND name = 'Follow Up'
);

INSERT INTO public.email_templates (member_id, name, subject, body_html, body_text, category) 
SELECT 
    id as member_id,
    'Thank You' as name,
    'Thank you for your time!' as subject,
    '<h2>Thank You!</h2><p>Thank you so much for taking the time to speak with me today. I really appreciate your interest!</p><p>I''ll be in touch soon with more information.</p><p>Have a wonderful day!<br>Your Name</p>' as body_html,
    'Thank You! Thank you so much for taking the time to speak with me today. I really appreciate your interest! I''ll be in touch soon with more information. Have a wonderful day! Your Name' as body_text,
    'thank_you' as category
FROM public.members 
WHERE NOT EXISTS (
    SELECT 1 FROM public.email_templates 
    WHERE member_id = public.members.id AND name = 'Thank You'
);

INSERT INTO public.email_templates (member_id, name, subject, body_html, body_text, category) 
SELECT 
    id as member_id,
    'Training Invitation' as name,
    'Invitation to Exclusive Training Session' as subject,
    '<h2>You''re Invited!</h2><p>I''d love to invite you to an exclusive training session that I think you''ll find incredibly valuable.</p><p>This training covers:</p><ul><li>Key strategies for success</li><li>Proven methods that work</li><li>Live Q&A session</li></ul><p>Would you be interested in joining us?</p><p>Best regards,<br>Your Name</p>' as body_html,
    'You''re Invited! I''d love to invite you to an exclusive training session that I think you''ll find incredibly valuable. This training covers key strategies for success, proven methods that work, and includes a live Q&A session. Would you be interested in joining us? Best regards, Your Name' as body_text,
    'training' as category
FROM public.members 
WHERE NOT EXISTS (
    SELECT 1 FROM public.email_templates 
    WHERE member_id = public.members.id AND name = 'Training Invitation'
); 