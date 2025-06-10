Task 6: Advanced Email Features (Refined)
Priority: 🟢 LOW
Estimated Time: 2 days
Status: 📋 TODO
Description
Enhance the email system with template customization interface and bulk email sending capabilities. Focus on leveraging the company-specific templates we've created while allowing personal customization.
Current State Analysis

✅ Company-specific email templates for Neumi (8 beautiful templates)
✅ Template isolation by company using RLS
✅ Variable system with automatic and custom variables
✅ Preview functionality via preview_email_template RPC
✅ Email sending via send_company_email RPC
❌ No UI for template customization
❌ No bulk sending interface
❌ No personal template variations

Revised Acceptance Criteria
Template Customization (Simplified)

 View and duplicate company templates for personal use
 Simple text editor for subject/body customization
 Variable helper showing available placeholders
 Live preview using existing preview_email_template
 Save personal variations of company templates

Bulk Email Sending

 Multi-select contacts interface
 Template selection from company + personal templates
 Batch processing with progress indicator
 Success/failure summary
 Respect rate limits (10-20 emails per batch)

Template Management

 List view showing company templates and personal variations
 Filter by category (welcome, follow_up, invitation, general)
 Usage counter for each template
 Favorite/star frequently used templates

Technical Requirements (Revised)
Database Schema Updates
sql-- Personal template variations (simpler than original)
CREATE TABLE personal_email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  parent_template_id UUID REFERENCES email_templates(id), -- Original company template
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  variables TEXT[] NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bulk email jobs
CREATE TABLE bulk_email_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id),
  personal_template_id UUID REFERENCES personal_email_templates(id),
  contact_ids UUID[] NOT NULL,
  custom_variables JSONB DEFAULT '{}',
  total_count INTEGER NOT NULL,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE personal_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_email_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own templates" ON personal_email_templates
  FOR ALL USING (member_id = auth.uid() AND company_id = current_user_company_id());

CREATE POLICY "Users can view their bulk jobs" ON bulk_email_jobs
  FOR ALL USING (member_id = auth.uid() AND company_id = current_user_company_id());
