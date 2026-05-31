"use client";

import { useState } from "react";
import { ComplianceNotice } from "@/components/ComplianceNotice";
import { Card, FieldLabel, PrimaryButton, fieldClass } from "@/components/ui";
import { wechatId } from "@/lib/compliance/config";
import { saveLead } from "@/lib/leads";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nickname: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    gender: "女",
    question: "",
    wechat: ""
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveLead(form);
    setSubmitted(true);
    setForm({
      nickname: "",
      birthDate: "",
      birthTime: "",
      birthPlace: "",
      gender: "女",
      question: "",
      wechat: ""
    });
  }

  return (
    <div className="page-shell pt-8">
      <p className="mb-3 text-sm text-gold">联系我们</p>
      <h1 className="mb-4 text-2xl font-semibold text-[#fff7e8]">人工深度版咨询</h1>
      <ComplianceNotice />

      <Card className="mt-4">
        <h2 className="text-lg font-semibold text-[#fff7e8]">当前为H5测试版</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          当前为H5测试版，暂不支持站内支付。如需人工深度版八字报告，可添加微信咨询。
        </p>
        <div className="mt-4 rounded-lg border border-gold/20 bg-[#07111f] p-4">
          <p className="text-xs text-slate-400">微信号</p>
          <p className="mt-1 text-xl font-semibold text-gold">{wechatId}</p>
          <p className="mt-2 text-sm text-[#efe2c4]">添加微信 {wechatId} 获取人工深度版</p>
          <div className="mt-4 flex h-36 items-center justify-center rounded-md border border-dashed border-gold/25 text-sm text-slate-400">
            微信二维码位置
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          服务说明：免费体验版可直接查看简短AI分析；人工深度版由人工进一步整理命盘重点、关键年份、事业财运、感情关系和行动建议。
        </p>
      </Card>

      <form className="mt-4" onSubmit={submit}>
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-[#fff7e8]">提交咨询资料</h2>
          <div>
            <FieldLabel>昵称</FieldLabel>
            <input className={fieldClass} onChange={(event) => setForm({ ...form, nickname: event.target.value })} required value={form.nickname} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>出生日期</FieldLabel>
              <input className={fieldClass} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} required type="date" value={form.birthDate} />
            </div>
            <div>
              <FieldLabel>出生时间</FieldLabel>
              <input className={fieldClass} onChange={(event) => setForm({ ...form, birthTime: event.target.value })} required type="time" value={form.birthTime} />
            </div>
          </div>
          <div>
            <FieldLabel>出生地</FieldLabel>
            <input className={fieldClass} onChange={(event) => setForm({ ...form, birthPlace: event.target.value })} placeholder="例如：上海" value={form.birthPlace} />
          </div>
          <div>
            <FieldLabel>性别</FieldLabel>
            <select className={fieldClass} onChange={(event) => setForm({ ...form, gender: event.target.value })} value={form.gender}>
              <option>女</option>
              <option>男</option>
            </select>
          </div>
          <div>
            <FieldLabel>想咨询的问题</FieldLabel>
            <textarea className={`${fieldClass} min-h-28`} onChange={(event) => setForm({ ...form, question: event.target.value })} required value={form.question} />
          </div>
          <div>
            <FieldLabel>微信号</FieldLabel>
            <input className={fieldClass} onChange={(event) => setForm({ ...form, wechat: event.target.value })} required value={form.wechat} />
          </div>
          <PrimaryButton type="submit">提交咨询资料</PrimaryButton>
          {submitted ? <p className="text-sm text-gold">已提交，我们会通过微信与你联系。</p> : null}
        </Card>
      </form>
    </div>
  );
}
