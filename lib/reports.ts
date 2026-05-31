"use client";

import { generateAnnualHighlights } from "@/lib/bazi/rules/annualHighlights";
import { generateLuckCycles } from "@/lib/bazi/rules/luckCycles";
import { generateRelationshipProfile } from "@/lib/bazi/rules/relationshipProfile";
import type { BaziReportRecord } from "@/lib/bazi/types";
import { getLocalPurchases } from "@/lib/payments/access";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";

const generatedReportsKey = "bazi_reports_generated";
const unlockedReportsKey = "bazi_reports_unlocked";
const profilesKey = "bazi_profiles";
const accountDeletionRequestsKey = "bazi_account_deletion_requests";

export type BaziProfileRecord = {
  id: string;
  userId: string;
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthType: string;
  isLeapMonth: boolean;
  birthPlace?: string;
  timezone: string;
  useTrueSolarTime: boolean;
  createdAt: string;
};

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

function upsertById<T extends { id: string }>(items: T[], item: T) {
  return [item, ...items.filter((existing) => existing.id !== item.id)];
}

export function toProfile(record: BaziReportRecord): BaziProfileRecord {
  return {
    id: record.profileId,
    userId: record.userId,
    name: record.profileName || "未命名命盘",
    gender: record.gender,
    birthDate: record.birthDate,
    birthTime: record.birthTime,
    birthType: record.calendarType,
    isLeapMonth: record.isLeapMonth,
    birthPlace: record.birthPlace,
    timezone: "Asia/Shanghai",
    useTrueSolarTime: record.useTrueSolarTime,
    createdAt: record.createdAt
  };
}

export function getGeneratedReports(): BaziReportRecord[] {
  return readJson<BaziReportRecord[]>(generatedReportsKey, []);
}

export function getLocalReports(): BaziReportRecord[] {
  return getGeneratedReports();
}

export function getUnlockedReports(userId?: string): BaziReportRecord[] {
  const reports = readJson<BaziReportRecord[]>(unlockedReportsKey, []);
  return userId ? reports.filter((report) => report.userId === userId) : reports;
}

export function getProfiles(userId?: string): BaziProfileRecord[] {
  const profiles = readJson<BaziProfileRecord[]>(profilesKey, []);
  return userId ? profiles.filter((profile) => profile.userId === userId) : profiles;
}

export function getPurchasedReportCount(profileId: string) {
  return getLocalPurchases().filter(
    (purchase) => purchase.profileId === profileId && purchase.paymentStatus === "paid"
  ).length;
}

export function deleteReport(reportId: string, userId: string) {
  const generated = getGeneratedReports().filter((report) => !(report.id === reportId && report.userId === userId));
  const unlocked = getUnlockedReports().filter((report) => !(report.id === reportId && report.userId === userId));
  writeJson(generatedReportsKey, generated);
  writeJson(unlockedReportsKey, unlocked);

  const latestRaw = window.localStorage.getItem("bazi_latest_report");
  if (latestRaw) {
    try {
      const latest = JSON.parse(latestRaw) as BaziReportRecord;
      if (latest.id === reportId && latest.userId === userId) {
        window.localStorage.removeItem("bazi_latest_report");
      }
    } catch {
      window.localStorage.removeItem("bazi_latest_report");
    }
  }
}

export function deleteProfile(profileId: string, userId: string) {
  const profiles = getProfiles().filter((profile) => !(profile.id === profileId && profile.userId === userId));
  writeJson(profilesKey, profiles);

  for (const report of getGeneratedReports().filter((item) => item.profileId === profileId && item.userId === userId)) {
    deleteReport(report.id, userId);
  }

  const purchases = getLocalPurchases().filter(
    (purchase) => !(purchase.profileId === profileId && purchase.userId === userId)
  );
  writeJson("bazi_purchases", purchases);
}

export function requestAccountDeletion(userId: string, contact = "") {
  const requests = readJson<Array<{ id: string; userId: string; contact: string; status: string; createdAt: string }>>(
    accountDeletionRequestsKey,
    []
  );
  const request = {
    id: crypto.randomUUID(),
    userId,
    contact,
    status: "pending",
    createdAt: new Date().toISOString()
  };
  writeJson(accountDeletionRequestsKey, [request, ...requests]);
  return request;
}

export function saveGeneratedReport(record: BaziReportRecord) {
  writeJson(generatedReportsKey, upsertById(getGeneratedReports(), record).slice(0, 50));
}

export async function saveUnlockedReport(record: BaziReportRecord) {
  const paidRecord = { ...record, paymentStatus: "paid" as const };
  const profile = toProfile(paidRecord);

  writeJson(profilesKey, upsertById(getProfiles(), profile).slice(0, 50));
  writeJson(unlockedReportsKey, upsertById(getUnlockedReports(), paidRecord).slice(0, 50));
  saveGeneratedReport(paidRecord);
  window.localStorage.setItem("bazi_latest_report", JSON.stringify(paidRecord));

  if (!hasSupabaseConfig()) return { savedToSupabase: false };

  const supabase = getSupabaseClient();
  if (!supabase) return { savedToSupabase: false };

  const annualHighlights = generateAnnualHighlights({
    birthInfo: paidRecord,
    focus: paidRecord.focus,
    pillars: paidRecord.pillars
  });
  const relationshipProfile = generateRelationshipProfile({
    form: paidRecord,
    pillars: paidRecord.pillars,
    annualHighlights
  });
  const luckCycles = generateLuckCycles({ form: paidRecord, pillars: paidRecord.pillars });

  await supabase.from("bazi_profiles").upsert({
    id: profile.id,
    user_id: profile.userId,
    name: profile.name,
    gender: profile.gender,
    birth_date: profile.birthDate,
    birth_time: profile.birthTime,
    birth_type: profile.birthType,
    is_leap_month: profile.isLeapMonth,
    birth_place: profile.birthPlace || null,
    timezone: profile.timezone,
    use_true_solar_time: profile.useTrueSolarTime,
    created_at: profile.createdAt
  });

  const { error } = await supabase.from("bazi_reports").upsert({
    id: paidRecord.id,
    user_id: paidRecord.userId,
    profile_id: paidRecord.profileId,
    report_type: paidRecord.reportType,
    question: paidRecord.question,
    focus: paidRecord.focus,
    pillars_json: paidRecord.pillars,
    annual_highlights_json: annualHighlights,
    relationship_profile_json: relationshipProfile,
    luck_cycles_json: luckCycles,
    report_content: paidRecord.report,
    created_at: paidRecord.createdAt
  });

  return {
    savedToSupabase: !error,
    error: error?.message
  };
}

export async function saveReport(record: BaziReportRecord) {
  saveGeneratedReport(record);
  return { savedToSupabase: false };
}
