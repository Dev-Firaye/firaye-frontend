'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'
import { getUserRole, isAuthenticated } from '@/lib/auth'
import { setRouter } from '@/lib/api'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set router instance for API interceptor
    setRouter(router)

    // Don't check auth on login/signup pages
    if (pathname === '/login' || pathname === '/signup') {
      setIsLoading(false)
      setIsAuthorized(true)
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.replace('/login')
      return
    }

    // Check if user has the correct role (merchant dashboard only allows 'merchant' role)
    const userRole = getUserRole()
    if (userRole !== 'merchant') {
      // Clear tokens and redirect to login with error message
      Cookies.remove('firaye_token')
      Cookies.remove('firaye_refresh_token')
      router.replace('/login?error=unauthorized')
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

