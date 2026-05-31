"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Heart, Lock, X } from "lucide-react";
import { Card, PrimaryButton } from "@/components/ui";
import { buildBaziAnalysis } from "@/lib/bazi/core/buildBaziAnalysis";
import type { BaziReportRecord, Pillar } from "@/lib/bazi/types";
import { createBaziOverview, getPillarMeta } from "@/lib/bazi/resultInsights";
import { complianceDisclaimer, wechatId } from "@/lib/compliance/config";
import { createManualOrder } from "@/lib/manualOrders";
import { saveGeneratedReport } from "@/lib/reports";

const pillarRows = [
  ["年柱", "year"],
  ["月柱", "month"],
  ["日柱", "day"],
  ["时柱", "hour"]
] as const;

type LoadState = "loading" | "ready" | "missing";

function createReportCode() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `BZ${date}-${random}`;
}

function isValidRecord(value: unknown): value is BaziReportRecord {
  const record = value as BaziReportRecord | null;
  return Boolean(
    record &&
      record.birthDate &&
      record.birthTime &&
      record.gender &&
      record.focus &&
      record.pillars?.year &&
      record.pillars?.month &&
      record.pillars?.day &&
      record.pillars?.hour &&
      record.pillars?.dayMaster
  );
}

function safeReadLatestReport() {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.localStorage.getItem("bazi_latest_report") ||
      window.localStorage.getItem("en_bazi_latest_report") ||
      window.localStorage.getItem("bazi_analysis_data");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isValidRecord(parsed?.record)) return parsed.record;
    return isValidRecord(parsed) ? parsed : null;
  } catch (error) {
    console.error("Failed to parse bazi_latest_report:", error);
    return null;
  }
}

function safeWriteLatestReport(record: BaziReportRecord) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("bazi_latest_report", JSON.stringify(record));
  } catch (error) {
    console.error("Failed to write bazi_latest_report:", error);
  }
}

function copyText(text: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) return Promise.resolve();
  return navigator.clipboard.writeText(text).catch((error) => {
    console.error("Failed to copy text:", error);
  });
}

function SoftCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-white/[0.08] bg-white/[0.035] p-5 shadow-aureate backdrop-blur ${className}`}>
      {children}
    </section>
  );
}

function PillarCard({ label, pillar }: { label: string; pillar: Pillar }) {
  const meta = getPillarMeta(pillar.stem, pillar.branch);

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#07111f]/80 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gold">
            {pillar.stem}
            {pillar.branch}
          </p>
        </div>
        <span className="rounded-md bg-gold/12 px-2 py-1 text-xs text-gold">{pillar.tenGod}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-md border border-white/[0.08] px-2 py-1 text-slate-300">藏干 {pillar.hiddenStems.join("、")}</span>
        <span className="rounded-md border border-white/[0.08] px-2 py-1 text-slate-300">纳音 {meta.nayin}</span>
        <span className="rounded-md border border-white/[0.08] px-2 py-1 text-slate-300">长生 {meta.changsheng}</span>
      </div>
      <p className="mt-3 text-xs leading-6 text-slate-400">{pillar.palaceMeaning}</p>
    </div>
  );
}

function ManualUnlockModal({
  reportCode,
  onClose,
  onPending,
  submitting
}: {
  reportCode: string;
  onClose: () => void;
  onPending: () => void;
  submitting: boolean;
}) {
  const [copied, setCopied] = useState("");

  async function copy(value: string, label: string) {
    await copyText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/65 px-4 pb-4 sm:items-center sm:justify-center sm:pb-0">
      <div className="w-full max-w-lg rounded-xl border border-gold/20 bg-[#07111f] p-5 shadow-aureate">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gold">人工解锁</p>
            <h2 className="mt-1 text-xl font-semibold text-[#fff7e8]">解锁完整八字报告</h2>
          </div>
          <button className="rounded-md border border-white/[0.08] p-2 text-slate-300" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm leading-7 text-slate-300">
          手机用户请点击复制微信号，然后打开微信搜索添加。电脑用户可以扫码添加。添加后请发送报告编号，客服确认后会为你生成完整报告。
        </p>
        <p className="mt-2 text-xs leading-6 text-gold">如果二维码无法识别，请直接复制微信号添加。</p>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
            <p className="text-xs text-slate-400">客服微信</p>
            <p className="mt-1 text-lg font-semibold text-gold">{wechatId}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
            <p className="mb-3 text-xs text-slate-400">微信二维码</p>
            <div className="mx-auto flex w-[240px] max-w-full items-center justify-center rounded-lg bg-white p-5">
              <img alt="客服微信二维码" className="block h-auto w-[200px] max-w-full" src="/wechat-qr.jpg" />
            </div>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
            <p className="text-xs text-slate-400">报告编号</p>
            <p className="mt-1 text-lg font-semibold text-gold">{reportCode}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button className="min-h-11 rounded-md border border-gold/25 bg-gold/[0.1] px-4 text-sm font-semibold text-gold" onClick={() => copy(wechatId, "客服微信")} type="button">
            <Copy className="mr-2 inline h-4 w-4" />
            复制微信号
          </button>
          <button className="min-h-11 rounded-md border border-gold/25 bg-gold/[0.1] px-4 text-sm font-semibold text-gold" onClick={() => copy(reportCode, "报告编号")} type="button">
            <Copy className="mr-2 inline h-4 w-4" />
            复制报告编号
          </button>
          <button className="min-h-12 rounded-md bg-gold px-4 text-sm font-semibold text-[#08101d] sm:col-span-2" disabled={submitting} onClick={onPending} type="button">
            {submitting ? "正在提交..." : "我已联系，等待报告"}
          </button>
        </div>
        {copied ? <p className="mt-3 text-center text-sm text-gold">已复制：{copied}</p> : null}
      </div>
    </div>
  );
}

export default function BaziResultPage() {
  const [record, setRecord] = useState<BaziReportRecord | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [showModal, setShowModal] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const latest = safeReadLatestReport();
    setRecord(latest);
    setLoadState(latest ? "ready" : "missing");
  }, []);

  const derived = useMemo(() => {
    if (!record) return null;
    try {
      const analysis = buildBaziAnalysis({ birthInfo: record, focus: record.focus, locale: "zh", pillars: record.pillars });
      const overview = createBaziOverview(record.pillars, record.focus);
      return { analysis, timeline: analysis.annualHighlights, relationship: analysis.relationshipProfile, overview };
    } catch (error) {
      console.error("Failed to build bazi result view:", error);
      return null;
    }
  }, [record]);

  if (loadState === "loading") {
    return (
      <div className="page-shell pt-12">
        <Card>
          <p className="text-sm text-slate-300">正在加载命盘数据...</p>
        </Card>
      </div>
    );
  }

  if (!record || !derived) {
    return (
      <div className="page-shell pt-12">
        <Card>
          <p className="text-base font-semibold text-[#fff7e8]">未找到命盘数据，请返回重新填写。</p>
          <Link href="/bazi/form">
            <PrimaryButton className="mt-5" type="button">重新填写八字信息</PrimaryButton>
          </Link>
        </Card>
      </div>
    );
  }

  const reportCode = record.reportCode || createReportCode();
  const chart = record.pillars;
  const isPending = record.manualUnlockStatus === "pending_manual_unlock";

  function openManualUnlock() {
    if (!record) return;
    if (!record.reportCode) {
      const updated = { ...record, reportCode };
      safeWriteLatestReport(updated);
      saveGeneratedReport(updated);
      setRecord(updated);
    }
    setShowModal(true);
  }

  async function markPending() {
    if (!record) return;
    setManualSubmitting(true);
    setSubmitError("");
    const updated: BaziReportRecord = {
      ...record,
      reportCode: record.reportCode || reportCode,
      manualUnlockStatus: "pending_manual_unlock"
    };

    safeWriteLatestReport(updated);
    saveGeneratedReport(updated);

    const result = await createManualOrder(updated, wechatId);
    if (result.error) {
      console.error("Manual order save failed:", result.error);
      setSubmitError("订单已在本机保存，但数据库写入失败，请联系管理员。");
    }

    setRecord(updated);
    setShowModal(false);
    setManualSubmitting(false);
  }

  return (
    <div className="page-shell pt-8">
      <div className="mb-4 rounded-lg border border-gold/15 bg-gold/[0.055] p-4 text-xs leading-6 text-[#e6d4ad]">
        <div className="flex items-center justify-between gap-3">
          <p>本报告为传统文化与 AI 辅助分析，仅供娱乐和个人参考。</p>
          <button className="shrink-0 text-gold" onClick={() => setShowDisclaimer((value) => !value)} type="button">
            查看完整说明
          </button>
        </div>
        {showDisclaimer ? <p className="mt-3 text-slate-300">{complianceDisclaimer}</p> : null}
      </div>

      {isPending ? (
        <SoftCard className="mb-4 border-gold/20 bg-gold/[0.06]">
          <p className="text-sm leading-7 text-[#efe2c4]">
            已提交人工解锁申请，请添加微信 {wechatId}，并发送报告编号，客服确认后发送完整报告。
          </p>
          <p className="mt-2 text-sm text-gold">报告编号：{record.reportCode || reportCode}</p>
        </SoftCard>
      ) : null}

      {submitError ? (
        <SoftCard className="mb-4 border-red-300/20 bg-red-500/[0.08]">
          <p className="text-sm leading-7 text-red-200">{submitError}</p>
        </SoftCard>
      ) : null}

      <SoftCard className="mb-4 bg-gold/[0.055]">
        <p className="mb-2 text-sm text-gold">免费体验版</p>
        <h1 className="text-2xl font-semibold leading-8 text-[#fff7e8]">八字命理简短分析</h1>
        <p className="mt-3 text-sm leading-7 text-[#efe2c4]">{derived.overview.conclusion}</p>
      </SoftCard>

      <SoftCard className="mb-4">
        <h2 className="mb-4 text-base font-semibold text-[#fff7e8]">命局总览</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-[#07111f] p-3">
            <p className="text-xs text-slate-400">日主</p>
            <p className="mt-1 text-2xl font-semibold text-gold">{chart.dayMaster}</p>
          </div>
          <div className="rounded-md bg-[#07111f] p-3">
            <p className="text-xs text-slate-400">分析方向</p>
            <p className="mt-2 text-sm font-semibold text-[#fff7e8]">{record.focus}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {derived.overview.keywords.map((keyword) => (
            <span className="rounded-md border border-gold/20 px-3 py-2 text-xs text-gold" key={keyword}>
              {keyword}
            </span>
          ))}
        </div>
      </SoftCard>

      <SoftCard className="mb-4">
        <h2 className="mb-4 text-base font-semibold text-[#fff7e8]">四柱排盘</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pillarRows.map(([label, key]) => (
            <PillarCard label={label} pillar={chart[key]} key={key} />
          ))}
        </div>
      </SoftCard>

      <SoftCard className="mb-4">
        <div className="mb-3 flex items-center gap-2 text-gold">
          <Heart className="h-4 w-4" />
          <h2 className="text-base font-semibold text-[#fff7e8]">桃花指数</h2>
        </div>
        <div className="rounded-md bg-[#07111f] p-4">
          <p className="text-3xl font-semibold text-gold">{derived.relationship.peachBlossomScore}</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">{derived.relationship.peachBlossomType}</p>
          <p className="mt-2 text-xs leading-6 text-slate-400">{derived.relationship.advice}</p>
        </div>
      </SoftCard>

      <SoftCard className="mb-4">
        <h2 className="mb-4 text-base font-semibold text-[#fff7e8]">关键年份免费预览</h2>
        <div className="space-y-3">
          {derived.timeline.slice(0, 3).map((item) => (
            <div className="rounded-lg border border-white/[0.08] bg-[#07111f]/70 p-4" key={item.year}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-gold">
                  {item.year} {item.annualPillar}年
                </p>
                <span className="rounded-md bg-gold/12 px-3 py-1 text-xs text-gold">{item.tag}</span>
              </div>
              <p className="text-sm leading-7 text-slate-300">解锁后查看具体原因、机会窗口和避坑建议。</p>
            </div>
          ))}
        </div>
      </SoftCard>

      <SoftCard className="mb-4 border-gold/20 bg-gold/[0.055]">
        <div className="mb-3 flex items-center gap-2 text-gold">
          <Lock className="h-4 w-4" />
          <h2 className="text-xl font-semibold text-[#fff7e8]">人工完整报告</h2>
        </div>
        <p className="text-sm leading-7 text-[#efe2c4]">
          完整报告包含关键年份、十年大运、感情画像、配偶画像、适配对象、命理师视角和完整正文。添加微信并发送报告编号后，由人工整理发送。
        </p>
        <div className="mt-4 rounded-lg border border-gold/20 bg-[#07111f] p-4">
          <p className="text-xs text-slate-400">客服微信</p>
          <p className="mt-1 text-xl font-semibold text-gold">{wechatId}</p>
          <p className="mt-3 text-xs text-slate-400">报告编号：{record.reportCode || reportCode}</p>
        </div>
        <PrimaryButton className="mt-5" onClick={openManualUnlock} type="button">
          联系人工解锁完整报告 39元
        </PrimaryButton>
      </SoftCard>

      <SoftCard>
        <h2 className="mb-4 text-base font-semibold text-[#fff7e8]">排盘设置</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-[#07111f] p-3">
            <p className="text-xs text-slate-400">生日类型</p>
            <p className="mt-1 text-sm text-[#efe2c4]">{chart.settings?.calendarTypeLabel || "公历/阳历"}</p>
          </div>
          <div className="rounded-md bg-[#07111f] p-3">
            <p className="text-xs text-slate-400">排盘规则</p>
            <p className="mt-1 text-sm text-[#efe2c4]">立春换年 / 节气换月</p>
          </div>
        </div>
      </SoftCard>

      {showModal ? (
        <ManualUnlockModal
          onClose={() => setShowModal(false)}
          onPending={markPending}
          reportCode={record.reportCode || reportCode}
          submitting={manualSubmitting}
        />
      ) : null}
    </div>
  );
}
