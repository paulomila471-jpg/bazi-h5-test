"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, FieldLabel, PrimaryButton, fieldClass } from "@/components/ui";
import { calculateBazi } from "@/lib/bazi/calculateBazi";
import {
  buildEnglishFreeReport,
  createEnglishReportId,
  englishFocusOptions,
  englishFocusToBaziFocus,
  type EnglishFocus
} from "@/lib/bazi/english";
import type { BirthCalendarType, Gender } from "@/lib/bazi/types";

export default function EnglishBaziFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<EnglishFocus>("General");
  const [form, setForm] = useState({
    birthDate: "",
    birthTime: "",
    gender: "female" as Gender,
    birthPlace: "",
    calendarType: "solar" as BirthCalendarType,
    isLeapMonth: false
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const baziForm = {
      question: "English BaZi Destiny Report",
      profileName: "",
      birthDate: form.birthDate,
      birthTime: form.birthTime,
      gender: form.gender,
      birthPlace: form.birthPlace,
      focus: englishFocusToBaziFocus[focus],
      calendarType: form.calendarType,
      isLeapMonth: form.calendarType === "lunar" ? form.isLeapMonth : false,
      useTrueSolarTime: false,
      ziHourDayChangeRule: "after_23" as const
    };
    const pillars = calculateBazi(baziForm);
    const record = {
      ...baziForm,
      id: crypto.randomUUID(),
      userId: "english-guest",
      profileId: crypto.randomUUID(),
      reportType: "english_bazi",
      reportCode: createEnglishReportId(),
      module: "bazi" as const,
      pillars,
      report: "",
      paymentStatus: "unpaid" as const,
      createdAt: new Date().toISOString()
    };
    const finalRecord = { ...record, report: buildEnglishFreeReport(record) };

    try {
      window.localStorage.setItem("en_bazi_latest_report", JSON.stringify(finalRecord));
      router.push("/en/bazi/result");
    } catch (error) {
      console.error("Failed to save English BaZi report:", error);
      setLoading(false);
    }
  }

  return (
    <div className="page-shell pt-8">
      <p className="mb-3 text-sm uppercase tracking-[0.16em] text-gold">BaZi Destiny Report</p>
      <h1 className="mb-6 text-3xl font-semibold leading-tight text-[#fff7e8]">Enter Birth Information</h1>

      <form onSubmit={submit}>
        <Card className="space-y-4">
          <div>
            <FieldLabel>Calendar type</FieldLabel>
            <select
              className={fieldClass}
              onChange={(event) =>
                setForm({
                  ...form,
                  calendarType: event.target.value as BirthCalendarType,
                  isLeapMonth: event.target.value === "lunar" ? form.isLeapMonth : false
                })
              }
              value={form.calendarType}
            >
              <option value="solar">Solar</option>
              <option value="lunar">Lunar</option>
            </select>
          </div>

          {form.calendarType === "lunar" ? (
            <label className="flex items-center gap-3 rounded-md border border-gold/15 bg-[#07111f] px-3 py-3 text-sm text-slate-300">
              <input
                checked={form.isLeapMonth}
                onChange={(event) => setForm({ ...form, isLeapMonth: event.target.checked })}
                type="checkbox"
              />
              Leap lunar month
            </label>
          ) : null}

          <div>
            <FieldLabel>Birth date</FieldLabel>
            <input
              className={fieldClass}
              onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
              required
              type="date"
              value={form.birthDate}
            />
          </div>
          <div>
            <FieldLabel>Birth time</FieldLabel>
            <input
              className={fieldClass}
              onChange={(event) => setForm({ ...form, birthTime: event.target.value })}
              required
              type="time"
              value={form.birthTime}
            />
          </div>
          <div>
            <FieldLabel>Gender</FieldLabel>
            <select
              className={fieldClass}
              onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}
              value={form.gender}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div>
            <FieldLabel>Birthplace optional</FieldLabel>
            <input
              className={fieldClass}
              onChange={(event) => setForm({ ...form, birthPlace: event.target.value })}
              placeholder="City or country"
              value={form.birthPlace}
            />
          </div>
          <div>
            <FieldLabel>Focus</FieldLabel>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {englishFocusOptions.map((item) => (
                <button
                  className={`min-h-10 rounded-md border px-2 text-xs ${
                    focus === item
                      ? "border-gold bg-gold text-[#08101d]"
                      : "border-gold/20 bg-[#07111f] text-slate-300"
                  }`}
                  key={item}
                  onClick={() => setFocus(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <PrimaryButton className="mt-5 gap-2" disabled={loading} type="submit">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Generate Free Preview
        </PrimaryButton>
      </form>
    </div>
  );
}
