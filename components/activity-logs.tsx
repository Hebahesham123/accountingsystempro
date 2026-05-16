"use client"

import { useCallback, useEffect, useState } from "react"
import { Search, RefreshCw, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import {
  type ActivityAction,
  type ActivityLog,
  fetchActivityLogs,
} from "@/lib/activity-log"

const ENTITY_TYPES = [
  { value: "all", labelEn: "All entities", labelAr: "كل الكيانات" },
  { value: "account", labelEn: "Account", labelAr: "حساب" },
  { value: "account_type", labelEn: "Account Type", labelAr: "نوع حساب" },
  { value: "journal_entry", labelEn: "Journal Entry", labelAr: "قيد محاسبي" },
  { value: "user", labelEn: "User", labelAr: "مستخدم" },
  { value: "project", labelEn: "Project", labelAr: "مشروع" },
  { value: "purchase_order", labelEn: "Purchase Order", labelAr: "أمر شراء" },
] as const

function actionBadge(action: ActivityAction) {
  switch (action) {
    case "CREATE":
      return <Badge className="bg-green-100 text-green-800 border border-green-200">CREATE</Badge>
    case "UPDATE":
      return <Badge className="bg-blue-100 text-blue-800 border border-blue-200">UPDATE</Badge>
    case "DELETE":
      return <Badge className="bg-red-100 text-red-800 border border-red-200">DELETE</Badge>
  }
}

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return iso
  }
}

export default function ActivityLogs() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [entityType, setEntityType] = useState<string>("all")
  const [action, setAction] = useState<ActivityAction | "all">("all")
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [search, setSearch] = useState<string>("")
  const [selected, setSelected] = useState<ActivityLog | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const rows = await fetchActivityLogs({
        entityType,
        action,
        fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
        toDate: toDate
          ? new Date(toDate + "T23:59:59").toISOString()
          : undefined,
        search,
        limit: 1000,
      })
      setLogs(rows)
    } catch (e) {
      toast({
        title: "Error",
        description:
          language === "ar"
            ? "تعذّر تحميل السجلات"
            : "Failed to load activity logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [entityType, action, fromDate, toDate, search, toast, language])

  useEffect(() => {
    load()
  }, [load])

  const locale = language === "ar" ? "ar-EG" : "en-US"

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {language === "ar" ? "السجلات" : "Activity Logs"}
        </h1>
        <p className="text-muted-foreground">
          {language === "ar"
            ? "سجل كامل لكل عمليات الإضافة والتعديل والحذف على النظام."
            : "Full audit trail of every create, update, and delete on the system."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {language === "ar" ? "تصفية" : "Filters"}
              </CardTitle>
              <CardDescription>
                {language === "ar"
                  ? "اختر الفترة والكيان لمتابعة من قام بكل إجراء."
                  : "Pick a range and entity to see who did what."}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {language === "ar" ? "تحديث" : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>{language === "ar" ? "الكيان" : "Entity"}</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {language === "ar" ? t.labelAr : t.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === "ar" ? "الإجراء" : "Action"}</Label>
              <Select
                value={action}
                onValueChange={(v) => setAction(v as ActivityAction | "all")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "ar" ? "كل الإجراءات" : "All actions"}
                  </SelectItem>
                  <SelectItem value="CREATE">CREATE</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === "ar" ? "من تاريخ" : "From"}</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === "ar" ? "إلى تاريخ" : "To"}</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === "ar" ? "بحث" : "Search"}</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder={
                    language === "ar"
                      ? "اسم، بريد، رمز حساب..."
                      : "name, email, code..."
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {language === "ar"
              ? `النتائج (${logs.length})`
              : `Results (${logs.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">
              {language === "ar" ? "جارٍ التحميل..." : "Loading..."}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {language === "ar"
                ? "لا توجد سجلات تطابق معايير التصفية."
                : "No log entries match the current filters."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === "ar" ? "متى" : "When"}</TableHead>
                    <TableHead>{language === "ar" ? "من" : "Who"}</TableHead>
                    <TableHead>{language === "ar" ? "الدور" : "Role"}</TableHead>
                    <TableHead>{language === "ar" ? "الإجراء" : "Action"}</TableHead>
                    <TableHead>{language === "ar" ? "الكيان" : "Entity"}</TableHead>
                    <TableHead>{language === "ar" ? "العنصر" : "Item"}</TableHead>
                    <TableHead className="text-right">
                      {language === "ar" ? "تفاصيل" : "Details"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {formatDate(log.created_at, locale)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {log.user_name || (language === "ar" ? "غير معروف" : "Unknown")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.user_email || ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.user_role || "—"}</Badge>
                      </TableCell>
                      <TableCell>{actionBadge(log.action)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.entity_type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate">
                        {log.entity_label || log.entity_id || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {log.details ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelected(log)}
                          >
                            {language === "ar" ? "عرض" : "View"}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === "ar" ? "تفاصيل السجل" : "Log Details"}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">
                    {language === "ar" ? "متى:" : "When:"}
                  </span>{" "}
                  {formatDate(selected.created_at, locale)}
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {language === "ar" ? "من:" : "Who:"}
                  </span>{" "}
                  {selected.user_name} ({selected.user_email})
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {language === "ar" ? "الإجراء:" : "Action:"}
                  </span>{" "}
                  {selected.action}
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {language === "ar" ? "الكيان:" : "Entity:"}
                  </span>{" "}
                  {selected.entity_type}
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">
                    {language === "ar" ? "العنصر:" : "Item:"}
                  </span>{" "}
                  {selected.entity_label || selected.entity_id}
                </div>
              </div>
              <div>
                <Label className="text-xs">
                  {language === "ar" ? "البيانات" : "Payload"}
                </Label>
                <pre className="mt-1 bg-muted p-3 rounded-md text-xs overflow-x-auto max-h-[400px]">
                  {JSON.stringify(selected.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
