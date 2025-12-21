"use client"

import { useState, useEffect } from "react"
import { Download, TrendingUp, DollarSign, PieChart, FileText, ChevronRight, ChevronDown, FolderOpen, Folder, Printer } from "lucide-react"
import { exportToCSVCustom, printReport, formatCurrency as formatCurrencyExport, formatDate } from "@/lib/export-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { AccountingService, type CashFlowStatement, type Account } from "@/lib/accounting-utils"
import { useToast } from "@/hooks/use-toast"

type BalanceSheetAccount = {
  name: string
  code: string
  amount: number
  parent_account_id?: string | null
  level?: number
  has_children?: boolean
  total_amount?: number
}

export default function FinancialReports() {
  const [balanceSheet, setBalanceSheet] = useState<any>(null)
  const [incomeStatement, setIncomeStatement] = useState<any>(null)
  const [cashFlowStatement, setCashFlowStatement] = useState<CashFlowStatement | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountBalances, setAccountBalances] = useState<Map<string, { ownBalance: number; totalBalance: number }>>(new Map())
  const [loading, setLoading] = useState(false)
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set())
  const [expandedLiabilities, setExpandedLiabilities] = useState<Set<string>>(new Set())
  const [expandedEquity, setExpandedEquity] = useState<Set<string>>(new Set())
  const [expandedRevenue, setExpandedRevenue] = useState<Set<string>>(new Set())
  const [expandedExpenses, setExpandedExpenses] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    // Set default dates for income statement (current year)
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)
    setStartDate(yearStart.toISOString().split("T")[0])
    setEndDate(asOfDate)
  }, [asOfDate])

  // Auto-load reports when dates change
  useEffect(() => {
    if (asOfDate) {
      loadBalanceSheet()
    }
  }, [asOfDate])

  useEffect(() => {
    if (startDate && endDate) {
      loadIncomeStatement()
      loadCashFlowStatement()
    }
  }, [startDate, endDate])

  const loadBalanceSheet = async () => {
    try {
      setLoading(true)
      const [data, accountsData, balancesData] = await Promise.all([
        AccountingService.getBalanceSheet(asOfDate),
        AccountingService.getChartOfAccounts(),
        AccountingService.getAllAccountBalances()
      ])
      setBalanceSheet(data)
      setAccounts(accountsData)
      setAccountBalances(balancesData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load balance sheet",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const hasChildren = (accountCode: string) => {
    return accounts.some(a => {
      const parent = accounts.find(p => p.id === a.parent_account_id)
      return parent?.code === accountCode
    })
  }

  const getChildren = (accountCode: string) => {
    const parent = accounts.find(a => a.code === accountCode)
    if (!parent) return []
    const children = accounts
      .filter(a => a.parent_account_id === parent.id)
      .sort((a, b) => a.code.localeCompare(b.code))
    
    // Map to BalanceSheetAccount format with balances
    return children.map(child => {
      const balance = getAccountBalance(child.code)
      return {
        name: child.name,
        code: child.code,
        amount: balance,
        parent_account_id: child.parent_account_id,
        level: child.level || 1,
        has_children: accounts.some(a => a.parent_account_id === child.id),
      }
    })
  }

  const getAccountBalance = (accountCode: string) => {
    const account = accounts.find(a => a.code === accountCode)
    if (!account) return 0
    const balance = accountBalances.get(account.id)
    return balance?.totalBalance || 0
  }

  const toggleExpand = (code: string, type: string) => {
    const setters: { [key: string]: React.Dispatch<React.SetStateAction<Set<string>>> } = {
      asset: setExpandedAssets,
      liability: setExpandedLiabilities,
      equity: setExpandedEquity,
      revenue: setExpandedRevenue,
      expense: setExpandedExpenses
    }
    const setter = setters[type]
    if (setter) {
      setter(prev => {
        const newSet = new Set(prev)
        if (newSet.has(code)) {
          newSet.delete(code)
        } else {
          newSet.add(code)
        }
        return newSet
      })
    }
  }

  const renderHierarchicalAccount = (
    item: BalanceSheetAccount, 
    level: number, 
    expandedSet: Set<string>,
    type: string
  ): JSX.Element[] => {
    const children = getChildren(item.code)
    const isParent = children.length > 0
    const isExpanded = expandedSet.has(item.code)
    const indent = level * 20
    
    const rows: JSX.Element[] = []
    
    // Parent row
    rows.push(
      <TableRow key={item.code} className={isParent ? "bg-gray-50 font-medium" : ""}>
        <TableCell>
          <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
            {isParent ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0"
                onClick={() => toggleExpand(item.code, type)}
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            ) : (
              <div className="w-5" />
            )}
            {isParent ? (
              <FolderOpen className="h-4 w-4 text-blue-600" />
            ) : (
              <Folder className="h-4 w-4 text-gray-400" />
            )}
            <span className="font-mono text-xs text-gray-500">{item.code}</span>
            <span>{item.name}</span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          {isParent ? (
            <span className="font-bold text-blue-600">{formatCurrency(getAccountBalance(item.code))}</span>
          ) : (
            <span>{formatCurrency(Math.abs(item.amount))}</span>
          )}
        </TableCell>
      </TableRow>
    )
    
    // Children rows (if expanded)
    if (isExpanded && isParent) {
      for (const child of children) {
        const childBalance = getAccountBalance(child.code)
        const childItem: BalanceSheetAccount = {
          name: child.name,
          code: child.code,
          amount: childBalance,
          parent_account_id: child.parent_account_id,
          level: child.level
        }
        rows.push(...renderHierarchicalAccount(childItem, level + 1, expandedSet, type))
      }
    }
    
    return rows
  }

  const loadIncomeStatement = async () => {
    try {
      setLoading(true)
      const [data, accountsData, balancesData] = await Promise.all([
        AccountingService.getIncomeStatement(startDate, endDate),
        AccountingService.getChartOfAccounts(),
        AccountingService.getAllAccountBalances()
      ])
      setIncomeStatement(data)
      setAccounts(accountsData)
      setAccountBalances(balancesData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load income statement",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCashFlowStatement = async () => {
    try {
      setLoading(true)
      const data = await AccountingService.getCashFlowStatement(startDate, endDate)
      setCashFlowStatement(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cash flow statement",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const exportBalanceSheet = () => {
    if (!balanceSheet) return

    const rows: string[][] = []
    rows.push(["Balance Sheet", "", ""])
    rows.push([`As of ${formatDate(asOfDate)}`, "", ""])
    rows.push([])

    // Assets
    rows.push(["ASSETS", "", ""])
    if (balanceSheet.assets && balanceSheet.assets.length > 0) {
      balanceSheet.assets.forEach((asset: any) => {
        rows.push([asset.account_code || "", asset.account_name || "", formatCurrencyExport(asset.balance || 0)])
      })
    }
    rows.push(["Total Assets", "", formatCurrencyExport(balanceSheet.total_assets || 0)])
    rows.push([])

    // Liabilities
    rows.push(["LIABILITIES", "", ""])
    if (balanceSheet.liabilities && balanceSheet.liabilities.length > 0) {
      balanceSheet.liabilities.forEach((liability: any) => {
        rows.push([liability.account_code || "", liability.account_name || "", formatCurrencyExport(liability.balance || 0)])
      })
    }
    rows.push(["Total Liabilities", "", formatCurrencyExport(balanceSheet.total_liabilities || 0)])
    rows.push([])

    // Equity
    rows.push(["EQUITY", "", ""])
    if (balanceSheet.equity && balanceSheet.equity.length > 0) {
      balanceSheet.equity.forEach((equity: any) => {
        rows.push([equity.account_code || "", equity.account_name || "", formatCurrencyExport(equity.balance || 0)])
      })
    }
    rows.push(["Total Equity", "", formatCurrencyExport(balanceSheet.total_equity || 0)])
    rows.push([])
    rows.push(["Total Liabilities and Equity", "", formatCurrencyExport((balanceSheet.total_liabilities || 0) + (balanceSheet.total_equity || 0))])

    exportToCSVCustom(rows, "balance-sheet")
    toast({
      title: "Success",
      description: "Balance sheet exported to CSV",
    })
  }

  const printBalanceSheet = () => {
    if (!balanceSheet) return
    const element = document.getElementById("balance-sheet-content")
    if (element) {
      printReport(`Balance Sheet - ${formatDate(asOfDate)}`, "balance-sheet-content")
    } else {
      window.print()
    }
  }

  const exportIncomeStatement = () => {
    if (!incomeStatement) return

    const rows: string[][] = []
    rows.push(["Income Statement", "", ""])
    rows.push([`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, "", ""])
    rows.push([])

    // Revenue
    rows.push(["REVENUE", "", ""])
    if (incomeStatement.revenue && incomeStatement.revenue.length > 0) {
      incomeStatement.revenue.forEach((item: any) => {
        rows.push([item.account_code || "", item.account_name || "", formatCurrencyExport(item.amount || 0)])
      })
    }
    rows.push(["Total Revenue", "", formatCurrencyExport(incomeStatement.total_revenue || 0)])
    rows.push([])

    // COGS
    if (incomeStatement.cogs && incomeStatement.cogs.length > 0) {
      rows.push(["Cost of Goods Sold", "", ""])
      incomeStatement.cogs.forEach((item: any) => {
        rows.push([item.account_code || "", item.account_name || "", formatCurrencyExport(item.amount || 0)])
      })
      rows.push(["Total COGS", "", formatCurrencyExport(incomeStatement.total_cogs || 0)])
      rows.push([])
    }

    // Gross Profit
    if (incomeStatement.gross_profit !== undefined) {
      rows.push(["Gross Profit", "", formatCurrencyExport(incomeStatement.gross_profit)])
      rows.push([])
    }

    // Operating Expenses
    rows.push(["OPERATING EXPENSES", "", ""])
    if (incomeStatement.operating_expenses && incomeStatement.operating_expenses.length > 0) {
      incomeStatement.operating_expenses.forEach((item: any) => {
        rows.push([item.account_code || "", item.account_name || "", formatCurrencyExport(item.amount || 0)])
      })
    }
    rows.push(["Total Operating Expenses", "", formatCurrencyExport(incomeStatement.total_operating_expenses || 0)])
    rows.push([])

    // Interest Expenses
    if (incomeStatement.interest_expenses && incomeStatement.interest_expenses.length > 0) {
      rows.push(["Interest Expenses", "", ""])
      incomeStatement.interest_expenses.forEach((item: any) => {
        rows.push([item.account_code || "", item.account_name || "", formatCurrencyExport(item.amount || 0)])
      })
      rows.push(["Total Interest Expenses", "", formatCurrencyExport(incomeStatement.total_interest_expenses || 0)])
      rows.push([])
    }

    // Taxes
    if (incomeStatement.taxes && incomeStatement.taxes.length > 0) {
      rows.push(["Taxes", "", ""])
      incomeStatement.taxes.forEach((item: any) => {
        rows.push([item.account_code || "", item.account_name || "", formatCurrencyExport(item.amount || 0)])
      })
      rows.push(["Total Taxes", "", formatCurrencyExport(incomeStatement.total_taxes || 0)])
      rows.push([])
    }

    // Net Profit/Income
    if (incomeStatement.net_profit !== undefined) {
      rows.push(["Net Profit", "", formatCurrencyExport(incomeStatement.net_profit)])
    }
    if (incomeStatement.net_income !== undefined) {
      rows.push(["Net Income", "", formatCurrencyExport(incomeStatement.net_income)])
    }

    exportToCSVCustom(rows, "income-statement")
    toast({
      title: "Success",
      description: "Income statement exported to CSV",
    })
  }

  const printIncomeStatement = () => {
    if (!incomeStatement) return
    const element = document.getElementById("income-statement-content")
    if (element) {
      printReport(`Income Statement - ${formatDate(startDate)} to ${formatDate(endDate)}`, "income-statement-content")
    } else {
      window.print()
    }
  }

  const exportCashFlowStatement = () => {
    if (!cashFlowStatement) return

    const rows: string[][] = []
    rows.push(["Cash Flow Statement", "", ""])
    rows.push([`Period: ${formatDate(startDate)} to ${formatDate(endDate)}`, "", ""])
    rows.push([])

    // Operating Activities
    rows.push(["OPERATING ACTIVITIES", "", ""])
    if (cashFlowStatement.operating_activities && cashFlowStatement.operating_activities.length > 0) {
      cashFlowStatement.operating_activities.forEach((item: any) => {
        rows.push([item.description || "", "", formatCurrencyExport(item.amount || 0)])
      })
    }
    rows.push(["Net Cash from Operating Activities", "", formatCurrencyExport(cashFlowStatement.net_cash_flow?.operating || 0)])
    rows.push([])

    // Investing Activities
    rows.push(["INVESTING ACTIVITIES", "", ""])
    if (cashFlowStatement.investing_activities && cashFlowStatement.investing_activities.length > 0) {
      cashFlowStatement.investing_activities.forEach((item: any) => {
        rows.push([item.description || "", "", formatCurrencyExport(item.amount || 0)])
      })
    }
    rows.push(["Net Cash from Investing Activities", "", formatCurrencyExport(cashFlowStatement.net_cash_flow?.investing || 0)])
    rows.push([])

    // Financing Activities
    rows.push(["FINANCING ACTIVITIES", "", ""])
    if (cashFlowStatement.financing_activities && cashFlowStatement.financing_activities.length > 0) {
      cashFlowStatement.financing_activities.forEach((item: any) => {
        rows.push([item.description || "", "", formatCurrencyExport(item.amount || 0)])
      })
    }
    rows.push(["Net Cash from Financing Activities", "", formatCurrencyExport(cashFlowStatement.net_cash_flow?.financing || 0)])
    rows.push([])

    // Summary
    rows.push(["Net Increase (Decrease) in Cash", "", formatCurrencyExport(cashFlowStatement.net_cash_flow?.total || 0)])
    rows.push(["Cash at Beginning of Period", "", formatCurrencyExport(cashFlowStatement.cash_at_beginning || 0)])
    rows.push(["Cash at End of Period", "", formatCurrencyExport(cashFlowStatement.cash_at_end || 0)])

    exportToCSVCustom(rows, "cash-flow-statement")
    toast({
      title: "Success",
      description: "Cash flow statement exported to CSV",
    })
  }

  const printCashFlowStatement = () => {
    if (!cashFlowStatement) return
    const element = document.getElementById("cash-flow-statement-content")
    if (element) {
      printReport(`Cash Flow Statement - ${formatDate(startDate)} to ${formatDate(endDate)}`, "cash-flow-statement-content")
    } else {
      window.print()
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">Generate and view your company's financial statements</p>
        </div>
      </div>

      <Tabs defaultValue="balance-sheet" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="account-reports">Account Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="balance-sheet" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Balance Sheet
                  </CardTitle>
                  <CardDescription>Assets = Liabilities + Equity as of a specific date</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportBalanceSheet} variant="outline" size="sm" disabled={!balanceSheet}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={printBalanceSheet} variant="outline" size="sm" disabled={!balanceSheet}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="as_of_date">As of Date</Label>
                  <Input id="as_of_date" type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
                </div>
                <Button onClick={loadBalanceSheet} disabled={loading}>
                  {loading ? "Loading..." : "Generate Report"}
                </Button>
              </div>

              {balanceSheet && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-bold">Company Name</h2>
                    <h3 className="text-lg font-semibold">Balance Sheet</h3>
                    <p className="text-muted-foreground">As of {new Date(asOfDate).toLocaleDateString()}</p>
                  </div>

                  {/* Expand/Collapse Controls */}
                  <div className="flex gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const allAssetCodes = balanceSheet.assets.map((a: any) => a.code)
                        setExpandedAssets(new Set(allAssetCodes))
                        const allLiabilityCodes = balanceSheet.liabilities.map((l: any) => l.code)
                        setExpandedLiabilities(new Set(allLiabilityCodes))
                        const allEquityCodes = balanceSheet.equity.map((e: any) => e.code)
                        setExpandedEquity(new Set(allEquityCodes))
                      }}
                    >
                      Expand All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setExpandedAssets(new Set())
                        setExpandedLiabilities(new Set())
                        setExpandedEquity(new Set())
                      }}
                    >
                      Collapse All
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Assets */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        ASSETS
                      </h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableBody>
                            {balanceSheet.assets.length > 0 ? (
                              balanceSheet.assets
                                .filter((asset: any) => {
                                  const acc = accounts.find(a => a.code === asset.code)
                                  return !acc?.parent_account_id
                                })
                                .map((asset: BalanceSheetAccount) => 
                                  renderHierarchicalAccount(asset, 0, expandedAssets, 'asset')
                                )
                            ) : (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground">
                                  No asset accounts with balances
                                </TableCell>
                              </TableRow>
                            )}
                            <TableRow className="font-semibold border-t-2 bg-green-50">
                              <TableCell className="font-bold">TOTAL ASSETS</TableCell>
                              <TableCell className="text-right font-bold text-green-700">
                                {formatCurrency(balanceSheet.totalAssets)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Liabilities & Equity */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-red-700 flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        LIABILITIES & EQUITY
                      </h3>
                      <div className="space-y-4">
                        {/* Liabilities */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-red-50 px-4 py-2 font-medium text-red-700">LIABILITIES</div>
                          <Table>
                            <TableBody>
                              {balanceSheet.liabilities.length > 0 ? (
                                balanceSheet.liabilities
                                  .filter((liability: any) => {
                                    const acc = accounts.find(a => a.code === liability.code)
                                    return !acc?.parent_account_id
                                  })
                                  .map((liability: BalanceSheetAccount) => 
                                    renderHierarchicalAccount(liability, 0, expandedLiabilities, 'liability')
                                  )
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                                    No liability accounts with balances
                                  </TableCell>
                                </TableRow>
                              )}
                              <TableRow className="font-semibold border-t-2 bg-red-50">
                                <TableCell className="font-bold">TOTAL LIABILITIES</TableCell>
                                <TableCell className="text-right font-bold text-red-700">
                                  {formatCurrency(balanceSheet.totalLiabilities)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        {/* Equity */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-blue-50 px-4 py-2 font-medium text-blue-700">EQUITY</div>
                          <Table>
                            <TableBody>
                              {balanceSheet.equity.length > 0 ? (
                                balanceSheet.equity
                                  .filter((equityItem: any) => {
                                    const acc = accounts.find(a => a.code === equityItem.code)
                                    return !acc?.parent_account_id
                                  })
                                  .map((equityItem: BalanceSheetAccount) => 
                                    renderHierarchicalAccount(equityItem, 0, expandedEquity, 'equity')
                                  )
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                                    No equity accounts with balances
                                  </TableCell>
                                </TableRow>
                              )}
                              <TableRow className="font-semibold border-t-2 bg-blue-50">
                                <TableCell className="font-bold">TOTAL EQUITY</TableCell>
                                <TableCell className="text-right font-bold text-blue-700">
                                  {formatCurrency(balanceSheet.totalEquity)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        {/* Total L&E */}
                        <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between font-bold text-lg">
                            <span>TOTAL LIABILITIES & EQUITY</span>
                            <span className="text-purple-700">
                              {formatCurrency(balanceSheet.totalLiabilities + balanceSheet.totalEquity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income-statement" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Income Statement
                  </CardTitle>
                  <CardDescription>Revenue - Expenses = Net Income for a period</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportIncomeStatement} variant="outline" size="sm" disabled={!incomeStatement}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={printIncomeStatement} variant="outline" size="sm" disabled={!incomeStatement}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <Button onClick={loadIncomeStatement} disabled={loading}>
                  {loading ? "Loading..." : "Generate Report"}
                </Button>
              </div>

              {incomeStatement && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-bold">Company Name</h2>
                    <h3 className="text-lg font-semibold">Income Statement</h3>
                    <p className="text-muted-foreground">
                      For the period {new Date(startDate).toLocaleDateString()} to{" "}
                      {new Date(endDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Expand/Collapse Controls */}
                  <div className="flex gap-2 mb-4 justify-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const allRevenueCodes = (incomeStatement.revenue || []).map((r: any) => r.code)
                        setExpandedRevenue(new Set(allRevenueCodes))
                        const allCOGSCodes = (incomeStatement.cogs || []).map((c: any) => c.code)
                        const allOpExpCodes = (incomeStatement.operatingExpenses || []).map((e: any) => e.code)
                        setExpandedExpenses(new Set([...allCOGSCodes, ...allOpExpCodes]))
                      }}
                    >
                      Expand All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setExpandedRevenue(new Set())
                        setExpandedExpenses(new Set())
                      }}
                    >
                      Collapse All
                    </Button>
                  </div>

                  <div className="max-w-3xl mx-auto space-y-4">
                    {/* Revenue Section */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-green-50 px-4 py-2 font-semibold text-green-700 flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        REVENUE
                      </div>
                      <Table>
                        <TableBody>
                          {(incomeStatement.revenue || []).length > 0 ? (
                            incomeStatement.revenue
                              .filter((item: any) => {
                                const acc = accounts.find(a => a.code === item.code)
                                return !acc?.parent_account_id
                              })
                              .map((revenueItem: BalanceSheetAccount) => 
                                renderHierarchicalAccount(revenueItem, 0, expandedRevenue, 'revenue')
                              )
                          ) : (
                            <TableRow>
                              <TableCell className="pl-6 text-muted-foreground">No revenue activity</TableCell>
                              <TableCell className="text-right">{formatCurrency(0)}</TableCell>
                            </TableRow>
                          )}
                          <TableRow className="font-semibold border-t-2 bg-green-50">
                            <TableCell className="font-bold">Total Revenue</TableCell>
                            <TableCell className="text-right font-bold text-green-700">
                              {formatCurrency(incomeStatement.totalRevenue || 0)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* COGS Section */}
                    {(incomeStatement.cogs || []).length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-orange-50 px-4 py-2 font-semibold text-orange-700 flex items-center gap-2">
                          <FolderOpen className="h-5 w-5" />
                          COST OF GOODS SOLD (COGS)
                        </div>
                        <Table>
                          <TableBody>
                            {incomeStatement.cogs
                              .filter((item: any) => {
                                const acc = accounts.find(a => a.code === item.code)
                                return !acc?.parent_account_id
                              })
                              .map((cogsItem: BalanceSheetAccount) => 
                                renderHierarchicalAccount(cogsItem, 0, expandedExpenses, 'expense')
                              )}
                            <TableRow className="font-semibold border-t-2 bg-orange-50">
                              <TableCell className="font-bold">Total COGS</TableCell>
                              <TableCell className="text-right font-bold text-orange-700">
                                {formatCurrency(incomeStatement.totalCOGS || 0)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Gross Profit */}
                    <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                      <div className="flex justify-between font-bold text-lg">
                        <span>GROSS PROFIT</span>
                        <span className="text-blue-700">
                          {formatCurrency(incomeStatement.grossProfit || 0)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        (Total Revenue - COGS)
                      </p>
                    </div>

                    {/* Operating Expenses Section */}
                    {(incomeStatement.operatingExpenses || []).length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-red-50 px-4 py-2 font-semibold text-red-700 flex items-center gap-2">
                          <FolderOpen className="h-5 w-5" />
                          OPERATING EXPENSES
                        </div>
                        <Table>
                          <TableBody>
                            {incomeStatement.operatingExpenses
                              .filter((item: any) => {
                                const acc = accounts.find(a => a.code === item.code)
                                return !acc?.parent_account_id
                              })
                              .map((expenseItem: BalanceSheetAccount) => 
                                renderHierarchicalAccount(expenseItem, 0, expandedExpenses, 'expense')
                              )}
                            <TableRow className="font-semibold border-t-2 bg-red-50">
                              <TableCell className="font-bold">Total Operating Expenses</TableCell>
                              <TableCell className="text-right font-bold text-red-700">
                                {formatCurrency(incomeStatement.totalOperatingExpenses || 0)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Interest Expenses */}
                    {(incomeStatement.interestExpenses || []).length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-yellow-50 px-4 py-2 font-semibold text-yellow-700">INTEREST EXPENSES</div>
                        <Table>
                          <TableBody>
                            {incomeStatement.interestExpenses.map((item: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="pl-6">{item.name}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="font-semibold border-t-2 bg-yellow-50">
                              <TableCell className="font-bold">Total Interest Expenses</TableCell>
                              <TableCell className="text-right font-bold text-yellow-700">
                                {formatCurrency(incomeStatement.totalInterestExpenses || 0)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Taxes */}
                    {(incomeStatement.taxes || []).length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-purple-50 px-4 py-2 font-semibold text-purple-700">TAXES</div>
                        <Table>
                          <TableBody>
                            {incomeStatement.taxes.map((item: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="pl-6">{item.name}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="font-semibold border-t-2 bg-purple-50">
                              <TableCell className="font-bold">Total Taxes</TableCell>
                              <TableCell className="text-right font-bold text-purple-700">
                                {formatCurrency(incomeStatement.totalTaxes || 0)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Net Profit */}
                    <div className={`border-2 rounded-lg p-4 ${(incomeStatement.netProfit || incomeStatement.netIncome || 0) >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                      <div className="flex justify-between font-bold text-xl">
                        <span>NET PROFIT</span>
                        <span className={(incomeStatement.netProfit || incomeStatement.netIncome || 0) >= 0 ? 'text-green-700' : 'text-red-700'}>
                          {formatCurrency(Math.abs(incomeStatement.netProfit || incomeStatement.netIncome || 0))}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        (Gross Profit - Operating Expenses - Interest - Taxes)
                      </p>
                    </div>

                    {/* Net Income - Final Bottom Line */}
                    <div className={`border-2 border-gray-400 rounded-lg p-4 ${(incomeStatement.netProfit || incomeStatement.netIncome || 0) >= 0 ? 'bg-emerald-50 border-emerald-400' : 'bg-rose-50 border-rose-400'}`}>
                      <div className="flex justify-between font-bold text-2xl">
                        <span>NET INCOME</span>
                        <span className={(incomeStatement.netProfit || incomeStatement.netIncome || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                          {formatCurrency(Math.abs(incomeStatement.netProfit || incomeStatement.netIncome || 0))}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Final bottom line after all expenses and deductions
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Cash Flow Statement
                  </CardTitle>
                  <CardDescription>
                    Track cash inflows and outflows from operating, investing, and financing activities
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={loadCashFlowStatement} disabled={loading} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? "Loading..." : "Generate"}
                  </Button>
                  <Button onClick={exportCashFlowStatement} variant="outline" size="sm" disabled={!cashFlowStatement || loading}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={printCashFlowStatement} variant="outline" size="sm" disabled={!cashFlowStatement || loading}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent id="cash-flow-statement-content">
              <div className="flex items-end gap-4 mb-6 p-4 bg-gray-50 rounded-lg no-print">
                <div className="space-y-2">
                  <Label htmlFor="cash_start_date">Start Date</Label>
                  <Input id="cash_start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cash_end_date">End Date</Label>
                  <Input id="cash_end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <Button onClick={loadCashFlowStatement} disabled={loading || !startDate || !endDate}>
                  {loading ? "Loading..." : "Generate Cash Flow"}
                </Button>
              </div>

              {cashFlowStatement && (
                <div className="space-y-6">
                  {/* Operating Activities */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-green-700">OPERATING ACTIVITIES</h3>
                    <Table>
                      <TableBody>
                        {cashFlowStatement.operating_activities.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="pl-6">{item.description}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-semibold border-t">
                          <TableCell>Net Cash from Operating Activities</TableCell>
                          <TableCell className="text-right">{formatCurrency(cashFlowStatement.net_cash_flow.operating)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Investing Activities */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-blue-700">INVESTING ACTIVITIES</h3>
                    <Table>
                      <TableBody>
                        {cashFlowStatement.investing_activities.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="pl-6">{item.description}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-semibold border-t">
                          <TableCell>Net Cash from Investing Activities</TableCell>
                          <TableCell className="text-right">{formatCurrency(cashFlowStatement.net_cash_flow.investing)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Financing Activities */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-purple-700">FINANCING ACTIVITIES</h3>
                    <Table>
                      <TableBody>
                        {cashFlowStatement.financing_activities.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="pl-6">{item.description}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-semibold border-t">
                          <TableCell>Net Cash from Financing Activities</TableCell>
                          <TableCell className="text-right">{formatCurrency(cashFlowStatement.net_cash_flow.financing)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-4">
                    <Table>
                      <TableBody>
                        <TableRow className="font-semibold">
                          <TableCell>Net Increase (Decrease) in Cash</TableCell>
                          <TableCell className="text-right">{formatCurrency(cashFlowStatement.net_cash_flow.total)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Cash at Beginning of Period</TableCell>
                          <TableCell className="text-right">{formatCurrency(cashFlowStatement.cash_at_beginning)}</TableCell>
                        </TableRow>
                        <TableRow className="font-bold text-lg border-t-2 border-black">
                          <TableCell>Cash at End of Period</TableCell>
                          <TableCell className="text-right">{formatCurrency(cashFlowStatement.cash_at_end)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {!cashFlowStatement && !loading && (
                <div className="text-center p-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Generate Cash Flow" to view your cash flow statement.</p>
                  <p className="text-sm mt-2">This will show operating, investing, and financing cash flows for the selected period.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account-reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Account Reports
              </CardTitle>
              <CardDescription>
                Detailed reports for individual accounts and sub-accounts with transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-semibold mb-2">Comprehensive Account Reports</h3>
                <p className="text-muted-foreground mb-6">
                  Generate detailed reports for each account showing:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left max-w-2xl mx-auto">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Opening and current balances</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Complete transaction history</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Debit and credit summaries</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Sub-account breakdowns</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button asChild className="w-full md:w-auto">
                    <a href="/account-reports">
                      <FileText className="h-4 w-4 mr-2" />
                      View All Account Reports
                    </a>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Or navigate to Chart of Accounts to view individual account reports
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
