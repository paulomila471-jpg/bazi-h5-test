import type { BaziChart, BaziFocus, BaziFormData } from "../types";

export type AnnualHighlight = {
  year: number;
  annualPillar: string;
  tag: string;
  level: "重点" | "平稳" | "提醒";
  description: string;
};

const annualStems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const annualBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function scoreText(text: string) {
  return Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getAnnualPillar(year: number) {
  const stem = annualStems[(year - 4) % 10];
  const branch = annualBranches[(year - 4) % 12];
  return `${stem}${branch}`;
}

export function generateAnnualHighlights(input: {
  birthInfo?: Partial<BaziFormData>;
  focus: BaziFocus;
  pillars: BaziChart;
  startYear?: number;
}): AnnualHighlight[] {
  const { birthInfo, focus, pillars, startYear = new Date().getFullYear() } = input;
  const seed = scoreText([
    birthInfo?.birthDate,
    birthInfo?.birthTime,
    focus,
    pillars.dayMaster,
    pillars.year.stem,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch
  ].filter(Boolean).join("|"));

  const hasWealth = pillars.tenGods.some((god) => god.includes("财"));
  const hasOfficer = pillars.tenGods.some((god) => god.includes("官") || god.includes("杀"));
  const hasOutput = pillars.tenGods.some((god) => god.includes("食") || god.includes("伤"));

  const templates: Omit<AnnualHighlight, "year" | "annualPillar">[] = [
    {
      tag: "财运启动",
      level: "重点",
      description: hasWealth
        ? "财星被触发，事业与财务机会增强，适合主动争取资源、谈合作和优化现金流。"
        : "财务机会来自能力变现，适合把已有技能包装成产品或服务。"
    },
    {
      tag: "桃花较旺",
      level: "重点",
      description: "人际、感情与合作缘分被带动，适合扩大社交半径，也要避免暧昧和承诺不清。"
    },
    {
      tag: "事业变化",
      level: "重点",
      description: hasOfficer
        ? "官杀力量被引动，职位、项目、平台规则容易变化，适合主动承担责任。"
        : "事业变化多来自外部机会和团队调整，宜用作品与能力争取位置。"
    },
    {
      tag: "稳定积累",
      level: "平稳",
      description: hasOutput
        ? "适合稳定输出作品、案例和方法论，把才华转化为可复用成果。"
        : "适合补齐基础能力、整理资源和沉淀信用，不宜频繁更换方向。"
    },
    {
      tag: "风险提醒",
      level: "提醒",
      description: "注意压力、破财或关系波动，重大支出、合伙和合同需要放慢半拍。"
    }
  ];

  const offset = seed % templates.length;
  return Array.from({ length: 5 }, (_, index) => {
    const year = startYear + index;
    return {
      year,
      annualPillar: getAnnualPillar(year),
      ...templates[(offset + index) % templates.length]
    };
  });
}
