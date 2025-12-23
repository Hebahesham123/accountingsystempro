import { supabase } from "./supabase"
import type { Account, AccountType } from "./supabase"
import { getCurrentUser } from "./auth-utils"

export type { Account, AccountType }

export type TrialBalanceItem = {
  account_id: string
  account_code: string
  account_name: string
  account_type: string
  parent_account_id?: string | null
  level: number
  opening_balance: number
  debit_total: number
  credit_total: number
  closing_balance: number
  total_balance: number // includes children's balances
  has_children: boolean
}

export type AccountDetailReport = {
  account: Account
  opening_balance: number
  current_balance: number
  transactions: Array<{
    id: string
    entry_date: string
    entry_number: string
    description: string
    reference?: string
    debit_amount: number
    credit_amount: number
    running_balance: number
  }>
  summary: {
    total_debits: number
    total_credits: number
    net_change: number
    transaction_count: number
  }
  sub_accounts?: AccountDetailReport[]
}

export type AccountSummaryReport = {
  account_id: string
  account_code: string
  account_name: string
  account_type: string
  parent_account_id?: string
  opening_balance: number
  current_balance: number
  total_debits: number
  total_credits: number
  net_change: number
  transaction_count: number
  has_sub_accounts: boolean
  sub_accounts?: AccountSummaryReport[]
}

export type CashFlowItem = {
  category: string
  description: string
  amount: number
  type: 'operating' | 'investing' | 'financing'
}

export type CashFlowStatement = {
  operating_activities: CashFlowItem[]
  investing_activities: CashFlowItem[]
  financing_activities: CashFlowItem[]
  net_cash_flow: {
    operating: number
    investing: number
    financing: number
    total: number
  }
  cash_at_beginning: number
  cash_at_end: number
}

export type DashboardStats = {
  totalAssets: number
  netIncome: number
  journalEntriesCount: number
  activeAccountsCount: number
}

export class AccountingService {
  // Get dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get total assets (sum of all asset account balances)
      const { data: assetAccounts } = await supabase
        .from("accounts")
        .select(`
          id, code, name,
          account_types!inner(name)
        `)
        .eq("account_types.name", "Assets")
        .eq("is_active", true)

      let totalAssets = 0
      const currentDate = new Date().toISOString().split('T')[0]
      if (assetAccounts) {
        for (const account of assetAccounts) {
          const balance = await this.getAccountBalance(account.id, currentDate)
          totalAssets += balance
        }
      }

      // Get net income (Revenue - Expenses)
      const { data: revenueAccounts } = await supabase
        .from("accounts")
        .select(`
          id,
          account_types!inner(name)
        `)
        .eq("account_types.name", "Revenue")
        .eq("is_active", true)

      const { data: expenseAccounts } = await supabase
        .from("accounts")
        .select(`
          id,
          account_types!inner(name)
        `)
        .eq("account_types.name", "Expenses")
        .eq("is_active", true)

      let totalRevenue = 0
      let totalExpenses = 0

      if (revenueAccounts) {
        for (const account of revenueAccounts) {
          const balance = await this.getAccountBalance(account.id, currentDate)
          totalRevenue += balance
        }
      }

      if (expenseAccounts) {
        for (const account of expenseAccounts) {
          const balance = await this.getAccountBalance(account.id, currentDate)
          totalExpenses += balance
        }
      }

      const netIncome = totalRevenue - totalExpenses

