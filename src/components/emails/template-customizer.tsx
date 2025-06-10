'use client'

import { useState } from 'react'
import { EmailTemplate, PersonalEmailTemplate } from '@/types'
import { useDuplicateTemplate, useUpdatePersonalTemplate } from '@/hooks/queries/usePersonalTemplates'
import { Button } from '@/components/ui/button'
import { Copy, Eye, Save, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

interface TemplateCustomizerProps {
  template: EmailTemplate | PersonalEmailTemplate
  isPersonalTemplate?: boolean
  onSave?: (template: PersonalEmailTemplate) => void
}

// Variable helper component
const VariableHelper = ({ 
  variables, 
  onInsert 
}: { 
  variables: string[]
  onInsert: (variable: string) => void 
}) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="font-medium text-sm mb-2">Available Variables</h4>
      <div className="flex flex-wrap gap-2">
        {variables.map((variable) => (
          <button
            key={variable}
            type="button"
            className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded cursor-pointer"
            onClick={() => onInsert(`{{${variable}}}`)}
          >
            {variable}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Click a variable to insert it at the cursor position
      </p>
    </div>
  )
}

export const TemplateCustomizer = ({ 
  template, 
  isPersonalTemplate = false,
  onSave 
}: TemplateCustomizerProps) => {
  const [editedTemplate, setEditedTemplate] = useState({
    name: template.name,
    subject: template.subject,
    body_html: template.body_html,
    body_text: template.body_text
  })
  
  const [showPreview, setShowPreview] = useState(false)
  
  const duplicateTemplate = useDuplicateTemplate()
  const updateTemplate = useUpdatePersonalTemplate()

  // Handle duplicating company template
  const handleDuplicate = async () => {
    if (isPersonalTemplate) return
    
    try {
      const result = await duplicateTemplate.mutateAsync({
        template_id: template.id,
        new_name: `${template.name} (My Version)`
      })
      
      toast.success('🎉 Template duplicated! You can now customize it.')
      onSave?.(result)
    } catch (error) {
      toast.error('Failed to duplicate template')
    }
  }

  // Handle saving personal template changes
  const handleSave = async () => {
    if (!isPersonalTemplate) return
    
    try {
      const result = await updateTemplate.mutateAsync({
        id: template.id,
        updates: editedTemplate
      })
      
      toast.success('🎉 Template saved!')
      onSave?.(result)
    } catch (error) {
      toast.error('Failed to save template')
    }
  }

  // Insert variable at cursor position
  const insertVariable = (variable: string) => {
    setEditedTemplate(prev => ({
      ...prev,
      body_html: prev.body_html + ` ${variable}`
    }))
  }

  // Generate preview (simplified - just toggle display of current content)
  const generatePreview = () => {
    setShowPreview(!showPreview)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isPersonalTemplate ? 'Edit Template' : 'Customize Template'}
          </h2>
          <p className="text-gray-600">
            {isPersonalTemplate 
              ? 'Make changes to your personal template'
              : 'Create your own version of this company template'
            }
          </p>
        </div>
        
        {!isPersonalTemplate && (
          <Button
            onClick={handleDuplicate}
            disabled={duplicateTemplate.isPending}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Copy className="h-4 w-4 mr-2" />
            {duplicateTemplate.isPending ? 'Creating...' : 'Create My Version'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Side */}
        <div className="space-y-6">
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Template Editor</h3>
            </div>
            
            <div className="space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={editedTemplate.name}
                  onChange={(e) => setEditedTemplate(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  disabled={!isPersonalTemplate}
                  placeholder="Enter template name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={editedTemplate.subject}
                  onChange={(e) => setEditedTemplate(prev => ({
                    ...prev,
                    subject: e.target.value
                  }))}
                  disabled={!isPersonalTemplate}
                  placeholder="Enter email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Body
                </label>
                <textarea
                  value={editedTemplate.body_html}
                  onChange={(e) => setEditedTemplate(prev => ({
                    ...prev,
                    body_html: e.target.value
                  }))}
                  disabled={!isPersonalTemplate}
                  className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 font-mono text-sm"
                  placeholder="Enter email content..."
                />
              </div>

              {/* Variable Helper */}
              {isPersonalTemplate && (
                <VariableHelper
                  variables={template.variables}
                  onInsert={insertVariable}
                />
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isPersonalTemplate && (
                  <Button
                    onClick={handleSave}
                    disabled={updateTemplate.isPending}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateTemplate.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
                
                <Button
                  onClick={generatePreview}
                  variant="secondary"
                  className="px-4"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Side */}
        <div className="space-y-6">
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            {showPreview ? (
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <div className="border-b pb-4 mb-4">
                  <h4 className="font-semibold text-lg">
                    {editedTemplate.subject}
                  </h4>
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: editedTemplate.body_html 
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Click "Show Preview" to see how your email will look</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 