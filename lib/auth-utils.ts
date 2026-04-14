// Authentication and Permission Utilities

export type UserRole = "admin" | "accountant" | "user"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  pin?: string
  created_at?: string
  updated_at?: string
}

// ============================================
// Session Management
// ============================================

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("current_user")
  if (!userStr) return null

  try {
    const parsed = JSON.parse(userStr)
    if (!parsed || !parsed.id || !parsed.email || !parsed.role) {
      localStorage.removeItem("current_user")
      return null
    }
    if (!["admin", "accountant", "user"].includes(parsed.role)) {
      localStorage.removeItem("current_user")
      return null
    }
    return parsed as User
  } catch {
    localStorage.removeItem("current_user")
    return null
  }
}

export const setCurrentUser = (user: User | null): void => {
  if (typeof window === "undefined") return

  if (user) {
    const safeUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
    localStorage.setItem("current_user", JSON.stringify(safeUser))
  } else {
    localStorage.removeItem("current_user")
  }
}

// ============================================
// Permission Checks
// ============================================

export const canEditAccountingData = (user: User | null): boolean => {
  if (!user) return false
  return user.role === "accountant"
}

export const canEdit = (user: User | null): boolean => {
  return canEditAccountingData(user)
}

export const canEditUsers = (user: User | null): boolean => {
  if (!user) return false
  return user.role === "admin"
}

export const canViewAccountingData = (user: User | null): boolean => {
  if (!user) return false
  return user.role === "admin" || user.role === "accountant" || user.role === "user"
}

export const canViewPurchaseOrders = (user: User | null): boolean => {
  return user !== null
}

export const canCreatePurchaseOrders = (user: User | null): boolean => {
  return user !== null
}

export const canApprovePurchaseOrders = (user: User | null): boolean => {
  if (!user) return false
  return user.role === "admin" || user.role === "accountant"
}

export const canView = (user: User | null): boolean => {
  return user !== null
}

export const isAdmin = (user: User | null): boolean => {
  if (!user) return false
  return user.role === "admin"
}

export const isAccountant = (user: User | null): boolean => {
  if (!user) return false
  return user.role === "accountant"
}

export const isRegularUser = (user: User | null): boolean => {
  if (!user) return false
  return user.role === "user"
}

export const canDelete = (user: User | null): boolean => {
  return canEditAccountingData(user)
}

export const getUserDisplayName = (user: User | null): string => {
  if (!user) return "Unknown User"
  return user.name || user.email || "Unknown User"
}

// ============================================
// Login / Logout with rate limiting
// ============================================

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 10
const LOCKOUT_MS = 60_000

export const login = async (email: string, pin: string): Promise<User | null> => {
  if (typeof window === "undefined") return null

  const normalizedEmail = email.toLowerCase().trim()

  // Rate limiting
  const attempts = loginAttempts.get(normalizedEmail)
  if (attempts) {
    const timeSince = Date.now() - attempts.lastAttempt
    if (attempts.count >= MAX_ATTEMPTS && timeSince < LOCKOUT_MS) {
      console.warn("Too many login attempts. Please wait.")
      return null
    }
    if (timeSince >= LOCKOUT_MS) {
      loginAttempts.delete(normalizedEmail)
    }
  }

  try {
    const { supabase } = await import("@/lib/supabase")
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("pin", pin.trim())
      .single()

    if (error || !data) {
      const current = loginAttempts.get(normalizedEmail) || { count: 0, lastAttempt: 0 }
      loginAttempts.set(normalizedEmail, { count: current.count + 1, lastAttempt: Date.now() })
      return null
    }

    loginAttempts.delete(normalizedEmail)

    const user: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }

    setCurrentUser(user)
    return user
  } catch (error) {
    console.error("Login error:", error)
    return null
  }
}

export const logout = (): void => {
  setCurrentUser(null)
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}
