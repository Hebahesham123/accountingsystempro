"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { AccountingService } from "@/lib/accounting-utils"
import JournalEntryEditForm from "@/components/journal-entry-edit-form"
import { getCurrentUser, canEdit } from "@/lib/auth-utils"

interface EditPageProps {
  params: {
    id: string
  }
}

export default function EditJournalEntryPage({ params }: EditPageProps) {
  const router = useRouter()
  const currentUser = getCurrentUser()

  useEffect(() => {
    // Check if user can edit
    if (!canEdit(currentUser)) {
      router.push("/journal-entries")
    }
  }, [currentUser, router])

  if (!canEdit(currentUser)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to edit journal entries.</p>
        </div>
      </div>
    )
  }

  return <JournalEntryEditFormWrapper entryId={params.id} />
}

function JournalEntryEditFormWrapper({ entryId }: { entryId: string }) {
  const [entry, setEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEntry() {
      try {
        const data = await AccountingService.getJournalEntryById(entryId)
        if (!data) {
          notFound()
        }
        setEntry(data)
      } catch (error) {
        console.error("Error loading journal entry:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    loadEntry()
  }, [entryId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading journal entry...</p>
        </div>
      </div>
    )
  }

  if (!entry) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Journal Entry</h1>
        <p className="text-muted-foreground">
          Edit journal entry: {entry.entry_number}
        </p>
      </div>
      <JournalEntryEditForm entry={entry} />
    </div>
  )
}
