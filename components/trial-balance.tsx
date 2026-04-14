"use client"

import { useState, useEffect } from "react"
import { Download, Filter, Search, ChevronRight, ChevronDown, FolderOpen, Folder, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type TrialBalanceItem, AccountingService } from "@/lib/accounting-utils"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"

export default function TrialBalance() {
  const { language, t } = useLanguage()
  const [trialBalance, setTrialBalance] = useState<TrialBalanceItem[]>([])
  const [filteredBalance, setFilteredBalance] = useState<TrialBalanceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [diagnosing, setDiagnosing] = useState(false)
  const [unbalancedEntries, setUnbalancedEntries] = useState<Array<{
    entry_id: string; entry_number: string; entry_date: string
    description: string; total_debit: number; total_credit: number
    difference: number; line_count: number
  }>>([])
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [accountTypeFilter, setAccountTypeFilter] = useState("All Types")
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"flat" | "hierarchical">("hierarchical")
  const { toast } = useToast()

  // Set default dates once on mount (current year)
  useEffect(() => {
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)
    const yearEnd = new Date(now.getFullYear(), 11, 31)
    setStartDate(yearStart.toISOString().split("T")[0])
    setEndDate(yearEnd.toISOString().split("T")[0])
  }, [])

  useEffect(() => {
    applyFilters()
  }, [trialBalance, accountTypeFilter, searchTerm])

  // Load trial balance when dates are set or change (single load with default dates)
  useEffect(() => {
    if (startDate && endDate) {
      loadTrialBalance()
    }
  }, [startDate, endDate])

  const loadTrialBalance = async (start?: string, end?: string) => {
    try {
      setLoading(true)
      const data = await AccountingService.getTrialBalance(start || startDate, end || endDate)
      setTrialBalance(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load trial balance",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const runDiagnosis = async () => {
    try {
      setDiagnosing(true)
      const results = await AccountingService.findUnbalancedEntries(startDate, endDate)
      setUnbalancedEntries(results)
      setShowDiagnosis(true)
    } catch (error) {
      toast({ title: "Error", description: "Failed to run diagnosis", variant: "destructive" })
    } finally {
      setDiagnosing(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...trialBalance]

    // Filter by account type
    if (accountTypeFilter !== "All Types") {
      filtered = filtered.filter((item) => item.account_type === accountTypeFilter)
    }

    // Filter by search term (account name or code)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.account_name.toLowerCase().includes(searchLower) ||
          item.account_code.toLowerCase().includes(searchLower),
      )
    }

    setFilteredBalance(filtered)
  }

  const handleDateFilter = () => {
    loadTrialBalance(startDate, endDate)
  }

  // CORRECT trial balance: use raw debit_total and credit_total
  // These are the actual sums of debit/credit entries per account
  // If all journal entries are balanced (debit=credit), these MUST be equal
  const getTotalDebits = () => {
    // Sum ALL accounts - the getTrialBalance() function already handles hierarchy correctly
    return filteredBalance
      .reduce((sum, item) => sum + (item.debit_total || 0), 0)
  }

  const getTotalCredits = () => {
    // Sum ALL accounts - the getTrialBalance() function already handles hierarchy correctly
    return filteredBalance
      .reduce((sum, item) => sum + (item.credit_total || 0), 0)
  }

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

  const toggleExpanded = (accountId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId)
    } else {
      newExpanded.add(accountId)
    }
    setExpandedNodes(newExpanded)
  }

  const expandAll = () => {
    const allParentIds = filteredBalance.filter(item => item.has_children).map(item => item.account_id)
    setExpandedNodes(new Set(allParentIds))
  }

  const collapseAll = () => {
    setExpandedNodes(new Set())
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Build hierarchical display order
  const getHierarchicalItems = () => {
    if (viewMode === "flat") {
      return filteredBalance
    }

    const result: TrialBalanceItem[] = []
    const processed = new Set<string>()

    const addItemWithChildren = (item: TrialBalanceItem, depth: number = 0) => {
      if (processed.has(item.account_id)) return
      processed.add(item.account_id)

      result.push({ ...item, level: depth + 1 })

      if (expandedNodes.has(item.account_id)) {
        const children = filteredBalance.filter(child => child.parent_account_id === item.account_id)
        for (const child of children.sort((a, b) => a.account_code.localeCompare(b.account_code))) {
          addItemWithChildren(child, depth + 1)
        }
      }
    }

    // Start with root accounts (no parent)
    const rootItems = filteredBalance
      .filter(item => !item.parent_account_id)
      .sort((a, b) => a.account_code.localeCompare(b.account_code))

    for (const item of rootItems) {
      addItemWithChildren(item)
    }

    return result
  }

  const exportToCSV = () => {
    const headers = ["Account Code", "Account Name", "Type", "Opening Balance", "Debits", "Credits", "Closing Balance"]
    const csvContent = [
      headers.join(","),
      ...filteredBalance.map((item) =>
        [
          item.account_code,
          `"${item.account_name}"`,
          item.account_type,
          item.opening_balance.toFixed(2),
          item.debit_total.toFixed(2),
          item.credit_total.toFixed(2),
          item.closing_balance.toFixed(2),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `trial-balance-${startDate}-to-${endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("tb.title")}</CardTitle>
            <CardDescription>{t("tb.summary")}</CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline" disabled={filteredBalance.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {t("tb.exportCSV")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="space-y-4 mb-6">
          {/* Date Filter */}
          <div className="flex items-end gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="start_date">{t("je.startDate")}</Label>
              <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">{t("je.endDate")}</Label>
              <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button onClick={handleDateFilter} disabled={loading}>
              <Filter className="h-4 w-4 mr-2" />
              {loading ? t("common.loading") : t("tb.applyDateFilter")}
            </Button>
            <Button onClick={() => loadTrialBalance(startDate, endDate)} variant="outline" disabled={loading} title="Reload trial balance with latest data">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {language === "ar" ? "تحديث" : "Refresh"}
            </Button>
          </div>

          {/* Search and Type Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">{t("tb.searchByNameOrCode")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={t("tb.searchAccounts")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_type">{t("tb.filterByType")}</Label>
              <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("tb.allAccountTypes")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Types">{t("tb.allTypes")}</SelectItem>
                  <SelectItem value="Asset">Asset</SelectItem>
                  <SelectItem value="Liability">Liability</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {language === "ar" ? `عرض ${filteredBalance.length} من ${trialBalance.length} حسابات` : `Showing ${filteredBalance.length} of ${trialBalance.length} accounts`}
            </span>
            {accountTypeFilter !== "All Types" && <Badge variant="outline">Type: {accountTypeFilter}</Badge>}
            {searchTerm && <Badge variant="outline">Search: "{searchTerm}"</Badge>}
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Label>{language === "ar" ? "العرض:" : "View:"}</Label>
            <Select value={viewMode} onValueChange={(v: "flat" | "hierarchical") => setViewMode(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hierarchical">{t("tb.hierarchicalView")}</SelectItem>
                <SelectItem value="flat">{t("tb.flatList")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {viewMode === "hierarchical" && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                {t("tb.expandAll")}
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                {t("tb.collapseAll")}
              </Button>
            </div>
          )}
        </div>

        {/* Trial Balance Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Account</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Debits</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Total (w/ Children)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getHierarchicalItems().map((item) => {
                const isParent = item.has_children
                const isExpanded = expandedNodes.has(item.account_id)
                const indent = viewMode === "hierarchical" ? (item.level - 1) * 20 : 0

                return (
                  <TableRow 
                    key={item.account_id} 
                    className={isParent ? "bg-gray-50 font-medium" : "hover:bg-gray-50"}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
                        {viewMode === "hierarchical" && isParent ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => toggleExpanded(item.account_id)}
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        ) : viewMode === "hierarchical" ? (
                          <div className="w-6" />
                        ) : null}
                        {isParent ? (
                          <FolderOpen className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Folder className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="font-mono text-sm text-gray-600">{item.account_code}</span>
                        <span className={isParent ? "font-semibold" : ""}>{item.account_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAccountTypeColor(item.account_type)}>{item.account_type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {(item.debit_total || 0) > 0 ? formatCurrency(item.debit_total) : <span className="text-gray-300">-</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      {(item.credit_total || 0) > 0 ? formatCurrency(item.credit_total) : <span className="text-gray-300">-</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={item.closing_balance >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(item.closing_balance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {isParent ? (
                        <span className="font-bold text-blue-600">
                          {formatCurrency(item.total_balance)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}

              {filteredBalance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {loading ? t("tb.loading") : (language === "ar" ? "لا توجد حسابات تطابق المرشحات" : "No accounts match your filters")}
                  </TableCell>
                </TableRow>
              )}

              {/* Totals Row */}
              {filteredBalance.length > 0 && (
                <TableRow className="bg-blue-50 font-semibold border-t-2">
                  <TableCell colSpan={2} className="text-right">
                    <strong>{language === "ar" ? "الإجماليات الكبرى:" : "GRAND TOTALS:"}</strong>
                  </TableCell>
                  <TableCell className="text-right">
                    <strong>{formatCurrency(getTotalDebits())}</strong>
                  </TableCell>
                  <TableCell className="text-right">
                    <strong>{formatCurrency(getTotalCredits())}</strong>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={Math.abs(getTotalDebits() - getTotalCredits()) < 0.01 ? "default" : "destructive"}>
                      {Math.abs(getTotalDebits() - getTotalCredits()) < 0.01 
                        ? (language === "ar" ? "متوازن ✓" : "Balanced ✓")
                        : (language === "ar" ? "غير متوازن ✗" : "Not Balanced ✗")}
                    </Badge>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Balance Verification */}
        {filteredBalance.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-medium">{language === "ar" ? "التحقق من التوازن:" : "Balance Verification:"}</span>
              <div className="flex items-center gap-4 flex-wrap">
                <span>{t("tb.totalDebits")}: ${getTotalDebits().toFixed(2)}</span>
                <span>{t("tb.totalCredits")}: ${getTotalCredits().toFixed(2)}</span>
                <Badge variant={Math.abs(getTotalDebits() - getTotalCredits()) < 0.01 ? "default" : "destructive"}>
                  {Math.abs(getTotalDebits() - getTotalCredits()) < 0.01
                    ? (language === "ar" ? "متوازن ✓" : "Balanced ✓")
                    : (language === "ar" ? "غير متوازن ✗" : "Not Balanced ✗")}
                </Badge>
                {Math.abs(getTotalDebits() - getTotalCredits()) >= 0.01 && (
                  <Button onClick={runDiagnosis} disabled={diagnosing} size="sm">
                    {diagnosing ? "..." : (language === "ar" ? "البحث عن السبب" : "Find Cause")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Diagnosis Results */}
        {showDiagnosis && unbalancedEntries.length > 0 && (
          <div className="mt-4 border border-red-200 rounded-lg overflow-hidden bg-red-50">
            <div className="px-4 py-3 bg-red-100 border-b">
              <h4 className="font-semibold text-red-900">
                {language === "ar" ? "قيود غير متوازنة" : "Unbalanced Entries"} ({unbalancedEntries.length})
              </h4>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === "ar" ? "رقم القيد" : "Entry"}</TableHead>
                    <TableHead>{language === "ar" ? "التاريخ" : "Date"}</TableHead>
                    <TableHead className="text-right">{language === "ar" ? "مدين" : "Debit"}</TableHead>
                    <TableHead className="text-right">{language === "ar" ? "دائن" : "Credit"}</TableHead>
                    <TableHead className="text-right">{language === "ar" ? "الفرق" : "Difference"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unbalancedEntries.map((entry) => (
                    <TableRow key={entry.entry_id}>
                      <TableCell>
                        <Link href={`/journal-entries?id=${entry.entry_id}`} className="text-blue-600 hover:underline">
                          {entry.entry_number}
                        </Link>
                      </TableCell>
                      <TableCell>{new Date(entry.entry_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">${entry.total_debit.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${entry.total_credit.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold text-red-700">${entry.difference.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Success Message - Only when balanced and diagnosis ran */}
        {showDiagnosis && unbalancedEntries.length === 0 && (
          <div className="mt-4 border border-green-200 rounded-lg overflow-hidden bg-green-50">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-green-800">
                ✓ {language === "ar" ? "جميع القيود متوازنة وصحيحة!" : "All journal entries are balanced and correct!"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
