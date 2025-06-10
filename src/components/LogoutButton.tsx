'use client'

import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const { logout } = useUserStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="btn-secondary text-sm"
    >
      👋 Logout
    </button>
  )
} 