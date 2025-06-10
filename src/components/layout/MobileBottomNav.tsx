'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, UsersIcon, CalendarDaysIcon, UserGroupIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, UsersIcon as UsersIconSolid, CalendarDaysIcon as CalendarDaysIconSolid, UserGroupIcon as UserGroupIconSolid, Bars3Icon as Bars3IconSolid } from '@heroicons/react/24/solid';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      iconFilled: HomeIconSolid,
    },
    {
      name: 'Contacts',
      href: '/contacts',
      icon: UsersIcon,
      iconFilled: UsersIconSolid,
    },
    {
      name: 'Events',
      href: '/events',
      icon: CalendarDaysIcon,
      iconFilled: CalendarDaysIconSolid,
    },
    {
      name: 'Team',
      href: '/team',
      icon: UserGroupIcon,
      iconFilled: UserGroupIconSolid,
    },
    {
      name: 'More',
      href: '/more',
      icon: Bars3Icon,
      iconFilled: Bars3IconSolid,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = isActive ? item.iconFilled : item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center px-1 py-2 transition-all duration-200 ${
                isActive
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-purple-600 rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
} 