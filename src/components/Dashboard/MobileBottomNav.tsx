'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Plus,
  Calendar, 
  Grid3X3
} from 'lucide-react'

interface TabItem {
  name: string
  href: string
  icon: any
  isSpecial?: boolean
}

const tabItems: TabItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Add New', href: '/add', icon: Plus, isSpecial: true },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'More', href: '/more', icon: Grid3X3 },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="flex justify-around items-center py-2" style={{ height: '70px' }}>
        {tabItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          if (item.isSpecial) {
            // Special "Add New" button - larger and prominent
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center relative"
              >
                <div className={`
                  w-14 h-14 rounded-full bg-gradient-to-br from-action-purple to-action-blue 
                  text-white flex items-center justify-center shadow-lg
                  transform transition-all duration-200 active:scale-95
                  ${isActive ? 'ring-4 ring-purple-100' : ''}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-text-light mt-1">
                  {item.name}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center min-w-[44px] py-1 transition-all duration-200"
            >
              <div className={`
                w-6 h-6 mb-1 transition-colors duration-200
                ${isActive ? 'text-action-purple' : 'text-text-light'}
              `}>
                <Icon className="w-full h-full" />
              </div>
              <span className={`
                text-xs font-medium transition-colors duration-200
                ${isActive ? 'text-action-purple' : 'text-text-light'}
              `}>
                {item.name}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-action-purple rounded-full"></div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 