const baziKeywords = [
  "一生",
  "一辈子",
  "命运",
  "命格",
  "事业",
  "财运",
  "婚姻",
  "感情",
  "流年",
  "大运",
  "适合行业",
  "人生趋势",
  "性格"
];

export function detectBaziIntent(question: string) {
  const normalized = question.trim();
  const matchedKeywords = baziKeywords.filter((keyword) => normalized.includes(keyword));

  return {
    module: "bazi" as const,
    matched: matchedKeywords.length > 0,
    matchedKeywords
  };
}
