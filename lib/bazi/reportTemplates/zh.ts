import type { AnnualHighlight } from "@/lib/bazi/rules/annualHighlights";
import type { LuckCycle } from "@/lib/bazi/rules/luckCycles";
import type { RelationshipProfile } from "@/lib/bazi/rules/relationshipProfile";
import type { BaziChart, BaziFocus, BaziFormData } from "@/lib/bazi/types";

export type BaziReportSections = {
  title: string;
  content: string;
}[];

export function buildZhReportSections(input: {
  birthInfo: BaziFormData;
  focus: BaziFocus;
  pillars: BaziChart;
  annualHighlights: AnnualHighlight[];
  relationshipProfile: RelationshipProfile;
  luckCycles: LuckCycle[];
  professionalView: string;
}): BaziReportSections {
  const { focus, pillars, annualHighlights, relationshipProfile, luckCycles, professionalView } = input;
  const firstWealthYear = annualHighlights.find((item) => item.tag.includes("财")) || annualHighlights[0];
  const firstLuck = luckCycles[0];

  return [
    {
      title: "命局总论",
      content: `日主为${pillars.dayMaster}，当前分析方向为「${focus}」。此盘先看四柱结构、十神落点和宫位，再结合关键年份与阶段趋势，不做绝对断语。`
    },
    {
      title: "性格底层",
      content: `命局中的十神组合显示，个人状态会受到${pillars.tenGods.slice(0, 4).join("、")}等主题影响。适合把优势放在长期积累、现实反馈和稳定行动上。`
    },
    {
      title: "事业方向",
      content: "事业上重点看月柱和官杀、印星、食伤的配合。若能借助平台、规则、专业能力和持续输出，更容易形成可见成果。"
    },
    {
      title: "财运结构",
      content: `${firstWealthYear.year}年为${firstWealthYear.tag}，财务机会与资源变现需要重点观察。建议先看现金流、合作规则和支出边界。`
    },
    {
      title: "感情婚姻",
      content: `桃花指数为${relationshipProfile.peachBlossomScore}，关系中要重视边界、承诺节奏和现实安排。感情不宜只看吸引力，也要看稳定相处能力。`
    },
    {
      title: "关键年份",
      content: annualHighlights.map((item) => `${item.year}${item.annualPillar}年：${item.tag}`).join("；")
    },
    {
      title: "十年大运趋势",
      content: firstLuck
        ? `当前基础大运阶段为${firstLuck.ageRange}，${firstLuck.pillar}，十神为${firstLuck.tenGod}，主题为${firstLuck.tag}。`
        : "大运趋势需要结合精确起运继续细看。"
    },
    {
      title: "命理师视角",
      content: professionalView
    },
    {
      title: "行动建议",
      content: "建议把命理结果作为传统文化参考，用来提升自我理解、选择节奏和行动质量，不作为医学、法律、投资或婚姻决策依据。"
    }
  ];
}
