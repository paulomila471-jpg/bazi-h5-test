import { LegalPage } from "@/components/LegalPage";
import { complianceDisclaimer } from "@/lib/compliance/config";

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="免责声明"
      intro={complianceDisclaimer}
      sections={[
        { heading: "非专业建议", body: "报告内容不构成医学诊断、法律意见、投资建议、婚姻决策建议或其他专业意见。" },
        { heading: "非结果承诺", body: "命理分析仅用于文化娱乐和自我观察，不保证任何现实结果，也不应作为重大决策的唯一依据。" },
        { heading: "高风险事项", body: "涉及身体健康、投资交易、法律纠纷、婚姻家庭、人身安全等事项，请咨询具备资质的专业人士或当地紧急援助。" }
      ]}
    />
  );
}

