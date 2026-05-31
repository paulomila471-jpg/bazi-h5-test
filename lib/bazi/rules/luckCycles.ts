import type { BaziChart, BaziFocus, BaziFormData } from "../types";

export type LuckCycle = {
  ageRange: string;
  pillar: string;
  tenGod: string;
  score: number;
  tag: string;
  career: string;
  wealth: string;
  love: string;
  risk: string;
  advice: string;
};

const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const cycle60 = Array.from({ length: 60 }, (_, index) => `${stems[index % 10]}${branches[index % 12]}`);

const stemElements: Record<string, { element: string; polarity: "yang" | "yin" }> = {
  甲: { element: "wood", polarity: "yang" },
  乙: { element: "wood", polarity: "yin" },
  丙: { element: "fire", polarity: "yang" },
  丁: { element: "fire", polarity: "yin" },
  戊: { element: "earth", polarity: "yang" },
  己: { element: "earth", polarity: "yin" },
  庚: { element: "metal", polarity: "yang" },
  辛: { element: "metal", polarity: "yin" },
  壬: { element: "water", polarity: "yang" },
  癸: { element: "water", polarity: "yin" }
};

const elementOrder = ["wood", "fire", "earth", "metal", "water"];

function scoreText(text: string) {
  return Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function clamp(value: number) {
  return Math.max(35, Math.min(96, value));
}

function nextPillar(basePillar: string, offset: number) {
  const baseIndex = cycle60.indexOf(basePillar);
  const start = baseIndex >= 0 ? baseIndex : scoreText(basePillar) % 60;
  return cycle60[(start + offset + 60) % 60];
}

function getTenGod(dayStem: string, luckStem: string) {
  const day = stemElements[dayStem];
  const other = stemElements[luckStem];
  if (!day || !other) return "比肩";

  const samePolarity = day.polarity === other.polarity;
  if (day.element === other.element) return samePolarity ? "比肩" : "劫财";

  const dayIndex = elementOrder.indexOf(day.element);
  const producedByDay = elementOrder[(dayIndex + 1) % 5];
  const controlledByDay = elementOrder[(dayIndex + 2) % 5];
  const controlsDay = elementOrder[(dayIndex + 3) % 5];
  const producesDay = elementOrder[(dayIndex + 4) % 5];

  if (other.element === producedByDay) return samePolarity ? "食神" : "伤官";
  if (other.element === controlledByDay) return samePolarity ? "偏财" : "正财";
  if (other.element === controlsDay) return samePolarity ? "七杀" : "正官";
  if (other.element === producesDay) return samePolarity ? "偏印" : "正印";

  return "比肩";
}

function groupOf(tenGod: string) {
  if (tenGod === "正官" || tenGod === "七杀") return "officer";
  if (tenGod === "正财" || tenGod === "偏财") return "wealth";
  if (tenGod === "正印" || tenGod === "偏印") return "seal";
  if (tenGod === "食神" || tenGod === "伤官") return "output";
  return "peer";
}

function ageTheme(startAge: number) {
  if (startAge <= 17) return "家庭、学习、性格基础";
  if (startAge <= 27) return "学习、试错、起步、人际";
  if (startAge <= 37) return "事业起势、婚恋选择、资源积累";
  if (startAge <= 47) return "事业财运主战场、家庭责任、身份提升";
  if (startAge <= 57) return "资源整合、守成、管理、资产稳定";
  if (startAge <= 67) return "晚年规划、身心状态、子女关系";
  return "健康、家庭、精神生活、传承";
}

function focusBonus(focus: BaziFocus, group: string, gender: BaziFormData["gender"]) {
  if (focus === "财运") return group === "wealth" ? 14 : group === "output" ? 8 : group === "officer" ? 5 : 0;
  if (focus === "事业") return group === "officer" ? 14 : group === "seal" ? 10 : group === "output" ? 6 : 0;
  if (focus === "感情") {
    if (gender === "female" && group === "officer") return 14;
    if (gender === "male" && group === "wealth") return 14;
    return group === "peer" ? -6 : 4;
  }
  if (focus === "流年") return 5;
  return group === "wealth" || group === "officer" || group === "seal" ? 7 : 4;
}

function scoreLabel(score: number, group: string, ageStart: number) {
  if (score < 60) return "压力调整期";
  if (score < 70) return ageStart >= 58 ? "身心修整期" : "学习积累期";
  if (score < 80) {
    if (group === "wealth") return "资源整合期";
    if (group === "officer") return "事业起势期";
    if (group === "seal") return "贵人助力期";
    if (group === "peer") return "合作变动期";
    return "转型突破期";
  }
  if (score < 90) {
    if (group === "wealth") return "财运增强期";
    if (group === "officer") return "事业起势期";
    if (group === "output") return "转型突破期";
    if (group === "peer") return "合作变动期";
    return "稳定守成期";
  }
  if (ageStart >= 38 && ageStart <= 57) return "稳定收获期";
  return "重点上升期";
}

function branchTheme(branch: string) {
  const themes: Record<string, string> = {
    子: "信息、人脉流动和隐藏机会",
    丑: "资产沉淀、责任绑定和慢变量",
    寅: "开拓、学习升级和新方向启动",
    卯: "关系、人际曝光和审美表达",
    辰: "资源盘整、项目蓄水和旧事重启",
    巳: "执行加速、技术输出和竞争升温",
    午: "曝光、表达、名声和情绪热度",
    未: "家庭责任、长期规划和资源收拢",
    申: "规则变化、流动机会和跨界连接",
    酉: "结果兑现、审美标准和合作筛选",
    戌: "管理、收尾、资产安全和压力测试",
    亥: "远方资源、学习转向和内在修整"
  };
  return themes[branch] || "阶段主题变化";
}

function narratives(input: {
  tenGod: string;
  group: string;
  gender: BaziFormData["gender"];
  ageStart: number;
  ageThemeText: string;
  focus: BaziFocus;
  index: number;
  branch: string;
}) {
  const { tenGod, group, gender, ageStart, ageThemeText, focus, index, branch } = input;
  const agePrefix = `这个阶段的人生主题偏向${ageThemeText}，`;
  const branchLine = `大运地支${branch}带出${branchTheme(branch)}，`;
  const ageRisk = ageStart <= 17
    ? "也要注意家庭期待、学习压力和性格定型带来的影响。"
    : ageStart <= 27
      ? "同时要注意试错成本、人际选择和方向频繁摇摆。"
      : ageStart <= 37
        ? "同时要处理婚恋选择、职业定位和资源积累之间的平衡。"
        : ageStart <= 47
          ? "同时要注意家庭责任、事业压力和身份转换的叠加。"
          : ageStart <= 57
            ? "同时要关注资产稳定、管理边界和身体精力分配。"
            : "同时要把身心状态、家庭关系和长期生活质量放在前面。";

  if (group === "officer") {
    const officerTone = tenGod === "七杀"
      ? "竞争、压力、攻坚和快速决断会更明显"
      : "规则、职位、名誉和稳定责任会更明显";
    return {
      career: `${agePrefix}${branchLine}${tenGod}大运中${officerTone}，适合争取更正式的平台身份和可被认可的成果。`,
      wealth: "财运更适合依托平台、职位、证书或稳定业务变现，不宜脱离规则做高风险尝试。",
      love: gender === "female"
        ? "女命在官杀大运中感情机会增强，更容易遇到有责任感或事业目标明确的人。"
        : "男命在官杀大运中责任感增强，关系里更容易讨论承诺、家庭安排和现实压力。",
      risk: `${tenGod === "七杀" ? "风险在压力过猛、冲动应战、竞争关系和权责冲突。" : "风险在规则约束、合同合规、上级关系和名誉压力。"}${ageRisk}`,
      advice: focus === "事业" ? "把责任变成职位和成果，主动建立规则感。" : "先守规则再求突破，避免情绪化对抗制度。"
    };
  }

  if (group === "wealth") {
    const wealthTone = tenGod === "偏财"
      ? "市场机会、人脉资源和弹性收入更活跃"
      : "稳定收入、预算秩序和现实回报更突出";
    return {
      career: `${agePrefix}${branchLine}${tenGod}大运里${wealthTone}，适合做资源整合和结果导向的业务。`,
      wealth: tenGod === "偏财"
        ? "财运机会感更强，适合谈渠道、客户和项目分成，但要控节奏。"
        : "财运更重稳定现金流，适合优化预算、定价和长期客户结构。",
      love: gender === "male"
        ? "男命在财星大运中感情机会增强，现实择偶意识和伴侣议题更明显。"
        : "女命在财星大运中更看重现实稳定、生活品质和关系里的资源匹配。",
      risk: `${tenGod === "偏财" ? "风险在投资冲动、机会过多、朋友牵线和利益分配不清。" : "风险在现金流保守、现实压力、家庭开支和预算失衡。"}${ageRisk}`,
      advice: focus === "财运" ? "先定预算和分账规则，再放大项目收益。" : "抓住资源机会，但不要用短期收益替代长期结构。"
    };
  }

  if (group === "seal") {
    const sealTone = tenGod === "偏印"
      ? "非标认知、灵感、研究和差异化能力更明显"
      : "证书、贵人、体系学习和稳定背书更明显";
    return {
      career: `${agePrefix}${branchLine}${tenGod}大运中${sealTone}，适合补体系、拿资格、做长期积累。`,
      wealth: "财运适合稳健积累，靠专业信用和平台背书慢慢转化，不宜高风险投机。",
      love: "感情偏慢热，容易理性、被动或先观察再投入，需要更多明确表达。",
      risk: `${tenGod === "偏印" ? "风险在想太多、孤立、路径偏窄和执行断续。" : "风险在保守、依赖、准备过久和行动不足。"}${ageRisk}`,
      advice: focus === "事业" ? "把学习转成证书、案例和可见履历。" : "少停在准备阶段，给自己设定清晰输出期限。"
    };
  }

  if (group === "output") {
    const outputTone = tenGod === "伤官"
      ? "突破规则、表达锋芒、技术创新和个人主张更强"
      : "稳定输出、作品沉淀、口碑和生活审美更容易成形";
    return {
      career: `${agePrefix}${branchLine}${tenGod}大运里${outputTone}，适合把能力做成作品、产品或可传播的方案。`,
      wealth: tenGod === "伤官"
        ? "财运靠差异化能力、技术方案和市场表达打开，但波动也更明显。"
        : "财运靠稳定作品、专业服务和长期口碑转化，适合细水长流。",
      love: tenGod === "伤官"
        ? "吸引力增强，但也容易挑剔、嘴硬或不愿被关系约束。"
        : "关系里更重舒适感和生活品质，适合温和稳定地培养感情。",
      risk: `${tenGod === "伤官" ? "风险在冲动表达、得罪上级、不服规则和计划变化过快。" : "风险在拖延享乐、缺少冲刺和成果转化慢。"}${ageRisk}`,
      advice: focus === "财运" ? "把技能包装成产品和服务，建立稳定交付。" : "让锋芒服务于结果，避免只表达不落地。"
    };
  }

  const peerTone = tenGod === "劫财"
    ? "合伙、人情、竞争和分财压力更强"
    : "自我意识、同辈竞争和独立负责更明显";
  return {
    career: `${agePrefix}${branchLine}${tenGod}大运中${peerTone}，适合建立清晰边界和可独立承担的能力。`,
    wealth: tenGod === "劫财"
      ? "财运有机会也有分财、破财和合伙压力，账目、股权和责任要提前说清。"
      : "财运更依赖个人能力和独立接单，竞争中能赚钱，也容易因固执错过合作。",
    love: tenGod === "劫财"
      ? "感情中竞争关系、三角关系或人际干扰增强，需要减少暧昧和外界介入。"
      : "关系里更强调平等和尊重，不适合被压制，也要避免过度坚持自我。",
    risk: `${tenGod === "劫财" ? "风险在冲动、合伙纠纷、资源被分走、朋友人情拖累。" : "风险在固执、单打独斗、同辈竞争和合作摩擦。"}${ageRisk}`,
    advice: ageStart <= 27
      ? `第${index + 1}步运多试错但少冲动绑定，先练能力和判断。`
      : `第${index + 1}步运合作可以做，但钱、权、责必须白纸黑字。`
  };
}

export function generateLuckCycles(input: {
  form: BaziFormData;
  pillars: BaziChart;
  count?: number;
}): LuckCycle[] {
  const { form, pillars, count = 6 } = input;
  const seed = scoreText(`${form.birthDate}|${form.birthTime}|${form.gender}|${pillars.month.stem}${pillars.month.branch}|${pillars.dayMaster}`);
  const startAge = 8 + (seed % 4);

  // TODO: replace this foundational trend model with precise 起运时间、顺逆排运 and 大运干支 calculation.
  return Array.from({ length: count }, (_, index) => {
    const from = startAge + index * 10;
    const to = from + 9;
    const pillar = nextPillar(`${pillars.month.stem}${pillars.month.branch}`, index + 1);
    const luckBranch = pillar.slice(1, 2);
    const tenGod = getTenGod(pillars.dayMaster, pillar.slice(0, 1));
    const group = groupOf(tenGod);
    const ageThemeText = ageTheme(from);
    const baseline = 52 + ((seed + index * 19 + pillar.charCodeAt(0) + pillar.charCodeAt(1)) % 24);
    const score = clamp(baseline + focusBonus(form.focus, group, form.gender) + (index >= 2 && index <= 4 ? 4 : 0) - (group === "peer" ? 3 : 0) + (index % 3));
    const tag = scoreLabel(score, group, from);
    const copy = narratives({
      tenGod,
      group,
      gender: form.gender,
      ageStart: from,
      ageThemeText,
      focus: form.focus,
      index,
      branch: luckBranch
    });

    return {
      ageRange: `${from}-${to}岁`,
      pillar,
      tenGod,
      score,
      tag,
      ...copy
    };
  });
}
