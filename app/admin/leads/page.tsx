"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { getLeads, updateLeadStatus, type LeadRecord, type LeadStatus } from "@/lib/leads";

const statuses: LeadStatus[] = ["未联系", "已加微信", "已生成报告", "已交付"];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);

  useEffect(() => {
    setLeads(getLeads());
  }, []);

  function changeStatus(id: string, status: LeadStatus) {
    updateLeadStatus(id, status);
    setLeads(getLeads());
  }

  return (
    <div className="page-shell pt-8">
      <p className="mb-3 text-sm text-gold">后台管理</p>
      <h1 className="mb-6 text-2xl font-semibold text-[#fff7e8]">用户留资</h1>
      {leads.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-300">暂无用户提交记录。</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-[#fff7e8]">{lead.nickname}</h2>
                <span className="rounded-md bg-gold/12 px-2 py-1 text-xs text-gold">{lead.status}</span>
              </div>
              <div className="space-y-2 text-sm leading-6 text-slate-300">
                <p>出生：{lead.birthDate} {lead.birthTime} · {lead.birthPlace || "未填"} · {lead.gender}</p>
                <p>问题：{lead.question}</p>
                <p>微信：{lead.wechat}</p>
                <p className="text-xs text-slate-500">{new Date(lead.createdAt).toLocaleString("zh-CN")}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    className="rounded-md border border-white/[0.08] px-3 py-2 text-xs text-slate-300"
                    key={status}
                    onClick={() => changeStatus(lead.id, status)}
                    type="button"
                  >
                    {status}
                  </button>
                ))}
                <Link className="rounded-md bg-gold px-3 py-2 text-xs font-semibold text-[#08101d]" href={`/admin/reports/new?leadId=${lead.id}`}>
                  生成完整报告
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
