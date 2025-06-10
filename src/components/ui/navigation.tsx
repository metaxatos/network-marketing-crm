'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Mail, 
  Calendar, 
  GraduationCap,
  BarChart3,
  Globe,
  Menu,
  X,
  Plus
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: any
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Email', href: '/emails', icon: Mail },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Training', href: '/training', icon: GraduationCap },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Landing Page', href: '/landing-page', icon: Globe },
]

// Mobile bottom navigation items (5 items max for optimal UX)
const mobileNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Add New', href: '/add', icon: Plus, isSpecial: true }, // Center item
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'More', href: '/more', icon: Menu },
]

interface TopNavigationProps {
  user?: {
    user_metadata?: {
      first_name?: string
      avatar_url?: string
    }
  }
}

export function TopNavigation({ user }: TopNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <div className="h-8 w-8 bg-action-purple rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">NM</span>
            </div>
            <span className="ml-3 font-display font-semibold text-text-primary hidden sm:block">
              NetworkCRM
            </span>
          </Link>
        </div>

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-sm font-medium text-text-secondary">
            {user?.user_metadata?.first_name || 'User'}
          </span>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shadow-sm">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-text-secondary font-medium text-sm">
                {user?.user_metadata?.first_name?.[0] || 'U'}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-text-secondary hover:bg-gray-50 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <MobileNavItem
                key={item.name}
                item={item}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export function SidebarNavigation() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:block fixed left-0 top-16 w-60 h-[calc(100vh-4rem)] bg-white border-r border-gray-100 overflow-y-auto shadow-sm">
      <div className="p-6 space-y-2">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.name}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </div>
    </nav>
  )
}

export function MobileBottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="grid grid-cols-5 h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center px-1 py-2 transition-all duration-300 relative ${
                item.isSpecial
                  ? 'transform -translate-y-2' // Elevated center button
                  : ''
              } ${
                isActive && !item.isSpecial
                  ? 'text-action-purple bg-purple-50'
                  : item.isSpecial
                  ? 'text-white'
                  : 'text-text-light hover:text-text-primary'
              }`}
            >
              {item.isSpecial ? (
                <div className="w-12 h-12 bg-action-purple rounded-full flex items-center justify-center shadow-lg">
                  <Icon className="w-6 h-6" />
                </div>
              ) : (
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} />
              )}
              
              {!item.isSpecial && (
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.name}
                </span>
              )}
              
              {isActive && !item.isSpecial && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-action-purple rounded-b-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function SidebarNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={`
        flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
        ${isActive
          ? 'bg-purple-50 text-action-purple font-semibold shadow-sm'
          : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
        }
      `}
    >
      <Icon className="h-5 w-5 mr-3" />
      {item.name}
    </Link>
  )
}

function MobileNavItem({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const pathname = usePathname()
  const isActive = pathname === item.href
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
        ${isActive
          ? 'bg-purple-50 text-action-purple font-semibold'
          : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
        }
      `}
    >
      <Icon className="h-5 w-5 mr-3" />
      {item.name}
    </Link>
  )
} 