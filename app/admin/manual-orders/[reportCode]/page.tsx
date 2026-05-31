"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, PrimaryButton } from "@/components/ui";
import {
  buildFullManualReport,
  getManualOrder,
  getManualStatusLabel,
  regenerateManualOrderReport,
  updateManualOrderStatus,
  type ManualOrderRecord,
  type ManualOrderStatus
} from "@/lib/manualOrders";

function PillarLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-[#07111f]/70 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-base font-semibold text-gold">{value}</p>
    </div>
  );
}

export default function ManualOrderDetailPage() {
  const params = useParams<{ reportCode: string }>();
  const [order, setOrder] = useState<ManualOrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    getManualOrder(decodeURIComponent(params.reportCode))
      .then((item) => setOrder(item))
      .catch((error) => {
        console.error("Failed to load manual order:", error);
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [params.reportCode]);

  const fullReport = useMemo(() => {
    if (!order) return "";
    return order.fullReport || buildFullManualReport(order);
  }, [order]);

  async function copyText(text: string, label: string) {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1400);
  }

  async function setStatus(status: ManualOrderStatus) {
    if (!order?.reportCode) return;
    const updated = await updateManualOrderStatus(order.reportCode, status);
    if (updated) setOrder(updated);
  }

  async function regenerate() {
    if (!order?.reportCode) return;
    setRegenerating(true);
    const updated = await regenerateManualOrderReport(order.reportCode);
    if (updated) setOrder(updated);
    setRegenerating(false);
  }

  if (loading) {
    return (
      <div className="page-shell pt-8">
        <Card>
          <p className="text-sm text-slate-300">正在读取订单详情...</p>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-shell pt-8">
        <Card>
          <p className="text-sm text-slate-300">未找到该报告编号。</p>
        </Card>
      </div>
    );
  }

  const chart = order.pillars;

  return (
    <div className="page-shell pt-8">
      <p className="mb-3 text-sm text-gold">测试版后台，仅供本人本地使用。</p>
      <h1 className="mb-6 text-2xl font-semibold text-[#fff7e8]">人工解锁报告详情</h1>

      <Card className="mb-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">报告编号</p>
            <h2 className="mt-1 text-xl font-semibold text-gold">{order.reportCode}</h2>
          </div>
          <span className="rounded-md bg-gold/12 px-2 py-1 text-xs text-gold">
            {getManualStatusLabel(order.manualUnlockStatus)}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm leading-6 text-slate-300 sm:grid-cols-2">
          <p>出生日期：{order.birthDate}</p>
          <p>出生时间：{order.birthTime}</p>
          <p>生日类型：{order.calendarType === "lunar" ? "农历/阴历" : "公历/阳历"}</p>
          <p>性别：{order.gender === "male" ? "男" : "女"}</p>
          <p>出生地：{order.birthPlace || "未填写"}</p>
          <p>分析方向：{order.focus}</p>
          <p>用户问题：{order.question || "未填写"}</p>
          <p>创建时间：{new Date(order.createdAt).toLocaleString("zh-CN")}</p>
        </div>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-base font-semibold text-[#fff7e8]">四柱排盘</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PillarLine label="年柱" value={`${chart.year.stem}${chart.year.branch}｜${chart.year.tenGod}`} />
          <PillarLine label="月柱" value={`${chart.month.stem}${chart.month.branch}｜${chart.month.tenGod}`} />
          <PillarLine label="日柱" value={`${chart.day.stem}${chart.day.branch}｜日主 ${chart.dayMaster}`} />
          <PillarLine label="时柱" value={`${chart.hour.stem}${chart.hour.branch}｜${chart.hour.tenGod}`} />
        </div>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-base font-semibold text-[#fff7e8]">完整报告内容</h2>
        {fullReport.trim() ? (
          <textarea
            className="min-h-[560px] w-full rounded-md border border-gold/20 bg-[#07111f] p-3 text-sm leading-7 text-[#fff7e8] outline-none"
            readOnly
            value={fullReport}
          />
        ) : (
          <div className="rounded-md border border-gold/20 bg-[#07111f] p-4">
            <p className="text-sm leading-7 text-slate-300">完整报告未生成，可点击重新生成。</p>
            <PrimaryButton className="mt-4" disabled={regenerating} onClick={regenerate} type="button">
              {regenerating ? "正在重新生成..." : "重新生成完整报告"}
            </PrimaryButton>
          </div>
        )}
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-base font-semibold text-[#fff7e8]">结构化数据</h2>
        <div className="space-y-3 text-sm leading-7 text-slate-300">
          <p>关键年份：{order.annualHighlights?.map((item) => `${item.year}${item.annualPillar}年 ${item.tag}`).join("；") || "已在完整报告中生成"}</p>
          <p>十年大运：{order.luckCycles?.map((item) => `${item.ageRange} ${item.pillar} ${item.tenGod}`).join("；") || "已在完整报告中生成"}</p>
          <p>桃花指数：{order.relationshipProfile ? `${order.relationshipProfile.peachBlossomScore}｜${order.relationshipProfile.peachBlossomType}` : "已在完整报告中生成"}</p>
          <p>命理师视角：{order.professionalView || "已在完整报告中生成"}</p>
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PrimaryButton onClick={() => copyText(fullReport, "完整报告")} type="button">复制完整报告</PrimaryButton>
          <PrimaryButton onClick={() => copyText(order.reportCode || "", "报告编号")} type="button">复制报告编号</PrimaryButton>
          <PrimaryButton onClick={() => setStatus("paid")} type="button">标记已付款</PrimaryButton>
          <PrimaryButton onClick={() => setStatus("sent")} type="button">标记已发送</PrimaryButton>
          <PrimaryButton onClick={() => setStatus("cancelled")} type="button">标记无效</PrimaryButton>
          <PrimaryButton disabled={regenerating} onClick={regenerate} type="button">
            {regenerating ? "正在重新生成..." : "重新生成完整报告"}
          </PrimaryButton>
        </div>
        {copied ? <p className="mt-3 text-sm text-gold">已复制：{copied}</p> : null}
      </Card>
    </div>
  );
}
