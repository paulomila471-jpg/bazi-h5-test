export type PalaceKey = "year" | "month" | "day" | "hour";

export type PalaceRule = {
  name: string;
  lifeArea: string;
  meaning: string;
};

export const palaceRules: Record<PalaceKey, PalaceRule> = {
  year: {
    name: "年柱",
    lifeArea: "祖上、早年、外部环境、远方资源",
    meaning: "看一个人与家族根基、早期环境、大范围资源和远方机会的关系。"
  },
  month: {
    name: "月柱",
    lifeArea: "父母、兄弟、事业平台、青年阶段、社会位置",
    meaning: "是事业土壤和社会位置的关键宫位，常用于判断平台、职业节奏和格局成败。"
  },
  day: {
    name: "日柱",
    lifeArea: "自己、配偶、婚姻宫、中年阶段、核心关系",
    meaning: "日干为自己，日支为夫妻宫，重点看自我选择、伴侣关系和核心互动。"
  },
  hour: {
    name: "时柱",
    lifeArea: "子女、晚年、下属、未来发展、长期结果",
    meaning: "看后势、长期成果、下属子女与未来理想落点。"
  }
};

export function getPalaceRule(key: PalaceKey) {
  return palaceRules[key];
}
