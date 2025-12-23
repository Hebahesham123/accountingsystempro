"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import TrialBalance from "@/components/trial-balance"
import { getCurrentUser, isRegularUser } from "@/lib/auth-utils"

export default function TrialBalancePage() {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trial Balance</h1>
        <p className="text-muted-foreground">View trial balance and verify that debits equal credits</p>
      </div>
      <TrialBalance />
    </div>
  )
}
