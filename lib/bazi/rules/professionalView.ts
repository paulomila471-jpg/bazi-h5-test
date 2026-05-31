import type { BaziChart, BaziFormData } from "../types";
import { generateLuckCycles } from "./luckCycles";
import { palaceRules } from "./palaces";
import { getTenGodRule } from "./tenGods";

const positions = [
  ["year", "年柱"],
  ["month", "月柱"],
  ["day", "日柱"],
  ["hour", "时柱"]
] as const;

function cleanText(text: string) {
  return text.replace(/。{2,}/g, "。").replace(/，{2,}/g, "，").trim();
}

export function generateProfessionalView(input: {
  form: BaziFormData;
  pillars: BaziChart;
}) {
  const { form, pillars } = input;
  const luckCycles = generateLuckCycles({ form, pillars, count: 1 });
  const currentLuck = luckCycles[0];
  const currentLuckRule = currentLuck ? getTenGodRule(currentLuck.tenGod) : null;
  const pillarLines = positions.map(([key, label]) => {
    const pillar = pillars[key];
    const palace = palaceRules[key];
    const rule = getTenGodRule(pillar.tenGod);
    return cleanText(
      `${label}${pillar.stem}${pillar.branch}，十神为${pillar.tenGod}，藏干${pillar.hiddenStems.join("、")}，落在${palace.lifeArea}，主象为${rule?.meaning || "对应人事关系与阶段主题"}。`
    );
  });

  const dayBranch = pillars.day.branch;
  const hasWealth = pillars.tenGods.some((god) => god.includes("财"));
  const hasOfficer = pillars.tenGods.some((god) => god.includes("官") || god.includes("杀"));
  const hasSeal = pillars.tenGods.some((god) => god.includes("印"));
  const hasOutput = pillars.tenGods.some((god) => god.includes("食") || god.includes("伤"));
  const hasPeer = pillars.tenGods.some((god) => god.includes("比") || god.includes("劫"));

  const structure = [
    hasWealth ? "财星有象，资源、现金流和现实回报需要重点观察" : "财星不显时，财富多从能力沉淀后转出",
    hasOfficer ? "官杀入局，平台、规则、职位和压力是命局的重要触发点" : "官杀不重，事业更依赖自我驱动与机会选择",
    hasSeal ? "印星参与，学习、贵人、资质和长期信用能护住命局" : "印星不重，遇事更要靠执行和现实反馈校正",
    hasOutput ? "食伤可见，表达、技术、作品和方案能力是出口" : "食伤不重，表达与产品化能力需要后天加强",
    hasPeer ? "比劫参与，同辈、朋友、合伙和竞争会带来机会也带来分耗" : "比劫不重，合作压力相对可控"
  ].join("；");

  const luckLine = currentLuck
    ? `当前基础版大运取象为${currentLuck.pillar}，十神为${currentLuck.tenGod}，主象为${currentLuckRule?.meaning || currentLuck.tag}。此阶段重点看${currentLuck.tag}，风险点为：${currentLuck.risk}`
    : "当前大运需要结合精确起运时间进一步细看。";

  return [
    `日主为${pillars.dayMaster}，以日干为主观察全局。当前分析方向为「${form.focus}」。`,
    `四柱读象：${pillarLines.join(" ")}`,
    `夫妻宫落${dayBranch}，感情与核心关系要结合日支藏干、十神和冲合触发来看。时柱${pillars.hour.stem}${pillars.hour.branch}为后势，代表长期结果、下属子女与未来发展。`,
    `从财官印食伤比劫看：${structure}。`,
    luckLine,
    "初步制用提示：第一版先以日主承载、月柱事业平台和十神落宫取象，不做强弱绝对断语。",
    "宾主与墓库提示：天干外显为主，地支藏干为宾。当地支藏干多而不透时，代表资源有封存与延迟，需要靠年份触发、行动和现实选择打开。"
  ].map(cleanText).join("\n");
}
