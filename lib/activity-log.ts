import { supabase } from "@/lib/supabase"
import { getCurrentUser } from "@/lib/auth-utils"

export type ActivityAction = "CREATE" | "UPDATE" | "DELETE"

export interface ActivityLog {
  id: string
  user_id: string | null
  user_name: string | null
  user_email: string | null
  user_role: string | null
  action: ActivityAction
  entity_type: string
  entity_id: string | null
  entity_label: string | null
  details: any
  created_at: string
}

export interface LogActivityParams {
  action: ActivityAction
  entityType: string
  entityId?: string | null
  entityLabel?: string | null
  details?: any
}

// Fire-and-forget audit log. Never throws — logging must not break the
// caller's operation if the activity_logs table is missing or unreachable.
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const u = getCurrentUser()
    const { error } = await supabase.from("activity_logs").insert([
      {
        user_id: u?.id ?? null,
        user_name: u?.name ?? null,
        user_email: u?.email ?? null,
        user_role: u?.role ?? null,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId ?? null,
        entity_label: params.entityLabel ?? null,
        details: params.details ?? null,
      },
    ])
    if (error) console.warn("logActivity insert error:", error.message)
  } catch (e) {
    console.warn("logActivity failed:", e)
  }
}

export interface FetchActivityLogsOptions {
  limit?: number
  entityType?: string
  action?: ActivityAction | "all"
  fromDate?: string
  toDate?: string
  search?: string
}

export async function fetchActivityLogs(
  opts: FetchActivityLogsOptions = {}
): Promise<ActivityLog[]> {
  try {
    let q = supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(opts.limit ?? 500)

    if (opts.entityType && opts.entityType !== "all") {
      q = q.eq("entity_type", opts.entityType)
    }
    if (opts.action && opts.action !== "all") {
      q = q.eq("action", opts.action)
    }
    if (opts.fromDate) q = q.gte("created_at", opts.fromDate)
    if (opts.toDate) q = q.lte("created_at", opts.toDate)

    const { data, error } = await q
    if (error) {
      console.error("fetchActivityLogs error:", error)
      return []
    }

    let rows = (data || []) as ActivityLog[]
    if (opts.search && opts.search.trim()) {
      const s = opts.search.trim().toLowerCase()
      rows = rows.filter(
        (r) =>
          (r.user_name || "").toLowerCase().includes(s) ||
          (r.user_email || "").toLowerCase().includes(s) ||
          (r.entity_label || "").toLowerCase().includes(s) ||
          (r.entity_id || "").toLowerCase().includes(s) ||
          (r.entity_type || "").toLowerCase().includes(s)
      )
    }
    return rows
  } catch (e) {
    console.error("fetchActivityLogs failed:", e)
    return []
  }
}
