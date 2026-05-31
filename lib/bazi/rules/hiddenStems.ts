export const hiddenStemRules: Record<string, string[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "戊", "庚"],
  午: ["丁", "己"],
  未: ["己", "乙", "丁"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"]
};

export function getHiddenStems(branch: string) {
  return hiddenStemRules[branch] || [];
}

export const hiddenStemUsage =
  "藏干用于表达隐藏人事、内在资源、潜在矛盾和暗线机会。";
