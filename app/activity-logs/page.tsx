"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ActivityLogs from "@/components/activity-logs"
import { getCurrentUser, isAdmin, isAccountant } from "@/lib/auth-utils"

export default function ActivityLogsPage() {
  const router = useRouter()
  const currentUser = getCurrentUser()
  const canViewLogs = isAdmin(currentUser) || isAccountant(currentUser)

  useEffect(() => {
    if (!canViewLogs) {
      router.push("/")
    }
  }, [canViewLogs, router])

  if (!canViewLogs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            Only administrators and accountants can view activity logs.
          </p>
        </div>
      </div>
    )
  }

  return <ActivityLogs />
}