RPC Functions
sql-- Duplicate company template for personal use
CREATE OR REPLACE FUNCTION duplicate_template_for_personal_use(
  p_template_id UUID,
  p_new_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template email_templates;
  v_new_id UUID;
BEGIN
  -- Get the template
  SELECT * INTO v_template
  FROM email_templates
  WHERE id = p_template_id
    AND (company_id = current_user_company_id() OR company_id IS NULL);
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or access denied';
  END IF;
  
  -- Create personal copy
  INSERT INTO personal_email_templates (
    member_id,
    company_id,
    parent_template_id,
    name,
    subject,
    body_html,
    body_text,
    variables
  ) VALUES (
    auth.uid(),
    current_user_company_id(),
    p_template_id,
    COALESCE(p_new_name, v_template.name || ' (My Version)'),
    v_template.subject,
    v_template.body_html,
    v_template.body_text,
    v_template.variables
  ) RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$$;

-- Send bulk emails
CREATE OR REPLACE FUNCTION send_bulk_emails(
  p_contact_ids UUID[],
  p_template_id UUID DEFAULT NULL,
  p_personal_template_id UUID DEFAULT NULL,
  p_custom_variables JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_id UUID;
  v_contact_id UUID;
BEGIN
  -- Validate inputs
  IF p_template_id IS NULL AND p_personal_template_id IS NULL THEN
    RAISE EXCEPTION 'Either template_id or personal_template_id must be provided';
  END IF;
  
  -- Create bulk job
  INSERT INTO bulk_email_jobs (
    member_id,
    company_id,
    template_id,
    personal_template_id,
    contact_ids,
    custom_variables,
    total_count,
    status
  ) VALUES (
    auth.uid(),
    current_user_company_id(),
    p_template_id,
    p_personal_template_id,
    p_contact_ids,
    p_custom_variables,
    array_length(p_contact_ids, 1),
    'processing'
  ) RETURNING id INTO v_job_id;
  
  -- Update job start time
  UPDATE bulk_email_jobs 
  SET started_at = NOW() 
  WHERE id = v_job_id;
  
  -- Process emails (simplified - in production use queue)
  FOREACH v_contact_id IN ARRAY p_contact_ids
  LOOP
    BEGIN
      IF p_personal_template_id IS NOT NULL THEN
        -- Send using personal template
        PERFORM send_email_from_personal_template(
          v_contact_id,
          p_personal_template_id,
          p_custom_variables
        );
      ELSE
        -- Send using company template
        PERFORM send_company_email(
          v_contact_id,
          p_template_id,
          p_custom_variables
        );
      END IF;
      
      -- Update sent count
      UPDATE bulk_email_jobs 
      SET sent_count = sent_count + 1
      WHERE id = v_job_id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Update failed count
      UPDATE bulk_email_jobs 
      SET failed_count = failed_count + 1
      WHERE id = v_job_id;
    END;
  END LOOP;
  
  -- Complete job
  UPDATE bulk_email_jobs 
  SET 
    status = CASE 
      WHEN failed_count = 0 THEN 'completed'
      WHEN sent_count = 0 THEN 'failed'
      ELSE 'completed'
    END,
    completed_at = NOW()
  WHERE id = v_job_id;
  
  RETURN v_job_id;
END;
$$;
Implementation Steps (Revised)

Template Viewer Enhancement

Show company templates with "Duplicate" button
Display personal templates with edit capability
Add usage statistics to each template


Simple Template Editor

Basic form for subject/body editing
Variable helper dropdown
Live preview panel using existing RPC
Save functionality


Bulk Email Interface

Contact multi-select with search
Template selector (company + personal)
Custom variables form (if needed)
Send button with confirmation


Progress Tracking

Real-time updates during bulk send
Success/failure summary
Option to retry failed emails



React Components (Simplified)
Template Customizer
typescriptconst TemplateCustomizer = ({ templateId, onSave }) => {
  const [template, setTemplate] = useState(null)
  const [preview, setPreview] = useState(null)
  
  // Duplicate company template
  const duplicateTemplate = async () => {
    const { data, error } = await supabase
      .rpc('duplicate_template_for_personal_use', {
        p_template_id: templateId
      })
    
    if (data) {
      showSuccessToast('Template duplicated! You can now customize it.')
      loadPersonalTemplate(data)
    }
  }
  
  // Update preview on changes
  useEffect(() => {
    if (template) {
      updatePreview()
    }
  }, [template])
  
  const updatePreview = async () => {
    const { data } = await supabase
      .rpc('preview_email_template', {
        p_template_id: templateId,
        p_custom_variables: sampleVariables
      })
    setPreview(data)
  }
  
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Editor */}
      <div className="space-y-4">
        <input
          type="text"
          value={template?.subject || ''}
          onChange={(e) => setTemplate({...template, subject: e.target.value})}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Email Subject"
        />
        
        <div className="relative">
          <textarea
            value={template?.body_html || ''}
            onChange={(e) => setTemplate({...template, body_html: e.target.value})}
            className="w-full h-96 px-4 py-2 border rounded-lg font-mono text-sm"
          />
          
          <VariableHelper
            variables={template?.variables || []}
            onInsert={(variable) => {
              // Insert at cursor position
              insertAtCursor(variable)
            }}
          />
        </div>
        
        <button
          onClick={saveTemplate}
          className="btn-primary"
        >
          Save My Version
        </button>
      </div>
      
      {/* Preview */}
      <div className="border rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="bg-white rounded-lg p-4 shadow">
          <h4 className="font-semibold">{preview?.subject}</h4>
          <div 
            className="mt-4 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: preview?.body_html }}
          />
        </div>
      </div>
    </div>
  )
}
Bulk Email Sender
typescriptconst BulkEmailSender = ({ contacts }) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState({ sent: 0, total: 0 })
  
  const sendBulkEmails = async () => {
    setSending(true)
    
    const { data: jobId } = await supabase
      .rpc('send_bulk_emails', {
        p_contact_ids: selectedContacts,
        p_template_id: selectedTemplate.id,
        p_custom_variables: {}
      })
    
    // Poll for progress
    const interval = setInterval(async () => {
      const { data: job } = await supabase
        .from('bulk_email_jobs')
        .select('*')
        .eq('id', jobId)
        .single()
      
      setProgress({
        sent: job.sent_count,
        total: job.total_count
      })
      
      if (job.status === 'completed' || job.status === 'failed') {
        clearInterval(interval)
        setSending(false)
        
        showSuccessToast(
          `Sent ${job.sent_count} of ${job.total_count} emails! 🎉`
        )
      }
    }, 1000)
  }
  
  return (
    <div className="space-y-6">
      {/* Contact Selection */}
      <ContactMultiSelect
        contacts={contacts}
        selected={selectedContacts}
        onChange={setSelectedContacts}
      />
      
      {/* Template Selection */}
      <TemplateSelector
        value={selectedTemplate}
        onChange={setSelectedTemplate}
        showPersonalTemplates={true}
      />
      
      {/* Progress */}
      {sending && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <span>Sending emails...</span>
            <span>{progress.sent} / {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(progress.sent / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Send Button */}
      <button
        onClick={sendBulkEmails}
        disabled={!selectedTemplate || selectedContacts.length === 0 || sending}
        className="btn-primary w-full"
      >
        Send to {selectedContacts.length} Contacts
      </button>
    </div>
  )
}
Key Differences from Original Task

Leverages Existing Infrastructure

Uses company templates as base
Utilizes existing preview RPC
Works with current variable system


Simplified Editor

No rich text editor needed (templates are already beautiful)
Focus on text customization only
Variable insertion helper instead of complex WYSIWYG


Company-Aware

Respects company isolation
Personal templates linked to company
Maintains multi-company support


Reduced Scope

No A/B testing (not needed for MVP)
No email scheduling (can add later)
No follow-up sequences (separate feature)



Success Metrics

Users can personalize company templates
Bulk sending works for 10-50 contacts
Templates maintain company branding
System respects rate limits
UI remains simple and celebration-focused