"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AccountReportsOverview from "@/components/account-reports-overview"
import { getCurrentUser, isRegularUser } from "@/lib/auth-utils"

export default function AccountReportsPage() {
  const router = useRouter()
  const currentUser = getCurrentUser()

  useEffect(() => {
    if (isRegularUser(currentUser)) {
      router.push('/purchase-orders')
    }
  }, [currentUser, router])

  if (isRegularUser(currentUser)) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AccountReportsOverview />
    </div>
  )
}
