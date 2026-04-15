"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Search, Filter, FileText, Eye, RotateCcw, Image, Plus, Calendar, DollarSign, Users, AlertCircle, CheckCircle, Clock, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type JournalEntry, AccountingService } from "@/lib/accounting-utils"
import { useToast } from "@/hooks/use-toast"
import JournalEntryReview from "@/components/journal-entry-review"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { getCurrentUser, canEditAccountingData } from "@/lib/auth-utils"
import { useLanguage } from "@/lib/language-context"

// Standalone utility — computes actual balance from line data, never trusts the DB flag
function computeIsBalanced(entry: any): boolean {
  const lines = entry.journal_entry_lines
  if (!lines || lines.length === 0) return false
  let td = 0, tc = 0
  for (const l of lines) {
    td += parseFloat(String(l.debit_amount  ?? 0)) || 0
    tc += parseFloat(String(l.credit_amount ?? 0)) || 0
  }
  return Math.abs(td - tc) < 0.01 && td > 0
}

export default function JournalEntriesList() {
  const { language, t } = useLanguage()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalDebits: 0,
    totalCredits: 0,
    balancedEntries: 0,
    entriesWithLines: 0,
    entriesWithoutLines: 0
  })
  const { toast } = useToast()
  const PAGE_SIZE = 50
  const [currentPage, setCurrentPage] = useState(1)

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    accountType: "All Types",
    searchTerm: "",
    status: "All Statuses"
  })

  useEffect(() => {
    // Set default dates (current year to show more entries)
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)
    const yearEnd = new Date(now.getFullYear(), 11, 31)

    const defaultStartDate = yearStart.toISOString().split("T")[0]
    const defaultEndDate = yearEnd.toISOString().split("T")[0]

    setFilters((prev) => ({
      ...prev,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
    }))

    // Load entries with the default dates immediately
    const loadWithDefaults = async () => {
      try {
        setLoading(true)
        const filterParams = {
          startDate: defaultStartDate,
          endDate: defaultEndDate,
          accountType: undefined,
          searchTerm: undefined,
        }
        const data = await AccountingService.getJournalEntries(filterParams)
        setEntries(data || [])

        // Calculate statistics — always compute from actual lines (header totals can be stale)
        const totalDebits = (data || []).reduce((sum, entry) => {
          const lines = entry.journal_entry_lines || []
          const td = lines.reduce((s: number, l: any) => s + (parseFloat(String(l.debit_amount ?? 0)) || 0), 0)
          return sum + (td > 0 ? td : (entry.total_debit || 0))
        }, 0)
        const totalCredits = (data || []).reduce((sum, entry) => {
          const lines = entry.journal_entry_lines || []
          const tc = lines.reduce((s: number, l: any) => s + (parseFloat(String(l.credit_amount ?? 0)) || 0), 0)
          return sum + (tc > 0 ? tc : (entry.total_credit || 0))
        }, 0)
        const balancedEntries = (data || []).filter(entry => {
          return computeIsBalanced(entry)
        }).length
        const entriesWithLines = (data || []).filter(entry => entry.journal_entry_lines && entry.journal_entry_lines.length > 0).length
        const entriesWithoutLines = (data || []).length - entriesWithLines

        setStats({
          totalEntries: (data || []).length,
          totalDebits,
          totalCredits,
          balancedEntries,
          entriesWithLines,
          entriesWithoutLines
        })
      } catch (error) {
        console.error("Error loading entries:", error)
        toast({
          title: "Error",
          description: "Failed to load journal entries",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadWithDefaults()
  }, [])

  // Enhanced loadEntries function with statistics
  const loadEntries = useCallback(async () => {
    try {
      setLoading(true)
      console.log("Loading entries with filters:", filters)

      // If no dates are set, load all entries (no date filter)
      const filterParams = {
        startDate: filters.startDate && filters.startDate.trim() !== "" ? filters.startDate : undefined,
        endDate: filters.endDate && filters.endDate.trim() !== "" ? filters.endDate : undefined,
        accountType: filters.accountType === "All Types" ? undefined : filters.accountType,
        searchTerm: filters.searchTerm && filters.searchTerm.trim() !== "" ? filters.searchTerm : undefined,
      }

      console.log("Filter params:", filterParams)
      const data = await AccountingService.getJournalEntries(filterParams)
      console.log("Loaded entries:", data)
      console.log("Number of entries loaded:", data?.length || 0)

      setEntries(data || [])

      // Calculate statistics — always compute from actual lines (header totals can be stale)
      const totalDebits = (data || []).reduce((sum, entry) => {
        const lines = entry.journal_entry_lines || []
        const td = lines.reduce((s: number, l: any) => s + (parseFloat(String(l.debit_amount ?? 0)) || 0), 0)
        return sum + (td > 0 ? td : (entry.total_debit || 0))
      }, 0)
      const totalCredits = (data || []).reduce((sum, entry) => {
        const lines = entry.journal_entry_lines || []
        const tc = lines.reduce((s: number, l: any) => s + (parseFloat(String(l.credit_amount ?? 0)) || 0), 0)
        return sum + (tc > 0 ? tc : (entry.total_credit || 0))
      }, 0)
      const balancedEntries = (data || []).filter(entry => computeIsBalanced(entry)).length
      const entriesWithLines = (data || []).filter(entry => entry.journal_entry_lines && entry.journal_entry_lines.length > 0).length
      const entriesWithoutLines = (data || []).length - entriesWithLines

      setStats({
        totalEntries: (data || []).length,
        totalDebits,
        totalCredits,
        balancedEntries,
        entriesWithLines,
        entriesWithoutLines
      })
    } catch (error) {
      console.error("Error loading entries:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load journal entries",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  // Reload when filters change
  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      loadEntries().catch((error) => {
        console.error("Error loading entries:", error)
      })
    }
  }, [filters.startDate, filters.endDate, loadEntries])

  const applyFilters = () => {
    loadEntries()
  }

  // Auto-apply filters when they change (but not dates, those are handled separately)
  useEffect(() => {
    // Only reload if dates are set (to avoid loading before initial dates are set)
    if (filters.startDate || filters.endDate || (!filters.startDate && !filters.endDate)) {
      loadEntries().catch((error) => {
        console.error("Error loading entries:", error)
      })
    }
  }, [filters.accountType, filters.searchTerm, filters.status, loadEntries])

  // Reset to page 1 when filters change
  const handleFilterChange = (field: string, value: string) => {
    setCurrentPage(1)
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Apply status filter client-side using computed balance from actual lines
  const filteredEntries = entries.filter(entry => {
    if (filters.status === "All Statuses") return true
    const hasLines = entry.journal_entry_lines && entry.journal_entry_lines.length > 0
    if (filters.status === "Missing Lines") return !hasLines
    const balanced = computeIsBalanced(entry)
    if (filters.status === "Balanced") return hasLines && balanced
    if (filters.status === "Unbalanced") return hasLines && !balanced
    return true
  })

  const getAccountTypeColor = (type: string) => {
    const colors = {
      Asset: "bg-green-100 text-green-800",
      Liability: "bg-red-100 text-red-800",
      Equity: "bg-blue-100 text-blue-800",
      Revenue: "bg-purple-100 text-purple-800",
      Expense: "bg-orange-100 text-orange-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusBadge = (entry: JournalEntry) => {
    const hasLines = entry.journal_entry_lines && entry.journal_entry_lines.length > 0

    if (!hasLines) {
      return (
        <Badge variant="destructive" className="bg-orange-100 text-orange-800 border-orange-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t("je.missingLinesStatus")}
        </Badge>
      )
    }

    // Use computed balance from actual lines, not the DB flag
    if (computeIsBalanced(entry)) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          {t("je.balanced")}
        </Badge>
      )
    }

    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        {t("je.unbalanced")}
      </Badge>
    )
  }

  // Enhanced reverse function with better error handling
  const handleReverseEntry = async (entryId: string) => {
    try {
      console.log("Reversing journal entry:", entryId)

      // Use AccountingService to reverse the entry
      await AccountingService.reverseJournalEntry(entryId)

      console.log("Journal entry reversed successfully")

      toast({
        title: "Success",
        description: "Journal entry debit and credit amounts have been swapped",
      })
      // Reload entries to show the updated amounts
      await loadEntries()
    } catch (error) {
      console.error("Error reversing journal entry:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reverse journal entry amounts",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
      return
    }

    try {
      // First delete the journal entry lines
      const { error: linesError } = await supabase
        .from("journal_entry_lines")
        .delete()
        .eq("journal_entry_id", entryId)

      if (linesError) {
        console.error("Error deleting journal entry lines:", linesError)
        throw new Error("Failed to delete journal entry lines")
      }

      // Then delete the journal entry header
      const { error: entryError } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", entryId)

      if (entryError) {
        console.error("Error deleting journal entry:", entryError)
        throw new Error("Failed to delete journal entry")
      }

      toast({
        title: "Success",
        description: "Journal entry deleted successfully",
      })

      // Reload entries with error handling
      await loadEntries().catch((error) => {
        console.error("Error reloading entries after delete:", error)
      })
    } catch (error) {
      console.error("Error deleting journal entry:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete journal entry",
        variant: "destructive",
      })
    }
  }

  const handleRepairBalanceFlags = async () => {
    try {
      setLoading(true)
      const result = await AccountingService.repairBalanceFlags()
      await loadEntries()
      if (result.stillUnbalanced.length > 0) {
        toast({
          title: language === "ar" ? "تم الإصلاح — توجد قيود غير متوازنة" : `Repaired ${result.fixed} flags — ${result.stillUnbalanced.length} entries still unbalanced`,
          description: (language === "ar" ? "القيود غير المتوازنة: " : "Unbalanced entries: ") + result.stillUnbalanced.join(", "),
          variant: "destructive",
        })
      } else {
        toast({
          title: language === "ar" ? "تم الإصلاح بنجاح" : `Fixed ${result.fixed} flags — all ${result.checked} entries balanced`,
          description: language === "ar" ? "جميع القيود متوازنة الآن" : "All entries now show correct balance status",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to repair flags",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Statistics */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal Entries</h1>
          <p className="text-gray-600 mt-1">Manage and review all journal entries</p>
        </div>
        <div className="flex gap-3">
          {canEditAccountingData(getCurrentUser()) && (
            <>
              <Button variant="outline" onClick={handleRepairBalanceFlags} disabled={loading} title="Recalculate is_balanced flags from actual line data">
                <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                {language === "ar" ? "إصلاح حالة التوازن" : "Repair Balance Flags"}
              </Button>
              <Link href="/journal-entries">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{language === "ar" ? "إجمالي القيود" : "Total Entries"}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
            <p className="text-xs text-muted-foreground">
              {stats.balancedEntries} {language === "ar" ? "متوازن" : "balanced"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("je.totalDebit")}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalDebits)}</div>
            <p className="text-xs text-muted-foreground">
              All entries combined
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("je.totalCredit")}</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalCredits)}</div>
            <p className="text-xs text-muted-foreground">
              All entries combined
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{language === "ar" ? "سلامة البيانات" : "Data Integrity"}</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.entriesWithoutLines}</div>
            <p className="text-xs text-muted-foreground">
              {language === "ar" ? "بنود مفقودة" : "Missing lines"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("general.filter")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{language === "ar" ? "تاريخ البداية" : "Start Date"}</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{language === "ar" ? "تاريخ النهاية" : "End Date"}</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountType">{t("coa.accountType")}</Label>
              <Select value={filters.accountType} onValueChange={(value) => handleFilterChange("accountType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Types">All Types</SelectItem>
                  <SelectItem value="Asset">Asset</SelectItem>
                  <SelectItem value="Liability">Liability</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t("common.status")}</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Statuses">All Statuses</SelectItem>
                  <SelectItem value="Balanced">{t("je.balanced")}</SelectItem>
                  <SelectItem value="Unbalanced">{t("je.unbalanced")}</SelectItem>
                  <SelectItem value="Missing Lines">{t("je.missingLinesStatus")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">{t("common.search")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={language === "ar" ? "بحث في القيود..." : "Search entries..."}
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters} disabled={loading} className="flex-1">
              <Filter className="h-4 w-4 mr-2" />
              {loading ? t("common.loading") : (language === "ar" ? "تطبيق المرشحات" : "Apply Filters")}
            </Button>
            <Button 
              onClick={async () => {
                setFilters(prev => ({
                  ...prev,
                  startDate: "",
                  endDate: "",
                  accountType: "All Types",
                  searchTerm: "",
                  status: "All Statuses"
                }))
                // Load all entries without date filters
                try {
                  setLoading(true)
                  const data = await AccountingService.getJournalEntries({
                    startDate: undefined,
                    endDate: undefined,
                    accountType: undefined,
                    searchTerm: undefined,
                  })
                  setEntries(data || [])

                  const totalDebits = (data || []).reduce((sum, entry) => {
                    const lines = entry.journal_entry_lines || []
                    const td = lines.reduce((s: number, l: any) => s + (parseFloat(String(l.debit_amount ?? 0)) || 0), 0)
                    return sum + (td > 0 ? td : (entry.total_debit || 0))
                  }, 0)
                  const totalCredits = (data || []).reduce((sum, entry) => {
                    const lines = entry.journal_entry_lines || []
                    const tc = lines.reduce((s: number, l: any) => s + (parseFloat(String(l.credit_amount ?? 0)) || 0), 0)
                    return sum + (tc > 0 ? tc : (entry.total_credit || 0))
                  }, 0)
                  const balancedEntries = (data || []).filter(entry => computeIsBalanced(entry)).length
                  const entriesWithLines = (data || []).filter(entry => entry.journal_entry_lines && entry.journal_entry_lines.length > 0).length
                  const entriesWithoutLines = (data || []).length - entriesWithLines

                  setStats({
                    totalEntries: (data || []).length,
                    totalDebits,
                    totalCredits,
                    balancedEntries,
                    entriesWithLines,
                    entriesWithoutLines
                  })
                } catch (error) {
                  console.error("Error loading all entries:", error)
                  toast({
                    title: "Error",
                    description: "Failed to load journal entries",
                    variant: "destructive",
                  })
                } finally {
                  setLoading(false)
                }
              }} 
              variant="outline"
              disabled={loading}
            >
              {t("je.showAll")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("je.title")} ({filteredEntries.length})
          </CardTitle>
          <CardDescription>
            {language === "ar" ? "تفاصيل كاملة لجميع قيود اليومية مع وظائف محسنة" : "Complete details of all journal entries with enhanced functionality"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("je.entryNumber")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("common.description")}</TableHead>
                  <TableHead>{t("je.accountName")}</TableHead>
                  <TableHead>{t("je.project")}</TableHead>
                  <TableHead>{t("common.createdBy")}</TableHead>
                  <TableHead className="text-right">{t("common.amount")}</TableHead>
                  <TableHead>{t("je.lines")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        {t("je.loading")}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      {filters.status !== "All Statuses"
                        ? (language === "ar" ? "لا توجد قيود تطابق حالة التصفية" : "No entries match the selected status filter")
                        : t("je.noEntries")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono font-medium">
                        {entry.entry_number}
                      </TableCell>
                      <TableCell>{formatDate(entry.entry_date)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {entry.description || t("general.noDescription")}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {entry.journal_entry_lines && entry.journal_entry_lines.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {entry.journal_entry_lines.slice(0, 3).map((line: any, idx: number) => {
                              // Handle account data - could be in accounts object or account property
                              const account = line.accounts || line.account || null
                              const accountName = account?.name || "Unknown Account"
                              return (
                                <span key={idx} className="text-sm truncate" title={accountName}>
                                  {accountName}
                                </span>
                              )
                            })}
                            {entry.journal_entry_lines.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{entry.journal_entry_lines.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">{t("je.noAccounts")}</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        {entry.journal_entry_lines && entry.journal_entry_lines.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {entry.journal_entry_lines.slice(0, 3).map((line: any, idx: number) => {
                              // Get project name from line
                              const project = line.projects || null
                              const projectName = project?.name || null
                              return projectName ? (
                                <span key={idx} className="text-sm text-blue-600 truncate" title={projectName}>
                                  {projectName}
                                </span>
                              ) : (
                                <span key={idx} className="text-sm text-gray-400 italic">
                                  -
                                </span>
                              )
                            })}
                            {entry.journal_entry_lines.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{entry.journal_entry_lines.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.users ? (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{entry.users.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">{language === "ar" ? "غير معروف" : "Unknown"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {(() => {
                          // Compute from actual lines — header total_debit/total_credit can be stale
                          const lines = entry.journal_entry_lines || []
                          let td = 0, tc = 0
                          for (const l of lines) {
                            td += parseFloat(String(l.debit_amount  ?? 0)) || 0
                            tc += parseFloat(String(l.credit_amount ?? 0)) || 0
                          }
                          // Fall back to header value if no lines fetched
                          const debit  = td  > 0 ? td  : (entry.total_debit  || 0)
                          const credit = tc  > 0 ? tc  : (entry.total_credit || 0)
                          return (
                            <div className="flex flex-col">
                              <span className="text-green-600 font-medium">{formatCurrency(debit)}</span>
                              <span className="text-blue-600 font-medium">{formatCurrency(credit)}</span>
                            </div>
                          )
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {entry.journal_entry_lines?.length || 0}
                          </span>
                          {entry.journal_entry_lines && entry.journal_entry_lines.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {language === "ar" ? "مكتمل" : "Complete"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(entry)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedEntry(entry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {canEditAccountingData(getCurrentUser()) && (
                            <>
                              <Link href={`/journal-entries/${entry.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              
                              {entry.journal_entry_lines && entry.journal_entry_lines.length > 0 && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleReverseEntry(entry.id)}
                                  title="Reverse debit and credit amounts"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete entry"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {filteredEntries.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-sm text-muted-foreground">
            {language === "ar"
              ? `عرض ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredEntries.length)} من ${filteredEntries.length}`
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredEntries.length)} of ${filteredEntries.length} entries`}
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              ← {language === "ar" ? "السابق" : "Prev"}
            </button>
            {Array.from({ length: Math.ceil(filteredEntries.length / PAGE_SIZE) }, (_, i) => i + 1)
              .filter(p => p === 1 || p === Math.ceil(filteredEntries.length / PAGE_SIZE) || Math.abs(p - currentPage) <= 2)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-2 py-1 text-sm text-muted-foreground">…</span>}
                  <button
                    className={`px-3 py-1 rounded border text-sm ${p === currentPage ? "bg-primary text-white border-primary" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-40"
              disabled={currentPage === Math.ceil(filteredEntries.length / PAGE_SIZE)}
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredEntries.length / PAGE_SIZE), p + 1))}
            >
              {language === "ar" ? "التالي" : "Next"} →
            </button>
          </div>
        </div>
      )}

      {/* Journal Entry Review Modal */}
      {selectedEntry && (
        <JournalEntryReview 
          entry={selectedEntry} 
          onClose={() => setSelectedEntry(null)} 
        />
      )}
    </div>
  )
}
