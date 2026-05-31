import type { AnnualHighlight } from "@/lib/bazi/rules/annualHighlights";
import type { LuckCycle } from "@/lib/bazi/rules/luckCycles";
import type { RelationshipProfile } from "@/lib/bazi/rules/relationshipProfile";
import type { BaziChart, BaziFocus, BaziReportRecord, Pillar } from "@/lib/bazi/types";

export type EnglishFocus = "General" | "Career" | "Wealth" | "Love" | "Key Years";

export const englishFocusOptions: EnglishFocus[] = ["General", "Career", "Wealth", "Love", "Key Years"];

export const englishFocusToBaziFocus: Record<EnglishFocus, BaziFocus> = {
  General: "综合",
  Career: "事业",
  Wealth: "财运",
  Love: "感情",
  "Key Years": "流年"
};

export const baziFocusToEnglish: Record<BaziFocus, EnglishFocus> = {
  综合: "General",
  事业: "Career",
  财运: "Wealth",
  感情: "Love",
  流年: "Key Years"
};

const stems: Record<string, string> = {
  甲: "Jia Wood",
  乙: "Yi Wood",
  丙: "Bing Fire",
  丁: "Ding Fire",
  戊: "Wu Earth",
  己: "Ji Earth",
  庚: "Geng Metal",
  辛: "Xin Metal",
  壬: "Ren Water",
  癸: "Gui Water"
};

const branches: Record<string, string> = {
  子: "Zi Rat",
  丑: "Chou Ox",
  寅: "Yin Tiger",
  卯: "Mao Rabbit",
  辰: "Chen Dragon",
  巳: "Si Snake",
  午: "Wu Horse",
  未: "Wei Goat",
  申: "Shen Monkey",
  酉: "You Rooster",
  戌: "Xu Dog",
  亥: "Hai Pig"
};

const tenGods: Record<string, string> = {
  正印: "Direct Resource",
  偏印: "Indirect Resource",
  正官: "Direct Officer",
  七杀: "Seven Killings / Pressure Star",
  正财: "Direct Wealth",
  偏财: "Indirect Wealth",
  比肩: "Peer",
  劫财: "Rob Wealth / Competition",
  食神: "Eating God / Creative Output",
  伤官: "Hurting Officer / Expressive Output"
};

const yearTags: Record<string, string> = {
  财运启动: "Wealth Activation",
  桃花较旺: "Romantic Attraction",
  事业变化: "Career Shift",
  稳定积累: "Steady Building",
  风险提醒: "Caution Year"
};

export function createEnglishReportId() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `ENBZ${date}-${random}`;
}

export function translateStem(stem: string) {
  return stems[stem] || stem;
}

export function translateBranch(branch: string) {
  return branches[branch] || branch;
}

export function translateTenGod(tenGod: string) {
  return tenGods[tenGod] || "Life Theme";
}

export function formatPillar(pillar: Pick<Pillar, "stem" | "branch">) {
  return `${translateStem(pillar.stem)} ${translateBranch(pillar.branch)}`;
}

export function translateYearTag(tag: string) {
  return yearTags[tag] || "Key Year";
}

function translateLevel(level: AnnualHighlight["level"]) {
  if (level === "重点") return "Important";
  if (level === "提醒") return "Caution";
  return "Steady";
}

export function createEnglishOverview(chart: BaziChart, focus: BaziFocus) {
  const hasWealth = chart.tenGods.some((god) => god.includes("财"));
  const hasOfficer = chart.tenGods.some((god) => god.includes("官") || god.includes("杀"));
  const hasOutput = chart.tenGods.some((god) => god.includes("食") || god.includes("伤"));
  const hasResource = chart.tenGods.some((god) => god.includes("印"));
  const keywords = [
    hasWealth ? "resource and monetization" : "skill-based growth",
    hasOfficer ? "structure and responsibility" : "self-directed path",
    hasOutput ? "expression and output" : "steady accumulation",
    hasResource ? "learning and support" : "action-led development"
  ];

  return {
    title: `Your Day Master is ${translateStem(chart.dayMaster)}.`,
    pattern: hasWealth && hasOfficer
      ? "This chart leans toward building through platforms, resources, and responsibility."
      : hasOutput
        ? "This chart leans toward skill expression, creative output, and self-made results."
        : "This chart favors steady development, practical choices, and long-term accumulation.",
    focus: baziFocusToEnglish[focus],
    keywords
  };
}

