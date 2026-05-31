export const complianceDisclaimer =
  "本报告由AI辅助生成，仅供娱乐、文化研究和个人参考，不构成医学、法律、投资、婚姻等现实决策依据，也不保证现实结果。";

export const aiDisclosureText = "本报告由人工智能辅助生成。";

export const h5TestNotice =
  "当前产品为H5测试版，仅提供传统命理文化参考与AI辅助分析，不提供站内支付服务。";

export const wechatId =
  process.env.NEXT_PUBLIC_CONTACT_WECHAT ||
  process.env.CONTACT_WECHAT ||
  "guotingyuan258";

export function getBeianInfo() {
  return {
    icpBeian: process.env.NEXT_PUBLIC_ICP_BEIAN || "",
    icpLicense: process.env.NEXT_PUBLIC_ICP_LICENSE || "",
    policeBeian: process.env.NEXT_PUBLIC_POLICE_BEIAN || ""
  };
}

export function isPaymentEnabled() {
  return false;
}
