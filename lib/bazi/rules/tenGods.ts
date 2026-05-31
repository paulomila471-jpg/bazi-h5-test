export type TenGodRule = {
  name: string;
  meaning: string;
  personality: string;
  career: string;
  wealth: string;
  relationship: string;
  downside: string;
  appExpression: string;
};

export const tenGodRules: Record<string, TenGodRule> = {
  正印: {
    name: "正印",
    meaning: "保护、学习、贵人、资质与稳定资源。",
    personality: "重安全感，愿意吸收知识，做事偏稳。",
    career: "适合教育、研究、咨询、文职和专业资质型岗位。",
    wealth: "财来得偏稳，适合靠专业信用长期积累。",
    relationship: "重照顾与信任，但表达偏慢热。",
    downside: "容易依赖、保守、行动慢。",
    appExpression: "优势在学习力、稳定度和贵人资源，适合先建立专业可信度。"
  },
  偏印: {
    name: "偏印",
    meaning: "灵感、偏门知识、独立思维与非标准资源。",
    personality: "敏感、洞察强，喜欢研究和独处。",
    career: "适合策划、技术、玄学、心理、内容和非标服务。",
    wealth: "适合以认知差、专业差异化变现。",
    relationship: "需要精神理解，不喜欢被过度控制。",
    downside: "容易多疑、孤立、想太多。",
    appExpression: "适合走差异化路线，但要把灵感沉淀为稳定产品或方法。"
  },
  正官: {
    name: "正官",
    meaning: "规则、职位、平台、责任与名誉。",
    personality: "重秩序，讲边界，愿意承担责任。",
    career: "适合组织平台、管理、合规、行政和专业体系。",
    wealth: "财随职位、平台、信用和稳定合作而来。",
    relationship: "重承诺，偏向稳定关系。",
    downside: "压力感强，怕犯错，容易被规则束缚。",
    appExpression: "事业适合借平台起势，越能承担责任，越容易得到机会。"
  },
  七杀: {
    name: "七杀",
    meaning: "压力、竞争、权力、挑战与执行力。",
    personality: "反应快，抗压强，遇事有冲劲。",
    career: "适合竞争行业、销售、管理、创业和项目攻坚。",
    wealth: "财随风险和决断而来，但波动也大。",
    relationship: "容易吸引强势或行动力强的人。",
    downside: "急躁、压迫感强，容易冲动决策。",
    appExpression: "有破局能力，但需要规则和节奏来驾驭压力。"
  },
  正财: {
    name: "正财",
    meaning: "稳定收入、现实资源、预算与务实关系。",
    personality: "务实，重结果，重生活秩序。",
    career: "适合财务、运营、交易、管理和稳定业务。",
    wealth: "适合稳健积累，重现金流和预算。",
    relationship: "重责任、生活安排与现实匹配。",
    downside: "容易计较、保守，被现实压力牵制。",
    appExpression: "财运更适合从稳定业务、预算管理和长期复利中打开。"
  },
  偏财: {
    name: "偏财",
    meaning: "流动财富、机会、人脉、市场与资源整合。",
    personality: "外向、灵活，重机会和资源调动。",
    career: "适合商业、销售、投资、渠道和资源整合。",
    wealth: "机会型收入明显，但必须控制风险。",
    relationship: "缘分活跃，人际吸引力较强。",
    downside: "花费大，贪多，容易投机。",
    appExpression: "适合主动争取资源，但财富要靠规则承接。"
  },
  比肩: {
    name: "比肩",
    meaning: "自我、同辈、竞争者与独立性。",
    personality: "自主，坚持，有主见。",
    career: "适合独立负责、专业岗位和边界清楚的合伙。",
    wealth: "靠个人能力赚钱，也容易因竞争分财。",
    relationship: "需要平等关系，不喜欢被压制。",
    downside: "固执、争强、合作摩擦。",
    appExpression: "要把独立性变成专业能力，而不是无谓对抗。"
  },
  劫财: {
    name: "劫财",
    meaning: "竞争、朋友、合伙、破财与行动力。",
    personality: "讲义气，冲劲强，容易被人情牵动。",
    career: "适合团队攻坚、销售和合伙项目，但要控边界。",
    wealth: "有赚钱冲动，也有破财风险。",
    relationship: "容易出现争夺、外界干扰或情绪冲动。",
    downside: "冲动消费、被朋友拖累、合伙纠纷。",
    appExpression: "合作能带来机会，但钱和责任必须提前说清。"
  },
  食神: {
    name: "食神",
    meaning: "表达、作品、享受、稳定输出与福气。",
    personality: "温和，有审美，适合持续产出。",
    career: "适合内容、教育、产品、餐饮、设计和表达型工作。",
    wealth: "财来自作品、技能和稳定输出。",
    relationship: "相处感舒适，重生活质量。",
    downside: "懒散、拖延、缺少冲刺。",
    appExpression: "机会在持续输出和作品沉淀，不宜只停在想法。"
  },
  伤官: {
    name: "伤官",
    meaning: "才华、表达、突破规则、技术锋芒。",
    personality: "聪明、直接、有批判力。",
    career: "适合创意、技术、表达、咨询和创新业务。",
    wealth: "财来自差异化能力和市场表达。",
    relationship: "吸引力强，但容易言语尖锐。",
    downside: "叛逆、得罪权威、情绪化表达。",
    appExpression: "有突破能力，但要把锋芒变成可交付的价值。"
  }
};

export function getTenGodRule(name: string) {
  return tenGodRules[name];
}
