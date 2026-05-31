export type FilterHit = {
  category: string;
  keyword: string;
};

const replacementRules: Array<{
  category: string;
  patterns: RegExp[];
  replacement: string;
}> = [
  {
    category: "死亡断言",
    patterns: [/必死/g, /死亡时间/g, /活不过/g, /寿命只到/g],
    replacement: "需要关注安全与身心状态，具体情况应以现实生活和专业意见为准"
  },
  {
    category: "疾病诊断",
    patterns: [/确诊[^，。；]*/g, /癌症/g, /绝症/g, /必得病/g, /重大疾病/g],
    replacement: "健康相关内容仅作一般提醒，如有不适应咨询正规医疗机构"
  },
  {
    category: "投资承诺",
    patterns: [/稳赚/g, /必赚/g, /暴富/g, /翻倍/g, /保本收益/g],
    replacement: "存在收益机会，但任何投资和经营决策都应审慎评估风险"
  },
  {
    category: "恐吓式转运",
    patterns: [/不化解就/g, /必须转运/g, /灾祸临头/g, /血光之灾/g],
    replacement: "建议以稳定心态和现实行动改善处境"
  },
  {
    category: "绝对化预测",
    patterns: [/一定会/g, /注定/g, /百分百/g, /绝对/g, /必然/g],
    replacement: "倾向于"
  },
  {
    category: "诱导购买法器",
    patterns: [/买法器/g, /开光物/g, /请符/g, /做法事/g],
    replacement: "可通过理性规划、沟通和行动调整节奏"
  },
  {
    category: "婚姻极端建议",
    patterns: [/必须离婚/g, /马上离婚/g, /必须分手/g, /断绝关系/g],
    replacement: "关系议题建议在充分沟通、尊重意愿和必要时寻求专业帮助后再决定"
  },
  {
    category: "自残相关建议",
    patterns: [/自杀/g, /自残/g, /轻生/g, /结束生命/g],
    replacement: "如果出现强烈痛苦或伤害自己的想法，请立即联系可信任的人或当地紧急援助"
  }
];

export function sanitizeGeneratedText(text: string) {
  const hits: FilterHit[] = [];
  let sanitized = text;

  for (const rule of replacementRules) {
    for (const pattern of rule.patterns) {
      const matches = sanitized.match(pattern);
      if (matches) {
        for (const keyword of matches) {
          hits.push({ category: rule.category, keyword });
        }
        sanitized = sanitized.replace(pattern, rule.replacement);
      }
    }
  }

  return {
    text: sanitized,
    hits
  };
}

export function buildSafetyPromptInstruction() {
  return [
    "合规安全要求：禁止输出死亡断言、疾病诊断、投资承诺、恐吓式转运、绝对化预测、诱导购买法器、婚姻极端建议、自残相关建议。",
    "如涉及健康、投资、法律、婚姻等重大决策，只能使用温和、参考性、非承诺式表达，并建议用户结合现实情况或咨询专业人士。"
  ].join("\n");
}

