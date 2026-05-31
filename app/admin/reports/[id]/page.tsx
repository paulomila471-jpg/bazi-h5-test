"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, PrimaryButton, fieldClass } from "@/components/ui";
import { getManualReport, updateManualReport, type LeadStatus, type ManualReportRecord } from "@/lib/leads";

const statuses: LeadStatus[] = ["未联系", "已加微信", "已生成报告", "已交付"];

export default function AdminReportDetailPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<ManualReportRecord | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setReport(getManualReport(params.id));
  }, [params.id]);

  function save() {
    if (!report) return;
    setReport(updateManualReport(report));
  }

  async function copy() {
    if (!report) return;
    await navigator.clipboard.writeText(report.content);
    setCopied(true);
  }

  function exportTxt() {
    if (!report) return;
    const blob = new Blob([report.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!report) {
    return (
      <div className="page-shell pt-8">
        <Card>
          <p className="text-sm text-slate-300">未找到报告。</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell pt-8">
      <p className="mb-3 text-sm text-gold">后台管理</p>
      <h1 className="mb-6 text-2xl font-semibold text-[#fff7e8]">编辑人工报告</h1>
      <Card className="space-y-4">
        <input
          className={fieldClass}
          onChange={(event) => setReport({ ...report, title: event.target.value })}
          value={report.title}
        />
        <select
          className={fieldClass}
          onChange={(event) => setReport({ ...report, status: event.target.value as LeadStatus })}
          value={report.status}
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <textarea
          className={`${fieldClass} min-h-[520px] font-mono leading-7`}
          onChange={(event) => setReport({ ...report, content: event.target.value })}
          value={report.content}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PrimaryButton onClick={save} type="button">保存报告</PrimaryButton>
          <PrimaryButton onClick={copy} type="button">复制报告</PrimaryButton>
          <PrimaryButton onClick={exportTxt} type="button">导出报告</PrimaryButton>
        </div>
        {copied ? <p className="text-sm text-gold">已复制到剪贴板。</p> : null}
      </Card>
    </div>
  );
}
