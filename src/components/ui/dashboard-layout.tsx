'use client'

import { TopNavigation, SidebarNavigation, MobileBottomNavigation } from './navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    user_metadata?: {
      first_name?: string
      avatar_url?: string
    }
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen gradient-main">
      {/* Top Navigation */}
      <TopNavigation user={user} />
      
      {/* Sidebar Navigation */}
      <SidebarNavigation />
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation />
      
      {/* Main Content */}
      <main className="pt-16 md:ml-60 pb-20 md:pb-6">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
} 