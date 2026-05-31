import { LegalPage } from "@/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="隐私政策"
      intro="我们重视你的个人信息保护，以下说明八字板块涉及的信息类型、用途和保存方式。"
      sections={[
        { heading: "收集的信息", body: "为生成体验版报告和处理人工深度版咨询，可能收集昵称、出生日期、出生时间、出生地、性别、想咨询的问题、微信号、报告内容和留资状态。" },
        { heading: "使用目的", body: "上述信息用于排盘、生成体验版报告、联系用户、整理人工深度版报告、处理删除与注销申请、进行合规审计。" },
        { heading: "保存方式", body: "当前H5测试版主要使用本机 localStorage 保存；配置 Supabase 后，留资将写入 leads 表。你可以删除自己的八字记录和报告记录，也可以申请注销账号。" },
        { heading: "你的权利", body: "你可以访问、更正、删除个人八字档案和报告；如需注销账号，可通过联系我们页面提交申请。" }
      ]}
    />
  );
}
