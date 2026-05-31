import type { AnnualHighlight } from "./annualHighlights";
import { getAnnualPillar } from "./annualHighlights";
import type { BaziChart, BaziFormData } from "../types";

export type RelationshipProfile = {
  peachBlossomScore: number;
  peachBlossomType: string;
  peachBlossomYears: Array<{ year: number; pillar: string; reason: string }>;
  spouseProfile: {
    personality: string;
    reality: string;
    relationshipMode: string;
    conflictPoint: string;
  };
  suitablePartners: string[];
  unsuitablePartners: string[];
  attractedTypes: string[];
  relationshipRisk: string;
  advice: string;
};

const peachBranches = ["子", "午", "卯", "酉"];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function branchOf(pillar: string) {
  return pillar.slice(1, 2);
}

function hasSpouseStar(chart: BaziChart, gender: BaziFormData["gender"]) {
  return gender === "male"
    ? chart.tenGods.some((god) => god.includes("财"))
    : chart.tenGods.some((god) => god.includes("官") || god.includes("杀"));
}

function getType(score: number, risk: boolean, stable: boolean) {
  if (risk && score >= 65) return "烂桃花风险";
  if (score >= 78) return "正缘型";
  if (score >= 62) return "人缘型";
  if (score >= 48) return "暧昧型";
  return stable ? "慢热稳定型" : "人缘待开发型";
}

export function generateRelationshipProfile(input: {
  form: BaziFormData;
  pillars: BaziChart;
  annualHighlights?: AnnualHighlight[];
  startYear?: number;
}): RelationshipProfile {
  const { form, pillars, annualHighlights = [], startYear = new Date().getFullYear() } = input;
  const dayBranch = pillars.day.branch;
  const hourBranch = pillars.hour.branch;
  const hasPeachBranch = [pillars.year.branch, pillars.month.branch, dayBranch, hourBranch].some((item) => peachBranches.includes(item));
  const spouseStarVisible = hasSpouseStar(pillars, form.gender);
  const dayIsPeach = peachBranches.includes(dayBranch);
  const risk = pillars.tenGods.some((god) => god.includes("劫") || god.includes("伤"));
  const stable = pillars.tenGods.some((god) => god.includes("官") || god.includes("印") || god.includes("财"));
  const peachFromTimeline = annualHighlights.filter((item) => item.tag.includes("桃花"));

  const score = clamp(
    42 +
    (hasPeachBranch ? 16 : 0) +
    (dayIsPeach ? 12 : 0) +
    (spouseStarVisible ? 14 : 0) +
    (stable ? 8 : 0) +
    (risk ? -6 : 0) +
    Math.min(peachFromTimeline.length * 6, 12)
  );

  const generatedYears = Array.from({ length: 10 }, (_, index) => {
    const year = startYear + index;
    const pillar = getAnnualPillar(year);
    const branch = branchOf(pillar);
    const dayBranchIndex = branches.indexOf(dayBranch);
    const branchIndex = branches.indexOf(branch);
    const triggered = peachBranches.includes(branch) || Math.abs(branchIndex - dayBranchIndex) % 6 === 0;
    return triggered
      ? {
          year,
          pillar,
          reason: peachBranches.includes(branch)
            ? "流年桃花地支被触发，人际与感情机会更明显。"
            : "流年与夫妻宫形成触发关系，容易带来关系议题。"
        }
      : null;
  }).filter(Boolean) as RelationshipProfile["peachBlossomYears"];

  const peachBlossomYears = [
    ...peachFromTimeline.map((item) => ({
      year: item.year,
      pillar: item.annualPillar,
      reason: "年度主题显示桃花较旺，适合主动经营关系。"
    })),
    ...generatedYears
  ].filter((item, index, arr) => arr.findIndex((other) => other.year === item.year) === index).slice(0, 5);

  const spouseProfile = form.gender === "male"
    ? {
        personality: spouseStarVisible ? "伴侣倾向务实、重生活秩序，也看重现实安全感。" : "伴侣倾向慢热，需要通过稳定互动逐渐建立信任。",
        reality: "现实状态更可能重视工作、收入、家庭安排和长期计划。",
        relationshipMode: "适合把金钱观、生活节奏和责任分工提前说清。",
        conflictPoint: risk ? "容易因朋友、人情或表达过急带来关系波动。" : "矛盾多来自节奏不同和现实安排不够清楚。"
      }
    : {
        personality: spouseStarVisible ? "伴侣倾向有责任感、执行力和规则意识。" : "伴侣倾向需要在现实相处中慢慢显现稳定度。",
        reality: "现实状态更看重事业位置、责任承担和未来规划。",
        relationshipMode: "适合稳定推进，避免只靠情绪确认关系。",
        conflictPoint: risk ? "容易因压力、控制感或沟通锋芒产生拉扯。" : "矛盾多来自承诺节奏和安全感表达不一致。"
      };

  return {
    peachBlossomScore: score,
    peachBlossomType: getType(score, risk, stable),
    peachBlossomYears,
    spouseProfile,
    suitablePartners: stable
      ? ["成熟稳定型", "执行力强型", "情绪稳定型", "有长期规划的人"]
      : ["尊重边界型", "愿意共同成长型", "沟通直接但不压迫的人"],
    unsuitablePartners: risk
      ? ["情绪反复的人", "消费冲动的人", "控制欲过强的人", "边界不清的人"]
      : ["承诺模糊的人", "长期规划缺失的人", "过度依赖情绪价值的人"],
    attractedTypes: spouseStarVisible
      ? ["有现实目标的人", "重视稳定感的人", "希望获得资源协助或情绪支持的人"]
      : ["被你的独立感吸引的人", "欣赏你专业能力的人", "需要慢慢建立信任的人"],
    relationshipRisk: risk
      ? "感情风险主要在暧昧边界、人情牵扯、表达过急和外界干扰。越是桃花活跃的年份，越要先确认承诺、金钱观和相处边界。"
      : "感情风险主要在推进过慢、表达不够明确和现实安排滞后。关系稳定不代表不用经营，重要议题仍需要主动沟通。",
    advice: "关系里最重要的是把边界、金钱观和未来计划说清楚。桃花旺时主动选择，桃花弱时先提升稳定感和可见价值。"
  };
}
