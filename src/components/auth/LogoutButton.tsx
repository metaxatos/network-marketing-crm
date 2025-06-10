'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export default function LogoutButton({ className = "btn-secondary", children = "Logout" }: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <button onClick={handleLogout} className={className}>
      {children}
    </button>
  )
} 