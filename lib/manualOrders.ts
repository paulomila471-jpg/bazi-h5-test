"use client";

import { generateAnnualHighlights } from "@/lib/bazi/rules/annualHighlights";
import { generateLuckCycles } from "@/lib/bazi/rules/luckCycles";
import { generateProfessionalView } from "@/lib/bazi/rules/professionalView";
import { generateRelationshipProfile } from "@/lib/bazi/rules/relationshipProfile";
import type { BaziReportRecord } from "@/lib/bazi/types";
import { getGeneratedReports, saveGeneratedReport } from "@/lib/reports";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";

export type ManualOrderStatus = NonNullable<BaziReportRecord["manualUnlockStatus"]>;

export type ManualReportSections = {
  overview: string;
  pillars: string;
  annualHighlights: string;
  luckCycles: string;
  relationship: string;
  professionalView: string;
  freeReport: string;
};

export type ManualOrderRecord = BaziReportRecord & {
  fullReport?: string;
  reportSections?: ManualReportSections;
  annualHighlights?: ReturnType<typeof generateAnnualHighlights>;
  relationshipProfile?: ReturnType<typeof generateRelationshipProfile>;
  luckCycles?: ReturnType<typeof generateLuckCycles>;
  professionalView?: string;
  contactWechat?: string;
  updatedAt?: string;
};

type ManualOrderRow = {
  id: string;
  report_code: string;
  status: ManualOrderStatus;
  birth_date: string;
  birth_time: string;
  birth_type: string;
  gender: "male" | "female";
  birth_place: string | null;
  focus: BaziReportRecord["focus"];
  question: string | null;
  pillars_json: BaziReportRecord["pillars"];
  annual_highlights_json: ManualOrderRecord["annualHighlights"] | null;
  relationship_profile_json: ManualOrderRecord["relationshipProfile"] | null;
  luck_cycles_json: ManualOrderRecord["luckCycles"] | null;
  professional_view: string | null;
  full_report: string | null;
  report_sections_json?: ManualReportSections | null;
  contact_wechat: string | null;
  created_at: string;
  updated_at: string;
};

