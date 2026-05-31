import { LegalPage } from "@/components/LegalPage";

export default function AiDisclosurePage() {
  return (
    <LegalPage
      title="AI生成内容说明"
      intro="本产品中的八字报告由规则系统与人工智能辅助生成。"
      sections={[
        { heading: "生成方式", body: "系统会根据用户提交的出生信息、四柱排盘、十神、藏干、宫位、关键年份、大运趋势等结构化信息生成报告。" },
        { heading: "内容边界", body: "AI生成内容可能存在表达偏差或不完整，请将其作为文化娱乐和个人参考，不应视为确定性结论。" },
        { heading: "安全处理", body: "系统会对死亡断言、疾病诊断、投资承诺、恐吓式转运、绝对化预测、诱导购买法器、婚姻极端建议、自残相关建议等内容进行过滤或温和改写。" }
      ]}
    />
  );
}

