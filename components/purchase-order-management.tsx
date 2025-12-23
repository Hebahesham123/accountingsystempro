"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Upload, Image as ImageIcon, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { AccountingService } from "@/lib/accounting-utils"
import { getCurrentUser, canEditAccountingData, isAdmin, canApprovePurchaseOrders, canCreatePurchaseOrders } from "@/lib/auth-utils"
import { formatCurrency } from "@/lib/export-utils"
import { useLanguage } from "@/lib/language-context"

interface PurchaseOrder {
  id: string
  po_number: string
  amount: number
  description?: string
  image_data?: string
  status: 'pending' | 'first_approved' | 'approved' | 'rejected'
  approved_by_1?: string
  approved_at_1?: string
  approved_by_2?: string
  approved_at_2?: string
  rejected_by?: string
  rejected_at?: string
  rejection_reason?: string
  created_by?: string
  created_at: string
  created_by_user?: { name: string; email: string }
  approved_by_1_user?: { name: string; email: string }
  approved_by_2_user?: { name: string; email: string }
  rejected_by_user?: { name: string; email: string }
}

export default function PurchaseOrderManagement() {
  const currentUser = getCurrentUser()
  const { language, t } = useLanguage()
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectingPOId, setRejectingPOId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null)
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    image_data: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadPurchaseOrders()
  }, [])

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true)
      const data = await AccountingService.getPurchaseOrders()
      setPurchaseOrders(data || [])
    } catch (error) {
      console.error("Error loading purchase orders:", error)
      toast({
        title: "Error",
        description: "Failed to load purchase orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setFormData((prev) => ({ ...prev, image_data: result }))
      setImagePreview(result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image_data: "" }))
    setImagePreview(null)
  }

  const resetForm = () => {
    setFormData({ amount: "", description: "", image_data: "" })
    setEditingPO(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: language === "ar" ? "معلومات مفقودة" : "Missing Information",
        description: language === "ar" ? "المبلغ مطلوب ويجب أن يكون أكبر من 0" : "Amount is required and must be greater than 0",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      if (editingPO) {
        await AccountingService.updatePurchaseOrder(editingPO.id, {
          amount: parseFloat(formData.amount),
          description: formData.description.trim() || undefined,
          image_data: formData.image_data || undefined,
        })
        toast({
          title: t("general.success"),
          description: language === "ar" ? "تم تحديث أمر الشراء بنجاح" : "Purchase order updated successfully",
        })
      } else {
        await AccountingService.createPurchaseOrder({
          amount: parseFloat(formData.amount),
          description: formData.description.trim() || undefined,
          image_data: formData.image_data || undefined,
        })
        toast({
          title: t("general.success"),
          description: language === "ar" ? "تم إنشاء أمر الشراء بنجاح" : "Purchase order created successfully",
        })
      }
      setIsDialogOpen(false)
      resetForm()
      loadPurchaseOrders()
    } catch (error) {
      console.error("Error saving purchase order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save purchase order",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditClick = (po: PurchaseOrder) => {
    // Only allow editing if status is pending
    if (po.status !== 'pending') {
      toast({
        title: "Cannot Edit",
        description: "Only pending purchase orders can be edited",
        variant: "destructive",
      })
      return
    }
    setEditingPO(po)
    setFormData({
      amount: po.amount.toString(),
      description: po.description || "",
      image_data: po.image_data || "",
    })
    setImagePreview(po.image_data || null)
    setIsDialogOpen(true)
  }

  const handleViewClick = (po: PurchaseOrder) => {
    setViewingPO(po)
    setImagePreview(po.image_data || null)
    setIsViewDialogOpen(true)
  }

  const handleApprove = async (id: string, approvalType: 'admin' | 'accountant') => {
    const roleName = approvalType === 'admin' ? 'Admin' : 'Accountant'
    if (!confirm(`Are you sure you want to approve this purchase order as ${roleName}?`)) {
      return
    }
    try {
      await AccountingService.approvePurchaseOrder(id, approvalType)
      toast({
        title: "Success",
        description: `Purchase order approved by ${roleName} successfully`,
      })
      loadPurchaseOrders()
    } catch (error) {
      console.error("Error approving purchase order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve purchase order",
        variant: "destructive",
      })
    }
  }

  const handleRejectClick = (id: string) => {
    setRejectingPOId(id)
    setRejectionReason("")
    setIsRejectDialogOpen(true)
  }

  const handleReject = async () => {
    if (!rejectingPOId) return
    
    if (!rejectionReason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }

    try {
      await AccountingService.rejectPurchaseOrder(rejectingPOId, rejectionReason)
      toast({
        title: "Success",
        description: "Purchase order rejected successfully",
      })
      setIsRejectDialogOpen(false)
      setRejectingPOId(null)
      setRejectionReason("")
      loadPurchaseOrders()
    } catch (error) {
      console.error("Error rejecting purchase order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject purchase order",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    const confirmMessage = language === "ar" 
      ? "هل أنت متأكد أنك تريد حذف أمر الشراء هذا؟"
      : "Are you sure you want to delete this purchase order?"
    if (!confirm(confirmMessage)) {
      return
    }
    try {
      await AccountingService.deletePurchaseOrder(id)
      toast({
        title: t("general.success"),
        description: language === "ar" ? "تم حذف أمر الشراء بنجاح" : "Purchase order deleted successfully",
      })
      loadPurchaseOrders()
    } catch (error) {
      console.error("Error deleting purchase order:", error)
      toast({
        title: t("general.error"),
        description: error instanceof Error ? error.message : (language === "ar" ? "فشل في حذف أمر الشراء" : "Failed to delete purchase order"),
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
  }

  const canApprove = canApprovePurchaseOrders(currentUser) // Admin or accountant
  const canEditPO = canEditAccountingData(currentUser) // Only accountants can edit
  const canCreatePO = canCreatePurchaseOrders(currentUser) // All users can create
  const isUserAdmin = isAdmin(currentUser)
  const isUserAccountant = currentUser?.role === 'accountant'

  return (
      <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("po.title")}</h1>
          <p className="text-gray-600 mt-1">{t("po.manage")}</p>
        </div>
        {canCreatePO && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Purchase Order
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPO ? "Edit Purchase Order" : "Create New Purchase Order"}</DialogTitle>
              <DialogDescription>
                {editingPO ? "Update the purchase order details." : "Create a new purchase order. It will require approval from admin or accountant."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "" || value === ".") {
                      handleInputChange("amount", "")
                      return
                    }
                    const numValue = parseFloat(value)
                    if (!isNaN(numValue)) {
                      const rounded = Math.round(numValue * 100) / 100
                      handleInputChange("amount", rounded.toString())
                    }
                  }}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("common.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter purchase order description"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">{t("po.uploadImage")}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast({
                            title: "File too large",
                            description: "Image must be less than 5MB",
                            variant: "destructive",
                          })
                          return
                        }
                        handleImageUpload(file)
                      }
                    }}
                    className="flex-1"
                  />
                </div>
                {imagePreview && (
                  <div className="relative mt-2">
                    <img src={imagePreview} alt="Preview" className="max-w-full h-auto rounded border" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingPO ? "Update Purchase Order" : "Create Purchase Order"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("po.allOrders")} ({purchaseOrders.length})</CardTitle>
          <CardDescription>
            {language === "ar" ? "قائمة بجميع أوامر الشراء. يمكن للمدير أو المحاسب الموافقة على الطلبات المعلقة أو رفضها." : "List of all purchase orders. Pending orders can be approved or rejected by admin or accountant."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("po.number")}</TableHead>
                  <TableHead>{t("common.amount")}</TableHead>
                  <TableHead>{t("common.description")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.createdBy")}</TableHead>
                  <TableHead>{t("po.firstApprovedBy")}</TableHead>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      {t("po.loadingOrders")}
                    </TableCell>
                  </TableRow>
                ) : purchaseOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      {t("po.noOrdersFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  purchaseOrders.map((po) => (
                    <TableRow key={po.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{po.po_number}</TableCell>
                      <TableCell>{formatCurrency(po.amount)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {po.description || t("general.noDescription")}
                      </TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell>{po.created_by_user?.name || t("general.unknown")}</TableCell>
                      <TableCell>
                        {po.approved_by_1_user?.name ? (
                          <div>
                            <div>{po.approved_by_1_user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {po.approved_at_1 ? new Date(po.approved_at_1).toLocaleDateString() : ""}
                            </div>
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {po.approved_by_2_user?.name ? (
                          <div>
                            <div>{po.approved_by_2_user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {po.approved_at_2 ? new Date(po.approved_at_2).toLocaleDateString() : ""}
                            </div>
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {po.rejected_by_user?.name ? (
                          <div>
                            <div className="text-red-600">{po.rejected_by_user.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {po.rejected_at ? new Date(po.rejected_at).toLocaleDateString() : ""}
                            </div>
                            {po.rejection_reason && (
                              <div className="text-xs text-red-600 mt-1 max-w-[200px] truncate" title={po.rejection_reason}>
                                {po.rejection_reason}
                              </div>
                            )}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(po.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewClick(po)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {po.status === 'pending' && (
                            <>
                              {canEditPO && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(po)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {isUserAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700"
                                  onClick={() => handleApprove(po.id, 'admin')}
                                  title="Admin Approval (First Approval)"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  {t("po.adminApprove")}
                                </Button>
                              )}
                              {canApprove && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleRejectClick(po.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                          {po.status === 'first_approved' && isUserAccountant && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(po.id, 'accountant')}
                              title={t("po.accountantApprove")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {t("po.accountantApprove")}
                            </Button>
                          )}
                          {po.status === 'first_approved' && canApprove && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRejectClick(po.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {canEditPO && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(po.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>
              View purchase order information and image
            </DialogDescription>
          </DialogHeader>
          {viewingPO && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">PO Number</Label>
                  <p className="font-medium">{viewingPO.po_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium">{formatCurrency(viewingPO.amount)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(viewingPO.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created By</Label>
                  <p className="font-medium">{viewingPO.created_by_user?.name || "Unknown"}</p>
                </div>
                {viewingPO.approved_by_1_user && (
                  <div>
                    <Label className="text-muted-foreground">First Approved By</Label>
                    <p className="font-medium">{viewingPO.approved_by_1_user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {viewingPO.approved_at_1 ? new Date(viewingPO.approved_at_1).toLocaleString() : "-"}
                    </p>
                  </div>
                )}
                {viewingPO.approved_by_2_user && (
                  <div>
                    <Label className="text-muted-foreground">Second Approved By</Label>
                    <p className="font-medium">{viewingPO.approved_by_2_user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {viewingPO.approved_at_2 ? new Date(viewingPO.approved_at_2).toLocaleString() : "-"}
                    </p>
                  </div>
                )}
                {viewingPO.rejected_by_user && (
                  <>
                    <div>
                      <Label className="text-muted-foreground">Rejected By</Label>
                      <p className="font-medium text-red-600">{viewingPO.rejected_by_user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {viewingPO.rejected_at ? new Date(viewingPO.rejected_at).toLocaleString() : "-"}
                      </p>
                    </div>
                    {viewingPO.rejection_reason && (
                      <div className="col-span-2">
                        <Label className="text-muted-foreground">Rejection Reason</Label>
                        <p className="font-medium text-red-600 whitespace-pre-wrap">{viewingPO.rejection_reason}</p>
                      </div>
                    )}
                  </>
                )}
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Created At</Label>
                  <p className="font-medium">{new Date(viewingPO.created_at).toLocaleString()}</p>
                </div>
                {viewingPO.description && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="font-medium whitespace-pre-wrap">{viewingPO.description}</p>
                  </div>
                )}
              </div>
              {imagePreview && (
                <div>
                  <Label className="text-muted-foreground">Image</Label>
                  <div className="mt-2">
                    <img src={imagePreview} alt="Purchase order" className="max-w-full h-auto rounded border" />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Purchase Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this purchase order. This reason will be recorded and visible to all users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejecting this purchase order..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsRejectDialogOpen(false)
              setRejectionReason("")
              setRejectingPOId(null)
            }}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              {t("po.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