const localManualOrdersKey = "bazi_manual_orders";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write ${key}:`, error);
  }
}

function compactOrder(order: ManualOrderRecord): ManualOrderRecord {
  const { fullReport, reportSections, annualHighlights, relationshipProfile, luckCycles, professionalView, ...rest } = order;
  return rest;
}

function getLocalManualOrders(): ManualOrderRecord[] {
  const stored = readJson<ManualOrderRecord[]>(localManualOrdersKey, []);
  const generated = getGeneratedReports().filter((report) => Boolean(report.reportCode && report.manualUnlockStatus));
  const byCode = new Map<string, ManualOrderRecord>();
  [...stored, ...generated].forEach((order) => {
    if (order.reportCode) byCode.set(order.reportCode, order as ManualOrderRecord);
  });
  return Array.from(byCode.values()).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

function saveLocalManualOrder(order: ManualOrderRecord) {
  const orders = getLocalManualOrders();
  writeJson(localManualOrdersKey, [order, ...orders.filter((item) => item.reportCode !== order.reportCode)].slice(0, 50));
  saveGeneratedReport(compactOrder(order));

  const latestRaw = typeof window !== "undefined" ? window.localStorage.getItem("bazi_latest_report") : null;
  if (!latestRaw) return;

  try {
    const latest = JSON.parse(latestRaw) as BaziReportRecord;
    if (latest.reportCode === order.reportCode || latest.id === order.id) {
      window.localStorage.setItem("bazi_latest_report", JSON.stringify(compactOrder(order)));
    }
  } catch (error) {
    console.error("Failed to update latest report:", error);
  }
}

function rowToOrder(row: ManualOrderRow): ManualOrderRecord {
  return {
    id: row.id,
    userId: "manual-order",
    profileId: row.id,
    reportType: row.focus,
    reportCode: row.report_code,
    manualUnlockStatus: row.status,
    module: "bazi",
    question: row.question || "",
    profileName: "",
    birthDate: row.birth_date,
    birthTime: row.birth_time,
    calendarType: row.birth_type === "lunar" ? "lunar" : "solar",
    isLeapMonth: false,
    gender: row.gender,
    birthPlace: row.birth_place || "",
    focus: row.focus,
    useTrueSolarTime: false,
    ziHourDayChangeRule: "after_23",
    pillars: row.pillars_json,
    report: row.report_sections_json?.freeReport || row.full_report || "",
    paymentStatus: "unpaid",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fullReport: row.full_report || "",
    reportSections: row.report_sections_json || undefined,
    annualHighlights: row.annual_highlights_json || undefined,
    relationshipProfile: row.relationship_profile_json || undefined,
    luckCycles: row.luck_cycles_json || undefined,
    professionalView: row.professional_view || "",
    contactWechat: row.contact_wechat || ""
  };
}

export function buildManualReportData(record: BaziReportRecord) {
  const annualHighlights =
    (record as ManualOrderRecord).annualHighlights ||
    generateAnnualHighlights({ birthInfo: record, focus: record.focus, pillars: record.pillars });
  const luckCycles =
    (record as ManualOrderRecord).luckCycles ||
    generateLuckCycles({ form: record, pillars: record.pillars, count: 6 });
  const relationshipProfile =
    (record as ManualOrderRecord).relationshipProfile ||
    generateRelationshipProfile({ form: record, pillars: record.pillars, annualHighlights });
  const professionalView =
    (record as ManualOrderRecord).professionalView ||
    generateProfessionalView({ form: record, pillars: record.pillars });

  const fullReport = buildFullManualReport({
    ...record,
    annualHighlights,
    luckCycles,
    relationshipProfile,
    professionalView
  } as ManualOrderRecord);

  const reportSections: ManualReportSections = {
    overview: `日主为 ${record.pillars.dayMaster}，分析方向为 ${record.focus}。`,
    pillars: `${record.pillars.year.stem}${record.pillars.year.branch} / ${record.pillars.month.stem}${record.pillars.month.branch} / ${record.pillars.day.stem}${record.pillars.day.branch} / ${record.pillars.hour.stem}${record.pillars.hour.branch}`,
    annualHighlights: annualHighlights.map((item) => `${item.year}${item.annualPillar}年：${item.tag}`).join("\n"),
    luckCycles: luckCycles.map((item) => `${item.ageRange} ${item.pillar} ${item.tenGod} ${item.tag}`).join("\n"),
    relationship: `桃花指数 ${relationshipProfile.peachBlossomScore}，${relationshipProfile.peachBlossomType}`,
    professionalView,
    freeReport: record.report || ""
  };

  return { annualHighlights, luckCycles, relationshipProfile, professionalView, fullReport, reportSections };
}

function buildOrderPayload(record: BaziReportRecord, status: ManualOrderStatus, contactWechat = "guotingyuan258") {
  const data = buildManualReportData(record);
  const now = new Date().toISOString();

  return {
    id: record.id,
    report_code: record.reportCode,
    status,
    birth_date: record.birthDate,
    birth_time: record.birthTime,
    birth_type: record.calendarType,
    gender: record.gender,
    birth_place: record.birthPlace || null,
    focus: record.focus,
    question: record.question || null,
    pillars_json: record.pillars,
    annual_highlights_json: data.annualHighlights,
    relationship_profile_json: data.relationshipProfile,
    luck_cycles_json: data.luckCycles,
    professional_view: data.professionalView,
    full_report: data.fullReport,
    report_sections_json: data.reportSections,
    contact_wechat: contactWechat,
    created_at: record.createdAt,
    updated_at: now
  };
}

export async function createManualOrder(record: BaziReportRecord, contactWechat = "guotingyuan258") {
  const status: ManualOrderStatus = "pending_manual_unlock";
  const data = buildManualReportData(record);
  const updated: ManualOrderRecord = {
    ...record,
    manualUnlockStatus: status,
    contactWechat,
    updatedAt: new Date().toISOString(),
    ...data
  };

  saveLocalManualOrder(updated);

  if (!hasSupabaseConfig()) return { order: updated, savedToSupabase: false };

  const supabase = getSupabaseClient();
  if (!supabase || !updated.reportCode) return { order: updated, savedToSupabase: false };

  const payload = buildOrderPayload(updated, status, contactWechat);
  let { error } = await supabase.from("manual_orders").upsert(payload, { onConflict: "report_code" });

  if (error && error.message.includes("report_sections_json")) {
    const { report_sections_json: _unused, ...compatiblePayload } = payload;
    const retry = await supabase.from("manual_orders").upsert(compatiblePayload, { onConflict: "report_code" });
    error = retry.error;
  }

  return {
    order: updated,
    savedToSupabase: !error,
    error: error?.message
  };
}

export async function getManualOrders() {
  if (!hasSupabaseConfig()) return getLocalManualOrders();

  const supabase = getSupabaseClient();
  if (!supabase) return getLocalManualOrders();

  const { data, error } = await supabase
    .from("manual_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return getLocalManualOrders();
  return (data as ManualOrderRow[]).map(rowToOrder);
}

export async function getManualOrder(reportCode: string) {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("manual_orders")
        .select("*")
        .eq("report_code", reportCode)
        .maybeSingle();
      if (!error && data) return rowToOrder(data as ManualOrderRow);
    }
  }

  return getLocalManualOrders().find((report) => report.reportCode === reportCode) || null;
}

export async function updateManualOrderStatus(reportCode: string, status: ManualOrderStatus) {
  const order = await getManualOrder(reportCode);
  if (!order) return null;

  const updated = { ...order, manualUnlockStatus: status, updatedAt: new Date().toISOString() };
  saveLocalManualOrder(updated);

  if (hasSupabaseConfig()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase
        .from("manual_orders")
        .update({ status, updated_at: updated.updatedAt })
        .eq("report_code", reportCode);
    }
  }

  return updated;
}

export async function regenerateManualOrderReport(reportCode: string) {
  const order = await getManualOrder(reportCode);
  if (!order) return null;

  const data = buildManualReportData(order);
  const updated: ManualOrderRecord = { ...order, ...data, updatedAt: new Date().toISOString() };
  saveLocalManualOrder(updated);

  if (hasSupabaseConfig()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase
        .from("manual_orders")
        .update({
          annual_highlights_json: data.annualHighlights,
          relationship_profile_json: data.relationshipProfile,
          luck_cycles_json: data.luckCycles,
          professional_view: data.professionalView,
          full_report: data.fullReport,
          report_sections_json: data.reportSections,
          updated_at: updated.updatedAt
        })
        .eq("report_code", reportCode);
    }
  }

  return updated;
}

export function getManualStatusLabel(status?: BaziReportRecord["manualUnlockStatus"]) {
  if (status === "paid") return "已付款，待发送";
  if (status === "sent") return "已发送";
  if (status === "cancelled") return "已取消";
  return "等待人工处理";
}

export function buildFullManualReport(record: BaziReportRecord) {
  const manual = record as ManualOrderRecord;
  const annualHighlights = manual.annualHighlights || generateAnnualHighlights({ birthInfo: record, focus: record.focus, pillars: record.pillars });
  const luckCycles = manual.luckCycles || generateLuckCycles({ form: record, pillars: record.pillars, count: 6 });
  const relationship = manual.relationshipProfile || generateRelationshipProfile({ form: record, pillars: record.pillars, annualHighlights });
  const professionalView = manual.professionalView || generateProfessionalView({ form: record, pillars: record.pillars });
  const chart = record.pillars;

  const pillarsText = [
    `年柱：${chart.year.stem}${chart.year.branch}（${chart.year.tenGod}）`,
    `月柱：${chart.month.stem}${chart.month.branch}（${chart.month.tenGod}）`,
    `日柱：${chart.day.stem}${chart.day.branch}（日主 ${chart.dayMaster}）`,
    `时柱：${chart.hour.stem}${chart.hour.branch}（${chart.hour.tenGod}）`
  ].join("\n");

  const annualText = annualHighlights
    .map((item) => `${item.year} ${item.annualPillar}年：${item.tag}（${item.level}）\n${item.description}`)
    .join("\n\n");

  const luckText = luckCycles
    .map(
      (cycle) =>
        `${cycle.ageRange}｜${cycle.pillar}｜${cycle.tenGod}｜${cycle.tag}｜评分 ${cycle.score}\n事业：${cycle.career}\n财运：${cycle.wealth}\n感情：${cycle.love}\n风险：${cycle.risk}\n建议：${cycle.advice}`
    )
    .join("\n\n");

  return [
    "本报告由AI辅助生成，仅供娱乐、文化研究和个人参考，不构成医学、法律、投资、婚姻等现实决策依据，也不保证现实结果。",
    "",
    `报告编号：${record.reportCode || "未生成"}`,
    `出生信息：${record.birthDate} ${record.birthTime}｜${record.gender === "male" ? "男" : "女"}｜${record.birthPlace || "未填写出生地"}`,
    `分析方向：${record.focus}`,
    "",
    "一、命局总评",
    `日主为 ${chart.dayMaster}。本报告以四柱结构、十神落点、藏干和宫位为基础，结合当前咨询方向「${record.focus}」做人工交付版整理。免费体验版只能看到基础倾向，完整报告会补充大运、关键年份、关系画像和行动建议。`,
    "",
    "二、四柱排盘",
    pillarsText,
    `藏干：年柱 ${chart.year.hiddenStems.join("、")}；月柱 ${chart.month.hiddenStems.join("、")}；日柱 ${chart.day.hiddenStems.join("、")}；时柱 ${chart.hour.hiddenStems.join("、")}`,
    "",
    "三、桃花与关系特点",
    `桃花指数：${relationship.peachBlossomScore} 分；类型：${relationship.peachBlossomType}`,
    `桃花重点年份：${relationship.peachBlossomYears.map((item) => `${item.year}${item.pillar}年：${item.reason}`).join("；") || "需结合后续流年进一步观察"}`,
    `感情风险提醒：${relationship.relationshipRisk}`,
    "",
    "四、配偶画像与适配对象",
    `伴侣性格倾向：${relationship.spouseProfile.personality}`,
    `伴侣现实状态倾向：${relationship.spouseProfile.reality}`,
    `相处模式：${relationship.spouseProfile.relationshipMode}`,
    `容易出现的矛盾点：${relationship.spouseProfile.conflictPoint}`,
    `更适合：${relationship.suitablePartners.join("、")}`,
    `不太适合：${relationship.unsuitablePartners.join("、")}`,
    `你容易吸引的人：${relationship.attractedTypes.join("、")}`,
    "",
    "五、关键年份提醒",
    annualText,
    "",
    "六、十年大运趋势",
    luckText,
    "",
    "七、命理师视角",
    professionalView,
    "",
    "八、免费体验版正文",
    record.report || "免费体验版正文未保存，可依据上方排盘和规则重新整理。",
    "",
    "九、总结建议",
    "建议把这份报告作为传统文化参考，不做绝对化判断。真正适合交付给用户前，可以再结合用户实际问题、职业状态、关系状态和当下选择做人工润色。"
  ].join("\n");
}
