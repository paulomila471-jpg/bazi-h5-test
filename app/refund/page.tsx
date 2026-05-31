import { LegalPage } from "@/components/LegalPage";

export default function RefundPage() {
  return (
    <LegalPage
      title="服务说明"
      intro="当前为H5测试版，暂不支持站内支付，因此不涉及站内退款流程。"
      sections={[
        { heading: "免费体验版", body: "用户提交信息后可直接查看简短AI分析，不收取费用。" },
        { heading: "人工深度版", body: "人工深度版需添加微信沟通服务内容、交付方式和后续安排。" },
        { heading: "问题反馈", body: "如需删除资料、反馈内容问题或咨询人工深度版，请通过联系我们页面提交信息。" }
      ]}
    />
  );
}