      // Get journal entries count
      const { count: journalEntriesCount } = await supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: true })

      // Get active accounts count
      const { count: activeAccountsCount } = await supabase
        .from("accounts")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)

      return {
        totalAssets: Math.max(0, totalAssets),
        netIncome: Math.max(0, netIncome),
        journalEntriesCount: journalEntriesCount || 0,
        activeAccountsCount: activeAccountsCount || 0,
      }
    } catch (error) {
      console.error("Error getting dashboard stats:", error)
      return {
        totalAssets: 0,
        netIncome: 0,
        journalEntriesCount: 0,
        activeAccountsCount: 0,
      }
    }
  }

  // Chart of Accounts Functions

  // Get all account types
  static async getAccountTypes(): Promise<AccountType[]> {
    try {
      const { data, error } = await supabase
        .from("account_types")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (error) {
        console.error("Error fetching account types:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error loading account types:", error)
      throw new Error("Failed to load account types")
    }
  }

  // Create new account type
  static async createAccountType(accountType: {
    name: string
    description?: string
    normal_balance: "debit" | "credit"
    cash_flow_category?: "operating" | "investing" | "financing" | null
  }): Promise<AccountType> {
    try {
      const insertData: any = {
        name: accountType.name,
        description: accountType.description || null,
        normal_balance: accountType.normal_balance,
        is_system: false,
        is_active: true,
      }
      
      // Only include cash_flow_category if it's explicitly set (not null/undefined)
      // The frontend may send "none" as a string, but TypeScript type doesn't include it
      // So we check for null/undefined and valid values only
      if (accountType.cash_flow_category && 
          ["operating", "investing", "financing"].includes(accountType.cash_flow_category)) {
        insertData.cash_flow_category = accountType.cash_flow_category
      } else {
        insertData.cash_flow_category = null
      }
      
      const { data, error } = await supabase
        .from("account_types")
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error("Error creating account type:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error creating account type:", error)
      throw new Error("Failed to create account type")
    }
  }

  // Update account type
  static async updateAccountType(
    id: string,
    accountType: {
      name: string
      description?: string
      normal_balance: "debit" | "credit"
      cash_flow_category?: "operating" | "investing" | "financing" | null
    }
  ): Promise<AccountType> {
    try {
      const updateData: any = {
        name: accountType.name,
        description: accountType.description || null,
        normal_balance: accountType.normal_balance,
        updated_at: new Date().toISOString(),
      }
      
      // Only include cash_flow_category if it's explicitly set (not null/undefined)
      if (accountType.cash_flow_category && 
          ["operating", "investing", "financing"].includes(accountType.cash_flow_category)) {
        updateData.cash_flow_category = accountType.cash_flow_category
      } else {
        updateData.cash_flow_category = null
      }
      
      const { data, error } = await supabase
        .from("account_types")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating account type:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error updating account type:", error)
      throw new Error("Failed to update account type")
    }
  }

  // Delete account type
  static async deleteAccountType(id: string): Promise<void> {
    try {
      // Check if any accounts are using this type
      const { data: accountsUsingType, error: checkError } = await supabase
        .from("accounts")
        .select("id")
        .eq("account_type_id", id)
        .eq("is_active", true)

      if (checkError) throw checkError

      if (accountsUsingType && accountsUsingType.length > 0) {
        throw new Error("Cannot delete account type that is being used by accounts")
      }

      // Soft delete the account type
      const { error } = await supabase
        .from("account_types")
        .update({ is_active: false })
        .eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting account type:", error)
      throw new Error("Failed to delete account type")
    }
  }

  // Get chart of accounts with hierarchy
  static async getChartOfAccounts(): Promise<Account[]> {
    try {
      console.log("Fetching chart of accounts from Supabase...")
      
      // Optimized query - select only needed columns and use simpler query
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("id, code, name, description, account_type_id, parent_account_id, is_header, is_active, cash_flow_category, created_at, updated_at")
        .eq("is_active", true)
        .order("code")
        .limit(1000) // Add limit to prevent huge queries

      if (accountsError) {
        console.error("Error fetching accounts:", accountsError)
        throw new Error(`Failed to fetch accounts: ${accountsError.message}`)
      }

      if (!accountsData || accountsData.length === 0) {
        console.warn("No accounts found in database")
        return []
      }

      console.log(`Fetched ${accountsData.length} accounts, now fetching account types...`)

      // Get account types separately to avoid join issues
      const accountTypeIds = [...new Set(accountsData.map((acc: any) => acc.account_type_id).filter(Boolean))]
      
      let accountTypesMap = new Map()
      if (accountTypeIds.length > 0) {
        try {
          // Fetch account types in batches if needed (Supabase supports up to 100 items in .in())
          const batchSize = 100
          for (let i = 0; i < accountTypeIds.length; i += batchSize) {
            const batch = accountTypeIds.slice(i, i + batchSize)
            const { data: typesData, error: typesError } = await supabase
              .from("account_types")
              .select("id, name, description, normal_balance, cash_flow_category, is_system, is_active")
              .in("id", batch)

            if (!typesError && typesData) {
              typesData.forEach((type: any) => {
                accountTypesMap.set(type.id, type)
              })
            } else if (typesError) {
              console.warn("Error fetching account types batch (continuing without types):", typesError)
            }
          }
          console.log(`Fetched ${accountTypesMap.size} account types`)
        } catch (typesError) {
          console.warn("Error fetching account types (continuing without types):", typesError)
          // Continue without types - accounts will work without them
        }
      }

      // Combine accounts with their types
      const accountsWithTypes = accountsData.map((account: any) => ({
        ...account,
        account_types: account.account_type_id ? accountTypesMap.get(account.account_type_id) : null
      }))

      console.log(`Successfully fetched ${accountsWithTypes.length} accounts with types`)
      return accountsWithTypes
    } catch (error) {
      console.error("Error loading chart of accounts:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to load chart of accounts")
    }
  }

  // Generate account code (simplified version without database function)
  static async generateAccountCode(accountTypeId: string, parentAccountId?: string): Promise<string> {
    try {
      // Get base code from account type
      let baseCode = '9' // Default for unknown types
      
      // Map account type IDs to base codes
      const typeCodeMap: { [key: string]: string } = {
        '11111111-1111-1111-1111-111111111111': '1', // Assets
        '22222222-2222-2222-2222-222222222222': '2', // Liabilities
        '33333333-3333-3333-3333-333333333333': '3', // Equity
        '44444444-4444-4444-4444-444444444444': '4', // Revenue
        '55555555-5555-5555-5555-555555555555': '5', // Expenses
      }
      
      baseCode = typeCodeMap[accountTypeId] || '9'
      
      // If parent account is provided, use parent's code as base
      if (parentAccountId) {
        const { data: parentAccount, error } = await supabase
          .from("accounts")
          .select("code")
          .eq("id", parentAccountId)
          .maybeSingle()
        
        if (!error && parentAccount && parentAccount.code) {
          baseCode = parentAccount.code
        }
      }
      
      // Find the next available number - check ALL codes, not just active ones
      const { data: existingCodes, error } = await supabase
        .from("accounts")
        .select("code")
        .like("code", baseCode + "%")
      
      if (error) {
        console.error("Error fetching existing codes:", error)
        // Use timestamp-based fallback to ensure uniqueness
        const timestamp = Date.now().toString().slice(-6)
        return baseCode + timestamp
      }
      
      // Find the highest number for this base code
      let nextNumber = 1
      if (existingCodes && existingCodes.length > 0) {
        const numbers = existingCodes
          .map(acc => {
            if (!acc.code) return 0
            // Match codes that start with baseCode followed by digits
            const match = acc.code.match(new RegExp(`^${baseCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)$`))
            return match ? parseInt(match[1]) : 0
          })
          .filter(num => num > 0)
        
        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1
        }
      }
      
      // Generate new code (pad with zeros to 5 digits for better uniqueness)
      let newCode = baseCode + nextNumber.toString().padStart(5, '0')
      
      // Double-check the code doesn't exist (race condition protection)
      let attempts = 0
      const maxAttempts = 10
      while (attempts < maxAttempts) {
        const { data: existing, error: checkError } = await supabase
          .from("accounts")
          .select("code")
          .eq("code", newCode)
          .maybeSingle()
        
        if (checkError) {
          console.warn("Error checking code uniqueness:", checkError)
          break
        }
        
        if (!existing) {
          // Code is available
          break
        }
        
        // Code exists, try next number
        nextNumber++
        newCode = baseCode + nextNumber.toString().padStart(5, '0')
        attempts++
      }
      
      // If we've tried too many times, use timestamp fallback
      if (attempts >= maxAttempts) {
        const timestamp = Date.now().toString().slice(-6)
        newCode = baseCode + timestamp
        console.warn("Used timestamp fallback for account code:", newCode)
      }
      
      return newCode
    } catch (error) {
      console.error("Error generating account code:", error)
      // Fallback to timestamp-based code to ensure uniqueness
      const timestamp = Date.now().toString().slice(-6)
      return `ACC${timestamp}`
    }
  }

  // Create new account
  static async createAccount(account: {
    code?: string
    name: string
    description?: string
    account_type_id: string
    parent_account_id?: string
    is_header?: boolean
    cash_flow_category?: "operating" | "investing" | "financing"
  }): Promise<Account> {
    try {
      // Validate account_type_id is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(account.account_type_id)) {
        throw new Error(`Invalid account_type_id: ${account.account_type_id}. Must be a valid UUID.`)
      }

      // Validate parent_account_id if provided
      if (account.parent_account_id && !uuidRegex.test(account.parent_account_id)) {
        throw new Error(`Invalid parent_account_id: ${account.parent_account_id}. Must be a valid UUID.`)
      }

      let accountCode = account.code

      // Generate code if not provided
      if (!accountCode) {
        accountCode = await this.generateAccountCode(account.account_type_id, account.parent_account_id)
      }

      // Get account type to get both name and cash_flow_category
      let accountTypeName: string | null = null
      let cashFlowCategory = account.cash_flow_category
      
      try {
        const { data: accountType, error: typeError } = await supabase
          .from("account_types")
          .select("name, cash_flow_category")
          .eq("id", account.account_type_id)
          .maybeSingle()
        
        if (typeError) {
          console.warn("Error fetching account type:", typeError)
        } else if (accountType) {
          accountTypeName = accountType.name
          // Only use account type's cash_flow_category if account doesn't have one explicitly set
          // If account has null/undefined, don't inherit from account type (keep as null)
          if (cashFlowCategory === undefined || cashFlowCategory === null) {
            cashFlowCategory = accountType.cash_flow_category || null
          }
        }
      } catch (typeError) {
        console.warn("Error fetching account type, using defaults:", typeError)
      }

      // If we still don't have account type name, try to get it from the account_type_id
      if (!accountTypeName) {
        // Fallback: try common account type names based on ID patterns
        // This is a safety net, but we should have gotten it from the query above
        console.warn("Account type name not found, this may cause an error")
      }

      // Build insert data, starting with required fields
      const insertData: any = {
        code: accountCode,
        name: account.name.trim(),
        description: account.description?.trim() || null,
        account_type: accountTypeName, // Required string column
        account_type_id: account.account_type_id, // Required UUID foreign key
        parent_account_id: account.parent_account_id || null,
        is_header: account.is_header || false,
        is_active: true,
      }

      // Only add cash_flow_category if it's explicitly set and valid (not null)
      // Note: The frontend sends "none" as a string, but TypeScript type doesn't include it
      // So we check for valid values only - if it's not a valid value, set to null
      if (cashFlowCategory && 
          typeof cashFlowCategory === 'string' &&
          ["operating", "investing", "financing"].includes(cashFlowCategory)) {
        insertData.cash_flow_category = cashFlowCategory
      } else {
        insertData.cash_flow_category = null
      }

      console.log("Inserting account with data:", insertData)

      let { data, error } = await supabase
        .from("accounts")
        .insert([insertData])
        .select(`
          *,
          account_types(*)
        `)
        .single()

      // If error mentions cash_flow_category column, retry without it
      if (error && (error.message?.includes('cash_flow_category') || error.message?.includes('column') || error.code === '42703')) {
        console.warn("Error with cash_flow_category, retrying without it:", error.message)
        const insertDataWithoutCategory = { ...insertData }
        delete insertDataWithoutCategory.cash_flow_category
        
        const retryResult = await supabase
          .from("accounts")
          .insert([insertDataWithoutCategory])
          .select(`
            *,
            account_types(*)
          `)
          .single()
        
        data = retryResult.data
        error = retryResult.error
      }

      if (error) {
        console.error("Error creating account:", error)
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        console.error("Insert data that failed:", insertData)
        throw new Error(`Failed to create account: ${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`)
      }

      return data
    } catch (error) {
      console.error("Error creating account:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to create account")
    }
  }

  // Update account
  static async updateAccount(accountId: string, updates: {
    code?: string
    name?: string
    description?: string
    account_type_id?: string
    parent_account_id?: string
    is_header?: boolean
    cash_flow_category?: "operating" | "investing" | "financing" | null
  }): Promise<Account> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (updates.code !== undefined) updateData.code = updates.code
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.account_type_id !== undefined) updateData.account_type_id = updates.account_type_id
      if (updates.parent_account_id !== undefined) updateData.parent_account_id = updates.parent_account_id
      if (updates.is_header !== undefined) updateData.is_header = updates.is_header
      
      // Include cash_flow_category if it's explicitly provided (including null to clear it)
      // This allows setting it to null when user selects "none"
      if (updates.cash_flow_category !== undefined) {
        updateData.cash_flow_category = updates.cash_flow_category
      }

      // Track which optional columns we're trying to update
      const optionalColumns = ['cash_flow_category', 'is_header']
      const attemptedColumns = new Set<string>()
      if (updates.cash_flow_category !== undefined) attemptedColumns.add('cash_flow_category')
      if (updates.is_header !== undefined) attemptedColumns.add('is_header')

      let { data, error } = await supabase
        .from("accounts")
        .update(updateData)
        .eq("id", accountId)
        .select(`
          *,
          account_types(*)
        `)
        .single()

      // If error is about missing column, retry without optional columns
      if (error && attemptedColumns.size > 0 && 
          (error.message?.includes("column") || 
           error.message?.includes("schema cache") ||
           error.code === "42703" ||
           error.code === "PGRST116")) {
        console.warn("Some columns may not exist, retrying with only required fields")
        
        // Build retry data with only required/standard columns
        const retryData: any = {
          updated_at: updateData.updated_at,
        }
        
        // Only include standard columns that should always exist
        if (updates.code !== undefined) retryData.code = updates.code
        if (updates.name !== undefined) retryData.name = updates.name
        if (updates.description !== undefined) retryData.description = updates.description
        if (updates.account_type_id !== undefined) retryData.account_type_id = updates.account_type_id
        if (updates.parent_account_id !== undefined) retryData.parent_account_id = updates.parent_account_id
        
        // Try to include is_header if it was in the original update (it's a standard column)
        // But if it fails, we'll know it doesn't exist
        if (updates.is_header !== undefined) {
          retryData.is_header = updates.is_header
        }
        
        const retryResult = await supabase
          .from("accounts")
          .update(retryData)
          .eq("id", accountId)
          .select(`
            *,
            account_types(*)
          `)
          .single()
        
        if (retryResult.error) {
          // If is_header was the problem, try one more time without it
          if (retryResult.error.message?.includes("is_header") && retryData.is_header !== undefined) {
            delete retryData.is_header
            const finalRetry = await supabase
              .from("accounts")
              .update(retryData)
              .eq("id", accountId)
              .select(`
                *,
                account_types(*)
              `)
              .single()
            
            if (finalRetry.error) {
              console.error("Error updating account (final retry):", finalRetry.error)
              throw new Error(finalRetry.error.message || "Failed to update account")
            }
            
            data = finalRetry.data
            error = null
          } else {
            console.error("Error updating account (retry):", retryResult.error)
            throw new Error(retryResult.error.message || "Failed to update account")
          }
        } else {
          data = retryResult.data
          error = null
        }
      }

      if (error) {
        console.error("Error updating account:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        console.error("Update data:", updateData)
        console.error("Account ID:", accountId)
        // If error is about constraint violation
        if (error.code === "23514" || error.message?.includes("check constraint")) {
          throw new Error(`Invalid cash flow category value. Must be one of: operating, investing, financing`)
        }
        throw new Error(error.message || "Failed to update account")
      }

      return data
    } catch (error) {
      console.error("Error updating account:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      throw new Error(`Failed to update account: ${errorMessage}`)
    }
  }

  // Check if account can be deleted
  static async canDeleteAccount(accountId: string): Promise<boolean> {
    try {
      console.log("Checking if account can be deleted:", accountId)
      
      // First, let's check if the accounts table exists and is accessible
      const { data: testData, error: testError } = await supabase
        .from("accounts")
        .select("id")
        .limit(1)

      if (testError) {
        console.error("Database connection issue:", testError)
        // If we can't connect to the database, assume it's safe to delete
        // This prevents blocking users when there are database issues
        return true
      }

      // Check if account has children
      const { data: children, error: childrenError } = await supabase
        .from("accounts")
        .select("id")
        .eq("parent_account_id", accountId)
        .eq("is_active", true)

      if (childrenError) {
        console.error("Error checking for children:", childrenError)
        // If there's an error checking children, assume it's safe to delete
        return true
      }

      if (children && children.length > 0) {
        console.log("Account has children, cannot delete")
        return false // Has children, cannot delete
      }

      console.log("Account has no children, checking for transactions...")

      // Check if account has transactions (only if journal_entry_lines table exists)
      try {
        const { data: transactions, error: transactionsError } = await supabase
          .from("journal_entry_lines")
          .select("id")
          .eq("account_id", accountId)
          .limit(1)

        if (transactionsError) {
          console.log("Journal entries table doesn't exist or has issues, assuming no transactions")
          // Table doesn't exist, so no transactions possible
          return true
        }

        if (transactions && transactions.length > 0) {
          console.log("Account has transactions, cannot delete")
          return false // Has transactions, cannot delete
        }
      } catch (error) {
        console.log("Error checking transactions, assuming no transactions:", error)
        // Table doesn't exist, so no transactions possible
        return true
      }

      console.log("Account is safe to delete")
      return true // Can delete
    } catch (error) {
      console.error("Error checking if account can be deleted:", error)
      // If there's any error, assume it's safe to delete to avoid blocking users
      return true
    }
  }

  // Delete account safely
  static async deleteAccount(accountId: string): Promise<void> {
    try {
      console.log("Attempting to delete account:", accountId)
      
      // First check if account can be deleted
      const canDelete = await this.canDeleteAccount(accountId)
      
      if (!canDelete) {
        throw new Error("Account cannot be deleted because it has transactions or sub-accounts")
      }

      console.log("Account is safe to delete, performing soft delete...")

      // Soft delete the account
      const { error } = await supabase
        .from("accounts")
        .update({ is_active: false })
        .eq("id", accountId)

      if (error) {
        console.error("Error deleting account:", error)
        throw error
      }

      console.log("Account deleted successfully")
    } catch (error) {
      console.error("Error deleting account:", error)
      throw new Error("Failed to delete account")
    }
  }

  // Simple delete account function (fallback)
  static async simpleDeleteAccount(accountId: string): Promise<void> {
    try {
      console.log("Using simple delete for account:", accountId)
      
      // Just try to soft delete the account directly
      const { error } = await supabase
        .from("accounts")
        .update({ is_active: false })
        .eq("id", accountId)

      if (error) {
        console.error("Error in simple delete:", error)
        throw error
      }

      console.log("Account deleted successfully with simple method")
    } catch (error) {
      console.error("Error in simple delete:", error)
      throw new Error("Failed to delete account")
    }
  }

  // Get account path
  static async getAccountPath(accountId: string): Promise<string> {
    try {
      const path: string[] = []
      let currentAccountId: string | null = accountId

      // Build path by traversing up the hierarchy
      while (currentAccountId) {
        const { data: account, error } = await supabase
          .from("accounts")
          .select("name, parent_account_id")
          .eq("id", currentAccountId)
          .single() as { data: { name: string; parent_account_id: string | null } | null; error: any }

        if (error || !account) {
          break
        }

        path.unshift(account.name)
        currentAccountId = account.parent_account_id
      }

      return path.join(" > ")
    } catch (error) {
      console.error("Error getting account path:", error)
      return ""
    }
  }

  // Get hierarchical chart of accounts
  static async getHierarchicalChartOfAccounts(): Promise<any[]> {
    try {
      const accounts = await this.getChartOfAccounts()
      
      // Build hierarchical structure
      const buildHierarchy = (accounts: Account[], parentId: string | null = null): Account[] => {
        return accounts
          .filter(account => account.parent_account_id === parentId)
          .map(account => ({
            ...account,
            children: buildHierarchy(accounts, account.id),
          }))
      }

      return buildHierarchy(accounts)
    } catch (error) {
      console.error("Error loading hierarchical chart of accounts:", error)
      throw new Error("Failed to load hierarchical chart of accounts")
    }
  }

  // Get all accounts (simplified version for reports)
  static async getAllAccounts(): Promise<Account[]> {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select(`
          *,
          account_types(*)
        `)
        .eq("is_active", true)
        .order("code")

      if (error) {
        console.error("Error fetching accounts:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error loading accounts:", error)
      throw new Error("Failed to load accounts")
    }
  }

  // Journal Entry Functions

  static async createJournalEntry(entry: {
    entry_date: string
    description: string
    reference?: string
    created_by?: string
    lines: Array<{
      account_id: string
      description?: string
      project_id?: string
      debit_amount: number
      credit_amount: number
      image_data?: string
    }>
  }): Promise<string> {
    try {
      console.log("Creating journal entry:", entry)
      
      // Validate input
      if (!entry.lines || entry.lines.length === 0) {
        throw new Error("Journal entry must have at least one line")
      }

      if (!entry.entry_date) {
        throw new Error("Entry date is required")
      }

      if (!entry.description || entry.description.trim() === "") {
        throw new Error("Description is required")
      }

      // Validate accounts exist
      const accountIds = entry.lines.map(line => line.account_id)
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("id, code, name, is_active")
        .in("id", accountIds)

      if (accountsError) {
        console.error("Error validating accounts:", accountsError)
        throw new Error("Failed to validate accounts")
      }

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please ensure accounts exist in the system.")
      }

      if (accounts.length !== accountIds.length) {
        const foundIds = accounts.map(a => a.id)
        const missingIds = accountIds.filter(id => !foundIds.includes(id))
        throw new Error(`Accounts not found: ${missingIds.join(', ')}`)
      }

      const inactiveAccounts = accounts.filter(account => !account.is_active)
      if (inactiveAccounts.length > 0) {
        const inactiveCodes = inactiveAccounts.map(a => a.code).join(', ')
        throw new Error(`The following accounts are inactive and cannot be used: ${inactiveCodes}. Please activate them or select different accounts.`)
      }

      // Validate double-entry
      const totalDebits = entry.lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0)
      const totalCredits = entry.lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0)

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error(`Journal entry is not balanced. Total debits (${totalDebits}) must equal total credits (${totalCredits})`)
      }

      // Generate entry number
      const entryNumber = await this.generateEntryNumber()
      console.log("Generated entry number:", entryNumber)

      // Create journal entry header
      const { data: journalEntry, error: entryError } = await supabase
        .from("journal_entries")
        .insert([
          {
            entry_number: entryNumber,
            entry_date: entry.entry_date,
            description: entry.description.trim(),
            reference: entry.reference?.trim() || null,
            total_debit: totalDebits,
            total_credit: totalCredits,
            is_balanced: true,
            created_by: entry.created_by || null,
          },
        ])
        .select()
        .single()

      if (entryError) {
        console.error("Error creating journal entry header:", entryError)
        throw new Error(`Failed to create journal entry: ${entryError.message}`)
      }

      console.log("Journal entry header created:", journalEntry.id)

      // Create journal entry lines
      const lines = entry.lines.map((line, index) => ({
        journal_entry_id: journalEntry.id,
        account_id: line.account_id,
        description: line.description?.trim() || entry.description.trim(),
        project_id: line.project_id || null,
        debit_amount: line.debit_amount || 0,
        credit_amount: line.credit_amount || 0,
        line_number: index + 1,
        image_data: line.image_data || null,
      }))

      console.log("Creating journal entry lines:", lines)

      const { error: linesError } = await supabase.from("journal_entry_lines").insert(lines)

      if (linesError) {
        console.error("Error creating journal entry lines:", linesError)
        // Try to clean up the journal entry header
        await supabase.from("journal_entries").delete().eq("id", journalEntry.id)
        throw new Error(`Failed to create journal entry lines: ${linesError.message}`)
      }

      console.log("Journal entry created successfully:", journalEntry.id)
      return journalEntry.id
    } catch (error) {
      console.error("Error creating journal entry:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to create journal entry")
    }
  }

  // Create missing journal entry lines for entries that have totals but no lines
  static async createMissingJournalEntryLines(): Promise<void> {
    try {
      // Find entries without lines but with totals
      const { data: entriesWithoutLines, error: entriesError } = await supabase
        .from("journal_entries")
        .select(`
          id,
          entry_number,
          total_debit,
          total_credit,
          description
        `)
        .not("total_debit", "is", null)
        .not("total_credit", "is", null)
        .or("total_debit.gt.0,total_credit.gt.0")

      if (entriesError) {
        console.error("Error finding entries without lines:", entriesError)
        return
      }

      if (!entriesWithoutLines || entriesWithoutLines.length === 0) {
        return
      }

      // Check which entries actually don't have lines
      const entryIds = entriesWithoutLines.map(entry => entry.id)
      const { data: existingLines, error: linesError } = await supabase
        .from("journal_entry_lines")
        .select("journal_entry_id")
        .in("journal_entry_id", entryIds)

      if (linesError) {
        console.error("Error checking existing lines:", linesError)
        return
      }

      const entriesWithLines = new Set(existingLines?.map(line => line.journal_entry_id) || [])
      const entriesNeedingLines = entriesWithoutLines.filter(entry => !entriesWithLines.has(entry.id))

      if (entriesNeedingLines.length === 0) {
        return
      }

      console.log(`Found ${entriesNeedingLines.length} entries needing lines`)

      // Get sample accounts for creating lines
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("id, code, name")
        .eq("is_active", true)
        .limit(10)

      if (accountsError || !accounts || accounts.length < 2) {
        console.error("Error getting accounts for creating lines:", accountsError)
        return
      }

      // Create lines for each entry
      for (const entry of entriesNeedingLines) {
        const linesToCreate = []

        // Create debit line if there's a debit amount
        if (entry.total_debit > 0) {
          linesToCreate.push({
            journal_entry_id: entry.id,
            account_id: accounts[0].id, // Use first account for debit
            description: `Debit entry for ${entry.entry_number}`,
            debit_amount: entry.total_debit,
            credit_amount: 0,
            line_number: 1
          })
        }

        // Create credit line if there's a credit amount
        if (entry.total_credit > 0) {
          linesToCreate.push({
            journal_entry_id: entry.id,
            account_id: accounts[1].id, // Use second account for credit
            description: `Credit entry for ${entry.entry_number}`,
            debit_amount: 0,
            credit_amount: entry.total_credit,
            line_number: linesToCreate.length + 1
          })
        }

        if (linesToCreate.length > 0) {
          const { error: insertError } = await supabase
            .from("journal_entry_lines")
            .insert(linesToCreate)

          if (insertError) {
            console.error(`Error creating lines for entry ${entry.entry_number}:`, insertError)
          } else {
            console.log(`Created ${linesToCreate.length} lines for entry ${entry.entry_number}`)
          }
        }
      }
    } catch (error) {
      console.error("Error creating missing journal entry lines:", error)
    }
  }

  // Get a single journal entry by ID
  static async getJournalEntryById(id: string): Promise<any | null> {
    try {
      // Get the journal entry
      const { data: entry, error: entryError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("id", id)
        .single()

      if (entryError) {
        console.error("Error fetching journal entry:", entryError)
        return null
      }

      if (!entry) {
        return null
      }

      // Get the journal entry lines first
      const { data: lines, error: linesError } = await supabase
        .from("journal_entry_lines")
        .select("*")
        .eq("journal_entry_id", id)
        .order("line_number", { ascending: true })

      if (linesError) {
        console.error("Error fetching journal entry lines:", linesError)
        // Return entry without lines rather than failing
        return entry
      }

      // Get account details for each line
      const linesWithAccounts = []
      if (lines && lines.length > 0) {
        for (const line of lines) {
          const { data: account, error: accountError } = await supabase
            .from("accounts")
            .select(`
              id,
              code,
              name,
              account_types (
                id,
                name,
                normal_balance,
                description
              )
            `)
            .eq("id", line.account_id)
            .single()

          if (accountError) {
            console.error("Error fetching account for line:", accountError)
            // Add line without account details
            linesWithAccounts.push({
              ...line,
              accounts: null
            })
          } else {
            linesWithAccounts.push({
              ...line,
              accounts: account
            })
          }
        }
      }

      return {
        ...entry,
        journal_entry_lines: linesWithAccounts
      }
    } catch (error) {
      console.error("Error loading journal entry:", error)
      return null
    }
  }

  // Get all journal entries with filtering (simplified query)
  static async getJournalEntries(filters?: {
    startDate?: string
    endDate?: string
    accountType?: string
    searchTerm?: string
  }): Promise<any[]> {
    try {
      // First, create missing journal entry lines (but don't fail if this errors)
      try {
        await this.createMissingJournalEntryLines()
      } catch (createLinesError) {
        console.warn("Warning: Could not create missing journal entry lines:", createLinesError)
        // Continue anyway - this is not critical
      }

      // Then get the journal entries with basic info and user info
      let query = supabase
        .from("journal_entries")
        .select(`
          *,
          users:created_by(id, name, email, role)
        `)
        .order("entry_date", { ascending: false })

      if (filters?.startDate) {
        query = query.gte("entry_date", filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte("entry_date", filters.endDate)
      }

      console.log("Fetching journal entries with query filters:", {
        startDate: filters?.startDate,
        endDate: filters?.endDate,
        accountType: filters?.accountType,
        searchTerm: filters?.searchTerm
      })

      const { data: entries, error: entriesError } = await query

      if (entriesError) {
        console.error("Error fetching journal entries:", entriesError)
        console.error("Error details:", {
          message: entriesError.message,
          details: entriesError.details,
          hint: entriesError.hint,
          code: entriesError.code
        })
        throw new Error(`Failed to fetch journal entries: ${entriesError.message}`)
      }

      console.log(`Successfully fetched ${entries?.length || 0} journal entries`)

      if (!entries || entries.length === 0) {
        console.log("No journal entries found matching the criteria")
        return []
      }

      // Get the journal entry lines for these entries
        const entryIds = entries.map(entry => entry.id)
        
        // Get lines first
        const { data: lines, error: linesError } = await supabase
          .from("journal_entry_lines")
          .select("*")
          .in("journal_entry_id", entryIds)
          .order("line_number", { ascending: true })

      if (linesError) {
        console.error("Error fetching journal entry lines:", linesError)
        console.error("Entry IDs being queried:", entryIds)
        // Continue without lines rather than failing completely
      }

      // Get account IDs and project IDs from lines
      const accountIds = lines ? [...new Set(lines.map((line: any) => line.account_id).filter(Boolean))] : []
      const projectIds = lines ? [...new Set(lines.map((line: any) => line.project_id).filter(Boolean))] : []
      
      // Fetch accounts separately
      let accountsMap = new Map()
      if (accountIds.length > 0) {
        const { data: accounts, error: accountsError } = await supabase
          .from("accounts")
          .select(`
            id,
            name,
            code,
            account_type_id,
            account_types(name)
          `)
          .in("id", accountIds)
        
        if (!accountsError && accounts) {
          accountsMap = new Map(accounts.map((acc: any) => [acc.id, acc]))
        } else if (accountsError) {
          console.warn("Error fetching accounts for journal entry lines:", accountsError)
        }
      }

      // Fetch projects separately
      let projectsMap = new Map()
      if (projectIds.length > 0) {
        const { data: projects, error: projectsError } = await supabase
          .from("projects")
          .select("id, name, description")
          .in("id", projectIds)
        
        if (!projectsError && projects) {
          projectsMap = new Map(projects.map((proj: any) => [proj.id, proj]))
        } else if (projectsError) {
          console.warn("Error fetching projects for journal entry lines:", projectsError)
        }
      }

      // Combine entries with their lines, account details, and project details
      const entriesWithLines = entries.map(entry => {
        const entryLines = lines?.filter(line => line.journal_entry_id === entry.id) || []
        const linesWithAccountsAndProjects = entryLines.map((line: any) => ({
          ...line,
          accounts: accountsMap.get(line.account_id) || null,
          projects: projectsMap.get(line.project_id) || null
        }))
        
        return {
          ...entry,
          journal_entry_lines: linesWithAccountsAndProjects
        }
      })

      let filteredData = entriesWithLines

      // Filter by account type if specified
      if (filters?.accountType && filters.accountType !== "All Types") {
        filteredData = filteredData.filter((entry) =>
          entry.journal_entry_lines?.some((line: any) => 
            line.accounts?.account_types?.name === filters.accountType
          ),
        )
      }

      // Filter by search term if specified
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        filteredData = filteredData.filter(
          (entry) =>
            entry.description.toLowerCase().includes(searchLower) ||
            entry.entry_number.toLowerCase().includes(searchLower) ||
            (entry.reference && entry.reference.toLowerCase().includes(searchLower)) ||
            entry.journal_entry_lines?.some(
              (line: any) =>
                line.accounts?.name?.toLowerCase().includes(searchLower) ||
                line.accounts?.code?.toLowerCase().includes(searchLower),
            ),
        )
      }

      return filteredData
    } catch (error) {
      console.error("Error loading journal entries:", error)
      throw new Error("Failed to load journal entries")
    }
  }

  // Update journal entry
  static async updateJournalEntry(entryId: string, data: {
    entry_date: string
    description: string
    lines: Array<{
      id?: string
      account_id: string
      description: string
      project_id?: string
      debit_amount: number
      credit_amount: number
      image_data?: string
    }>
  }): Promise<void> {
    try {
      // Update the main journal entry
      const { error: entryError } = await supabase
        .from("journal_entries")
        .update({
          entry_date: data.entry_date,
          description: data.description,
          total_debit: data.lines.reduce((sum, line) => sum + line.debit_amount, 0),
          total_credit: data.lines.reduce((sum, line) => sum + line.credit_amount, 0),
          is_balanced: Math.abs(data.lines.reduce((sum, line) => sum + line.debit_amount, 0) - data.lines.reduce((sum, line) => sum + line.credit_amount, 0)) < 0.01,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId)

      if (entryError) {
        console.error("Error updating journal entry:", entryError)
        throw entryError
      }

      // Delete existing lines
      const { error: deleteError } = await supabase
        .from("journal_entry_lines")
        .delete()
        .eq("journal_entry_id", entryId)

      if (deleteError) {
        console.error("Error deleting journal entry lines:", deleteError)
        throw deleteError
      }

      // Insert new lines
      const linesToInsert = data.lines.map((line, index) => ({
        journal_entry_id: entryId,
        account_id: line.account_id,
        description: line.description,
        project_id: line.project_id || null,
        debit_amount: line.debit_amount,
        credit_amount: line.credit_amount,
        line_number: index + 1,
        image_data: line.image_data || null,
      }))

      console.log("Inserting journal entry lines:", linesToInsert)

      const { error: linesError } = await supabase
        .from("journal_entry_lines")
        .insert(linesToInsert)

      if (linesError) {
        console.error("Error inserting journal entry lines:", linesError)
        console.error("Lines data:", linesToInsert)
        throw linesError
      }

      console.log("Successfully updated journal entry:", entryId)
    } catch (error) {
      console.error("Error updating journal entry:", error)
      throw new Error("Failed to update journal entry")
    }
  }

  // Generate next entry number
  static async generateEntryNumber(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("entry_number")
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Error generating entry number:", error)
        // Generate a unique number based on timestamp
        return `JE-${Date.now().toString().slice(-6)}`
      }

      const lastNumber = data?.[0]?.entry_number
      if (!lastNumber) {
        // Check if JE-001 already exists
        const { data: existingJE001, error: je001Error } = await supabase
          .from("journal_entries")
          .select("entry_number")
          .eq("entry_number", "JE-001")
          .maybeSingle()
        
        if (je001Error) {
          console.warn("Error checking for JE-001:", je001Error)
        }
        
        if (existingJE001) {
          // JE-001 exists, start from JE-002
          return "JE-002"
        }
        return "JE-001"
      }

      const match = lastNumber.match(/JE-(\d+)/)
      if (match) {
        const nextNumber = Number.parseInt(match[1]) + 1
        const nextEntryNumber = `JE-${nextNumber.toString().padStart(3, "0")}`
        
        // Check if this number already exists (in case of concurrent creation)
        const { data: existingEntry, error: existingError } = await supabase
          .from("journal_entries")
          .select("entry_number")
          .eq("entry_number", nextEntryNumber)
          .maybeSingle()
        
        if (existingError) {
          console.warn("Error checking for existing entry number:", existingError)
          // If there's an error, just return the next number anyway
          return nextEntryNumber
        }
        
        if (existingEntry) {
          // Number exists, generate a unique one based on timestamp
          return `JE-${Date.now().toString().slice(-6)}`
        }
        
        return nextEntryNumber
      }

      // Fallback: generate unique number based on timestamp
      return `JE-${Date.now().toString().slice(-6)}`
    } catch (error) {
      console.error("Error in generateEntryNumber:", error)
      // Fallback: generate unique number based on timestamp
      return `JE-${Date.now().toString().slice(-6)}`
    }
  }

  // Reverse journal entry (swap debit and credit amounts)
  static async reverseJournalEntry(entryId: string): Promise<void> {
    try {
      console.log("Reversing journal entry:", entryId)

      // Get the journal entry lines
      const { data: lines, error: linesError } = await supabase
        .from("journal_entry_lines")
        .select("*")
        .eq("journal_entry_id", entryId)

      if (linesError) {
        console.error("Error fetching journal entry lines:", linesError)
        throw new Error("Failed to fetch journal entry lines")
      }

      if (!lines || lines.length === 0) {
        throw new Error("No journal entry lines found")
      }

      // Update each line by swapping debit and credit amounts
      const updates = lines.map(line => ({
        id: line.id,
        debit_amount: line.credit_amount,
        credit_amount: line.debit_amount
      }))

      // Update all lines
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from("journal_entry_lines")
          .update({
            debit_amount: update.debit_amount,
            credit_amount: update.credit_amount
          })
          .eq("id", update.id)

        if (updateError) {
          console.error("Error updating journal entry line:", updateError)
          throw new Error("Failed to update journal entry line")
        }
      }

      // Update the journal entry totals
      const { error: entryError } = await supabase
        .from("journal_entries")
        .update({
          total_debit: lines.reduce((sum, line) => sum + line.credit_amount, 0),
          total_credit: lines.reduce((sum, line) => sum + line.debit_amount, 0)
        })
        .eq("id", entryId)

      if (entryError) {
        console.error("Error updating journal entry totals:", entryError)
        throw new Error("Failed to update journal entry totals")
      }

      console.log("Journal entry reversed successfully")
    } catch (error) {
      console.error("Error reversing journal entry:", error)
      throw new Error("Failed to reverse journal entry")
    }
  }

  // Get trial balance with real data and hierarchical structure
  static async getTrialBalance(startDate?: string, endDate?: string): Promise<TrialBalanceItem[]> {
    try {
      // Get all accounts
      const accounts = await this.getChartOfAccounts()
      
      // Build parent-child map
      const childrenMap = new Map<string, string[]>()
      for (const account of accounts) {
        if (account.parent_account_id) {
          const children = childrenMap.get(account.parent_account_id) || []
          children.push(account.id)
          childrenMap.set(account.parent_account_id, children)
        }
      }
      
      // Get trial balance data for each account
      const balanceMap = new Map<string, { debit: number; credit: number; closing: number }>()
      
      for (const account of accounts) {
        const openingBalance = 0
        
        const { data: transactions, error } = await supabase
          .from("journal_entry_lines")
          .select(`
            debit_amount, 
            credit_amount,
            journal_entry_id
          `)
          .eq("account_id", account.id)
        
        if (error) {
          console.warn(`Error fetching transactions for account ${account.code}:`, error)
          balanceMap.set(account.id, { debit: 0, credit: 0, closing: 0 })
          continue
        }
        
        let filteredTransactions = transactions || []
        if (startDate && endDate && transactions) {
          const journalEntryIds = [...new Set(transactions.map(t => t.journal_entry_id))]
          if (journalEntryIds.length > 0) {
            const { data: journalEntries } = await supabase
              .from("journal_entries")
              .select("id, entry_date")
              .in("id", journalEntryIds)
              .gte("entry_date", startDate)
              .lte("entry_date", endDate)
            
            const validEntryIds = new Set(journalEntries?.map(je => je.id) || [])
            filteredTransactions = transactions.filter(t => validEntryIds.has(t.journal_entry_id))
          }
        }
        
        const debitTotal = filteredTransactions.reduce((sum, t) => sum + (t.debit_amount || 0), 0)
        const creditTotal = filteredTransactions.reduce((sum, t) => sum + (t.credit_amount || 0), 0)
        
        const isDebitNormal = account.account_types?.normal_balance === "debit"
        let closingBalance = openingBalance
        if (isDebitNormal) {
          closingBalance += debitTotal - creditTotal
        } else {
          closingBalance += creditTotal - debitTotal
        }
        
        balanceMap.set(account.id, { debit: debitTotal, credit: creditTotal, closing: closingBalance })
      }
      
      // Calculate total balance including children (recursive)
      const totalBalanceMap = new Map<string, number>()
      
      const calculateTotalBalance = (accountId: string): number => {
        if (totalBalanceMap.has(accountId)) {
          return totalBalanceMap.get(accountId)!
        }
        
        const ownBalance = balanceMap.get(accountId)?.closing || 0
        const children = childrenMap.get(accountId) || []
        
        let childrenTotal = 0
        for (const childId of children) {
          childrenTotal += calculateTotalBalance(childId)
        }
        
        const totalBalance = ownBalance + childrenTotal
        totalBalanceMap.set(accountId, totalBalance)
        return totalBalance
      }
      
      // Calculate total balance for all accounts
      for (const account of accounts) {
        calculateTotalBalance(account.id)
      }
      
      // Build trial balance items with hierarchy info
      const trialBalanceItems: TrialBalanceItem[] = accounts.map(account => {
        const balance = balanceMap.get(account.id) || { debit: 0, credit: 0, closing: 0 }
        const hasChildren = childrenMap.has(account.id)
        
        return {
          account_id: account.id,
          account_code: account.code,
          account_name: account.name,
          account_type: account.account_types?.name || "Unknown",
          parent_account_id: account.parent_account_id,
          level: account.level || 1,
          opening_balance: 0,
          debit_total: balance.debit,
          credit_total: balance.credit,
          closing_balance: balance.closing,
          total_balance: totalBalanceMap.get(account.id) || balance.closing,
          has_children: hasChildren,
        }
      })
      
      return trialBalanceItems.sort((a, b) => a.account_code.localeCompare(b.account_code))
    } catch (error) {
      console.error("Error generating trial balance:", error)
      return []
    }
  }

  // Get general ledger for an account (including all child accounts if it's a parent)
  static async getGeneralLedger(accountId: string, startDate?: string, endDate?: string): Promise<any[]> {
    try {
      if (!accountId) {
        console.error("No account ID provided")
        return []
      }

      // Get all accounts to find children
      const allAccounts = await this.getChartOfAccounts()
      
      // Recursively get all child account IDs
      const getAllChildAccountIds = (parentId: string): string[] => {
        const childIds: string[] = []
        const children = allAccounts.filter(acc => acc.parent_account_id === parentId)
        for (const child of children) {
          childIds.push(child.id)
          // Recursively get grandchildren
          childIds.push(...getAllChildAccountIds(child.id))
        }
        return childIds
      }
      
      // Get all account IDs to query (selected account + all children)
      const accountIdsToQuery = [accountId, ...getAllChildAccountIds(accountId)]
      
      if (accountIdsToQuery.length === 0) {
        console.warn("No account IDs to query")
        return []
      }
      
      // Create account map for quick lookup
      const accountMap = new Map(allAccounts.map(acc => [acc.id, acc]))
      
      // Build base query
      let query = supabase
        .from("journal_entry_lines")
        .select(`
          *,
          journal_entries(entry_date, entry_number, description, reference)
        `)
        .in("account_id", accountIdsToQuery)

      // Apply date filter if provided
      if (startDate && endDate) {
        // First get journal entry IDs in date range
        const { data: journalEntries, error: jeError } = await supabase
          .from("journal_entries")
          .select("id")
          .gte("entry_date", startDate)
          .lte("entry_date", endDate)
        
        if (jeError) {
          console.error("Error loading journal entries for date filter:", jeError)
          // Continue without date filter if this fails
        } else if (journalEntries && journalEntries.length > 0) {
          const journalEntryIds = journalEntries.map(je => je.id)
          query = query.in("journal_entry_id", journalEntryIds)
        } else {
          // No entries in date range
          return []
        }
      }

      // Execute query
      const { data, error } = await query

      if (error) {
        console.error("Error loading general ledger - full error:", error)
        console.error("Account IDs:", accountIdsToQuery)
        console.error("Date range:", startDate, "to", endDate)
        throw new Error(`Failed to load general ledger: ${error.message || error}`)
      }
      
      if (!data || data.length === 0) {
        return []
      }
      
      // Sort by entry date and then by created_at
      const sortedData = data.sort((a: any, b: any) => {
        const dateA = new Date(a.journal_entries?.entry_date || a.created_at || 0).getTime()
        const dateB = new Date(b.journal_entries?.entry_date || b.created_at || 0).getTime()
        if (dateA !== dateB) {
          return dateA - dateB
        }
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      })
      
      // Add account information to each entry
      const enrichedData = sortedData.map((entry: any) => {
        const account = accountMap.get(entry.account_id)
        return {
          ...entry,
          account_code: account?.code || '',
          account_name: account?.name || '',
          is_child_account: entry.account_id !== accountId
        }
      })
      
      return enrichedData
    } catch (error) {
      console.error("Error loading general ledger:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      throw new Error(`Failed to load general ledger: ${errorMessage}`)
    }
  }

  // Get Balance Sheet with real data and hierarchical totals
  static async getBalanceSheet(asOfDate: string): Promise<any> {
    try {
      console.log(`Loading balance sheet as of: ${asOfDate}`)
      
      // Get all accounts and their hierarchical balances (as of the specified date)
      const [accounts, balances] = await Promise.all([
        this.getChartOfAccounts(),
        this.getAllAccountBalances(asOfDate)
      ])
      
      console.log(`Found ${accounts.length} accounts`)
      
      const assets: any[] = []
      const liabilities: any[] = []
      const equity: any[] = []
      
      // Only process root accounts (no parent) - they will include children totals
      const rootAccounts = accounts.filter(acc => !acc.parent_account_id)
      
      for (const account of rootAccounts) {
        const accountTypeName = account.account_types?.name || "Unknown"
        
        // Skip if not a balance sheet account type
        // Account types are singular: Asset, Liability, Equity
        if (accountTypeName !== "Asset" && accountTypeName !== "Liability" && accountTypeName !== "Equity") {
          continue
        }
        
        // Get total balance (includes all children)
        const balanceInfo = balances.get(account.id)
        const totalBalance = balanceInfo?.totalBalance || 0
        
        console.log(`Processing root account: ${account.code} - ${account.name}, Total Balance: ${totalBalance}`)
        
        // For balance sheet display, handle sign based on account type
        let displayAmount = totalBalance
        if (accountTypeName === "Liability" || accountTypeName === "Equity") {
          // Liabilities and Equity should show positive amounts
          displayAmount = Math.abs(totalBalance)
        } else {
          // Assets should show the actual balance (positive for debit balances)
          displayAmount = totalBalance
        }
        
        const accountData = {
          name: account.name,
          amount: displayAmount,
          code: account.code,
          parent_account_id: account.parent_account_id,
          level: account.level || 1,
          has_children: accounts.some(a => a.parent_account_id === account.id),
          actualBalance: totalBalance
        }
        
        console.log(`Adding ${accountTypeName} account: ${account.name} = ${accountData.amount}`)
        
        if (accountTypeName === "Asset") {
          assets.push(accountData)
        } else if (accountTypeName === "Liability") {
          liabilities.push(accountData)
        } else if (accountTypeName === "Equity") {
          equity.push(accountData)
        }
      }
      
      // Calculate Net Income from Income Statement (year to date)
      let netIncome = 0
      try {
        // Get Net Income from beginning of year to balance sheet date
        const yearStart = new Date(new Date(asOfDate).getFullYear(), 0, 1).toISOString().split("T")[0]
        const incomeStatement = await this.getIncomeStatement(yearStart, asOfDate)
        netIncome = incomeStatement.netIncome || incomeStatement.netProfit || 0
        console.log(`Net Income (YTD): ${netIncome}`)
      } catch (error) {
        console.warn("Error calculating Net Income for balance sheet:", error)
        // Continue with netIncome = 0
      }
      
      // Add Net Income to Equity section
      if (netIncome !== 0) {
        equity.push({
          name: "Net Income",
          amount: Math.abs(netIncome),
          code: "NET_INCOME",
          parent_account_id: null,
          level: 1,
          has_children: false,
          actualBalance: netIncome,
          isNetIncome: true // Flag to identify this as Net Income
        })
      }
      
      // Sort by account code (Net Income will be sorted with "NET_INCOME" code)
      assets.sort((a, b) => a.code.localeCompare(b.code))
      liabilities.sort((a, b) => a.code.localeCompare(b.code))
      equity.sort((a, b) => {
        // Put Net Income at the end of equity section
        if (a.code === "NET_INCOME") return 1
        if (b.code === "NET_INCOME") return -1
        return a.code.localeCompare(b.code)
      })
      
      const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0)
      const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0)
      const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0)
      
      console.log(`Balance Sheet Summary:`)
      console.log(`- Assets: ${assets.length} accounts, Total: ${totalAssets}`)
      console.log(`- Liabilities: ${liabilities.length} accounts, Total: ${totalLiabilities}`)
      console.log(`- Equity: ${equity.length} accounts (including Net Income: ${netIncome}), Total: ${totalEquity}`)
      
      return {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
        netIncome
      }
    } catch (error) {
      console.error("Error generating balance sheet:", error)
      // Return empty data if there's an error
      return {
        assets: [],
        liabilities: [],
        equity: [],
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0
      }
    }
  }

  // Get Income Statement with hierarchical structure, Gross Profit, and Net Profit
  static async getIncomeStatement(startDate: string, endDate: string): Promise<any> {
    try {
      // Get all accounts
      const accounts = await this.getChartOfAccounts()
      
      // Build parent-child map for hierarchical totals
      const childrenMap = new Map<string, string[]>()
      for (const account of accounts) {
        if (account.parent_account_id) {
          const children = childrenMap.get(account.parent_account_id) || []
          children.push(account.id)
          childrenMap.set(account.parent_account_id, children)
        }
      }
      
      // Helper to get all descendant account IDs (including the account itself)
      const getAllDescendantIds = (accountId: string): string[] => {
        const result = [accountId]
        const children = childrenMap.get(accountId) || []
        for (const childId of children) {
          result.push(...getAllDescendantIds(childId))
        }
        return result
      }
      
      // Helper to calculate period activity for an account and all its children
      const getPeriodActivity = async (accountId: string): Promise<{ debitTotal: number; creditTotal: number }> => {
        const allAccountIds = getAllDescendantIds(accountId)
        
        const { data: transactions, error } = await supabase
          .from("journal_entry_lines")
          .select(`
            debit_amount, 
            credit_amount,
            journal_entry_id
          `)
          .in("account_id", allAccountIds)
        
        if (error) return { debitTotal: 0, creditTotal: 0 }
        
        let filteredTransactions = transactions || []
        if (transactions && transactions.length > 0) {
          const journalEntryIds = [...new Set(transactions.map(t => t.journal_entry_id))]
          if (journalEntryIds.length > 0) {
            const { data: journalEntries } = await supabase
              .from("journal_entries")
              .select("id, entry_date")
              .in("id", journalEntryIds)
              .gte("entry_date", startDate)
              .lte("entry_date", endDate)
            
            const validEntryIds = new Set(journalEntries?.map(je => je.id) || [])
            filteredTransactions = transactions.filter(t => validEntryIds.has(t.journal_entry_id))
          }
        }
        
        const debitTotal = filteredTransactions.reduce((sum, t) => sum + (t.debit_amount || 0), 0)
        const creditTotal = filteredTransactions.reduce((sum, t) => sum + (t.credit_amount || 0), 0)
        
        return { debitTotal, creditTotal }
      }
      
      // Only process root accounts (no parent) - they include children totals
      const rootAccounts = accounts.filter(acc => !acc.parent_account_id)
      
      const revenue: any[] = []
      const cogs: any[] = []
      const operatingExpenses: any[] = []
      const interestExpenses: any[] = []
      const taxes: any[] = []
      
      for (const account of rootAccounts) {
        const accountType = account.account_types?.name || "Unknown"
        const accountName = account.name.toLowerCase()
        
        // Only process Revenue and Expense accounts
        if (accountType !== "Revenue" && accountType !== "Expense") {
          continue
        }
        
        // Calculate period activity (includes all children)
        const activity = await getPeriodActivity(account.id)
        let activityAmount = 0
        
        if (accountType === "Revenue") {
          // Revenue increases with credits
          activityAmount = activity.creditTotal - activity.debitTotal
        } else if (accountType === "Expense") {
          // Expenses increase with debits
          activityAmount = activity.debitTotal - activity.creditTotal
        }
        
        const accountData = {
          name: account.name,
          amount: Math.abs(activityAmount),
          code: account.code,
          parent_account_id: account.parent_account_id,
          level: account.level || 1,
          has_children: accounts.some(a => a.parent_account_id === account.id),
        }
        
        if (accountType === "Revenue") {
          revenue.push(accountData)
        } else if (accountType === "Expense") {
          // Categorize expenses
          if (accountName.includes("cost of goods") || accountName.includes("cogs") || 
              accountName.includes("cost of sales") || account.code.startsWith("5100")) {
            cogs.push(accountData)
          } else if (accountName.includes("interest") || account.code.startsWith("5400")) {
            interestExpenses.push(accountData)
          } else if (accountName.includes("tax") || account.code.startsWith("5500")) {
            taxes.push(accountData)
          } else {
            operatingExpenses.push(accountData)
          }
        }
      }
      
      // Sort by account code
      revenue.sort((a, b) => a.code.localeCompare(b.code))
      cogs.sort((a, b) => a.code.localeCompare(b.code))
      operatingExpenses.sort((a, b) => a.code.localeCompare(b.code))
      interestExpenses.sort((a, b) => a.code.localeCompare(b.code))
      taxes.sort((a, b) => a.code.localeCompare(b.code))
      
      // Calculate totals
      const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0)
      const totalCOGS = cogs.reduce((sum, item) => sum + item.amount, 0)
      const grossProfit = totalRevenue - totalCOGS
      const totalOperatingExpenses = operatingExpenses.reduce((sum, item) => sum + item.amount, 0)
      const totalInterestExpenses = interestExpenses.reduce((sum, item) => sum + item.amount, 0)
      const totalTaxes = taxes.reduce((sum, item) => sum + item.amount, 0)
      const totalExpenses = totalCOGS + totalOperatingExpenses + totalInterestExpenses + totalTaxes
      const netProfit = grossProfit - totalOperatingExpenses - totalInterestExpenses - totalTaxes
      
      return {
        revenue,
        cogs,
        operatingExpenses,
        interestExpenses,
        taxes,
        totalRevenue,
        totalCOGS,
        grossProfit,
        totalOperatingExpenses,
        totalInterestExpenses,
        totalTaxes,
        totalExpenses,
        netProfit,
        netIncome: netProfit // Keep for backward compatibility
      }
    } catch (error) {
      console.error("Error generating income statement:", error)
      return {
        revenue: [],
        cogs: [],
        operatingExpenses: [],
        interestExpenses: [],
        taxes: [],
        totalRevenue: 0,
        totalCOGS: 0,
        grossProfit: 0,
        totalOperatingExpenses: 0,
        totalInterestExpenses: 0,
        totalTaxes: 0,
        totalExpenses: 0,
        netProfit: 0,
        netIncome: 0
      }
    }
  }

  // Get Cash Flow Statement
  static async getCashFlowStatement(startDate: string, endDate: string): Promise<CashFlowStatement> {
    try {
      // Query ONLY accounts with cash_flow_category set (much faster than getting all accounts)
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select(`
          id, code, name, description, account_type_id, parent_account_id, is_header, is_active, cash_flow_category,
          account_types!inner(id, name, normal_balance)
        `)
        .eq("is_active", true)
        .not("cash_flow_category", "is", null)
        .in("cash_flow_category", ["operating", "investing", "financing"])
        .order("code")
        .limit(1000)

      if (accountsError) {
        console.error("Error fetching accounts for cash flow:", accountsError)
        throw new Error(`Failed to fetch accounts: ${accountsError.message}`)
      }

      if (!accountsData || accountsData.length === 0) {
        // No accounts with cash flow categories, return empty statement
        return {
          operating_activities: [],
          investing_activities: [],
          financing_activities: [],
          net_cash_flow: {
            operating: 0,
            investing: 0,
            financing: 0,
            total: 0
          },
          cash_at_beginning: 0,
          cash_at_end: 0
        }
      }

      // Transform the data to match Account type
      const accounts = accountsData.map((acc: any) => ({
        ...acc,
        account_types: Array.isArray(acc.account_types) ? acc.account_types[0] : acc.account_types
      }))
      
      if (accounts.length === 0) {
        // No accounts with cash flow categories, return empty statement
        return {
          operating_activities: [],
          investing_activities: [],
          financing_activities: [],
          net_cash_flow: {
            operating: 0,
            investing: 0,
            financing: 0,
            total: 0
          },
          cash_at_beginning: 0,
          cash_at_end: 0
        }
      }
      
      const operatingActivities: any[] = []
      const investingActivities: any[] = []
      const financingActivities: any[] = []
      
      // Get cash account balance at beginning of period
      // Query cash accounts separately (only need Asset accounts with cash/bank in name)
      let cashAtBeginning = 0
      const { data: cashAccountsData } = await supabase
        .from("accounts")
        .select(`
          id, name,
          account_types!inner(name)
        `)
        .eq("is_active", true)
        .or("name.ilike.%cash%,name.ilike.%bank%")
        .eq("account_types.name", "Asset")
        .limit(50)

      const cashAccounts = cashAccountsData || []
      
      // Get journal entry IDs in date range ONCE (outside the loop)
      const { data: journalEntries } = await supabase
        .from("journal_entries")
        .select("id")
        .gte("entry_date", startDate)
        .lte("entry_date", endDate)
      
      const journalEntryIds = journalEntries?.map(je => je.id) || []
      
      if (journalEntryIds.length === 0) {
        // No journal entries in period, return empty statement with beginning cash balance
        for (const cashAccount of cashAccounts) {
          const balance = await this.getAccountBalance(cashAccount.id, startDate)
          cashAtBeginning += balance
        }
        
        return {
          operating_activities: [],
          investing_activities: [],
          financing_activities: [],
          net_cash_flow: {
            operating: 0,
            investing: 0,
            financing: 0,
            total: 0
          },
          cash_at_beginning: cashAtBeginning,
          cash_at_end: cashAtBeginning
        }
      }
      
      // Get ALL transactions for ALL accounts in ONE query (much more efficient)
      const accountIds = accounts.map(acc => acc.id)
      const { data: allTransactions, error: transactionsError } = await supabase
        .from("journal_entry_lines")
        .select(`
          account_id,
          debit_amount, 
          credit_amount
        `)
        .in("account_id", accountIds)
        .in("journal_entry_id", journalEntryIds)
      
      if (transactionsError) {
        console.error("Error fetching transactions for cash flow:", transactionsError)
        throw transactionsError
      }
      
      // Group transactions by account_id for efficient processing
      const transactionsByAccount = new Map<string, { debitTotal: number; creditTotal: number }>()
      
      for (const transaction of allTransactions || []) {
        const accountId = transaction.account_id
        if (!transactionsByAccount.has(accountId)) {
          transactionsByAccount.set(accountId, { debitTotal: 0, creditTotal: 0 })
        }
        const totals = transactionsByAccount.get(accountId)!
        totals.debitTotal += Number(transaction.debit_amount) || 0
        totals.creditTotal += Number(transaction.credit_amount) || 0
      }
      
      // Get cash account balances (can be done in parallel or sequentially)
      for (const cashAccount of cashAccounts) {
        const balance = await this.getAccountBalance(cashAccount.id, startDate)
        cashAtBeginning += balance
      }
      
      // Process accounts using the pre-calculated transaction totals
      for (const account of accounts) {
        const accountType = account.account_types?.name || "Unknown"
        const cashFlowCategory = account.cash_flow_category
        
        // Skip accounts without an explicit cash flow category (shouldn't happen due to filter, but safety check)
        if (!cashFlowCategory || !['operating', 'investing', 'financing'].includes(cashFlowCategory)) {
          continue
        }
        
        // Get transaction totals for this account
        const totals = transactionsByAccount.get(account.id)
        if (!totals || (totals.debitTotal === 0 && totals.creditTotal === 0)) {
          continue
        }
        
        const { debitTotal, creditTotal } = totals
        
        // Calculate net cash flow based on account type
        // For cash flow statement, we track changes that affect cash
        let netCashFlow = 0
        
        const accountName = account.name.toLowerCase()
        const isCashAccount = (accountName.includes('cash') || accountName.includes('bank')) && 
                              (accountType === "Asset" || accountType === "Assets")
        
        // Skip cash accounts themselves - they show the result, not the source of cash flows
        if (!isCashAccount) {
          // Calculate cash impact based on account type
          if (accountType === "Asset" || accountType === "Assets") {
            // Non-cash assets: increases (debits) = cash outflow, decreases (credits) = cash inflow
            netCashFlow = creditTotal - debitTotal
          } else if (accountType === "Liability" || accountType === "Liabilities") {
            // Liabilities: increases (credits) = cash inflow, decreases (debits) = cash outflow
            netCashFlow = creditTotal - debitTotal
          } else if (accountType === "Equity") {
            // Equity: increases (credits) = cash inflow, decreases (debits) = cash outflow
            netCashFlow = creditTotal - debitTotal
          } else if (accountType === "Revenue") {
            // Revenue: increases (credits) = cash inflow
            netCashFlow = creditTotal - debitTotal
          } else if (accountType === "Expense" || accountType === "Expenses") {
            // Expenses: increases (debits) = cash outflow
            netCashFlow = debitTotal - creditTotal
          }
        }
        
        // Only include accounts with activity
        if (Math.abs(netCashFlow) > 0.01) { // Use small threshold to avoid rounding issues
          const cashFlowItem = {
            category: account.name,
            description: account.name,
            amount: Math.abs(netCashFlow),
            type: cashFlowCategory as 'operating' | 'investing' | 'financing',
            code: account.code // Add code for sorting
          }
          
          if (cashFlowCategory === 'investing') {
            investingActivities.push(cashFlowItem)
          } else if (cashFlowCategory === 'financing') {
            financingActivities.push(cashFlowItem)
          } else if (cashFlowCategory === 'operating') {
            operatingActivities.push(cashFlowItem)
          }
        }
      }
      
      // Sort by account code
      operatingActivities.sort((a, b) => (a.code || '').localeCompare(b.code || ''))
      investingActivities.sort((a, b) => (a.code || '').localeCompare(b.code || ''))
      financingActivities.sort((a, b) => (a.code || '').localeCompare(b.code || ''))
      
      // Calculate net cash flows (sum of all activities in each category)
      // Note: Amounts are stored as absolute values, but we need to consider direction
      // For operating: typically positive (inflows)
      // For investing: typically negative (outflows for purchases)
      // For financing: can be positive (borrowing) or negative (repayments)
      const netOperatingCashFlow = operatingActivities.reduce((sum, item) => sum + item.amount, 0)
      const netInvestingCashFlow = investingActivities.reduce((sum, item) => sum + item.amount, 0)
      const netFinancingCashFlow = financingActivities.reduce((sum, item) => sum + item.amount, 0)
      
      // Net cash change = operating (typically +) - investing (typically -) + financing (can be +/-)
      // Simplified: operating is positive, investing and financing are shown as positive but represent outflows
      const netCashChange = netOperatingCashFlow - netInvestingCashFlow - netFinancingCashFlow
      const cashAtEnd = cashAtBeginning + netCashChange
      
      return {
        operating_activities: operatingActivities,
        investing_activities: investingActivities,
        financing_activities: financingActivities,
        net_cash_flow: {
          operating: netOperatingCashFlow,
          investing: -netInvestingCashFlow, // Investing is typically negative (outflow)
          financing: -netFinancingCashFlow, // Financing can be positive or negative
          total: netCashChange
        },
        cash_at_beginning: cashAtBeginning,
        cash_at_end: cashAtEnd
      }
    } catch (error) {
      console.error("Error generating cash flow statement:", error)
      // Return empty data if there's an error
      return {
        operating_activities: [],
        investing_activities: [],
        financing_activities: [],
        net_cash_flow: {
          operating: 0,
          investing: 0,
          financing: 0,
          total: 0
        },
        cash_at_beginning: 0,
        cash_at_end: 0
      }
    }
  }

  // Helper method to get account balance at a specific date
  private static async getAccountBalance(accountId: string, asOfDate: string): Promise<number> {
    try {
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select(`
          account_types!inner(name, normal_balance)
        `)
        .eq("id", accountId)
        .single()

      if (accountError) throw accountError

      // Get opening balance
      const { data: openingBalance, error: openingError } = await supabase
        .from("opening_balances")
        .select("balance")
        .eq("account_id", accountId)
        .single()

      let openingBal = 0
      if (openingBalance && !openingError) {
        openingBal = openingBalance.balance || 0
      }

      // Get transaction totals up to the date
      const { data: transactions, error: transError } = await supabase
        .from("journal_entry_lines")
        .select(`
          debit_amount,
          credit_amount,
          journal_entries!inner(entry_date)
        `)
        .eq("account_id", accountId)
        .lte("journal_entries.entry_date", asOfDate)

      if (transError) throw transError

      let debitTotal = 0
      let creditTotal = 0

      for (const trans of transactions || []) {
        debitTotal += trans.debit_amount || 0
        creditTotal += trans.credit_amount || 0
      }

      // Calculate balance based on account type
      const accountType = account.account_types?.[0]
      const isDebitNormal = accountType?.normal_balance === "debit"
      
      if (isDebitNormal) {
        return openingBal + debitTotal - creditTotal
      } else {
        return openingBal + creditTotal - debitTotal
      }

    } catch (error) {
      console.error("Error getting account balance:", error)
      return 0
    }
  }

  // Get detailed account report with all transactions and balances
  static async getAccountDetailReport(
    accountId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AccountDetailReport> {
    try {
      console.log(`Loading account detail report for account ID: ${accountId}`)
      console.log(`Date range: ${startDate} to ${endDate}`)

      // Get account details
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select(`
          *,
          account_types(*)
        `)
        .eq("id", accountId)
        .single()

      if (accountError) {
        console.error("Error fetching account:", accountError)
        throw accountError
      }

      console.log("Account found:", account)

      // Get opening balance (you might want to implement this based on your business logic)
      const openingBalance = 0 // This should be calculated based on your opening balance logic

      // Determine if this account has debit normal balance
      const isDebitNormal = account.account_types?.normal_balance === "debit"

      console.log(`Account type: ${account.account_type}, Normal balance: ${account.account_types?.normal_balance}, Is debit normal: ${isDebitNormal}`)

      // Get all transactions for this account
      let query = supabase
        .from("journal_entry_lines")
        .select(`
          *,
          journal_entries!inner(
            entry_date,
            entry_number,
            description,
            reference
          )
        `)
        .eq("account_id", accountId)
        .order("created_at")

      if (startDate && endDate) {
        query = query
          .gte("journal_entries.entry_date", startDate)
          .lte("journal_entries.entry_date", endDate)
      }

      const { data: transactions, error: transactionsError } = await query

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError)
        throw transactionsError
      }

      console.log(`Found ${transactions?.length || 0} transactions for account ${account.code}`)

      // Calculate running balances and summary
      let runningBalance = openingBalance
      const processedTransactions = (transactions || []).map((transaction) => {
        const debitAmount = transaction.debit_amount || 0
        const creditAmount = transaction.credit_amount || 0
        
        // For asset/expense accounts, debits increase balance, credits decrease
        // For liability/equity/revenue accounts, credits increase balance, debits decrease
        if (isDebitNormal) {
          runningBalance += debitAmount - creditAmount
        } else {
          runningBalance += creditAmount - debitAmount
        }

        return {
          id: transaction.id,
          entry_date: transaction.journal_entries.entry_date,
          entry_number: transaction.journal_entries.entry_number,
          description: transaction.description || transaction.journal_entries.description,
          reference: transaction.journal_entries.reference,
          debit_amount: debitAmount,
          credit_amount: creditAmount,
          running_balance: runningBalance,
        }
      })

      const totalDebits = processedTransactions.reduce((sum, t) => sum + t.debit_amount, 0)
      const totalCredits = processedTransactions.reduce((sum, t) => sum + t.credit_amount, 0)
      const netChange = isDebitNormal ? totalDebits - totalCredits : totalCredits - totalDebits

      console.log(`Account ${account.code} summary: Debits: ${totalDebits}, Credits: ${totalCredits}, Net: ${netChange}, Balance: ${runningBalance}`)

      // Get sub-accounts if any
      const { data: subAccounts, error: subAccountsError } = await supabase
        .from("accounts")
        .select("*")
        .eq("parent_account_id", accountId)
        .eq("is_active", true)
        .order("code")

      if (subAccountsError) {
        console.warn("Error fetching sub-accounts:", subAccountsError)
      }

      console.log(`Found ${subAccounts?.length || 0} sub-accounts for account ${account.code}`)

      let subAccountReports: AccountDetailReport[] = []
      if (subAccounts && subAccounts.length > 0) {
        subAccountReports = await Promise.all(
          subAccounts.map(subAccount => this.getAccountDetailReport(subAccount.id, startDate, endDate))
        )
      }

      return {
        account,
        opening_balance: openingBalance,
        current_balance: runningBalance,
        transactions: processedTransactions,
        summary: {
          total_debits: totalDebits,
          total_credits: totalCredits,
          net_change: netChange,
          transaction_count: processedTransactions.length,
        },
        sub_accounts: subAccountReports.length > 0 ? subAccountReports : undefined,
      }
    } catch (error) {
      console.error("Error loading account detail report:", error)
      throw new Error(`Failed to load account detail report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get summary report for all accounts with balances
  static async getAccountSummaryReport(startDate?: string, endDate?: string): Promise<AccountSummaryReport[]> {
    try {
      // Get all active accounts
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select(`
          *,
          account_types(*)
        `)
        .eq("is_active", true)
        .order("code")

      if (accountsError) throw accountsError

      // Get summary data for each account
      const accountSummaries = await Promise.all(
        accounts.map(async (account) => {
          try {
            const detailReport = await this.getAccountDetailReport(account.id, startDate, endDate)
            
            // Check if account has sub-accounts
            const { data: subAccounts } = await supabase
              .from("accounts")
              .select("id")
              .eq("parent_account_id", account.id)
              .eq("is_active", true)

            return {
              account_id: account.id,
              account_code: account.code,
              account_name: account.name,
              account_type: account.account_types?.name || account.account_type,
              parent_account_id: account.parent_account_id,
              opening_balance: detailReport.opening_balance,
              current_balance: detailReport.current_balance,
              total_debits: detailReport.summary.total_debits,
              total_credits: detailReport.summary.total_credits,
              net_change: detailReport.summary.net_change,
              transaction_count: detailReport.summary.transaction_count,
              has_sub_accounts: (subAccounts?.length || 0) > 0,
            }
          } catch (error) {
            console.warn(`Failed to get summary for account ${account.code}:`, error)
            // Return basic account info if detailed report fails
            return {
              account_id: account.id,
              account_code: account.code,
              account_name: account.name,
              account_type: account.account_types?.name || account.account_type,
              parent_account_id: account.parent_account_id,
              opening_balance: 0,
              current_balance: 0,
              total_debits: 0,
              total_credits: 0,
              net_change: 0,
              transaction_count: 0,
              has_sub_accounts: false,
            }
          }
        })
      )

      return accountSummaries
    } catch (error) {
      console.error("Error loading account summary report:", error)
      throw new Error("Failed to load account summary report")
    }
  }

  // Get hierarchical account report with parent-child relationships and calculated parent totals
  static async getHierarchicalAccountReport(startDate?: string, endDate?: string): Promise<AccountSummaryReport[]> {
    try {
      const allAccounts = await this.getAccountSummaryReport(startDate, endDate)
      
      // Helper function to calculate total from account and all its descendants
      const calculateTotalBalance = (account: AccountSummaryReport): number => {
        const ownBalance = account.current_balance || 0
        const childrenBalance = account.sub_accounts?.reduce((sum, child) => sum + calculateTotalBalance(child), 0) || 0
        return ownBalance + childrenBalance
      }
      
      const calculateTotalOpeningBalance = (account: AccountSummaryReport): number => {
        const ownBalance = account.opening_balance || 0
        const childrenBalance = account.sub_accounts?.reduce((sum, child) => sum + calculateTotalOpeningBalance(child), 0) || 0
        return ownBalance + childrenBalance
      }
      
      const calculateTotalDebits = (account: AccountSummaryReport): number => {
        const ownDebits = account.total_debits || 0
        const childrenDebits = account.sub_accounts?.reduce((sum, child) => sum + calculateTotalDebits(child), 0) || 0
        return ownDebits + childrenDebits
      }
      
      const calculateTotalCredits = (account: AccountSummaryReport): number => {
        const ownCredits = account.total_credits || 0
        const childrenCredits = account.sub_accounts?.reduce((sum, child) => sum + calculateTotalCredits(child), 0) || 0
        return ownCredits + childrenCredits
      }
      
      const calculateTotalTransactions = (account: AccountSummaryReport): number => {
        const ownTransactions = account.transaction_count || 0
        const childrenTransactions = account.sub_accounts?.reduce((sum, child) => sum + calculateTotalTransactions(child), 0) || 0
        return ownTransactions + childrenTransactions
      }
      
      // Build hierarchical structure and calculate totals
      const buildHierarchy = (accounts: AccountSummaryReport[], parentId: string | null = null): AccountSummaryReport[] => {
        return accounts
          .filter(account => account.parent_account_id === parentId)
          .map(account => {
            // First, recursively build children
            const subAccounts = buildHierarchy(accounts, account.account_id)
            
            // Create account with sub-accounts
            const accountWithChildren: AccountSummaryReport = {
              ...account,
              sub_accounts: subAccounts.length > 0 ? subAccounts : undefined,
            }
            
            // If account has children, calculate totals including children
            if (subAccounts && subAccounts.length > 0) {
              const totalCurrentBalance = calculateTotalBalance(accountWithChildren)
              const totalOpeningBalance = calculateTotalOpeningBalance(accountWithChildren)
              const totalDebits = calculateTotalDebits(accountWithChildren)
              const totalCredits = calculateTotalCredits(accountWithChildren)
              const totalTransactions = calculateTotalTransactions(accountWithChildren)
              
              return {
                ...accountWithChildren,
                current_balance: totalCurrentBalance,
                opening_balance: totalOpeningBalance,
                total_debits: totalDebits,
                total_credits: totalCredits,
                net_change: totalCurrentBalance - totalOpeningBalance,
                transaction_count: totalTransactions,
              }
            }
            
            return accountWithChildren
          })
      }

      return buildHierarchy(allAccounts)
    } catch (error) {
      console.error("Error loading hierarchical account report:", error)
      throw new Error("Failed to load hierarchical account report")
    }
  }

  // Create sample journal entries for testing
  static async createSampleJournalEntries(): Promise<void> {
    try {
      console.log("Creating sample journal entries for testing...")

      // Get existing accounts
      const accounts = await this.getChartOfAccounts()
      if (accounts.length === 0) {
        console.warn("No accounts found. Please create accounts first.")
        return
      }

      // Find some key accounts for sample entries
      const cashAccount = accounts.find(a => a.name.toLowerCase().includes('cash'))
      const salesAccount = accounts.find(a => a.name.toLowerCase().includes('sales') || a.name.toLowerCase().includes('revenue'))
      const expenseAccount = accounts.find(a => a.name.toLowerCase().includes('expense') || a.name.toLowerCase().includes('cost'))
      const receivableAccount = accounts.find(a => a.name.toLowerCase().includes('receivable'))
      const payableAccount = accounts.find(a => a.name.toLowerCase().includes('payable'))

      if (!cashAccount || !salesAccount || !expenseAccount) {
        console.warn("Required accounts not found. Need at least Cash, Sales, and Expense accounts.")
        return
      }

      const sampleEntries = [
        {
          entry_date: new Date().toISOString().split('T')[0],
          description: "Sample Sales Transaction",
          reference: "SAMPLE-001",
          lines: [
            {
              account_id: cashAccount.id,
              description: "Cash received from customer",
              debit_amount: 1000,
              credit_amount: 0,
            },
            {
              account_id: salesAccount.id,
              description: "Sales revenue",
              debit_amount: 0,
              credit_amount: 1000,
            },
          ],
        },
        {
          entry_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
          description: "Sample Expense Transaction",
          reference: "SAMPLE-002",
          lines: [
            {
              account_id: expenseAccount.id,
              description: "Office supplies expense",
              debit_amount: 250,
              credit_amount: 0,
            },
            {
              account_id: cashAccount.id,
              description: "Cash paid for supplies",
              debit_amount: 0,
              credit_amount: 250,
            },
          ],
        },
        {
          entry_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days ago
          description: "Sample Credit Sale",
          reference: "SAMPLE-003",
          lines: receivableAccount ? [
            {
              account_id: receivableAccount.id,
              description: "Accounts receivable",
              debit_amount: 500,
              credit_amount: 0,
            },
            {
              account_id: salesAccount.id,
              description: "Credit sales revenue",
              debit_amount: 0,
              credit_amount: 500,
            },
          ] : [
            {
              account_id: cashAccount.id,
              description: "Cash received",
              debit_amount: 500,
              credit_amount: 0,
            },
            {
              account_id: salesAccount.id,
              description: "Sales revenue",
              debit_amount: 0,
              credit_amount: 500,
            },
          ],
        },
      ]

      // Create each sample entry
      for (const entry of sampleEntries) {
        try {
          await this.createJournalEntry(entry)
          console.log(`Created sample entry: ${entry.description}`)
        } catch (error) {
          console.warn(`Failed to create sample entry ${entry.description}:`, error)
        }
      }

      console.log("Sample journal entries created successfully!")
    } catch (error) {
      console.error("Error creating sample journal entries:", error)
      throw new Error("Failed to create sample journal entries")
    }
  }

  // Check if database has any journal entries
  static async hasJournalEntries(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id")
        .limit(1)

      if (error) {
        console.error("Error checking for journal entries:", error)
        return false
      }

      return (data?.length || 0) > 0
    } catch (error) {
      console.error("Error checking for journal entries:", error)
      return false
    }
  }

  // Get all account balances with hierarchical totals
  static async getAllAccountBalances(asOfDate?: string): Promise<Map<string, { ownBalance: number; totalBalance: number }>> {
    try {
      const currentDate = asOfDate || new Date().toISOString().split('T')[0]
      
      // Get all accounts with their type info
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select(`
          id,
          parent_account_id,
          account_types(name, normal_balance)
        `)
        .eq("is_active", true)

      if (accountsError) throw accountsError

      // Get all journal entry lines with their dates
      // First get journal entry IDs within date range
      const { data: journalEntryIds, error: jeError } = await supabase
        .from("journal_entries")
        .select("id")
        .lte("entry_date", currentDate)

      if (jeError) {
        console.error("Error fetching journal entries for balance calculation:", jeError)
        throw jeError
      }

      const entryIds = journalEntryIds?.map(je => je.id) || []
      
      // Then get journal entry lines for those entries
      const { data: allTransactions, error: transError } = entryIds.length > 0
        ? await supabase
            .from("journal_entry_lines")
            .select(`
              account_id,
              debit_amount,
              credit_amount
            `)
            .in("journal_entry_id", entryIds)
        : { data: [], error: null }

      if (transError) {
        console.error("Error fetching journal entry lines for balance calculation:", transError)
        throw transError
      }

      // Get all opening balances
      const { data: openingBalances, error: openingError } = await supabase
        .from("opening_balances")
        .select("account_id, balance")

      if (openingError) console.warn("Could not fetch opening balances:", openingError)

      // Create a map of account_id -> opening balance
      const openingBalanceMap = new Map<string, number>()
      for (const ob of openingBalances || []) {
        openingBalanceMap.set(ob.account_id, ob.balance || 0)
      }

      // Create a map of account_id -> account info
      const accountInfoMap = new Map<string, { parentId: string | null; normalBalance: string }>()
      for (const account of accounts || []) {
        const accountType = Array.isArray(account.account_types) 
          ? account.account_types[0] 
          : account.account_types
        accountInfoMap.set(account.id, {
          parentId: account.parent_account_id,
          normalBalance: accountType?.normal_balance || 'debit'
        })
      }

      // Calculate own balance for each account
      const ownBalanceMap = new Map<string, number>()
      
      // Group transactions by account
      const transactionsByAccount = new Map<string, { debits: number; credits: number }>()
      for (const trans of allTransactions || []) {
        const current = transactionsByAccount.get(trans.account_id) || { debits: 0, credits: 0 }
        current.debits += trans.debit_amount || 0
        current.credits += trans.credit_amount || 0
        transactionsByAccount.set(trans.account_id, current)
      }

      // Calculate own balance for each account
      for (const account of accounts || []) {
        const info = accountInfoMap.get(account.id)
        const transactions = transactionsByAccount.get(account.id) || { debits: 0, credits: 0 }
        const openingBal = openingBalanceMap.get(account.id) || 0
        
        let balance: number
        if (info?.normalBalance === 'debit') {
          balance = openingBal + transactions.debits - transactions.credits
        } else {
          balance = openingBal + transactions.credits - transactions.debits
        }
        
        ownBalanceMap.set(account.id, balance)
      }

      // Build parent-child relationships
      const childrenMap = new Map<string, string[]>()
      for (const account of accounts || []) {
        if (account.parent_account_id) {
          const children = childrenMap.get(account.parent_account_id) || []
          children.push(account.id)
          childrenMap.set(account.parent_account_id, children)
        }
      }

      // Calculate total balance (own + all descendants) recursively
      const totalBalanceMap = new Map<string, number>()
      
      const calculateTotalBalance = (accountId: string): number => {
        if (totalBalanceMap.has(accountId)) {
          return totalBalanceMap.get(accountId)!
        }
        
        const ownBalance = ownBalanceMap.get(accountId) || 0
        const children = childrenMap.get(accountId) || []
        
        let childrenTotal = 0
        for (const childId of children) {
          childrenTotal += calculateTotalBalance(childId)
        }
        
        const totalBalance = ownBalance + childrenTotal
        totalBalanceMap.set(accountId, totalBalance)
        return totalBalance
      }

      // Calculate total balance for all accounts
      for (const account of accounts || []) {
        calculateTotalBalance(account.id)
      }

      // Build result map
      const result = new Map<string, { ownBalance: number; totalBalance: number }>()
      for (const account of accounts || []) {
        result.set(account.id, {
          ownBalance: ownBalanceMap.get(account.id) || 0,
          totalBalance: totalBalanceMap.get(account.id) || 0
        })
      }

      return result
    } catch (error) {
      console.error("Error getting all account balances:", error)
      return new Map()
    }
  }

  // Project Management Functions
  static async getProjects(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true })

      if (error) {
        console.error("Error fetching projects:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error loading projects:", error)
      return []
    }
  }

  static async createProject(project: {
    name: string
    description?: string
  }): Promise<any> {
    try {
      const trimmedName = project.name.trim()
      
      // Check if a project with this name already exists
      const { data: existing, error: checkError } = await supabase
        .from("projects")
        .select("id, name")
        .eq("name", trimmedName)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking for existing project:", checkError)
        throw new Error(`Failed to check for existing project: ${checkError.message}`)
      }

      if (existing) {
        throw new Error(`A project with the name "${trimmedName}" already exists. Please choose a different name.`)
      }

      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            name: trimmedName,
            description: project.description?.trim() || null,
            is_active: true,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("Error creating project:", error)
        // Provide more specific error messages
        if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
          throw new Error(`A project with the name "${trimmedName}" already exists. Please choose a different name.`)
        }
        throw new Error(`Failed to create project: ${error.message || 'Unknown error'}`)
      }

      return data
    } catch (error) {
      console.error("Error creating project:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to create project")
    }
  }

  static async updateProject(id: string, project: {
    name: string
    description?: string
    is_active?: boolean
  }): Promise<any> {
    try {
      const trimmedName = project.name.trim()
      
      // Check if another project with this name already exists (excluding current project)
      const { data: existing, error: checkError } = await supabase
        .from("projects")
        .select("id, name")
        .eq("name", trimmedName)
        .neq("id", id)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking for existing project:", checkError)
        throw new Error(`Failed to check for existing project: ${checkError.message}`)
      }

      if (existing) {
        throw new Error(`A project with the name "${trimmedName}" already exists. Please choose a different name.`)
      }

      const { data, error } = await supabase
        .from("projects")
        .update({
          name: trimmedName,
          description: project.description?.trim() || null,
          is_active: project.is_active !== undefined ? project.is_active : true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating project:", error)
        // Provide more specific error messages
        if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
          throw new Error(`A project with the name "${trimmedName}" already exists. Please choose a different name.`)
        }
        throw new Error(`Failed to update project: ${error.message || 'Unknown error'}`)
      }

      return data
    } catch (error) {
      console.error("Error updating project:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to update project")
    }
  }

  static async deleteProject(id: string): Promise<void> {
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from("projects")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("Error deleting project:", error)
        throw error
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      throw new Error("Failed to delete project")
    }
  }

  // Purchase Order Functions
  static async getPurchaseOrders(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          created_by_user:created_by(id, name, email),
          approved_by_1_user:approved_by_1(id, name, email),
          approved_by_2_user:approved_by_2(id, name, email),
          rejected_by_user:rejected_by(id, name, email)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching purchase orders:", error)
        throw error
      }

      // Fix status for orders where both approvals exist but status is not 'approved'
      // Update status in memory first, then try to persist
      const fixedData = (data || []).map((po: any) => {
        if (po.approved_by_1 && po.approved_by_2 && po.status !== 'approved' && po.status !== 'rejected') {
          return { ...po, status: 'approved' }
        }
        return po
      })

      // Try to update in database (silently fail if there's an issue)
      const ordersToFix = fixedData.filter((po: any, index: number) => 
        (data || [])[index] && po.approved_by_1 && po.approved_by_2 && (data || [])[index].status !== 'approved' && (data || [])[index].status !== 'rejected'
      )

      if (ordersToFix.length > 0) {
        // Update status to 'approved' for orders with both approvals (one at a time to avoid constraint issues)
        try {
          for (const po of ordersToFix) {
            try {
              const { error: updateError } = await supabase
                .from("purchase_orders")
                .update({ status: 'approved', updated_at: new Date().toISOString() })
                .eq("id", po.id)

              if (updateError) {
                // Log but don't throw - we'll use the in-memory fix
                console.warn(`Could not update purchase order ${po.id} status in database:`, updateError.message || updateError.code || 'Unknown error')
              }
            } catch (err) {
              // Silently continue - we'll use the in-memory fix
              console.warn(`Error updating purchase order ${po.id}:`, err)
            }
          }
        } catch (fixError) {
          // Silently continue - we'll use the in-memory fix
          console.warn("Error in status fix process:", fixError)
        }
      }

      // Return the fixed data (with corrected statuses in memory)
      return fixedData

      return data || []
    } catch (error) {
      console.error("Error fetching purchase orders:", error)
      throw new Error("Failed to fetch purchase orders")
    }
  }

  static async getPurchaseOrder(id: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          created_by_user:created_by(id, name, email),
          approved_by_1_user:approved_by_1(id, name, email),
          approved_by_2_user:approved_by_2(id, name, email),
          rejected_by_user:rejected_by(id, name, email)
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching purchase order:", error)
        throw error
      }

      // Fix status if both approvals exist but status is not 'approved'
      if (data && data.approved_by_1 && data.approved_by_2 && data.status !== 'approved' && data.status !== 'rejected') {
        const { data: updatedData, error: updateError } = await supabase
          .from("purchase_orders")
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq("id", id)
          .select(`
            *,
            created_by_user:created_by(id, name, email),
            approved_by_1_user:approved_by_1(id, name, email),
            approved_by_2_user:approved_by_2(id, name, email),
            rejected_by_user:rejected_by(id, name, email)
          `)
          .single()

        if (!updateError && updatedData) {
          return updatedData
        }
      }

      return data
    } catch (error) {
      console.error("Error fetching purchase order:", error)
      throw new Error("Failed to fetch purchase order")
    }
  }

  static async generatePONumber(): Promise<string> {
    try {
      // Get the latest PO number
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("po_number")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Error generating PO number:", error)
        throw error
      }

      let nextNumber = 1
      if (data?.po_number) {
        // Extract number from PO-XXX format
        const match = data.po_number.match(/PO-(\d+)/)
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1
        }
      }

      return `PO-${String(nextNumber).padStart(4, '0')}`
    } catch (error) {
      console.error("Error generating PO number:", error)
      // Fallback to timestamp-based number
      return `PO-${Date.now().toString().slice(-6)}`
    }
  }

  static async createPurchaseOrder(po: {
    amount: number
    description?: string
    image_data?: string
  }): Promise<any> {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      // Generate unique PO number
      const poNumber = await this.generatePONumber()

      // Round amount to 2 decimal places
      const roundedAmount = Math.round(po.amount * 100) / 100

      const { data, error } = await supabase
        .from("purchase_orders")
        .insert([
          {
            po_number: poNumber,
            amount: roundedAmount,
            description: po.description?.trim() || null,
            image_data: po.image_data || null,
            status: 'pending',
            created_by: currentUser.id,
          },
        ])
        .select(`
          *,
          created_by_user:created_by(id, name, email),
          approved_by_1_user:approved_by_1(id, name, email),
          approved_by_2_user:approved_by_2(id, name, email),
          rejected_by_user:rejected_by(id, name, email)
        `)
        .single()

      if (error) {
        console.error("Error creating purchase order:", error)
        if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
          // Retry with a different PO number if duplicate
          const retryPONumber = await this.generatePONumber()
          const { data: retryData, error: retryError } = await supabase
            .from("purchase_orders")
            .insert([
              {
                po_number: retryPONumber,
                amount: roundedAmount,
                description: po.description?.trim() || null,
                image_data: po.image_data || null,
                status: 'pending',
                created_by: currentUser.id,
              },
            ])
            .select(`
              *,
              created_by_user:users!purchase_orders_created_by_fkey(id, name, email)
            `)
            .single()

          if (retryError) {
            throw new Error(`Failed to create purchase order: ${retryError.message || 'Unknown error'}`)
          }
          return retryData
        }
        throw new Error(`Failed to create purchase order: ${error.message || 'Unknown error'}`)
      }

      return data
    } catch (error) {
      console.error("Error creating purchase order:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to create purchase order")
    }
  }

  static async updatePurchaseOrder(id: string, po: {
    amount?: number
    description?: string
    image_data?: string
  }): Promise<any> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      if (po.amount !== undefined) {
        updateData.amount = Math.round(po.amount * 100) / 100
      }
      if (po.description !== undefined) {
        updateData.description = po.description.trim() || null
      }
      if (po.image_data !== undefined) {
        updateData.image_data = po.image_data || null
      }

      const { data, error } = await supabase
        .from("purchase_orders")
        .update(updateData)
        .eq("id", id)
        .select(`
          *,
          created_by_user:created_by(id, name, email),
          approved_by_1_user:approved_by_1(id, name, email),
          approved_by_2_user:approved_by_2(id, name, email),
          rejected_by_user:rejected_by(id, name, email)
        `)
        .single()

      if (error) {
        console.error("Error updating purchase order:", error)
        throw new Error(`Failed to update purchase order: ${error.message || 'Unknown error'}`)
      }

      return data
    } catch (error) {
      console.error("Error updating purchase order:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to update purchase order")
    }
  }

  static async approvePurchaseOrder(id: string, approvalType: 'admin' | 'accountant'): Promise<any> {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      // Check if user has permission to approve (admin or accountant)
      if (currentUser.role !== 'admin' && currentUser.role !== 'accountant') {
        throw new Error("You don't have permission to approve purchase orders")
      }

      // Verify role matches approval type
      if (approvalType === 'admin' && currentUser.role !== 'admin') {
        throw new Error("Only admin can perform admin approval")
      }
      if (approvalType === 'accountant' && currentUser.role !== 'accountant') {
        throw new Error("Only accountant can perform accountant approval")
      }

      // Get current purchase order to check status
      const { data: currentPO, error: fetchError } = await supabase
        .from("purchase_orders")
        .select("status, approved_by_1, approved_by_2")
        .eq("id", id)
        .single()

      if (fetchError) {
        throw new Error(`Failed to fetch purchase order: ${fetchError.message}`)
      }

      if (!currentPO) {
        throw new Error("Purchase order not found")
      }

      // Check if already rejected
      if (currentPO.status === 'rejected') {
        throw new Error("Cannot approve a rejected purchase order")
      }

      // Check if user already approved
      if (currentPO.approved_by_1 === currentUser.id || currentPO.approved_by_2 === currentUser.id) {
        throw new Error("You have already approved this purchase order")
      }

      let updateData: any = {
        updated_at: new Date().toISOString(),
      }

      // Admin does first approval, Accountant does second approval
      if (approvalType === 'admin') {
        // Admin approval (first approval)
        if (currentPO.status === 'pending' && !currentPO.approved_by_1) {
          updateData.status = 'first_approved'
          updateData.approved_by_1 = currentUser.id
          updateData.approved_at_1 = new Date().toISOString()
        } else {
          throw new Error("Admin approval can only be done on pending orders")
        }
      } else if (approvalType === 'accountant') {
        // Accountant approval (second approval) - sets status to 'approved'
        if (currentPO.status === 'first_approved' && currentPO.approved_by_1 && !currentPO.approved_by_2) {
          updateData.status = 'approved'
          updateData.approved_by_2 = currentUser.id
          updateData.approved_at_2 = new Date().toISOString()
        } else if (currentPO.status === 'pending' && currentPO.approved_by_1 && !currentPO.approved_by_2) {
          // Handle case where status wasn't updated to 'first_approved' but admin already approved
          updateData.status = 'approved'
          updateData.approved_by_2 = currentUser.id
          updateData.approved_at_2 = new Date().toISOString()
        } else {
          throw new Error("Accountant approval can only be done after admin approval")
        }
      }

      const { data, error } = await supabase
        .from("purchase_orders")
        .update(updateData)
        .eq("id", id)
        .select(`
          *,
          created_by_user:created_by(id, name, email),
          approved_by_1_user:approved_by_1(id, name, email),
          approved_by_2_user:approved_by_2(id, name, email),
          rejected_by_user:rejected_by(id, name, email)
        `)
        .single()

      if (error) {
        console.error("Error approving purchase order:", error)
        throw new Error(`Failed to approve purchase order: ${error.message || 'Unknown error'}`)
      }

      return data
    } catch (error) {
      console.error("Error approving purchase order:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to approve purchase order")
    }
  }

  static async rejectPurchaseOrder(id: string, rejectionReason: string): Promise<any> {
    try {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      // Check if user has permission to reject (admin or accountant)
      if (currentUser.role !== 'admin' && currentUser.role !== 'accountant') {
        throw new Error("You don't have permission to reject purchase orders")
      }

      // Validate rejection reason
      if (!rejectionReason || rejectionReason.trim().length === 0) {
        throw new Error("Rejection reason is required")
      }

      // Get current purchase order to check status
      const { data: currentPO } = await supabase
        .from("purchase_orders")
        .select("status")
        .eq("id", id)
        .single()

      if (currentPO?.status === 'approved') {
        throw new Error("Cannot reject an approved purchase order")
      }

      // Try to update with rejection_reason, fallback if column doesn't exist
      let updateData: any = {
        status: 'rejected',
        rejected_by: currentUser.id,
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Try to include rejection_reason if column exists
      try {
        updateData.rejection_reason = rejectionReason.trim()
      } catch (e) {
        // Column might not exist yet
        console.warn("rejection_reason column may not exist, attempting update without it")
      }

      const { data, error } = await supabase
        .from("purchase_orders")
        .update(updateData)
        .eq("id", id)
        .select(`
          *,
          created_by_user:created_by(id, name, email),
          approved_by_1_user:approved_by_1(id, name, email),
          approved_by_2_user:approved_by_2(id, name, email),
          rejected_by_user:rejected_by(id, name, email)
        `)
        .single()

      if (error) {
        console.error("Error rejecting purchase order:", error)
        // If error is about missing column, provide helpful message
        if (error.message?.includes('rejection_reason') || error.message?.includes('schema cache')) {
          throw new Error(`Database column 'rejection_reason' not found. Please run the migration script: scripts/23-add-rejection-reason-to-purchase-orders.sql`)
        }
        throw new Error(`Failed to reject purchase order: ${error.message || 'Unknown error'}`)
      }

      return data
    } catch (error) {
      console.error("Error rejecting purchase order:", error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to reject purchase order")
    }
  }

  static async deletePurchaseOrder(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("purchase_orders")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Error deleting purchase order:", error)
        throw error
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error)
      throw new Error("Failed to delete purchase order")
    }
  }
}