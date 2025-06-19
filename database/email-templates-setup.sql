-- Email Templates Setup
-- Run this in your Supabase SQL editor to create the email_templates table

-- Create email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('welcome', 'follow_up', 'thank_you', 'training', 'invitation', 'general')),
    variables TEXT[] DEFAULT '{}', -- Variables that can be replaced in templates
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false, -- If true, available to all members in company
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for email_templates
DROP POLICY IF EXISTS "Users can view their own templates" ON public.email_templates;
CREATE POLICY "Users can view their own templates" ON public.email_templates
    FOR SELECT USING (auth.uid() = member_id OR is_public = true);

DROP POLICY IF EXISTS "Users can insert their own templates" ON public.email_templates;
CREATE POLICY "Users can insert their own templates" ON public.email_templates
    FOR INSERT WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can update their own templates" ON public.email_templates;
CREATE POLICY "Users can update their own templates" ON public.email_templates
    FOR UPDATE USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can delete their own templates" ON public.email_templates;
CREATE POLICY "Users can delete their own templates" ON public.email_templates
    FOR DELETE USING (auth.uid() = member_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS handle_updated_at ON public.email_templates;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.email_templates
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_member_id ON public.email_templates(member_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates(category);

-- Insert default public templates that all users can use
-- Get a default member_id for public templates (using the first member if exists)
DO $$
DECLARE
    default_member_id UUID;
BEGIN
    -- Try to get the first member ID, if no members exist, create templates without member_id restriction
    SELECT id INTO default_member_id FROM public.members LIMIT 1;
    
    IF default_member_id IS NOT NULL THEN
        -- Welcome Email Template
        INSERT INTO public.email_templates (member_id, name, subject, body_html, body_text, category, is_public, variables)
        VALUES (
            default_member_id,
            '🎉 Welcome to Our Team!',
            'Welcome to an Amazing Journey, {{first_name}}!',
            '<h2>Welcome {{first_name}}!</h2>
            <p>I''m so excited to have you join our incredible team! 🎉</p>
            <p>You''ve just taken the first step toward building something amazing, and I couldn''t be prouder to have you on board.</p>
            <p><strong>What happens next?</strong></p>
            <ul>
                <li>📚 Check out our training resources</li>
                <li>📞 Schedule your welcome call with me</li>
                <li>🎯 Set your first goals together</li>
                <li>🚀 Start building your success story!</li>
            </ul>
            <p>Remember, success in this business is all about taking consistent action and helping others. I''m here to support you every step of the way!</p>
            <p>To your success,<br>{{sender_name}}</p>',
            'Welcome {{first_name}}!\n\nI''m so excited to have you join our incredible team!\n\nYou''ve just taken the first step toward building something amazing, and I couldn''t be prouder to have you on board.\n\nWhat happens next?\n- Check out our training resources\n- Schedule your welcome call with me\n- Set your first goals together\n- Start building your success story!\n\nRemember, success in this business is all about taking consistent action and helping others. I''m here to support you every step of the way!\n\nTo your success,\n{{sender_name}}',
            'welcome',
            true,
            ARRAY['first_name', 'sender_name']
        ) ON CONFLICT DO NOTHING;

        -- Follow Up Template
        INSERT INTO public.email_templates (member_id, name, subject, body_html, body_text, category, is_public, variables)
        VALUES (
            default_member_id,
            '💪 Let''s Keep the Momentum Going!',
            'How are you doing, {{first_name}}?',
            '<h2>Hi {{first_name}},</h2>
            <p>I wanted to check in and see how you''re doing with your new journey! 💪</p>
            <p>Starting something new can feel overwhelming, but remember - every successful person started exactly where you are right now.</p>
            <p><strong>Quick question:</strong> What''s your biggest challenge right now?</p>
            <p>Whether it''s:</p>
            <ul>
                <li>🎓 Understanding the training materials</li>
                <li>📞 Making your first calls</li>
                <li>🎯 Setting up your goals</li>
                <li>⏰ Finding time to work your business</li>
            </ul>
            <p>I''m here to help! Just reply to this email or give me a call. We''re in this together!</p>
            <p>Your success matters to me,<br>{{sender_name}}</p>',
            'Hi {{first_name}},\n\nI wanted to check in and see how you''re doing with your new journey!\n\nStarting something new can feel overwhelming, but remember - every successful person started exactly where you are right now.\n\nQuick question: What''s your biggest challenge right now?\n\nWhether it''s understanding the training, making calls, setting goals, or finding time - I''m here to help!\n\nJust reply to this email or give me a call. We''re in this together!\n\nYour success matters to me,\n{{sender_name}}',
            'follow_up',
            true,
            ARRAY['first_name', 'sender_name']
        ) ON CONFLICT DO NOTHING;

        -- Thank You Template
        INSERT INTO public.email_templates (member_id, name, subject, body_html, body_text, category, is_public, variables)
        VALUES (
            default_member_id,
            '🙏 Thank You for Your Interest!',
            'Thank you for your time today, {{first_name}}!',
            '<h2>Thank you {{first_name}}!</h2>
            <p>I really enjoyed our conversation today! 🙏</p>
            <p>It''s clear that you''re someone who thinks big and isn''t afraid to pursue your dreams. That''s exactly the kind of person who succeeds in this business!</p>
            <p><strong>As promised, here are the next steps:</strong></p>
            <ul>
                <li>📺 Review the presentation we discussed</li>
                <li>📞 Schedule a follow-up call to answer any questions</li>
                <li>🤔 Think about your goals and what success looks like for you</li>
            </ul>
            <p>Take your time to process everything, and remember - there''s no pressure. This opportunity will be here when you''re ready!</p>
            <p>I''m excited about the possibility of working together!</p>
            <p>Talk soon,<br>{{sender_name}}</p>',
            'Thank you {{first_name}}!\n\nI really enjoyed our conversation today!\n\nIt''s clear that you''re someone who thinks big and isn''t afraid to pursue your dreams. That''s exactly the kind of person who succeeds in this business!\n\nAs promised, here are the next steps:\n- Review the presentation we discussed\n- Schedule a follow-up call to answer any questions\n- Think about your goals and what success looks like for you\n\nTake your time to process everything, and remember - there''s no pressure. This opportunity will be here when you''re ready!\n\nI''m excited about the possibility of working together!\n\nTalk soon,\n{{sender_name}}',
            'thank_you',
            true,
            ARRAY['first_name', 'sender_name']
        ) ON CONFLICT DO NOTHING;

        -- Training Reminder Template
        INSERT INTO public.email_templates (member_id, name, subject, body_html, body_text, category, is_public, variables)
        VALUES (
            default_member_id,
            '🎓 Your Training Awaits!',
            'Don''t miss tonight''s training, {{first_name}}!',
            '<h2>Hi {{first_name}},</h2>
            <p>Just a friendly reminder about tonight''s training session! 🎓</p>
            <p><strong>Training Details:</strong></p>
            <ul>
                <li>📅 Date: {{training_date}}</li>
                <li>⏰ Time: {{training_time}}</li>
                <li>🔗 Link: {{training_link}}</li>
            </ul>
            <p>Tonight we''ll be covering some game-changing strategies that could seriously accelerate your success. You won''t want to miss this!</p>
            <p><strong>What to bring:</strong></p>
            <ul>
                <li>📝 A notebook for taking notes</li>
                <li>💡 Your questions and challenges</li>
                <li>🎯 Your goals and dreams</li>
            </ul>
            <p>See you there!</p>
            <p>{{sender_name}}</p>',
            'Hi {{first_name}},\n\nJust a friendly reminder about tonight''s training session!\n\nTraining Details:\n- Date: {{training_date}}\n- Time: {{training_time}}\n- Link: {{training_link}}\n\nTonight we''ll be covering some game-changing strategies that could seriously accelerate your success. You won''t want to miss this!\n\nWhat to bring:\n- A notebook for taking notes\n- Your questions and challenges\n- Your goals and dreams\n\nSee you there!\n\n{{sender_name}}',
            'training',
            true,
            ARRAY['first_name', 'sender_name', 'training_date', 'training_time', 'training_link']
        ) ON CONFLICT DO NOTHING;

    END IF;
END $$; 