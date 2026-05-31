import { LegalPage } from "@/components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      title="用户协议"
      intro="使用本服务前，请确认你已理解本产品为H5测试版，内容仅作传统命理文化参考。"
      sections={[
        { heading: "服务性质", body: "本服务提供八字命理文化解读、免费体验版报告和人工深度版咨询入口，不提供医学、法律、投资、婚姻等专业决策服务。" },
        { heading: "用户义务", body: "你应提供真实、合法、必要的信息，不得利用本服务从事违法违规、侵害他人权益或传播高风险内容的行为。" },
        { heading: "资料与报告", body: "体验版报告保存在本机浏览器中。人工深度版需通过微信联系确认具体服务内容与交付方式。" }
      ]}
    />
  );
}