export function createEnglishKeyInsights(input: {
  chart: BaziChart;
  focus: BaziFocus;
  annualHighlights: AnnualHighlight[];
  relationship: RelationshipProfile;
}) {
  const { chart, focus, annualHighlights, relationship } = input;
  const wealthYear = annualHighlights.find((item) => item.tag.includes("财")) || annualHighlights[0];
  const cautionYear = annualHighlights.find((item) => item.level === "提醒") || annualHighlights[2];

  return [
    `Career: ${chart.tenGods.some((god) => god.includes("官") || god.includes("杀")) ? "You benefit from structure, responsibility, and recognized roles." : "You may grow better through skill, output, and flexible opportunities."}`,
    `Wealth: ${wealthYear.year} looks like an important money-related year, especially for resources, projects, or monetization decisions.`,
    `Love: your Peach Blossom Score is ${relationship.peachBlossomScore}, suggesting ${relationship.peachBlossomScore >= 65 ? "noticeable attraction and relationship triggers" : "a slower but more stable relationship rhythm"}.`,
    `Caution: ${cautionYear.year} should be handled with more patience around spending, pressure, and relationship boundaries.`
  ].slice(0, focus === "综合" ? 4 : 3);
}

export function translateAnnualHighlight(item: AnnualHighlight) {
  const base = {
    year: item.year,
    pillar: formatPillar({ stem: item.annualPillar.slice(0, 1), branch: item.annualPillar.slice(1, 2) }),
    tag: translateYearTag(item.tag),
    level: translateLevel(item.level)
  };

  if (item.tag.includes("财")) {
    return {
      ...base,
      description: "Money and resource opportunities may become more visible. Focus on income structure, collaboration terms, and practical monetization.",
      action: "Clarify pricing, budgets, and partnership boundaries before scaling."
    };
  }
  if (item.tag.includes("桃花")) {
    return {
      ...base,
      description: "Romantic attraction, social attention, and relationship choices may increase. This is useful for connection, but boundaries matter.",
      action: "Move slowly, confirm intentions, and avoid unclear emotional situations."
    };
  }
  if (item.tag.includes("事业")) {
    return {
      ...base,
      description: "Career position, platform rules, or responsibility may shift. This can be a chance to step into a clearer role.",
      action: "Choose whether to actively compete or wait based on the quality of the opportunity."
    };
  }
  if (item.tag.includes("风险")) {
    return {
      ...base,
      description: "Pressure, extra spending, or relationship friction may appear. Contracts and shared money require extra care.",
      action: "Avoid impulsive financial decisions and slow down major commitments."
    };
  }
  return {
    ...base,
    description: "This year favors steady building, skill improvement, and organizing long-term resources.",
    action: "Focus on consistency, credibility, and converting stability into real outcomes."
  };
}

function translateLuckTag(tag: string) {
  if (tag.includes("财")) return "Wealth Growth Phase";
  if (tag.includes("事业")) return "Career Rising Phase";
  if (tag.includes("贵人")) return "Support & Learning Phase";
  if (tag.includes("合作")) return "Partnership Change Phase";
  if (tag.includes("压力")) return "Adjustment Phase";
  if (tag.includes("突破")) return "Breakthrough Phase";
  if (tag.includes("稳定")) return "Stabilizing Phase";
  return "Development Phase";
}

export function translateLuckCycle(cycle: LuckCycle) {
  const tenGod = translateTenGod(cycle.tenGod);
  return {
    ageRange: cycle.ageRange.replace("岁", ""),
    pillar: formatPillar({ stem: cycle.pillar.slice(0, 1), branch: cycle.pillar.slice(1, 2) }),
    tenGod,
    score: cycle.score,
    tag: translateLuckTag(cycle.tag),
    career: tenGod.includes("Officer")
      ? "Career growth comes through responsibility, rules, titles, and formal platforms."
      : tenGod.includes("Wealth")
        ? "Career growth is tied to clients, resources, business opportunities, and monetization."
        : tenGod.includes("Resource")
          ? "Career growth favors learning, credentials, mentors, and deeper professional foundations."
          : tenGod.includes("Output")
            ? "Career growth comes from expression, technical ability, content, products, or visible work."
            : "Career growth involves peers, networks, competition, teamwork, and independent choices.",
    wealth: tenGod.includes("Wealth")
      ? "Wealth opportunities are stronger, but partnership terms and spending discipline matter."
      : "Wealth improves through stable skill-building and careful resource management.",
    love: tenGod.includes("Officer")
      ? "For women, relationship opportunities may be more visible; for men, responsibility in relationships increases."
      : tenGod.includes("Wealth")
        ? "For men, relationship opportunities may increase; for women, practical standards become clearer."
        : "Relationships require clearer communication and more patience during this phase.",
    risk: cycle.score < 65 ? "Avoid rushing, overcommitting, or making emotional financial decisions." : "The phase is usable, but boundaries and timing still matter.",
    advice: cycle.advice.replace(/第\d+步运/g, "This phase")
  };
}

