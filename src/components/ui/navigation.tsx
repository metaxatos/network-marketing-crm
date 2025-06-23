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
  Settings,
  Menu,
  X,
  Plus
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

interface NavItem {
  nameKey: string
  href: string
  icon: any
  isSpecial?: boolean
}

const navItems: NavItem[] = [
  { nameKey: 'nav.dashboard', href: '/dashboard', icon: Home },
  { nameKey: 'nav.contacts', href: '/contacts', icon: Users },
  { nameKey: 'nav.emails', href: '/emails', icon: Mail },
  { nameKey: 'nav.events', href: '/events', icon: Calendar },
  { nameKey: 'nav.training', href: '/training', icon: GraduationCap },
  { nameKey: 'nav.team', href: '/team', icon: Users },
  { nameKey: 'nav.settings', href: '/settings', icon: Settings },
]

// Mobile bottom navigation items (5 items max for optimal UX)
const mobileNavItems: NavItem[] = [
  { nameKey: 'nav.dashboard', href: '/dashboard', icon: Home },
  { nameKey: 'nav.contacts', href: '/contacts', icon: Users },
  { nameKey: 'nav.addNew', href: '/add', icon: Plus, isSpecial: true }, // Center item
  { nameKey: 'nav.events', href: '/events', icon: Calendar },
  { nameKey: 'nav.more', href: '/more', icon: Menu },
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
  const { t } = useTranslation()
  
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
          <LanguageToggle compact={true} showLabel={false} />
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
            {/* Language Toggle for Mobile */}
            <div className="px-4 py-2 flex justify-center">
              <LanguageToggle showLabel={true} />
            </div>
            <div className="border-t border-gray-100 pt-2">
              {navItems.map((item) => (
                <MobileNavItem
                  key={item.nameKey}
                  item={item}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </div>
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
            key={item.nameKey}
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
  const { t } = useTranslation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="grid grid-cols-5 h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.nameKey}
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
                  {t(item.nameKey)}
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
  const { t } = useTranslation()

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
      {t(item.nameKey)}
    </Link>
  )
}

function MobileNavItem({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const pathname = usePathname()
  const isActive = pathname === item.href
  const Icon = item.icon
  const { t } = useTranslation()

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
      {t(item.nameKey)}
    </Link>
  )
} 