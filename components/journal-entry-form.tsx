"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Calculator, Save, RotateCcw, Plus, Trash2, Search, ChevronRight, ChevronDown, Upload, Image, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { type Account, AccountingService } from "@/lib/accounting-utils"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser, canEditAccountingData } from "@/lib/auth-utils"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"

interface JournalLine {
  id: string
  account_id: string
  description: string
  project_id?: string
  type: "debit" | "credit"
  amount: number
  image_data?: string
}

interface HierarchicalAccount extends Account {
  children?: HierarchicalAccount[]
  level: number
}

export default function JournalEntryForm() {
  const router = useRouter()
  const currentUser = getCurrentUser()
  const { language, t } = useLanguage()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [hierarchicalAccounts, setHierarchicalAccounts] = useState<HierarchicalAccount[]>([])
  const [accountBalances, setAccountBalances] = useState<Map<string, { ownBalance: number; totalBalance: number }>>(new Map())
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
  const [searchValue, setSearchValue] = useState("")
  const [openPopovers, setOpenPopovers] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    description: "",
  })
  const [entryNumber, setEntryNumber] = useState<string>("")

  const [lines, setLines] = useState<JournalLine[]>([
    { id: "1", account_id: "", description: "", project_id: "", type: "debit", amount: 0 },
    { id: "2", account_id: "", description: "", project_id: "", type: "credit", amount: 0 },
  ])

  // Check permissions on mount
  useEffect(() => {
    if (!canEditAccountingData(currentUser)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create journal entries. View only.",
        variant: "destructive",
      })
      router.push("/journal-entries")
      return
    }
    
    // Only load once on mount
    let isMounted = true
    if (isMounted) {
      loadAccounts()
      loadProjects()
      generateEntryNumber()
    }
    
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run once on mount

  // Don't render form if user can't edit
  if (!canEditAccountingData(currentUser)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to create journal entries.</p>
          <p className="text-sm text-muted-foreground mt-2">Regular users can only view entries.</p>
        </div>
      </div>
    )
  }

  const generateEntryNumber = async () => {
    try {
      const number = await AccountingService.generateEntryNumber()
      setEntryNumber(number)
    } catch (error) {
      console.error("Error generating entry number:", error)
      setEntryNumber("JE-001") // Fallback
    }
  }

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true)
      console.log("Loading accounts and balances...")
      
      // Load accounts first (faster) with timeout
      const accountsPromise = AccountingService.getChartOfAccounts()
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Accounts loading timeout after 15 seconds. Please check your connection and try refreshing.")), 15000)
      )
      
      const data = await Promise.race([accountsPromise, timeoutPromise])
      console.log(`Loaded ${data.length} accounts`)
      setAccounts(data)
      
      // Build hierarchical structure immediately so UI can render
      const hierarchical = buildAccountHierarchy(data)
      setHierarchicalAccounts(hierarchical)
      
      // Load balances separately (might be slower) - don't block UI
      AccountingService.getAllAccountBalances()
        .then(balances => {
          console.log(`Loaded balances for ${balances.size} accounts`)
          setAccountBalances(balances)
        })
        .catch(balanceError => {
          console.error("Error loading balances (continuing without balances):", balanceError)
          // Continue without balances - form can still work
          setAccountBalances(new Map())
        })
    } catch (error) {
      console.error("Error loading accounts:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load accounts"
      console.error("Full error details:", error)
      toast({
        title: "Error Loading Accounts",
        description: errorMessage + ". Please check your browser console for details.",
        variant: "destructive",
      })
      // Set empty arrays so form can still render (even if empty)
      setAccounts([])
      setHierarchicalAccounts([])
    } finally {
      setLoadingAccounts(false)
    }
  }

  const loadProjects = async () => {
    try {
      const data = await AccountingService.getProjects()
      setProjects(data)
    } catch (error) {
      console.error("Error loading projects:", error)
      // Continue without projects - form can still work
      setProjects([])
    }
  }

  const getBalance = (accountId: string) => {
    const balance = accountBalances.get(accountId)
    return balance?.totalBalance || 0
  }

  const buildAccountHierarchy = (accounts: Account[]): HierarchicalAccount[] => {
    const accountMap = new Map<string, HierarchicalAccount>()
    const rootAccounts: HierarchicalAccount[] = []

    // First pass: create all account objects with level 0
    accounts.forEach(account => {
      accountMap.set(account.id, {
        ...account,
        children: [],
        level: 0
      })
    })

    // Second pass: build parent-child relationships
    accounts.forEach(account => {
      const hierarchicalAccount = accountMap.get(account.id)!
      
      if (account.parent_account_id) {
        const parent = accountMap.get(account.parent_account_id)
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(hierarchicalAccount)
          hierarchicalAccount.level = parent.level + 1
        }
      } else {
        rootAccounts.push(hierarchicalAccount)
      }
    })

    // Sort accounts by code within each level
    const sortAccounts = (accountList: HierarchicalAccount[]) => {
      accountList.sort((a, b) => a.code.localeCompare(b.code))
      accountList.forEach(account => {
        if (account.children && account.children.length > 0) {
          sortAccounts(account.children)
        }
      })
    }

    sortAccounts(rootAccounts)
    return rootAccounts
  }

  const toggleAccountExpansion = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts)
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId)
    } else {
      newExpanded.add(accountId)
    }
    setExpandedAccounts(newExpanded)
  }

  const getAccountTypeIcon = (type: string) => {
    const icons = {
      Asset: "💰",
      Assets: "💰",
      Liability: "📋",
      Liabilities: "📋",
      Equity: "🏛️",
      Revenue: "📈",
      Expenses: "💸",
      Expense: "💸",
    }
    return icons[type as keyof typeof icons] || "📊"
  }

  const renderAccountOption = (account: HierarchicalAccount, depth = 0, onSelect?: (accountId: string) => void) => {
    const hasChildren = account.children && account.children.length > 0
    const isExpanded = expandedAccounts.has(account.id)
    const accountTypeName = account.account_types?.name || account.account_type
    const isSubAccount = !!account.parent_account_id

    return (
      <div key={account.id}>
        <CommandItem
          value={account.id}
          onSelect={() => {
            if (onSelect) {
              onSelect(account.id)
            }
          }}
          className="flex items-center gap-2 cursor-pointer"
          style={{ paddingLeft: `${depth * 20 + 16}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation()
                toggleAccountExpansion(account.id)
              }}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          ) : (
            <div className="w-4 mr-1" />
          )}
          
          <div className="flex items-center gap-2 flex-1">
            <span className="text-lg">{getAccountTypeIcon(accountTypeName)}</span>
            {isSubAccount && (
              <span className="text-blue-500 text-xs">📁</span>
            )}
            <span className="font-mono text-sm text-gray-600">{account.code}</span>
            <span className="font-medium">{account.name}</span>
            <Badge className={getAccountTypeColor(accountTypeName)}>{accountTypeName}</Badge>
            <span className={`ml-auto font-mono text-xs ${getBalance(account.id) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(getBalance(account.id))}
            </span>
          </div>
        </CommandItem>

        {hasChildren && isExpanded && (
          <div>
            {account.children!.map(child => renderAccountOption(child, depth + 1, onSelect))}
          </div>
        )}
      </div>
    )
  }

  const getAccountTypeColor = (type: string) => {
    const colors = {
      Asset: "bg-green-100 text-green-800",
      Assets: "bg-green-100 text-green-800",
      Liability: "bg-red-100 text-red-800",
      Liabilities: "bg-red-100 text-red-800",
      Equity: "bg-blue-100 text-blue-800",
      Revenue: "bg-purple-100 text-purple-800",
      Expenses: "bg-orange-100 text-orange-800",
      Expense: "bg-orange-100 text-orange-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const filterAccounts = (accounts: HierarchicalAccount[], searchTerm: string): HierarchicalAccount[] => {
    if (!searchTerm) return accounts
    
    const searchLower = searchTerm.toLowerCase().trim()
    
    return accounts.filter(account => {
      // Get account type name safely
      const accountTypeName = account.account_types?.name || account.account_type || ''
      
      // Check if any field matches
      const codeMatch = account.code && account.code.toLowerCase().includes(searchLower)
      const nameMatch = account.name && account.name.toLowerCase().includes(searchLower)
      const typeMatch = accountTypeName && accountTypeName.toLowerCase().includes(searchLower)
      
      return codeMatch || nameMatch || typeMatch
    })
  }

  const getFilteredAccounts = () => {
    // Always use flat accounts for search to ensure we get all accounts
    const flatAccounts = accounts.map(acc => ({ ...acc, children: [], level: 0 }))
    return filterAccounts(flatAccounts, searchValue)
  }

  const handleAccountSearch = (value: string) => {
    setSearchValue(value)
    
    // If clearing search, collapse all expanded accounts
    if (!value) {
      setExpandedAccounts(new Set())
    }
  }

  // Auto-expand accounts when searching
  useEffect(() => {
    if (searchValue) {
      const accountsToExpand = new Set<string>()
      
      const findAccountsToExpand = (accounts: HierarchicalAccount[]) => {
        accounts.forEach(account => {
          const accountTypeName = account.account_types?.name || account.account_type || ''
          const searchLower = searchValue.toLowerCase()
          
          const matchesSearch = 
            account.code.toLowerCase().includes(searchLower) ||
            account.name.toLowerCase().includes(searchLower) ||
            accountTypeName.toLowerCase().includes(searchLower)
          
          if (matchesSearch) {
            // If this account matches, expand its parent
            if (account.parent_account_id) {
              accountsToExpand.add(account.parent_account_id)
            }
          }
          
          // Check children recursively
          if (account.children && account.children.length > 0) {
            findAccountsToExpand(account.children)
          }
        })
      }
      
      findAccountsToExpand(hierarchicalAccounts)
      setExpandedAccounts(prev => new Set([...prev, ...accountsToExpand]))
    }
  }, [searchValue, hierarchicalAccounts])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLineChange = (lineId: string, field: keyof JournalLine, value: any) => {
    setLines((prev) => prev.map((line) => (line.id === lineId ? { ...line, [field]: value } : line)))
  }

  const handleImageUpload = (lineId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      handleLineChange(lineId, "image_data", result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (lineId: string) => {
    handleLineChange(lineId, "image_data", undefined)
  }

  const addLine = () => {
    const newLine: JournalLine = {
      id: Date.now().toString(),
      account_id: "",
      description: "",
      project_id: "",
      type: "debit",
      amount: 0,
    }
    setLines([...lines, newLine])
  }

  const removeLine = (lineId: string) => {
    if (lines.length > 2) {
      setLines(lines.filter((line) => line.id !== lineId))
    }
  }

  const getTotalDebits = () => {
    return lines.filter((line) => line.type === "debit").reduce((sum, line) => sum + line.amount, 0)
  }

  const getTotalCredits = () => {
    return lines.filter((line) => line.type === "credit").reduce((sum, line) => sum + line.amount, 0)
  }

  const isBalanced = () => {
    // Round totals to 2 decimal places before comparing to avoid floating point precision issues
    const totalDebits = Math.round(getTotalDebits() * 100) / 100
    const totalCredits = Math.round(getTotalCredits() * 100) / 100
    return Math.abs(totalDebits - totalCredits) < 0.01
  }

  const resetForm = () => {
    setFormData({
      entry_date: new Date().toISOString().split("T")[0],
      description: "",
    })
    setLines([
      { id: "1", account_id: "", description: "", project_id: "", type: "debit", amount: 0 },
      { id: "2", account_id: "", description: "", project_id: "", type: "credit", amount: 0 },
    ])
    generateEntryNumber() // Generate new entry number for next entry
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please enter a description for this journal entry",
        variant: "destructive",
      })
      return
    }

    const validLines = lines.filter((line) => line.account_id && line.amount > 0)

    if (validLines.length < 2) {
      toast({
        title: "Insufficient Lines",
        description: "At least two lines with accounts and amounts are required",
        variant: "destructive",
      })
      return
    }

    if (!isBalanced()) {
      // Round totals for display
      const totalDebits = Math.round(getTotalDebits() * 100) / 100
      const totalCredits = Math.round(getTotalCredits() * 100) / 100
      toast({
        title: "Entry Not Balanced",
        description: `Total debits ($${totalDebits.toFixed(2)}) must equal total credits ($${totalCredits.toFixed(2)})`,
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Convert lines to the format expected by the service
      // Round amounts to 2 decimal places to avoid floating point precision issues
      const entryLines = validLines
        .filter(line => line.account_id && line.account_id.trim() !== "") // Additional safety check
        .map((line) => {
          const roundedAmount = Math.round(line.amount * 100) / 100
          return {
            account_id: line.account_id.trim(), // Ensure no leading/trailing whitespace
            description: line.description || formData.description,
            project_id: line.project_id || undefined,
            debit_amount: line.type === "debit" ? roundedAmount : 0,
            credit_amount: line.type === "credit" ? roundedAmount : 0,
            image_data: line.image_data,
          }
        })
      
      if (entryLines.length !== validLines.length) {
        toast({
          title: "Validation Error",
          description: "Some lines have invalid account selections. Please check all lines.",
          variant: "destructive",
        })
        return
      }
      
      if (entryLines.length < 2) {
        toast({
          title: "Insufficient Lines",
          description: "At least two lines with valid accounts and amounts are required",
          variant: "destructive",
        })
        return
      }
      
      // Verify all account IDs exist in the loaded accounts
      const accountIdsInEntry = entryLines.map(line => line.account_id)
      const loadedAccountIds = new Set(accounts.map(acc => acc.id))
      const missingAccountIds = accountIdsInEntry.filter(id => !loadedAccountIds.has(id))
      
      if (missingAccountIds.length > 0) {
        console.error("Account IDs not found in loaded accounts:", missingAccountIds)
        toast({
          title: "Account Validation Error",
          description: "Some selected accounts are no longer available. Please refresh the page and try again.",
          variant: "destructive",
        })
        return
      }

      const currentUser = getCurrentUser()
      await AccountingService.createJournalEntry({
        entry_date: formData.entry_date,
        description: formData.description,
        created_by: currentUser?.id,
        lines: entryLines,
      })

      toast({
        title: "Success",
        description: `Journal entry ${entryNumber} created successfully`,
      })

      resetForm()
    } catch (error) {
      console.error("Error creating journal entry:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create journal entry"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    return account ? `${account.code} - ${account.name}` : ""
  }

  const getAccountType = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    return account?.account_type || ""
  }

  const getAccountDisplayInfo = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    if (!account) return { code: "", name: "", type: "", isSubAccount: false, parentName: "", hierarchyPath: "", balance: 0 }
    
    const isSubAccount = !!account.parent_account_id
    const parentAccount = account.parent_account_id ? accounts.find(a => a.id === account.parent_account_id) : null
    
    // Build hierarchy path
    let hierarchyPath = ""
    if (isSubAccount && parentAccount) {
      hierarchyPath = `${parentAccount.code} → ${account.code}`
    }
    
    // For now, we'll set balance to 0 - this could be enhanced to fetch real balances
    const balance = 0
    
    return {
      code: account.code,
      name: account.name,
      type: account.account_types?.name || account.account_type,
      isSubAccount,
      parentName: parentAccount?.name || "",
      hierarchyPath,
      balance
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handleAccountSelection = (lineId: string, accountId: string) => {
    handleLineChange(lineId, "account_id", accountId)
    setSearchValue("") // Clear search after selection
    
    // Close the popover for this line
    setOpenPopovers(prev => {
      const newSet = new Set(prev)
      newSet.delete(lineId)
      return newSet
    })
  }

  const togglePopover = (lineId: string, open: boolean) => {
    setOpenPopovers(prev => {
      const newSet = new Set(prev)
      if (open) {
        newSet.add(lineId)
      } else {
        newSet.delete(lineId)
      }
      return newSet
    })
    
    // Clear search when opening popover
    if (open) {
      setSearchValue("")
      setExpandedAccounts(new Set())
    }
  }

  if (loadingAccounts) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t("common.loading")}</p>
          <p className="text-sm text-muted-foreground mt-2">{language === "ar" ? "قد يستغرق هذا بضع ثوانٍ" : "This may take a few seconds"}</p>
          <p className="text-xs text-muted-foreground mt-1">{language === "ar" ? "إذا استغرق هذا وقتًا طويلاً، تحقق من وحدة تحكم المتصفح للأخطاء" : "If this takes too long, check the browser console for errors"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t("je.createNew")}
          </CardTitle>
          <CardDescription>
            {language === "ar" 
              ? "إنشاء قيد يومية ببنود متعددة. يمكن أن يكون كل بند إما مدين أو دائن. يمكنك اختيار أي حساب أو حساب فرعي من دليل الحسابات."
              : "Create a journal entry with multiple lines. Each line can be either debit or credit. You can select any account or sub-account from the chart of accounts."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Entry Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry_date">{t("je.date")} *</Label>
                <Input
                  id="entry_date"
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => handleInputChange("entry_date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("je.entryNumber")}</Label>
                <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md">
                  <Badge variant="outline" className="font-mono">
                    {entryNumber || "Loading..."}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Balance Status</Label>
                <div className="flex items-center h-10">
                  <Badge variant={isBalanced() ? "default" : "destructive"}>
                    {isBalanced() ? t("je.balanced") + " ✓" : t("je.notBalanced") + " ✗"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("common.description")} *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder={language === "ar" ? "وصف قيد اليومية..." : "Describe this journal entry..."}
                required
              />
            </div>

            <Separator />

            {/* Journal Lines */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{language === "ar" ? "بنود قيد اليومية" : "Journal Entry Lines"}</h3>
                <Button type="button" variant="outline" onClick={addLine}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("je.addLine")}
                </Button>
              </div>

              <div className="space-y-4">
                {lines.map((line, index) => {
                  const accountInfo = getAccountDisplayInfo(line.account_id)
                  
                  return (
                    <div key={line.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">{t("je.lines")} {index + 1}</Badge>
                        {lines.length > 2 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(line.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>{t("je.selectAccount")} *</Label>
                          <Popover
                            open={openPopovers.has(line.id)}
                            onOpenChange={open => togglePopover(line.id, open)}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between text-left"
                              >
                                {line.account_id ? (
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">
                                      {accountInfo.code} - {accountInfo.name}
                                    </span>
                                    {accountInfo.isSubAccount && (
                                      <div className="text-xs text-muted-foreground space-y-1">
                                        <div>Sub-account of: {accountInfo.parentName}</div>
                                        <div className="text-blue-600 font-mono">
                                          {accountInfo.hierarchyPath}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  t("je.selectAccount") + "..."
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[500px] p-0" align="start">
                              <Command shouldFilter={false}>
                                <CommandInput 
                                  placeholder="Search accounts by code or name..." 
                                  value={searchValue}
                                  onValueChange={handleAccountSearch}
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    {searchValue ? `No accounts found for "${searchValue}"` : "No accounts available"}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {(() => {
                                      const filteredAccounts = getFilteredAccounts()
                                      
                                      // Always show accounts - either filtered or all
                                      const accountsToShow = filteredAccounts.length > 0 ? filteredAccounts : accounts.map(acc => ({ ...acc, children: [], level: 0 }))
                                      
                                      return accountsToShow.map(account => 
                                        renderAccountOption(account, 0, (accountId) => {
                                          handleAccountSelection(line.id, accountId)
                                        })
                                      )
                                    })()}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          
                          {line.account_id && (
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <span>Type: {accountInfo.type}</span>
                                <span>Balance: {formatCurrency(accountInfo.balance)}</span>
                              </div>
                              {accountInfo.isSubAccount && (
                                <div className="text-blue-600 space-y-1">
                                  <div>Sub-account of: {accountInfo.parentName}</div>
                                  <div className="font-mono text-xs">
                                    {accountInfo.hierarchyPath}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>{language === "ar" ? "النوع" : "Type"} *</Label>
                          <Select
                            value={line.type}
                            onValueChange={(value: "debit" | "credit") => handleLineChange(line.id, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="debit">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-green-100 text-green-800">{t("general.debit")}</Badge>
                                  <span>Dr</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="credit">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-red-100 text-red-800">{t("general.credit")}</Badge>
                                  <span>Cr</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>{t("common.amount")} *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={line.amount ? Number(line.amount.toFixed(2)) : ""}
                            onChange={(e) => {
                              const inputValue = e.target.value
                              if (inputValue === "" || inputValue === ".") {
                                handleLineChange(line.id, "amount", 0)
                                return
                              }
                              const numValue = Number.parseFloat(inputValue)
                              if (!Number.isNaN(numValue)) {
                                // Round to 2 decimal places to avoid floating point precision issues
                                const rounded = Math.round(numValue * 100) / 100
                                handleLineChange(line.id, "amount", rounded)
                              }
                            }}
                            onBlur={(e) => {
                              // Ensure value is rounded on blur
                              const numValue = Number.parseFloat(e.target.value)
                              if (!Number.isNaN(numValue) && numValue >= 0) {
                                const rounded = Math.round(numValue * 100) / 100
                                handleLineChange(line.id, "amount", rounded)
                              }
                            }}
                            placeholder="0.00"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>{t("je.project")}</Label>
                          <Select
                            value={line.project_id || "none"}
                            onValueChange={(value) => handleLineChange(line.id, "project_id", value === "none" ? "" : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("je.selectProject")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">{t("general.none")}</SelectItem>
                              {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Image Upload Section */}
                      <div className="mt-4 space-y-2">
                        <Label>{language === "ar" ? "مستند مساند" : "Supporting Document"}</Label>
                        <div className="flex items-center gap-2">
                          {line.image_data ? (
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={line.image_data}
                                  alt="Uploaded document"
                                  className="w-48 h-36 object-contain rounded border cursor-pointer hover:opacity-80 hover:scale-105 transition-transform bg-white"
                                  onClick={() => {
                                    // Open image in new tab for full view
                                    const newWindow = window.open()
                                    if (newWindow) {
                                      newWindow.document.write(`
                                        <html>
                                          <head>
                                            <title>Document Preview - 1080x1080</title>
                                            <style>
                                              body { 
                                                margin:0; 
                                                padding:20px; 
                                                text-align:center; 
                                                background:#f5f5f5; 
                                                font-family: Arial, sans-serif; 
                                                overflow-x: auto;
                                              }
                                              img { 
                                                width: 1080px; 
                                                height: 1080px; 
                                                object-fit: contain; 
                                                border-radius:8px; 
                                                box-shadow:0 4px 12px rgba(0,0,0,0.15);
                                                border: 2px solid #e5e7eb;
                                              }
                                              .header { 
                                                margin-bottom: 20px; 
                                                color: #333; 
                                                font-size: 18px;
                                              }
                                              .container {
                                                display: flex;
                                                flex-direction: column;
                                                align-items: center;
                                                min-height: 100vh;
                                                justify-content: center;
                                              }
                                            </style>
                                          </head>
                                          <body>
                                            <div class="container">
                                              <div class="header">
                                                <h2>Supporting Document - Full Size (1080x1080)</h2>
                                                <p>Click outside the image or press ESC to close</p>
                                              </div>
                                              <img src="${line.image_data}" />
                                            </div>
                                          </body>
                                        </html>
                                      `)
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                  onClick={() => removeImage(line.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-green-600">Document Uploaded</span>
                                <span className="text-xs text-muted-foreground">Click to view full size</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handleImageUpload(line.id, file)
                                  }
                                }}
                                className="hidden"
                                id={`image-upload-${line.id}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`image-upload-${line.id}`)?.click()}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {language === "ar" ? "رفع صورة" : "Upload Image"}
                              </Button>
                              <span className="text-sm text-muted-foreground">{language === "ar" ? "إيصال، فاتورة، إلخ" : "Receipt, invoice, etc."}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Totals Summary */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium mb-3">{language === "ar" ? "ملخص القيد" : "Entry Summary"}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-green-700">{t("je.totalDebit")}</div>
                    <div className="text-2xl font-bold">${getTotalDebits().toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-red-700">{t("je.totalCredit")}</div>
                    <div className="text-2xl font-bold">${getTotalCredits().toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-medium">{t("je.difference")}</div>
                    <div className="text-2xl font-bold">
                      ${Math.abs(getTotalDebits() - getTotalCredits()).toFixed(2)}
                    </div>
                    <Badge variant={isBalanced() ? "default" : "destructive"} className="mt-1">
                      {isBalanced() ? t("je.balanced") : t("je.notBalanced")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={resetForm}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("general.reset")}
              </Button>
              <Button type="submit" disabled={loading || !isBalanced()}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? (language === "ar" ? "جاري الإنشاء..." : "Creating...") : t("je.create")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