export function createEnglishRelationshipSummary(relationship: RelationshipProfile) {
  const score = relationship.peachBlossomScore;
  return {
    peachType: score >= 78 ? "strong romantic attraction" : score >= 62 ? "good social and romantic visibility" : score >= 48 ? "moderate attraction with slow development" : "slow-burning relationship pattern",
    spouseProfile:
      "A suitable partner is likely to value stability, emotional steadiness, and practical planning. The exact profile should be read together with the Day Branch and relationship timing.",
    suitablePartners: score >= 62
      ? ["emotionally stable", "long-term minded", "clear with boundaries", "practical and reliable"]
      : ["patient", "consistent", "respectful of personal rhythm", "willing to build trust slowly"],
    unsuitablePartners: ["emotionally chaotic", "financially impulsive", "unclear with commitment", "overly controlling"],
    attractedTypes: ["goal-oriented people", "people seeking emotional support", "people who value stability", "people attracted to your inner drive"],
    advice: "Keep boundaries clear, confirm expectations early, and avoid confusing chemistry with long-term compatibility."
  };
}

export function buildEnglishFreeReport(record: BaziReportRecord) {
  const chart = record.pillars;
  const overview = createEnglishOverview(chart, record.focus);
  return [
    "1. Core Life Pattern",
    `${overview.title} ${overview.pattern}`,
    "",
    "2. Personality & Inner Drive",
    "Your chart suggests a mix of inner motivation, practical judgment, and life themes that become clearer through responsibility, skill-building, and relationship choices.",
    "",
    "3. Career Direction",
    chart.tenGods.some((god) => god.includes("官") || god.includes("杀"))
      ? "Career development benefits from structure, clear rules, formal roles, and trusted platforms."
      : "Career development may come through flexible opportunities, visible output, and building a personal skill base.",
    "",
    "4. Wealth Timing",
    chart.tenGods.some((god) => god.includes("财"))
      ? "Wealth themes are visible in the chart, but timing and partnership terms matter more than quick decisions."
      : "Wealth is more likely to come from ability, consistency, and turning skills into practical value.",
    "",
    "5. Love & Relationship Pattern",
    "Relationships should be approached with clear boundaries and realistic expectations. Attraction is useful, but stable communication matters more.",
    "",
    "6. Key Years Ahead",
    "Some upcoming years may activate money, love, or career changes. The free preview only shows the first layer of timing.",
    "",
    "7. Practical Advice",
    "Use this reading as cultural and personal reference. Avoid absolute predictions; focus on better timing, clearer choices, and steadier action."
  ].join("\n");
}

export function buildEnglishFullReport(input: {
  record: BaziReportRecord;
  annualHighlights: AnnualHighlight[];
  luckCycles: LuckCycle[];
  relationship: RelationshipProfile;
  professionalView: string;
}) {
  const { record, annualHighlights, luckCycles, relationship, professionalView } = input;
  const chart = record.pillars;
  const overview = createEnglishOverview(chart, record.focus);
  const relation = createEnglishRelationshipSummary(relationship);
  const years = annualHighlights.map(translateAnnualHighlight);
  const cycles = luckCycles.map(translateLuckCycle);

  return [
    "1. Core Life Pattern",
    `${overview.title} ${overview.pattern} The main focus of this reading is ${overview.focus}.`,
    "",
    "2. Personality & Inner Drive",
    `Key themes: ${overview.keywords.join(", ")}. These themes describe how your chart tends to respond to pressure, opportunity, relationships, and long-term growth.`,
    "",
    "3. Career Direction",
    cycles[0]?.career || "Career direction should be built through consistent output and clear positioning.",
    "",
    "4. Wealth Timing",
    years.find((item) => item.tag.includes("Wealth"))?.description || "Wealth timing is best handled through steady planning and practical decisions.",
    "",
    "5. Love & Relationship Pattern",
    `${relation.peachType}. ${relation.advice}`,
    "",
    "6. Key Years Ahead",
    years.map((item) => `${item.year} ${item.pillar}: ${item.tag}. ${item.description} ${item.action}`).join("\n"),
    "",
    "7. 10-Year Luck Cycles",
    cycles.map((item) => `${item.ageRange}: ${item.pillar}, ${item.tenGod}, ${item.tag}, score ${item.score}. Career: ${item.career} Wealth: ${item.wealth} Love: ${item.love}`).join("\n"),
    "",
    "8. Best Partner Type",
    `Best suited types: ${relation.suitablePartners.join(", ")}. Less suitable types: ${relation.unsuitablePartners.join(", ")}. You may attract ${relation.attractedTypes.join(", ")}.`,
    "",
    "9. Practical Advice",
    "Treat this as an Eastern cultural reading and personal reflection tool, not as medical, legal, investment, or marriage advice. The best use is to improve timing, self-awareness, and decision quality.",
    "",
    "Professional BaZi Notes",
    professionalView
      .replace(/日主/g, "Day Master")
      .replace(/四柱/g, "Four Pillars")
      .replace(/十神/g, "Ten Gods")
      .replace(/藏干/g, "Hidden Stems")
      .replace(/夫妻宫/g, "Relationship Palace")
  ].join("\n");
}
