"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ComplianceNotice } from "@/components/ComplianceNotice";
import { Card, FieldLabel, PrimaryButton, fieldClass } from "@/components/ui";
import { calculateBazi } from "@/lib/bazi/calculateBazi";
import type {
  BaziFocus,
  BaziFormData,
  BirthCalendarType,
  Gender,
  ZiHourDayChangeRule
} from "@/lib/bazi/types";
import { generateBaziReport } from "@/lib/ai/generateBaziReport";
import { getGuestUserId, getOrCreateProfileId, getReportType } from "@/lib/payments/access";
import { saveReport } from "@/lib/reports";

const focuses: BaziFocus[] = ["综合", "事业", "财运", "感情", "流年"];

export default function BaziFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<BaziFormData>({
    question: "",
    profileName: "",
    birthDate: "",
    birthTime: "",
    gender: "female",
    birthPlace: "",
    focus: "综合",
    calendarType: "solar",
    isLeapMonth: false,
    useTrueSolarTime: false,
    ziHourDayChangeRule: "after_23"
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      question: window.localStorage.getItem("bazi_question") || ""
    }));
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const chart = calculateBazi(form);
    const { report } = await generateBaziReport(form, chart);
    const userId = getGuestUserId();
    const profileId = getOrCreateProfileId(form, userId);
    const record = {
      ...form,
      id: crypto.randomUUID(),
      userId,
      profileId,
      reportType: getReportType(form.focus),
      module: "bazi" as const,
      pillars: chart,
      report,
      paymentStatus: "unpaid" as const,
      createdAt: new Date().toISOString()
    };

    window.localStorage.setItem("bazi_latest_report", JSON.stringify(record));
    await saveReport(record);
    router.push("/bazi/result");
  }

  return (
    <div className="page-shell pt-8">
      <p className="mb-3 text-sm text-gold">八字资料</p>
      <h1 className="mb-6 text-2xl font-semibold text-[#fff7e8]">填写出生信息</h1>
      <div className="mb-4">
        <ComplianceNotice />
      </div>

      <form onSubmit={submit}>
        <Card className="space-y-4">
          <div>
            <FieldLabel>姓名或备注，可选</FieldLabel>
            <input
              className={fieldClass}
              onChange={(event) => setForm({ ...form, profileName: event.target.value })}
              placeholder="例如：本人 / 某某"
              value={form.profileName}
            />
          </div>
          <div>
            <FieldLabel>生日类型</FieldLabel>
            <select
              className={fieldClass}
              onChange={(event) => setForm({
                ...form,
                calendarType: event.target.value as BirthCalendarType,
                isLeapMonth: event.target.value === "lunar" ? form.isLeapMonth : false
              })}
              value={form.calendarType}
            >
              <option value="solar">公历/阳历</option>
              <option value="lunar">农历/阴历</option>
            </select>
          </div>

          {form.calendarType === "lunar" ? (
            <label className="flex items-center gap-3 rounded-md border border-gold/15 bg-[#07111f] px-3 py-3 text-sm text-slate-300">
              <input
                checked={form.isLeapMonth}
                onChange={(event) => setForm({ ...form, isLeapMonth: event.target.checked })}
                type="checkbox"
              />
              是否闰月
            </label>
          ) : null}

          <div>
            <FieldLabel>{form.calendarType === "lunar" ? "农历出生日期" : "公历出生日期"}</FieldLabel>
            <input
              className={fieldClass}
              onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
              required
              type="date"
              value={form.birthDate}
            />
          </div>
          <div>
            <FieldLabel>出生时间</FieldLabel>
            <input
              className={fieldClass}
              onChange={(event) => setForm({ ...form, birthTime: event.target.value })}
              required
              type="time"
              value={form.birthTime}
            />
          </div>
          <div>
            <FieldLabel>性别</FieldLabel>
            <select
              className={fieldClass}
              onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}
              value={form.gender}
            >
              <option value="female">女</option>
              <option value="male">男</option>
            </select>
          </div>
          <div>
            <FieldLabel>出生地，可选</FieldLabel>
            <input
              className={fieldClass}
              onChange={(event) => setForm({ ...form, birthPlace: event.target.value })}
              placeholder="例如：上海"
              value={form.birthPlace}
            />
          </div>
          <div>
            <FieldLabel>分析方向</FieldLabel>
            <div className="grid grid-cols-5 gap-2">
              {focuses.map((focus) => (
                <button
                  className={`min-h-10 rounded-md border px-2 text-xs ${
                    form.focus === focus
                      ? "border-gold bg-gold text-[#08101d]"
                      : "border-gold/20 bg-[#07111f] text-slate-300"
                  }`}
                  key={focus}
                  onClick={() => setForm({ ...form, focus })}
                  type="button"
                >
                  {focus}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-gold/15 bg-[#07111f]/80 p-3">
            <p className="mb-3 text-sm text-[#e6d4ad]">高级排盘选项</p>
            <label className="mb-3 flex items-center gap-3 text-sm text-slate-300">
              <input
                checked={form.useTrueSolarTime}
                onChange={(event) => setForm({ ...form, useTrueSolarTime: event.target.checked })}
                type="checkbox"
              />
              使用真太阳时（当前版本预留，默认否）
            </label>
            <FieldLabel>子时换日规则</FieldLabel>
            <select
              className={fieldClass}
              onChange={(event) => setForm({
                ...form,
                ziHourDayChangeRule: event.target.value as ZiHourDayChangeRule
              })}
              value={form.ziHourDayChangeRule}
            >
              <option value="after_23">23点后换日（默认）</option>
              <option value="after_00">0点后换日</option>
            </select>
          </div>
        </Card>

        <PrimaryButton className="mt-5 gap-2" disabled={loading} type="submit">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          提交并生成报告
        </PrimaryButton>
      </form>
    </div>
  );
}
