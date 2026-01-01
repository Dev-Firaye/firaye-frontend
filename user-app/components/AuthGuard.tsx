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

    // Only run on client side
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    // Don't check auth on login/signup pages
    if (pathname === '/login' || pathname === '/signup') {
      setIsLoading(false)
      setIsAuthorized(true)
      return
    }

    const checkAuth = () => {
      try {
        // Check if user is authenticated
        if (!isAuthenticated()) {
          setIsLoading(false)
          setIsAuthorized(false)
          router.replace('/login')
          return
        }

        // Check if user has the correct role (user app only allows 'user' role)
        const userRole = getUserRole()
        if (userRole !== 'user') {
          // Clear tokens and redirect to login with error message
          Cookies.remove('firaye_token')
          Cookies.remove('firaye_refresh_token')
          setIsLoading(false)
          setIsAuthorized(false)
          router.replace('/login?error=unauthorized')
          return
        }

        setIsAuthorized(true)
        setIsLoading(false)
      } catch (error) {
        console.error('Auth check error:', error)
        setIsLoading(false)
        setIsAuthorized(false)
        router.replace('/login')
      }
    }

    // Small delay to ensure cookies are available
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
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

