"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ProjectManagement from "@/components/project-management"
import { getCurrentUser, isRegularUser, isAdmin, isAccountant } from "@/lib/auth-utils"

export default function ProjectManagementPage() {
  const router = useRouter()
  const currentUser = getCurrentUser()

  useEffect(() => {
    if (isRegularUser(currentUser) || (!isAdmin(currentUser) && !isAccountant(currentUser))) {
      router.push('/purchase-orders')
    }
  }, [currentUser, router])

  if (isRegularUser(currentUser) || (!isAdmin(currentUser) && !isAccountant(currentUser))) {
    return null
  }

  return <ProjectManagement />
}

