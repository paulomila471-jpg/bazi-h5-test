import type { BaziChart, BaziFormData } from "./types";
import type { AnnualHighlight } from "./rules/annualHighlights";
import { generateAnnualHighlights } from "./rules/annualHighlights";
import { buildSafetyPromptInstruction } from "@/lib/compliance/contentFilter";
import { wechatId } from "@/lib/compliance/config";

function hasTenGod(chart: BaziChart, keywords: string[]) {
  return chart.tenGods.some((god) => keywords.some((keyword) => god.includes(keyword)));
}

function getStructure(chart: BaziChart) {
  const hasWealth = hasTenGod(chart, ["财", "璐"]);
  const hasOfficer = hasTenGod(chart, ["官", "杀", "瀹", "鏉"]);
  const hasSeal = hasTenGod(chart, ["印", "鍗"]);
  const hasOutput = hasTenGod(chart, ["食", "伤", "椋", "浼"]);

  if (hasWealth && hasOfficer) return "资源与规则并重，适合在平台、项目和稳定关系中逐步打开局面";
  if (hasSeal) return "重学习、资质、贵人和长期沉淀，适合先稳住基本盘";
  if (hasOutput) return "重表达、技术、作品和能力输出，适合把想法变成可见成果";
  return "自我驱动较强，适合通过持续积累和现实反馈慢慢形成优势";
}

function getCareerHint(chart: BaziChart) {
  if (hasTenGod(chart, ["官", "杀", "瀹", "鏉"])) {
    return "事业上更适合靠规则、职位、流程、平台和责任感建立信任，不宜只凭一时情绪做选择。";
  }
  if (hasTenGod(chart, ["财", "璐"])) {
    return "事业上可以多关注客户、资源、项目转化和现实回报，但要避免过早追求高风险变现。";
  }
  if (hasTenGod(chart, ["食", "伤", "椋", "浼"])) {
    return "事业上适合把表达、技术、内容、产品或手艺做成稳定输出，让别人看见你的价值。";
  }
  return "事业上宜先建立专业标签和稳定节奏，少做频繁切换，多做能沉淀经验的事情。";
}

function getRelationshipHint(chart: BaziChart) {
  const dayBranch = chart.day.branch;
  if (["子", "午", "卯", "酉"].includes(dayBranch)) {
    return "感情中容易被人际氛围、情绪互动和吸引力影响，适合慢一点确认关系质量。";
  }
  return "感情中更看重稳定感、现实配合和长期相处，不适合长期消耗或边界不清的关系。";
}

export function createBaziReportPrompt(
  form: BaziFormData,
  chart: BaziChart,
  annualHighlights: AnnualHighlight[] = generateAnnualHighlights({ birthInfo: form, focus: form.focus, pillars: chart })
) {
  return [
    "请生成一份中文八字免费体验版报告，长度控制在500-800字。",
    "结构固定：1. 命局基础气质 2. 性格优势 3. 性格短板 4. 事业方向简析 5. 感情模式简析 6. 未来一年提醒 7. 引导人工深度版。",
    "禁止输出完整大运、关键年份、配偶画像、详细财运年份。",
    buildSafetyPromptInstruction(),
    `用户问题：${form.question}`,
    `出生信息：${form.birthDate} ${form.birthTime}`,
    `性别：${form.gender === "male" ? "男" : "女"}`,
    `分析方向：${form.focus}`,
    `四柱：${chart.year.stem}${chart.year.branch} ${chart.month.stem}${chart.month.branch} ${chart.day.stem}${chart.day.branch} ${chart.hour.stem}${chart.hour.branch}`,
    `日主：${chart.dayMaster}`,
    `十神：${chart.tenGods.join("、")}`,
    `未来一年内部参考：${annualHighlights[0]?.tag || "稳步观察"}`
  ].join("\n");
}

export function createMockBaziReport(
  form: BaziFormData,
  chart: BaziChart,
  annualHighlights: AnnualHighlight[] = generateAnnualHighlights({ birthInfo: form, focus: form.focus, pillars: chart })
) {
  const pillars = `${chart.year.stem}${chart.year.branch}、${chart.month.stem}${chart.month.branch}、${chart.day.stem}${chart.day.branch}、${chart.hour.stem}${chart.hour.branch}`;
  const structure = getStructure(chart);
  const careerHint = getCareerHint(chart);
  const relationshipHint = getRelationshipHint(chart);
  const nextYearTheme = annualHighlights[0]?.tag || "稳定积累";

  return `一、命局基础气质
你的四柱为${pillars}，日主为${chart.dayMaster}。从基础结构看，你的命局倾向是：${structure}。免费体验版只看基础气质和当下倾向，不展开完整大运、关键年份和对象画像，因此更适合作为一个初步自我观察。

二、性格优势
你身上比较明显的优势，是愿意在现实里寻找秩序感，也会在压力中慢慢形成自己的判断。遇到重要事情时，你并不适合完全凭冲动推进，反而适合先观察局面、整理资源，再决定下一步。只要方向稳定，后续容易把经验变成可复用的方法。

三、性格短板
短板在于容易想得多、行动节奏忽快忽慢，有时会因为顾虑关系、结果或安全感而延迟选择。若外部环境变化较多，你可能会出现焦虑、反复比较或对自己要求过高的情况。建议先把目标拆小，用稳定行动降低内耗。

四、事业方向简析
${careerHint}如果你问的是事业或财运，当前更适合先看能力、资源和执行节奏是否匹配，不建议只追求快速结果。稳定的专业标签、可信赖的合作方式和持续输出，会比短期机会更重要。

五、感情模式简析
${relationshipHint}关系里需要注意沟通边界和期待管理。适合你的关系，不一定是强烈刺激型，而是能互相尊重节奏、愿意一起面对现实问题的人。免费版不展开配偶画像，只提示基础相处倾向。

六、未来一年提醒
未来一年可重点留意“${nextYearTheme}”这个主题。它不代表确定结果，而是提醒你在相应事项上更需要主动观察和稳妥处理。无论事业、感情还是财务，都建议先稳住基本盘，再做重要选择。

七、引导人工深度版
从你的命局结构看，真正影响后续变化的，不只是性格本身，而是大运切换、关键年份和感情/事业触发点。免费版只能看到基础倾向。如果你想进一步查看十年大运、关键年份、感情对象画像、近三年行动建议，可以添加微信 ${wechatId} 获取人工深度版。`;
}
