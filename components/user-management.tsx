"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, User as UserIcon, Shield, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { type User as UserType, type UserRole } from "@/lib/auth-utils"
import { useLanguage } from "@/lib/language-context"

export default function UserManagement() {
  const { language, t } = useLanguage()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const { toast } = useToast()

  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    role: "user" as UserRole,
    pin: "",
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setUserFormData({
      name: "",
      email: "",
      role: "user",
      pin: "",
    })
    setEditingUser(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userFormData.name.trim() || !userFormData.email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    if (!userFormData.pin.trim() || userFormData.pin.length < 4) {
      toast({
        title: "Error",
        description: "PIN is required and must be at least 4 characters",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      if (editingUser) {
        // Update existing user
        const updateData: any = {
          name: userFormData.name.trim(),
          email: userFormData.email.trim(),
          role: userFormData.role,
          updated_at: new Date().toISOString(),
        }
        
        // Only update PIN if it was changed
        if (userFormData.pin.trim()) {
          updateData.pin = userFormData.pin.trim()
        }
        
        const { error } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", editingUser.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "User updated successfully",
        })
      } else {
        // Create new user
        const { error } = await supabase
          .from("users")
          .insert({
            name: userFormData.name.trim(),
            email: userFormData.email.trim(),
            role: userFormData.role,
            pin: userFormData.pin.trim(),
          })

        if (error) throw error

        toast({
          title: "Success",
          description: "User created successfully",
        })
      }

      resetForm()
      setIsDialogOpen(false)
      loadUsers()
    } catch (error: any) {
      console.error("Error saving user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: UserType) => {
    try {
      setSaving(true)
      const { error } = await supabase.from("users").delete().eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      loadUsers()
    } catch (error: any) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (user: UserType) => {
    setEditingUser(user)
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      pin: "", // Don't show existing PIN for security
    })
    setIsDialogOpen(true)
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "accountant":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "accountant":
        return <UserCheck className="h-4 w-4" />
      default:
        return <UserIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                {t("user.title")}
              </CardTitle>
              <CardDescription>{t("user.managePermissions")}</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("user.new")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingUser ? t("user.edit") : t("user.create")}</DialogTitle>
                    <DialogDescription>
                      {editingUser ? t("user.updatePermissions") : t("user.createAccount")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("common.name")}</Label>
                      <Input
                        id="name"
                        value={userFormData.name}
                        onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                        placeholder={t("user.userName")}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("common.email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">{t("common.role")}</Label>
                      <Select
                        value={userFormData.role}
                        onValueChange={(value) => setUserFormData({ ...userFormData, role: value as UserRole })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">{t("user.adminFullAccess")}</SelectItem>
                          <SelectItem value="accountant">{t("user.accountantViewEdit")}</SelectItem>
                          <SelectItem value="user">{t("user.userViewOnly")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {userFormData.role === "admin" && t("user.canViewEditEverything")}
                        {userFormData.role === "accountant" && t("user.canViewEditAccounting")}
                        {userFormData.role === "user" && t("user.canOnlyView")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pin">{t("user.pin")} {editingUser && t("user.leaveBlank")}</Label>
                      <Input
                        id="pin"
                        type="password"
                        value={userFormData.pin}
                        onChange={(e) => setUserFormData({ ...userFormData, pin: e.target.value })}
                        placeholder={t("user.enterPin")}
                        maxLength={10}
                        required={!editingUser}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("user.pinMinLength")}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}>
                      {t("general.cancel")}
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? t("general.saving") : editingUser ? t("general.update") : t("general.create")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>{t("user.loading")}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("user.noUsers")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("common.email")}</TableHead>
                  <TableHead>{t("common.role")}</TableHead>
                  <TableHead>{t("common.createdAt")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        <span className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(user)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

