import { getSupabaseClient } from "@/lib/supabase/client";

export async function assertReportEntitlement(userId: string, reportId: string) {
  if (!userId || !reportId) return false;

  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { data } = await supabase
    .from("entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("report_id", reportId)
    .eq("status", "active")
    .maybeSingle();

  return Boolean(data);
}

export async function getReportDetailForUser(userId: string, reportId: string) {
  const canView = await assertReportEntitlement(userId, reportId);
  if (!canView) {
    return { report: null, error: "FORBIDDEN" as const };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return { report: null, error: "SUPABASE_NOT_CONFIGURED" as const };

  const { data, error } = await supabase
    .from("bazi_reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", userId)
    .maybeSingle();

  return { report: data, error: error?.message || null };
}

