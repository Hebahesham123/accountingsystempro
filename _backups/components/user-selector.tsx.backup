"use client"

import { useState, useEffect } from "react"
import { User as UserIcon, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getCurrentUser, setCurrentUser, type User as UserType, getUserDisplayName, isAdmin } from "@/lib/auth-utils"

export default function UserSelector() {
  const [currentUser, setCurrentUserState] = useState<UserType | null>(null)
  const [users, setUsers] = useState<UserType[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    // Load current user from localStorage
    const user = getCurrentUser()
    setCurrentUserState(user)
    
    // Load all users for selection
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("name", { ascending: true })

      if (error) throw error
      setUsers(data || [])
      
      // If no user is selected and we have users, open dialog
      if (!getCurrentUser() && data && data.length > 0) {
        setIsDialogOpen(true)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const handleUserSelect = () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      })
      return
    }

    const selectedUser = users.find(u => u.id === selectedUserId)
    if (selectedUser) {
      setCurrentUser(selectedUser)
      setCurrentUserState(selectedUser)
      setIsDialogOpen(false)
      toast({
        title: "Success",
        description: `Logged in as ${selectedUser.name}`,
      })
    }
  }

  const handleLogout = () => {
    const { logout } = require('@/lib/auth-utils')
    logout()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "accountant":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {currentUser ? (
          <>
            <Badge className={getRoleBadgeColor(currentUser.role)}>
              <UserIcon className="h-3 w-3 mr-1" />
              {getUserDisplayName(currentUser)}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogIn className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
            <LogIn className="h-4 w-4 mr-2" />
            Select User
          </Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select User</DialogTitle>
            <DialogDescription>
              Choose a user to continue. Your permissions will be based on your role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        <Badge className={getRoleBadgeColor(user.role)} variant="outline">
                          {user.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedUserId && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Role:</strong> {users.find(u => u.id === selectedUserId)?.role}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {users.find(u => u.id === selectedUserId)?.role === "admin" && "Can view and edit everything"}
                  {users.find(u => u.id === selectedUserId)?.role === "accountant" && "Can view and edit accounting data"}
                  {users.find(u => u.id === selectedUserId)?.role === "user" && "Can only view data, cannot edit"}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUserSelect} disabled={!selectedUserId}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

