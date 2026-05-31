"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, PrimaryButton } from "@/components/ui";
import { createManualReport, getLead, getLeads, type LeadRecord } from "@/lib/leads";

export default function AdminNewReportPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const items = getLeads();
    const searchParams = new URLSearchParams(window.location.search);
    setLeads(items);
    setSelectedId(searchParams.get("leadId") || items[0]?.id || "");
  }, []);

  const selectedLead = useMemo(() => getLead(selectedId), [selectedId]);

  function createReport() {
    if (!selectedLead) return;
    const report = createManualReport(selectedLead);
    router.push(`/admin/reports/${report.id}`);
  }

  return (
    <div className="page-shell pt-8">
      <p className="mb-3 text-sm text-gold">后台管理</p>
      <h1 className="mb-6 text-2xl font-semibold text-[#fff7e8]">新建人工深度版报告</h1>
      <Card className="space-y-4">
        <select
          className="min-h-12 w-full rounded-md border border-gold/20 bg-[#07111f] px-3 text-sm text-[#fff7e8]"
          onChange={(event) => setSelectedId(event.target.value)}
          value={selectedId}
        >
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.nickname} · {lead.birthDate} · {lead.wechat}
            </option>
          ))}
        </select>
        {selectedLead ? (
          <div className="rounded-lg border border-white/[0.08] bg-[#07111f]/70 p-4 text-sm leading-7 text-slate-300">
            <p>问题：{selectedLead.question}</p>
            <p>出生：{selectedLead.birthDate} {selectedLead.birthTime} {selectedLead.birthPlace}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-300">暂无可生成报告的留资。</p>
        )}
        <PrimaryButton disabled={!selectedLead} onClick={createReport} type="button">
          根据用户资料生成完整报告
        </PrimaryButton>
      </Card>
    </div>
  );
}
