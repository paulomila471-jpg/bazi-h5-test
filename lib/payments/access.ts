"use client";

import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { BaziFormData, BaziReportRecord } from "@/lib/bazi/types";

export type PurchaseRecord = {
  id: string;
  userId: string;
  profileId: string;
  reportId: string;
  productType: string;
  amount: number;
  currency: "CNY";
  paymentStatus: "paid" | "pending" | "failed";
  createdAt: string;
};

const guestUserKey = "bazi_guest_user_id";
const purchasesKey = "bazi_purchases";
const profileMapKey = "bazi_profile_id_map";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getGuestUserId() {
  if (typeof window === "undefined") return "00000000-0000-4000-8000-000000000000";

  const existing = window.localStorage.getItem(guestUserKey);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(guestUserKey, id);
  return id;
}

export function getReportType(focus: string) {
  return `bazi_${focus || "综合"}`;
}

export function getProfileKey(form: Pick<BaziFormData, "gender" | "birthDate" | "birthTime" | "calendarType" | "isLeapMonth" | "birthPlace" | "useTrueSolarTime" | "ziHourDayChangeRule">) {
  return [
    form.gender,
    form.birthDate,
    form.birthTime,
    form.calendarType,
    form.isLeapMonth ? "leap" : "normal",
    form.birthPlace || "",
    form.useTrueSolarTime ? "trueSolar" : "standardTime",
    form.ziHourDayChangeRule
  ].join("|");
}

export function getOrCreateProfileId(form: BaziFormData, userId = getGuestUserId()) {
  const map = readJson<Record<string, string>>(profileMapKey, {});
  const key = `${userId}:${getProfileKey(form)}`;

  if (map[key]) return map[key];

  const id = crypto.randomUUID();
  map[key] = id;
  writeJson(profileMapKey, map);
  return id;
}

export function getLocalPurchases() {
  return readJson<PurchaseRecord[]>(purchasesKey, []);
}

export async function hasReportAccess(userId: string, reportId: string) {
  const local = getLocalPurchases().some(
    (purchase) => purchase.userId === userId && purchase.reportId === reportId && purchase.paymentStatus === "paid"
  );
  if (local) return true;

  if (!hasSupabaseConfig()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { data } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("report_id", reportId)
    .eq("payment_status", "paid")
    .maybeSingle();

  return Boolean(data);
}

export async function hasProfileReportAccess(userId: string, profileId: string, productType: string) {
  const local = getLocalPurchases().some(
    (purchase) =>
      purchase.userId === userId &&
      purchase.profileId === profileId &&
      purchase.productType === productType &&
      purchase.paymentStatus === "paid"
  );
  if (local) return true;

  if (!hasSupabaseConfig()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { data } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("profile_id", profileId)
    .eq("product_type", productType)
    .eq("payment_status", "paid")
    .maybeSingle();

  return Boolean(data);
}

export async function canViewFullReport(userId: string, reportId: string) {
  return hasReportAccess(userId, reportId);
}

export async function createMockPurchase(
  userId: string,
  reportId: string,
  profileId: string,
  productType: string,
  amount: number
) {
  const purchases = getLocalPurchases();
  const existing = purchases.find(
    (purchase) =>
      purchase.userId === userId &&
      purchase.paymentStatus === "paid" &&
      (purchase.reportId === reportId || (purchase.profileId === profileId && purchase.productType === productType))
  );

  if (existing) return existing;

  const purchase: PurchaseRecord = {
    id: crypto.randomUUID(),
    userId,
    reportId,
    profileId,
    productType,
    amount,
    currency: "CNY",
    paymentStatus: "paid",
    createdAt: new Date().toISOString()
  };

  writeJson(purchasesKey, [purchase, ...purchases]);

  if (hasSupabaseConfig()) {
    const supabase = getSupabaseClient();
    await supabase?.from("purchases").insert({
      id: purchase.id,
      user_id: userId,
      profile_id: profileId,
      report_id: reportId,
      product_type: productType,
      amount,
      currency: purchase.currency,
      payment_status: purchase.paymentStatus,
      created_at: purchase.createdAt
    });
    await supabase?.from("entitlements").upsert({
      id: crypto.randomUUID(),
      user_id: userId,
      profile_id: profileId,
      report_id: reportId,
      order_id: purchase.id,
      product_type: productType,
      access_scope: "full_report",
      status: "active",
      created_at: purchase.createdAt
    });
  }

  return purchase;
}

export function isRecordUnlocked(record: BaziReportRecord, userId = getGuestUserId()) {
  return getLocalPurchases().some(
    (purchase) =>
      purchase.userId === userId &&
      purchase.paymentStatus === "paid" &&
      (purchase.reportId === record.id ||
        (purchase.profileId === record.profileId && purchase.productType === record.reportType))
  );
}
