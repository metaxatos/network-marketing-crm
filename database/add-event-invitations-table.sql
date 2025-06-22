-- Add event_invitations table for tracking event invitations
-- Run this in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.event_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    sent_by UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    sent_to_type TEXT NOT NULL CHECK (sent_to_type IN ('contact', 'team', 'new')),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    email_template_id UUID,
    language VARCHAR(2) DEFAULT 'en',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.event_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view invitations for their events or sent by them" ON public.event_invitations
    FOR SELECT USING (
        auth.uid() = sent_by OR 
        auth.uid() IN (SELECT member_id FROM public.events WHERE id = event_id)
    );

CREATE POLICY "Users can create invitations for their events" ON public.event_invitations
    FOR INSERT WITH CHECK (
        auth.uid() = sent_by AND
        auth.uid() IN (SELECT member_id FROM public.events WHERE id = event_id)
    );

CREATE POLICY "Users can update invitations they sent" ON public.event_invitations
    FOR UPDATE USING (auth.uid() = sent_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_invitations_event_id ON public.event_invitations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_invitations_sent_by ON public.event_invitations(sent_by);
CREATE INDEX IF NOT EXISTS idx_event_invitations_recipient_email ON public.event_invitations(recipient_email);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.event_invitations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at(); 