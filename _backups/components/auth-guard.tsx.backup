"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated } from "@/lib/auth-utils"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Don't protect login page
    if (pathname === '/login') {
      setIsChecking(false)
      return
    }

    // Check authentication
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        router.push('/login')
        return
      }
      setIsChecking(false)
    }
    
    checkAuth()
  }, [pathname, router])

  // Show loading state while checking
  if (isChecking && pathname !== '/login') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

