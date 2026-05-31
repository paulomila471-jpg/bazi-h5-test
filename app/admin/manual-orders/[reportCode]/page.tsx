"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AdminGate } from "@/components/AdminGate";
import { Card, PrimaryButton } from "@/components/ui";
import { generateAnnualHighlights } from "@/lib/bazi/rules/annualHighlights";
import { generateLuckCycles } from "@/lib/bazi/rules/luckCycles";
import { generateProfessionalView } from "@/lib/bazi/rules/professionalView";
import { generateRelationshipProfile } from "@/lib/bazi/rules/relationshipProfile";
import {
  buildFullManualReport,
  getManualOrder,
  getManualStatusLabel,
  updateManualOrderStatus,
  type ManualOrderRecord,
  type ManualOrderStatus
} from "@/lib/manualOrders";

type ManualOrderDetail = {
  annualHighlights: ReturnType<typeof generateAnnualHighlights>;
  luckCycles: ReturnType<typeof generateLuckCycles>;
  relationship: ReturnType<typeof generateRelationshipProfile>;
  professionalView: string;
  fullReport: string;
};

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

  useEffect(() => {
    getManualOrder(decodeURIComponent(params.reportCode)).then((item) => {
      setOrder(item);
      setLoading(false);
    });
  }, [params.reportCode]);

  const detail = useMemo(() => {
    if (!order) return null;
    const annualHighlights =
      order.annualHighlights ||
      generateAnnualHighlights({
        birthInfo: order,
        focus: order.focus,
        pillars: order.pillars
      });
    const luckCycles = order.luckCycles || generateLuckCycles({ form: order, pillars: order.pillars, count: 6 });
    const relationship =
      order.relationshipProfile ||
      generateRelationshipProfile({
        form: order,
        pillars: order.pillars,
        annualHighlights
      });
    const professionalView = order.professionalView || generateProfessionalView({ form: order, pillars: order.pillars });
    const fullReport = order.fullReport || buildFullManualReport(order);
    return { annualHighlights, luckCycles, relationship, professionalView, fullReport };
  }, [order]);

  async function copyText(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1400);
  }

  async function setStatus(status: ManualOrderStatus) {
    if (!order?.reportCode) return;
    const updated = await updateManualOrderStatus(order.reportCode, status);
    if (updated) setOrder(updated);
  }

  return (
    <AdminGate>
      {loading ? (
        <div className="page-shell pt-8">
          <Card>
            <p className="text-sm text-slate-300">正在读取订单详情...</p>
          </Card>
        </div>
      ) : !order || !detail ? (
        <div className="page-shell pt-8">
          <Card>
            <p className="text-sm text-slate-300">未找到该报告编号。</p>
          </Card>
        </div>
      ) : (
        <ManualOrderDetailContent
          copied={copied}
          detail={detail}
          onCopy={copyText}
          onSetStatus={setStatus}
          order={order}
        />
      )}
    </AdminGate>
  );
}

function ManualOrderDetailContent({
  order,
  detail,
  copied,
  onCopy,
  onSetStatus
}: {
  order: ManualOrderRecord;
  detail: ManualOrderDetail;
  copied: string;
  onCopy: (text: string, label: string) => Promise<void>;
  onSetStatus: (status: ManualOrderStatus) => Promise<void>;
}) {
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
        <h2 className="mb-3 text-base font-semibold text-[#fff7e8]">免费预览内容</h2>
        <p className="whitespace-pre-line text-sm leading-7 text-slate-300">{order.report}</p>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-base font-semibold text-[#fff7e8]">关键年份详细解释</h2>
        <div className="space-y-3">
          {detail.annualHighlights.map((item) => (
            <div className="rounded-md border border-white/[0.08] bg-[#07111f]/70 p-3" key={item.year}>
              <p className="text-sm font-semibold text-gold">
                {item.year} {item.annualPillar}年：{item.tag}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-base font-semibold text-[#fff7e8]">十年大运</h2>
        <div className="space-y-3">
          {detail.luckCycles.map((cycle) => (
            <div className="rounded-md border border-white/[0.08] bg-[#07111f]/70 p-3" key={`${cycle.ageRange}-${cycle.pillar}`}>
              <p className="text-sm font-semibold text-gold">
                {cycle.ageRange}｜{cycle.pillar}｜{cycle.tenGod}｜{cycle.tag}｜{cycle.score}分
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">事业：{cycle.career}</p>
              <p className="text-sm leading-6 text-slate-300">财运：{cycle.wealth}</p>
              <p className="text-sm leading-6 text-slate-300">感情：{cycle.love}</p>
              <p className="text-sm leading-6 text-slate-400">风险：{cycle.risk}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-base font-semibold text-[#fff7e8]">感情画像 / 配偶画像 / 适配对象</h2>
        <div className="space-y-3 text-sm leading-7 text-slate-300">
          <p>桃花指数：{detail.relationship.peachBlossomScore}｜{detail.relationship.peachBlossomType}</p>
          <p>配偶画像：{detail.relationship.spouseProfile.personality} {detail.relationship.spouseProfile.reality}</p>
          <p>相处模式：{detail.relationship.spouseProfile.relationshipMode}</p>
          <p>适配对象：{detail.relationship.suitablePartners.join("、")}</p>
          <p>你吸引的人：{detail.relationship.attractedTypes.join("、")}</p>
          <p>感情风险：{detail.relationship.relationshipRisk}</p>
        </div>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-base font-semibold text-[#fff7e8]">命理师视角</h2>
        <p className="whitespace-pre-line text-sm leading-7 text-slate-300">{detail.professionalView}</p>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-base font-semibold text-[#fff7e8]">完整报告内容</h2>
        <textarea
          className="min-h-[520px] w-full rounded-md border border-gold/20 bg-[#07111f] p-3 text-sm leading-7 text-[#fff7e8] outline-none"
          readOnly
          value={detail.fullReport}
        />
      </Card>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PrimaryButton onClick={() => onCopy(detail.fullReport, "完整报告")} type="button">复制完整报告</PrimaryButton>
          <PrimaryButton onClick={() => onCopy(order.reportCode || "", "报告编号")} type="button">复制报告编号</PrimaryButton>
          <PrimaryButton onClick={() => onSetStatus("paid")} type="button">标记已付款</PrimaryButton>
          <PrimaryButton onClick={() => onSetStatus("sent")} type="button">标记已发送</PrimaryButton>
          <PrimaryButton onClick={() => onSetStatus("cancelled")} type="button">标记无效</PrimaryButton>
        </div>
        {copied ? <p className="mt-3 text-sm text-gold">已复制：{copied}</p> : null}
      </Card>
    </div>
  );
}
