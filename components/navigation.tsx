"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calculator, FileText, TrendingUp, BookOpen, BarChart3, Home, Menu, ClipboardList, Users, Folder, ShoppingCart } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import UserSelector from "@/components/user-selector"
import { getCurrentUser, isAdmin, canViewAccountingData, isRegularUser } from "@/lib/auth-utils"
import { useLanguage } from "@/lib/language-context"

export default function Navigation() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  
  const navigation = [
    { name: t("nav.dashboard"), key: "dashboard", href: "/", icon: Home, requiresAccountingView: true },
    { name: t("nav.chartOfAccounts"), key: "chartOfAccounts", href: "/chart-of-accounts", icon: BookOpen, requiresAccountingView: true },
    { name: t("nav.journalEntries"), key: "journalEntries", href: "/journal-entries", icon: FileText, requiresAccountingView: true },
    { name: t("nav.purchaseOrders"), key: "purchaseOrders", href: "/purchase-orders", icon: ShoppingCart },
    { name: t("nav.projects"), key: "projects", href: "/project-management", icon: Folder, requiresAccountingView: true },
    { name: t("nav.generalLedger"), key: "generalLedger", href: "/general-ledger", icon: BarChart3, requiresAccountingView: true },
    { name: t("nav.trialBalance"), key: "trialBalance", href: "/trial-balance", icon: Calculator, requiresAccountingView: true },
    { name: t("nav.financialReports"), key: "financialReports", href: "/financial-reports", icon: TrendingUp, requiresAccountingView: true },
    { name: t("nav.accountReports"), key: "accountReports", href: "/account-reports", icon: ClipboardList, requiresAccountingView: true },
  ]

  // Don't show navigation on login page
  if (pathname === '/login') {
    return null
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={isRegularUser(getCurrentUser()) ? "/purchase-orders" : "/"} className="flex items-center gap-2 font-semibold">
              <Calculator className="h-6 w-6" />
              <span>{language === "ar" ? "نظام المحاسبة" : "Accounting System"}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const currentUser = getCurrentUser()
                // Regular users can only see Purchase Orders
                if (isRegularUser(currentUser) && item.key !== "purchaseOrders") {
                  return null
                }
                // Skip admin-only items if user is not admin
                if (item.adminOnly && !isAdmin(currentUser)) {
                  return null
                }
                // Skip accounting view items if user is regular user
                if (item.requiresAccountingView && !canViewAccountingData(currentUser)) {
                  return null
                }
                const Icon = item.icon
                return (
                  <Link key={item.key} href={item.href}>
                    <Button variant={pathname === item.href ? "default" : "ghost"} size="sm" className="gap-2">
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Selector */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant={language === "en" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLanguage("en")}
                className="rounded-r-none"
              >
                EN
              </Button>
              <Button
                variant={language === "ar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLanguage("ar")}
                className="rounded-l-none"
              >
                AR
              </Button>
            </div>
            <UserSelector />
            {isAdmin(getCurrentUser()) && (
              <Link href="/user-management">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  {t("nav.users")}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-2 mt-8">
                  {navigation.map((item) => {
                    const currentUser = getCurrentUser()
                    // Regular users can only see Purchase Orders
                    if (isRegularUser(currentUser) && item.key !== "purchaseOrders") {
                      return null
                    }
                    // Skip admin-only items if user is not admin
                    if (item.adminOnly && !isAdmin(currentUser)) {
                      return null
                    }
                    // Skip accounting view items if user is regular user
                    if (item.requiresAccountingView && !canViewAccountingData(currentUser)) {
                      return null
                    }
                    const Icon = item.icon
                    return (
                      <Link key={item.key} href={item.href}>
                        <Button
                          variant={pathname === item.href ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start gap-2"
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Button>
                      </Link>
                    )
                  })}
                  {isAdmin(getCurrentUser()) && (
                    <Link href="/user-management">
                      <Button
                        variant={pathname === "/user-management" ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start gap-2"
                      >
                        <Users className="h-4 w-4" />
                        {t("nav.users")}
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
