"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JournalEntryForm from "@/components/journal-entry-form"
import JournalEntriesList from "@/components/journal-entries-list"
import { getCurrentUser, canEdit } from "@/lib/auth-utils"

export default function JournalEntriesPage() {
  const currentUser = getCurrentUser()
  const canCreate = canEdit(currentUser)

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue={canCreate ? "create" : "list"} className="w-full">
        <TabsList className={`grid w-full ${canCreate ? "grid-cols-2" : "grid-cols-1"}`}>
          {canCreate && (
            <TabsTrigger value="create">Create Entry</TabsTrigger>
          )}
          <TabsTrigger value="list">View Entries</TabsTrigger>
        </TabsList>

        {canCreate && (
          <TabsContent value="create" className="mt-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Create Journal Entry</h1>
              <p className="text-muted-foreground">Create new journal entries with multiple lines</p>
            </div>
            <JournalEntryForm />
          </TabsContent>
        )}

        <TabsContent value="list" className="mt-6">
          <JournalEntriesList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
