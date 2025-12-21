// Authentication and Permission Utilities

export type UserRole = 'admin' | 'accountant' | 'user'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  pin?: string
  created_at?: string
  updated_at?: string
}

// Get current user from localStorage (simple implementation)
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('current_user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

// Set current user
export const setCurrentUser = (user: User | null): void => {
  if (typeof window === 'undefined') return
  
  if (user) {
    localStorage.setItem('current_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('current_user')
  }
}

// Check if user has permission to edit accounting data (admin and accountant)
export const canEdit = (user: User | null): boolean => {
  if (!user) return false
  return user.role === 'admin' || user.role === 'accountant'
}

// Check if user can edit users (admin only)
export const canEditUsers = (user: User | null): boolean => {
  if (!user) return false
  return user.role === 'admin'
}

// Check if user has permission to view
export const canView = (user: User | null): boolean => {
  return user !== null
}

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false
  return user.role === 'admin'
}

// Check if user can delete
export const canDelete = (user: User | null): boolean => {
  return canEdit(user)
}

// Get user display name
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'Unknown User'
  return user.name || user.email || 'Unknown User'
}

// Login with email and PIN
export const login = async (email: string, pin: string): Promise<User | null> => {
  if (typeof window === 'undefined') return null
  
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('pin', pin)
      .single()
    
    if (error || !data) {
      return null
    }
    
    // Don't store PIN in localStorage
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
    console.error('Login error:', error)
    return null
  }
}

// Logout
export const logout = (): void => {
  setCurrentUser(null)
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}

