"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Compass, Copy, Sparkles, X } from "lucide-react";
import { Card, PrimaryButton } from "@/components/ui";
import type { BaziReportRecord, Pillar } from "@/lib/bazi/types";
import { createBaziOverview, createSummary, getPillarMeta } from "@/lib/bazi/resultInsights";
import { generateAnnualHighlights, type AnnualHighlight } from "@/lib/bazi/rules/annualHighlights";
import { complianceDisclaimer, wechatId } from "@/lib/compliance/config";
import { createManualOrder } from "@/lib/manualOrders";
import { saveGeneratedReport } from "@/lib/reports";

const pillarRows = [
  ["年柱", "year"],
  ["月柱", "month"],
  ["日柱", "day"],
  ["时柱", "hour"]
] as const;

const freeSectionTitles = [
  "命局基础气质",
  "性格优势",
  "性格短板",
  "事业方向简析",
  "感情模式简析",
  "未来一年提醒",
  "引导人工深度版"
];

function SoftCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-white/[0.08] bg-white/[0.035] p-5 shadow-aureate backdrop-blur ${className}`}>
      {children}
    </section>
  );
}

function DetailChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-md border border-white/[0.08] bg-[#07111f] px-2 py-1 text-[11px] leading-5 text-slate-300">
      <span className="text-mutedgold">{label}</span> {value}
    </span>
  );
}

function PillarCard({ label, pillar }: { label: string; pillar: Pillar }) {
  const meta = getPillarMeta(pillar.stem, pillar.branch);

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#07111f]/80 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gold">{pillar.stem}{pillar.branch}</p>
        </div>
        <span className="rounded-md bg-gold/12 px-2 py-1 text-xs text-gold">{pillar.tenGod}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <DetailChip label="藏干" value={pillar.hiddenStems.join("、")} />
        <DetailChip label="纳音" value={meta.nayin} />
        <DetailChip label="长生" value={meta.changsheng} />
        <DetailChip label="神煞" value={meta.shensha.join("、")} />
      </div>
      <p className="mt-3 text-xs leading-6 text-slate-400">{pillar.palaceMeaning}</p>
    </div>
  );
}

function parseFreeReportSections(report: string) {
  const normalized = report.replace(/\r\n/g, "\n").trim();
  const positions = freeSectionTitles
    .map((title, index) => {
      const markers = [`${index + 1}. ${title}`, `${index + 1}、${title}`, title];
      const found = markers
        .map((marker) => ({ marker, index: normalized.indexOf(marker) }))
        .filter((item) => item.index >= 0)
        .sort((a, b) => a.index - b.index)[0];
      return found ? { title, marker: found.marker, index: found.index } : null;
    })
    .filter(Boolean) as Array<{ title: string; marker: string; index: number }>;

  if (positions.length < 2) {
    return freeSectionTitles.map((title) => ({ title, content: createSummary(normalized, 180) }));
  }

  return positions.map((item, index) => {
    const next = positions[index + 1];
    return {
      title: item.title,
      content: normalized.slice(item.index + item.marker.length, next?.index).trim()
    };
  });
}

function createReportCode() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `BZ${date}-${random}`;
}

function annualPreviewHook(item: AnnualHighlight) {
  const tag = item.tag;

  if (tag.includes("财") || tag.includes("璐")) {
    return "这一年财务机会被触发，适合关注收入、项目、合作和资源变现。解锁后查看：财从哪里来、适不适合投资合作、如何避免破财。";
  }
  if (tag.includes("桃花") || tag.includes("妗冭姳") || tag.includes("感情")) {
    return "这一年人际与感情缘分增强，容易出现暧昧、关系推进或新的选择。解锁后查看：容易遇到什么类型的人、是否适合确定关系、烂桃花风险在哪里。";
  }
  if (tag.includes("事业") || tag.includes("浜嬩笟")) {
    return "这一年事业位置、平台规则或责任压力容易变化。解锁后查看：变化来自哪里、适合主动争取还是保守等待、哪些选择容易踩坑。";
  }
  if (tag.includes("风险") || tag.includes("椋庨櫓") || item.level.includes("提醒") || item.level.includes("鎻愰啋")) {
    return "这一年容易出现支出、合作压力或关系波动。解锁后查看：具体风险点、破财位置和避坑建议。";
  }
  return "这一年适合沉淀能力、整理资源、建立长期信用。解锁后查看：适合做什么、不适合做什么、如何把稳定转成实际收益。";
}

function CopyButton({ text, children }: { text: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gold/25 bg-gold/[0.1] px-4 text-sm font-semibold text-gold"
      onClick={copy}
      type="button"
    >
      <Copy className="h-4 w-4" />
      {copied ? "已复制" : children}
    </button>
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
  const [qrFailed, setQrFailed] = useState(false);

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
        <p className="mt-2 text-xs leading-6 text-gold">
          如果二维码无法识别，请直接复制微信号添加。
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
            <p className="text-xs text-slate-400">客服微信</p>
            <p className="mt-1 text-lg font-semibold text-gold">{wechatId}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
            <p className="mb-3 text-xs text-slate-400">微信二维码</p>
            <div className="mx-auto flex w-[240px] max-w-full items-center justify-center rounded-lg bg-white p-5">
              {qrFailed ? (
                <div className="flex h-[200px] w-[200px] items-center justify-center rounded-md border border-slate-200 text-center text-sm leading-6 text-slate-700">
                  二维码加载失败<br />请复制微信号添加
                </div>
              ) : (
                <img
                  alt="客服微信二维码"
                  className="block h-auto w-[200px] max-w-full"
                  onError={() => setQrFailed(true)}
                  src="/wechat-qr.jpg"
                />
              )}
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">二维码仅作辅助展示，手机端请优先复制微信号。</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
            <p className="text-xs text-slate-400">报告编号</p>
            <p className="mt-1 text-lg font-semibold text-gold">{reportCode}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CopyButton text={wechatId}>复制客服微信</CopyButton>
          <CopyButton text={reportCode}>复制报告编号</CopyButton>
          <button
            className="min-h-12 rounded-md bg-gold px-4 text-sm font-semibold text-[#08101d] sm:col-span-2"
            disabled={submitting}
            onClick={onPending}
            type="button"
          >
            {submitting ? "正在提交..." : "我已联系，等待报告"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BaziResultPage() {
  const [record, setRecord] = useState<BaziReportRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [manualSubmitting, setManualSubmitting] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("bazi_latest_report");
    setRecord(raw ? (JSON.parse(raw) as BaziReportRecord) : null);
  }, []);

  const reportSections = useMemo(() => (record ? parseFreeReportSections(record.report) : []), [record]);

  if (!record) {
    return (
      <div className="page-shell pt-12">
        <Card>
          <p className="text-slate-300">还没有生成结果，请先填写八字资料。</p>
          <Link href="/bazi/form">
            <PrimaryButton className="mt-5" type="button">去填写</PrimaryButton>
          </Link>
        </Card>
      </div>
    );
  }

  const reportCode = record.reportCode || createReportCode();
  const chart = record.pillars;
  const settings = chart.settings;
  const overview = createBaziOverview(chart, record.focus);
  const timeline = generateAnnualHighlights({ birthInfo: record, focus: record.focus, pillars: chart });
  const isPending = record.manualUnlockStatus === "pending_manual_unlock";

  function openManualUnlock() {
    if (!record) return;
    if (!record.reportCode) {
      const updated = { ...record, reportCode };
      window.localStorage.setItem("bazi_latest_report", JSON.stringify(updated));
      saveGeneratedReport(updated);
      setRecord(updated);
    }
    setShowModal(true);
  }

  async function markPending() {
    if (!record) return;
    setManualSubmitting(true);
    const updated: BaziReportRecord = {
      ...record,
      reportCode: record.reportCode || reportCode,
      manualUnlockStatus: "pending_manual_unlock"
    };
    window.localStorage.setItem("bazi_latest_report", JSON.stringify(updated));
    saveGeneratedReport(updated);
    await createManualOrder(updated, wechatId);
    setRecord(updated);
    setShowModal(false);
    setManualSubmitting(false);
  }

  return (
    <div className="page-shell pt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="mb-2 text-sm text-gold">免费体验版</p>
          <h1 className="text-2xl font-semibold text-[#fff7e8]">八字命理简短分析</h1>
        </div>
        <span className="rounded-md border border-gold/20 bg-gold/[0.08] px-3 py-2 text-xs text-gold">
          H5测试版
        </span>
      </div>

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
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailChip label="客服微信" value={wechatId} />
            <DetailChip label="报告编号" value={record.reportCode || reportCode} />
          </div>
        </SoftCard>
      ) : null}

      <SoftCard className="mb-4 bg-gold/[0.055]">
        <div className="mb-3 flex items-center gap-2 text-gold">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm">核心结论</span>
        </div>
        <p className="text-xl font-semibold leading-8 text-[#fff7e8]">{overview.conclusion}</p>
        <p className="mt-3 text-sm leading-7 text-[#efe2c4]">{overview.lifeLine}</p>
      </SoftCard>

      <SoftCard className="mb-4">
        <div className="mb-4 flex items-center gap-2">
          <Compass className="h-4 w-4 text-gold" />
          <h2 className="text-base font-semibold text-[#fff7e8]">命局总览</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-[#07111f] p-3">
            <p className="text-xs text-slate-400">日主</p>
            <p className="mt-1 text-2xl font-semibold text-gold">{chart.dayMaster}</p>
          </div>
          <div className="rounded-md bg-[#07111f] p-3">
            <p className="text-xs text-slate-400">格局倾向</p>
            <p className="mt-2 text-sm font-semibold text-[#fff7e8]">{overview.pattern}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {overview.keywords.map((keyword) => (
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
        <h2 className="mb-4 text-base font-semibold text-[#fff7e8]">免费体验版报告</h2>
        <p className="mb-4 text-xs leading-6 text-slate-400">
          免费版仅展示基础倾向，不输出完整大运、关键年份、配偶画像或详细财运年份。
        </p>
        <div className="space-y-3">
          {reportSections.map((section) => (
            <section className="rounded-lg border border-white/[0.08] bg-[#07111f]/65 p-4" key={section.title}>
              <h3 className="mb-2 text-sm font-semibold text-gold">{section.title}</h3>
              <p className="whitespace-pre-line text-sm leading-7 text-[#efe2c4]">{section.content}</p>
            </section>
          ))}
        </div>
      </SoftCard>

      <SoftCard className="mb-4">
        <h2 className="mb-4 text-base font-semibold text-[#fff7e8]">关键年份免费预览</h2>
        <div className="space-y-3">
          {timeline.slice(0, 5).map((item) => (
            <div className="rounded-lg border border-white/[0.08] bg-[#07111f]/70 p-4" key={item.year}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-gold">{item.year} {item.annualPillar}年</p>
                <span className="rounded-md bg-gold/12 px-3 py-1 text-xs text-gold">{item.tag}</span>
              </div>
              <p className="text-sm leading-7 text-slate-300">{annualPreviewHook(item)}</p>
            </div>
          ))}
        </div>
      </SoftCard>

      <SoftCard className="mb-4 border-gold/20 bg-gold/[0.055]">
        <h2 className="text-xl font-semibold text-[#fff7e8]">人工完整报告</h2>
        <p className="mt-3 text-sm leading-7 text-[#efe2c4]">
          完整报告由人工整理后发送，包含十年大运、关键年份、感情对象画像、事业财运重点和近三年行动建议。请联系人工并发送报告编号。
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
            <p className="mt-1 text-sm text-[#efe2c4]">{settings?.calendarTypeLabel || "公历/阳历"}</p>
          </div>
          <div className="rounded-md bg-[#07111f] p-3">
            <p className="text-xs text-slate-400">排盘规则</p>
            <p className="mt-1 text-sm text-[#efe2c4]">{settings?.yearRule || "立春换年"} / {settings?.monthRule || "节气换月"}</p>
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
