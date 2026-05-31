"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import type { BaziReportRecord } from "@/lib/bazi/types";
import { wechatId } from "@/lib/compliance/config";
import { getManualStatusLabel } from "@/lib/manualOrders";
import { getGuestUserId } from "@/lib/payments/access";
import { deleteReport, getGeneratedReports } from "@/lib/reports";

export default function HistoryPage() {
  const [reports, setReports] = useState<BaziReportRecord[]>([]);

  useEffect(() => {
    const userId = getGuestUserId();
    setReports(getGeneratedReports().filter((report) => report.userId === userId));
  }, []);

  const manualReports = useMemo(
    () => reports.filter((report) => Boolean(report.manualUnlockStatus)),
    [reports]
  );
  const experienceReports = useMemo(
    () => reports.filter((report) => !report.manualUnlockStatus),
    [reports]
  );

  function removeReport(reportId: string) {
    const userId = getGuestUserId();
    if (!window.confirm("确认删除这份报告记录吗？")) return;
    deleteReport(reportId, userId);
    setReports(getGeneratedReports().filter((report) => report.userId === userId));
  }

  function ReportCard({ report, pending = false }: { report: BaziReportRecord; pending?: boolean }) {
    return (
      <Card className="block">
        <Link
          href="/bazi/result"
          onClick={() => window.localStorage.setItem("bazi_latest_report", JSON.stringify(report))}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="rounded-md bg-gold/12 px-2 py-1 text-xs text-gold">
              {pending ? getManualStatusLabel(report.manualUnlockStatus) : "体验版"}
            </span>
            <span className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleString("zh-CN")}</span>
          </div>
          <h2 className="text-base font-semibold text-[#fff7e8]">
            {report.profileName || "未命名命盘"}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-400 sm:grid-cols-2">
            <p>报告编号：{report.reportCode || "未生成"}</p>
            <p>出生日期：{report.birthDate}</p>
            <p>分析方向：{report.focus}</p>
            <p>状态：{pending ? getManualStatusLabel(report.manualUnlockStatus) : "免费体验版"}</p>
            {pending ? <p>客服微信：{wechatId}</p> : null}
          </div>
        </Link>
        <button
          className="mt-4 rounded-md border border-red-300/20 px-3 py-2 text-xs text-red-200"
          onClick={() => removeReport(report.id)}
          type="button"
        >
          删除报告记录
        </button>
      </Card>
    );
  }

  return (
    <div className="page-shell pt-8">
      <p className="mb-3 text-sm text-gold">我的报告</p>
      <h1 className="mb-6 text-2xl font-semibold text-[#fff7e8]">报告记录</h1>

      <section className="mb-6">
        <h2 className="mb-3 text-base font-semibold text-[#fff7e8]">待处理报告</h2>
        {manualReports.length === 0 ? (
          <Card>
            <p className="text-sm leading-7 text-slate-300">暂无等待人工处理的报告。</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {manualReports.map((report) => (
              <ReportCard key={report.id} pending report={report} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-[#fff7e8]">体验版报告</h2>
        {experienceReports.length === 0 ? (
          <Card>
            <p className="text-sm leading-7 text-slate-300">
              暂无体验版报告。填写八字信息后，系统会生成免费体验版并记录在这里。
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {experienceReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
