"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ProjectManagement from "@/components/project-management"
import { getCurrentUser, isRegularUser } from "@/lib/auth-utils"

export default function ProjectManagementPage() {
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

  return <ProjectManagement />
}

