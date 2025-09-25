'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const PROTECTED_ROUTES = ['/chat']
const AUTH_ROUTES = ['/login', '/signup', "/home"]

export default function AuthChecker() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuthOnRouteChange = async () => {
      const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname.startsWith(route),
      )
      const isAuthRoute = AUTH_ROUTES.some(route =>
        pathname.startsWith(route),
      )

      if (isProtectedRoute || isAuthRoute) {
        try {
          const response = await fetch('/api/auth/me')
          const isAuthenticated = response.ok

          if (isProtectedRoute && !isAuthenticated) {
            router.push('/home')
          } else if (isAuthRoute && isAuthenticated) {
            router.push('/chat')
          }
        } catch (error) {
          if (isProtectedRoute) {
            router.push('/home')
          }
        }
      }
    }

    checkAuthOnRouteChange()
  }, [pathname, router])

  return null
}
