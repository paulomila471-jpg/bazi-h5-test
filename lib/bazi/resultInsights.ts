import type { AnnualHighlight } from "./rules/annualHighlights";
import type { BaziChart, BaziFocus } from "./types";

export type BaziOverview = {
  pattern: string;
  keywords: string[];
  lifeLine: string;
  currentFocus: string;
  conclusion: string;
};

export type KeyConclusion = {
  label: "事业" | "财运" | "感情" | "风险";
  text: string;
};

const nayinCycle = [
  "海中金",
  "炉中火",
  "大林木",
  "路旁土",
  "剑锋金",
  "山头火",
  "涧下水",
  "城头土",
  "白蜡金",
  "杨柳木",
  "泉中水",
  "屋上土"
];

const changshengCycle = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"];
const shaCycle = ["天乙", "文昌", "桃花", "驿马", "华盖", "将星", "禄神", "金舆"];

function textScore(text: string) {
  return Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function findHighlight(timeline: AnnualHighlight[], tag: string) {
  return timeline.find((item) => item.tag.includes(tag));
}

export function getPillarMeta(stem: string, branch: string) {
  const score = textScore(`${stem}${branch}`);

  return {
    nayin: nayinCycle[score % nayinCycle.length],
    changsheng: changshengCycle[score % changshengCycle.length],
    shensha: [shaCycle[score % shaCycle.length], shaCycle[(score + 3) % shaCycle.length]],
    relationHint: ["合局待成", "冲动有变", "刑害需缓", "气势平稳"][score % 4]
  };
}

export function createBaziOverview(chart: BaziChart, focus: BaziFocus): BaziOverview {
  const hasWealth = chart.tenGods.some((god) => god.includes("财"));
  const hasOfficer = chart.tenGods.some((god) => god.includes("官") || god.includes("杀"));
  const hasSeal = chart.tenGods.some((god) => god.includes("印"));
  const hasOutput = chart.tenGods.some((god) => god.includes("食") || god.includes("伤"));

  const pattern = hasWealth && hasOfficer
    ? "财官入局"
    : hasSeal
      ? "印星护身"
      : hasOutput
        ? "食伤生发"
        : "比劫成势";

  const keywords = [
    hasWealth ? "资源变现" : "能力积累",
    hasOfficer ? "平台规则" : "自我驱动",
    hasSeal ? "贵人与学习" : "长期信用",
    focus
  ];

  return {
    pattern,
    keywords,
    lifeLine: hasWealth || hasOfficer
      ? "事业靠平台与资源起势，中年后财运与身份感更明显。"
      : "人生主线偏向先立专业，再以作品、经验和信用打开局面。",
    currentFocus: `当前重点落在「${focus}」，宜先稳住结构，再放大优势。`,
    conclusion: hasWealth && hasOfficer
      ? "你的命局重点：事业财运强于早年，中年后机会更明显。"
      : "你的命局重点：专业积累会带来后劲，未来几年人际与合作机会会被触发。"
  };
}

export function createKeyConclusions(
  chart: BaziChart,
  focus: BaziFocus,
  timeline: AnnualHighlight[]
): KeyConclusion[] {
  const wealth = findHighlight(timeline, "财运");
  const romance = findHighlight(timeline, "桃花");
  const career = findHighlight(timeline, "事业");
  const risk = findHighlight(timeline, "风险");
  const hasOfficer = chart.tenGods.some((god) => god.includes("官") || god.includes("杀"));
  const hasWealth = chart.tenGods.some((god) => god.includes("财"));

  return [
    {
      label: "事业",
      text: career
        ? `${career.year} ${career.annualPillar}年事业变化明显，适合依托平台、规则、资源型项目，不宜完全单打独斗。`
        : hasOfficer
          ? "事业适合借平台、规则和责任感起势，越能承担关键任务，越容易被看见。"
          : "事业更依赖专业作品与持续输出，先建立可复用能力，再争取位置。"
    },
    {
      label: "财运",
      text: wealth
        ? `${wealth.year} ${wealth.annualPillar}年财运启动，适合谈合作、优化项目变现和现金流。`
        : hasWealth
          ? "财运来自资源调度与现实回报，重点在预算、渠道和可复制收入。"
          : "财运先从能力产品化开始，短期不宜追逐过高风险收益。"
    },
    {
      label: "感情",
      text: romance
        ? `${romance.year} ${romance.annualPillar}年桃花较旺，但要注意关系边界和承诺清晰。`
        : "感情更看重稳定感与现实匹配，不适合长期消耗型关系。"
    },
    {
      label: "风险",
      text: risk
        ? `${risk.year} ${risk.annualPillar}年压力较明显，重大支出、合伙和合同需谨慎。`
        : `围绕「${focus}」要减少冲动决策，先定规则，再放大机会。`
    }
  ];
}

export function createSummary(content: string, maxLength = 160) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const slice = normalized.slice(0, maxLength);
  const punctuationIndex = Math.max(slice.lastIndexOf("。"), slice.lastIndexOf("；"), slice.lastIndexOf("，"));
  return `${slice.slice(0, punctuationIndex > 90 ? punctuationIndex + 1 : maxLength)}...`;
}

export function splitReportSections(report: string) {
  const aliases = [
    ["命局总论", ["一、命局总论", "命局总论"]],
    ["性格底层", ["二、性格底层", "性格底层"]],
    ["事业方向", ["三、事业方向", "事业方向"]],
    ["财运结构", ["四、财运结构", "财运结构"]],
    ["感情婚姻", ["五、感情婚姻", "感情婚姻"]],
    ["感情与对象画像", ["六、感情与对象画像", "感情与对象画像"]],
    ["关键年份", ["七、关键年份", "六、关键年份", "六、未来趋势", "未来趋势", "关键年份"]],
    ["十年大运趋势", ["八、十年大运趋势", "十年大运趋势"]],
    ["风险提醒", ["九、风险提醒", "七、风险提醒", "风险提醒"]],
    ["行动建议", ["十、行动建议", "八、行动建议", "七、行动建议", "行动建议"]],
    ["命理师视角", ["十一、命理师视角", "九、命理师视角", "命理师视角"]]
  ] as const;

  const normalized = report.replace(/\r\n/g, "\n").trim();
  const positions = aliases
    .map(([title, heads]) => {
      const found = heads
        .map((head) => ({ head, index: normalized.indexOf(head) }))
        .filter((item) => item.index >= 0)
        .sort((a, b) => a.index - b.index)[0];
      return found ? { title, head: found.head, index: found.index } : null;
    })
    .filter(Boolean) as Array<{ title: string; head: string; index: number }>;

  if (positions.length < 2) {
    return aliases.map(([title]) => ({
      title,
      content: title === "关键年份" ? "未来五年的关键节点请参考上方时间线。" : normalized
    }));
  }

  return positions.map((item, index) => {
    const next = positions[index + 1];
    const raw = normalized.slice(item.index + item.head.length, next?.index).trim();
    return {
      title: item.title,
      content: raw || "此项需要结合完整大运流年进一步细看。"
    };
  });
}
