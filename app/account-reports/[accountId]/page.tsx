"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import AccountDetailReport from "@/components/account-detail-report"
import { AccountingService } from "@/lib/accounting-utils"
import { getCurrentUser, isRegularUser } from "@/lib/auth-utils"
import { useState } from "react"

interface AccountReportPageProps {
  params: {
    accountId: string
  }
}

export default function AccountReportPage({ params }: AccountReportPageProps) {
  const router = useRouter()
  const currentUser = getCurrentUser()
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isRegularUser(currentUser)) {
      router.push('/purchase-orders')
      return
    }

    async function loadAccount() {
      try {
        const accounts = await AccountingService.getChartOfAccounts()
        const foundAccount = accounts.find(acc => acc.id === params.accountId)
        
        if (!foundAccount) {
          notFound()
        }
        setAccount(foundAccount)
      } catch (error) {
        console.error("Error loading account:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    loadAccount()
  }, [currentUser, router, params.accountId])

  if (isRegularUser(currentUser) || loading) {
    return null
  }

  if (!account) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AccountDetailReport 
        accountId={params.accountId}
        accountCode={account.code}
        accountName={account.name}
      />
    </div>
  )
}
