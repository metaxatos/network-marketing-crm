'use client'

import { useAppAuth } from '@/hooks/useAuth'

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Initialize auth at the root level
  useAppAuth()
  
  return <>{children}</>
} 