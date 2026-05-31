"use client";

import { wechatId } from "@/lib/compliance/config";
import { getSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/client";

export type LeadStatus = "未联系" | "已加微信" | "已生成报告" | "已交付";

export type LeadRecord = {
  id: string;
  nickname: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: string;
  question: string;
  wechat: string;
  status: LeadStatus;
  createdAt: string;
};

export type ManualReportRecord = {
  id: string;
  leadId: string;
  title: string;
  content: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

const leadsKey = "bazi_h5_leads";
const manualReportsKey = "bazi_h5_manual_reports";

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

export function getLeads() {
  return readJson<LeadRecord[]>(leadsKey, []);
}

export function getLead(id: string) {
  return getLeads().find((lead) => lead.id === id) || null;
}

export async function saveLead(input: Omit<LeadRecord, "id" | "status" | "createdAt">) {
  const lead: LeadRecord = {
    ...input,
    id: crypto.randomUUID(),
    status: "未联系",
    createdAt: new Date().toISOString()
  };

  writeJson(leadsKey, [lead, ...getLeads()]);

  if (hasSupabaseConfig()) {
    const supabase = getSupabaseClient();
    await supabase?.from("leads").insert({
      id: lead.id,
      nickname: lead.nickname,
      birth_date: lead.birthDate,
      birth_time: lead.birthTime,
      birth_place: lead.birthPlace,
      gender: lead.gender,
      question: lead.question,
      wechat: lead.wechat,
      status: lead.status,
      created_at: lead.createdAt
    });
  }

  return lead;
}

export function updateLeadStatus(id: string, status: LeadStatus) {
  writeJson(
    leadsKey,
    getLeads().map((lead) => (lead.id === id ? { ...lead, status } : lead))
  );
}

export function getManualReports() {
  return readJson<ManualReportRecord[]>(manualReportsKey, []);
}

export function getManualReport(id: string) {
  return getManualReports().find((report) => report.id === id) || null;
}

export function createManualReport(lead: LeadRecord) {
  const now = new Date().toISOString();
  const report: ManualReportRecord = {
    id: crypto.randomUUID(),
    leadId: lead.id,
    title: `${lead.nickname || "用户"}的人工深度版八字报告`,
    status: "已生成报告",
    createdAt: now,
    updatedAt: now,
    content: [
      "本报告由AI辅助生成，仅供娱乐、文化研究和个人参考，不构成医学、法律、投资、婚姻等现实决策依据，也不保证现实结果。",
      "",
      `用户昵称：${lead.nickname}`,
      `出生信息：${lead.birthDate} ${lead.birthTime}，出生地：${lead.birthPlace || "未填写"}，性别：${lead.gender}`,
      `咨询问题：${lead.question}`,
      `联系微信：${lead.wechat}`,
      "",
      "一、命局总评",
      "本部分用于综合四柱、日主、月令、十神和宫位，说明命局主线、人生节奏和当前最需要把握的核心问题。请结合排盘结果补充命局强弱、结构取向、事业感情侧重点，并保持温和、参考性的表达。",
      "",
      "二、性格底色",
      "本部分用于说明用户在思维方式、情绪反应、行动节奏、人际边界上的底层倾向。建议用“倾向、容易、更适合、需要留意”等表达，避免绝对化判断。",
      "",
      "三、事业与赚钱方式",
      "本部分用于分析适合的平台、岗位、行业形态、能力变现方式和资源整合路径。可以结合财星、官杀、印星、食伤、比劫说明赚钱方式，但不得承诺收益或给出投资保证。",
      "",
      "四、感情婚姻模式",
      "本部分用于分析亲密关系中的需求、边界、表达方式、容易出现的误会和适合的相处节奏。建议强调沟通、现实匹配和长期稳定，不给出极端婚恋建议。",
      "",
      "五、适合的伴侣类型",
      "本部分用于说明更适合的对象类型，例如情绪稳定型、成熟负责型、执行力强型、现实规划清晰型等。也可说明不太适合的类型，但要避免贬低和绝对否定。",
      "",
      "六、桃花与关系特点",
      "本部分用于说明人际吸引力、桃花触发方式、暧昧风险、关系边界和适合主动经营的方式。请区分人缘、正缘、暧昧和消耗型关系。",
      "",
      "七、十年大运趋势",
      "本部分用于按阶段说明未来大运的主题差异，重点看事业、财运、感情和压力变化。每个阶段应有不同侧重点，不要复制模板。",
      "",
      "八、关键年份提醒",
      "本部分用于提示未来几年中事业变化、财运启动、桃花活跃、稳定积累或压力较明显的年份。表达为提醒和参考，不做绝对预测。",
      "",
      "九、近三年行动建议",
      "本部分用于给出近三年的现实行动建议，包括事业节奏、关系经营、财务管理、学习提升和风险控制。建议具体、可执行、不过度玄学化。",
      "",
      "十、总结建议",
      `请在结尾再次提示：如需进一步沟通和人工校对，可添加微信 ${wechatId}。`
    ].join("\n")
  };

  writeJson(manualReportsKey, [report, ...getManualReports()]);
  updateLeadStatus(lead.id, "已生成报告");
  return report;
}

export function updateManualReport(report: ManualReportRecord) {
  const updated = { ...report, updatedAt: new Date().toISOString() };
  writeJson(
    manualReportsKey,
    getManualReports().map((item) => (item.id === updated.id ? updated : item))
  );
  return updated;
}
