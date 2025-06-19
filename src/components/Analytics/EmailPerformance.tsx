'use client'

// TEMPORARY: This component needs to be updated to work with the new communications table
// For now, showing a placeholder to allow builds to pass

interface EmailPerformanceProps {
  className?: string
}

export function EmailPerformance({ className = '' }: EmailPerformanceProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Email Performance</h3>
        <p className="text-blue-700">
          📊 Email analytics coming soon! 
          <br />
          <span className="text-sm">Component being updated for new database structure.</span>
        </p>
      </div>
    </div>
  )
} 