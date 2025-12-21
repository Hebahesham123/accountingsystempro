"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import UserManagement from "@/components/user-management"
import { getCurrentUser, isAdmin } from "@/lib/auth-utils"

export default function UserManagementPage() {
  const router = useRouter()
  const currentUser = getCurrentUser()

  useEffect(() => {
    // Only admins can access user management
    if (!isAdmin(currentUser)) {
      router.push("/")
    }
  }, [currentUser, router])

  if (!isAdmin(currentUser)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Only administrators can access user management.</p>
        </div>
      </div>
    )
  }

  return <UserManagement />
}
