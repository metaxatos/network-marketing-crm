-- ============================================
-- EMAIL SYSTEM TRANSFORMATION - PHASE 1 MIGRATION
-- ============================================
-- This migration adds Phase 1 fields to the existing email_templates table
-- Run this in Supabase SQL Editor to upgrade the email system

-- Add Phase 1 columns to email_templates table
DO $$ 
BEGIN
    -- Add language column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'language') THEN
        ALTER TABLE public.email_templates ADD COLUMN language VARCHAR(2) DEFAULT 'en';
        RAISE NOTICE 'Added language column';
    END IF;
    
    -- Add preview_text column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'preview_text') THEN
        ALTER TABLE public.email_templates ADD COLUMN preview_text TEXT;
        RAISE NOTICE 'Added preview_text column';
    END IF;
    
    -- Add usage_priority column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'usage_priority') THEN
        ALTER TABLE public.email_templates ADD COLUMN usage_priority INTEGER DEFAULT 0;
        RAISE NOTICE 'Added usage_priority column';
    END IF;
    
    -- Add target_audience column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'target_audience') THEN
        ALTER TABLE public.email_templates ADD COLUMN target_audience TEXT DEFAULT 'general';
        RAISE NOTICE 'Added target_audience column';
    END IF;
    
    -- Add is_quick_action column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'is_quick_action') THEN
        ALTER TABLE public.email_templates ADD COLUMN is_quick_action BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_quick_action column';
    END IF;
    
    -- Add usage_count column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'usage_count') THEN
        ALTER TABLE public.email_templates ADD COLUMN usage_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added usage_count column';
    END IF;
    
    -- Add last_used_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'last_used_at') THEN
        ALTER TABLE public.email_templates ADD COLUMN last_used_at TIMESTAMPTZ;
        RAISE NOTICE 'Added last_used_at column';
    END IF;
    
    -- Add company_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'company_id') THEN
        ALTER TABLE public.email_templates ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added company_id column';
    END IF;
    
    -- Add template_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'template_type') THEN
        ALTER TABLE public.email_templates ADD COLUMN template_type TEXT DEFAULT 'personal' CHECK (template_type IN ('system', 'company', 'personal'));
        RAISE NOTICE 'Added template_type column';
    END IF;
END $$;

-- Update existing templates to mark language based on content
DO $$
BEGIN
    -- Mark Greek templates
    UPDATE public.email_templates 
    SET language = 'gr' 
    WHERE name LIKE '%(GR)%' OR name LIKE '%Καλώς%' OR name LIKE '%Επανάσταση%' OR name LIKE '%Συνεργάτη%' OR name LIKE '%Πελάτη%';
    
    -- Clean up template names (remove GR suffix)
    UPDATE public.email_templates 
    SET name = REPLACE(name, ' (GR)', '')
    WHERE language = 'gr';
    
    RAISE NOTICE 'Updated existing templates with language tags';
END $$;

-- Set up quick action templates
DO $$
BEGIN
    -- Mark English quick action templates
    UPDATE public.email_templates 
    SET is_quick_action = true, 
        target_audience = 'customer',
        usage_priority = 10
    WHERE name IN ('Customer Email - Personal Product Share', 'Welcome to Our Team!');
    
    UPDATE public.email_templates 
    SET is_quick_action = true, 
        target_audience = 'partner',
        usage_priority = 10
    WHERE name IN ('Partner Email - Personal Business Share');
    
    -- Mark Greek quick action templates
    UPDATE public.email_templates 
    SET is_quick_action = true, 
        target_audience = 'customer',
        usage_priority = 10
    WHERE name IN ('Email Πελάτη - Προσωπική Κοινοποίηση Προϊόντος');
    
    UPDATE public.email_templates 
    SET is_quick_action = true, 
        target_audience = 'partner',
        usage_priority = 10
    WHERE name IN ('Email Συνεργάτη - Προσωπική Επιχειρηματική Κοινοποίηση');
    
    RAISE NOTICE 'Configured quick action templates';
END $$;

-- Set target audience for existing templates
DO $$
BEGIN
    -- Customer-focused templates
    UPDATE public.email_templates 
    SET target_audience = 'customer'
    WHERE category IN ('welcome', 'follow_up', 'thank_you') AND target_audience = 'general';
    
    -- Partner-focused templates
    UPDATE public.email_templates 
    SET target_audience = 'partner'
    WHERE category IN ('invitation', 'training') AND target_audience = 'general';
    
    RAISE NOTICE 'Set target audience for existing templates';
END $$;

-- Create system email templates table
CREATE TABLE IF NOT EXISTS public.system_email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_event TEXT NOT NULL, -- 'member_welcome', 'sponsor_notification', 'rank_achieved'
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    language VARCHAR(2) DEFAULT 'en',
    delay_hours INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email automation queue table
CREATE TABLE IF NOT EXISTS public.email_automation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
    system_template_id UUID REFERENCES public.system_email_templates(id) ON DELETE SET NULL,
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.system_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automation_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for system_email_templates
DROP POLICY IF EXISTS "System templates are viewable by authenticated users" ON public.system_email_templates;
CREATE POLICY "System templates are viewable by authenticated users" ON public.system_email_templates
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create RLS policies for email_automation_queue
DROP POLICY IF EXISTS "Users can view their own automation queue" ON public.email_automation_queue;
CREATE POLICY "Users can view their own automation queue" ON public.email_automation_queue
    FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can insert their own automation queue" ON public.email_automation_queue;
CREATE POLICY "Users can insert their own automation queue" ON public.email_automation_queue
    FOR INSERT WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can update their own automation queue" ON public.email_automation_queue;
CREATE POLICY "Users can update their own automation queue" ON public.email_automation_queue
    FOR UPDATE USING (auth.uid() = member_id);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_email_templates_language ON public.email_templates(language);
CREATE INDEX IF NOT EXISTS idx_email_templates_target_audience ON public.email_templates(target_audience);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_quick_action ON public.email_templates(is_quick_action);
CREATE INDEX IF NOT EXISTS idx_email_templates_usage_priority ON public.email_templates(usage_priority);
CREATE INDEX IF NOT EXISTS idx_email_templates_company_id ON public.email_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_template_type ON public.email_templates(template_type);

CREATE INDEX IF NOT EXISTS idx_system_email_templates_trigger_event ON public.system_email_templates(trigger_event);
CREATE INDEX IF NOT EXISTS idx_system_email_templates_language ON public.system_email_templates(language);

CREATE INDEX IF NOT EXISTS idx_email_automation_queue_member_id ON public.email_automation_queue(member_id);
CREATE INDEX IF NOT EXISTS idx_email_automation_queue_status ON public.email_automation_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_automation_queue_scheduled_for ON public.email_automation_queue(scheduled_for);

-- Add updated_at triggers for new tables
DROP TRIGGER IF EXISTS handle_updated_at ON public.system_email_templates;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.system_email_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON public.email_automation_queue;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.email_automation_queue
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- PHASE 1 MIGRATION COMPLETE
-- ============================================

SELECT 'Phase 1 Migration Complete! Email system is now ready for the transformation.' AS status; 