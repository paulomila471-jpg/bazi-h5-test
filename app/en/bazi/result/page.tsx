"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Lock, X } from "lucide-react";
import { Card, PrimaryButton } from "@/components/ui";
import { buildBaziAnalysis } from "@/lib/bazi/core/buildBaziAnalysis";
import {
  baziFocusToEnglish,
  buildEnglishFullReport,
  createEnglishKeyInsights,
  createEnglishOverview,
  createEnglishRelationshipSummary,
  formatPillar,
  translateAnnualHighlight,
  translateLuckCycle,
  translateStem,
  translateTenGod
} from "@/lib/bazi/english";
import type { BaziReportRecord, Pillar } from "@/lib/bazi/types";
import { getEnglishDeliveryConfig } from "@/lib/compliance/config";

const pillarRows = [
  ["Year Pillar", "year"],
  ["Month Pillar", "month"],
  ["Day Pillar", "day"],
  ["Hour Pillar", "hour"]
] as const;

type LoadState = "loading" | "ready" | "missing";

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

function safeReadEnglishReport() {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.localStorage.getItem("en_bazi_latest_report") ||
      window.localStorage.getItem("bazi_latest_report") ||
      window.localStorage.getItem("bazi_analysis_data");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isValidRecord(parsed?.record)) return parsed.record;
    return isValidRecord(parsed) ? parsed : null;
  } catch (error) {
    console.error("Failed to parse en_bazi_latest_report:", error);
    return null;
  }
}

function SoftCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-white/[0.08] bg-white/[0.035] p-5 shadow-aureate backdrop-blur ${className}`}>
      {children}
    </section>
  );
}

function PaymentLink({ label, href }: { label: string; href: string }) {
  if (!href) {
    return (
      <button
        className="min-h-12 rounded-md border border-white/[0.08] bg-[#07111f] px-4 py-3 text-sm font-semibold text-slate-500"
        disabled
        type="button"
      >
        {label} · Coming soon
      </button>
    );
  }

  return (
    <a
      className="inline-flex min-h-12 items-center justify-center rounded-md border border-gold/25 bg-gold/[0.1] px-4 py-3 text-sm font-semibold text-gold hover:bg-gold/[0.16]"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}

function PillarCard({ label, pillar, isDay }: { label: string; pillar: Pillar; isDay?: boolean }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#07111f]/80 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-1 text-lg font-semibold leading-7 text-gold">{formatPillar(pillar)}</p>
        </div>
        <span className="rounded-md bg-gold/12 px-2 py-1 text-xs text-gold">
          {isDay ? "Self" : translateTenGod(pillar.tenGod)}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-md border border-white/[0.08] px-2 py-1 text-slate-300">
          Hidden Stems {pillar.hiddenStems.map(translateStem).join(", ")}
        </span>
        <span className="rounded-md border border-white/[0.08] px-2 py-1 text-slate-300">
          Palace {label.replace(" Pillar", "")}
        </span>
      </div>
    </div>
  );
}

function UnlockModal({
  reportId,
  onClose
}: {
  reportId: string;
  onClose: () => void;
}) {
  const { koFiUrl, gumroadUrl, paypalUrl, contactEmail } = getEnglishDeliveryConfig();
  const mailHref = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(`BaZi Report ${reportId}`)}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/65 px-4 pb-4 sm:items-center sm:justify-center sm:pb-0">
      <div className="w-full max-w-lg rounded-xl border border-gold/20 bg-[#07111f] p-5 shadow-aureate">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gold">Early Access</p>
            <h2 className="mt-1 text-xl font-semibold text-[#fff7e8]">Unlock Full BaZi Report</h2>
          </div>
          <button className="rounded-md border border-white/[0.08] p-2 text-slate-300" onClick={onClose} type="button">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm leading-7 text-slate-300">
          This is an early-access H5 test version. Full reports are manually prepared and delivered by email after payment confirmation.
        </p>

        <div className="mt-4 rounded-lg border border-gold/20 bg-gold/[0.06] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-gold">Report ID</p>
          <p className="mt-1 text-xl font-semibold text-[#fff7e8]">{reportId}</p>
          <p className="mt-3 text-sm leading-7 text-[#efe2c4]">
            After payment, please include your Report ID and email so we can deliver your report within 24 hours.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3">
          <PaymentLink href={koFiUrl} label="Buy on Ko-fi" />
          <PaymentLink href={gumroadUrl} label="Buy on Gumroad" />
          <PaymentLink href={paypalUrl} label="Pay with PayPal" />
        </div>

        <div className="mt-4 rounded-lg border border-white/[0.08] bg-white/[0.035] p-4">
          <p className="text-xs text-slate-400">Email delivery</p>
          {contactEmail ? (
            <a className="mt-1 block text-sm font-semibold text-gold" href={mailHref}>
              {contactEmail}
            </a>
          ) : (
            <p className="mt-1 text-sm font-semibold text-gold">Contact email coming soon</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EnglishBaziResultPage() {
  const [record, setRecord] = useState<BaziReportRecord | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const latest = safeReadEnglishReport();
    setRecord(latest);
    setLoadState(latest ? "ready" : "missing");
  }, []);

  const derived = useMemo(() => {
    if (!record) return null;
    try {
      const analysis = buildBaziAnalysis({ birthInfo: record, focus: record.focus, locale: "en", pillars: record.pillars });
      const annualHighlights = analysis.annualHighlights;
      const relationship = analysis.relationshipProfile;
      const luckCycles = analysis.luckCycles;
      const professionalView = analysis.professionalView;
      const overview = createEnglishOverview(record.pillars, record.focus);
      const insights = createEnglishKeyInsights({ chart: record.pillars, focus: record.focus, annualHighlights, relationship }).slice(0, 3);
      const relationshipSummary = createEnglishRelationshipSummary(relationship);
      const fullReport = buildEnglishFullReport({ record, annualHighlights, luckCycles, relationship, professionalView });
      return { annualHighlights, relationship, luckCycles, professionalView, overview, insights, relationshipSummary, fullReport };
    } catch (error) {
      console.error("Failed to build English BaZi result:", error);
      return null;
    }
  }, [record]);

  if (loadState === "loading") {
    return (
      <div className="page-shell pt-12">
        <Card>
          <p className="text-sm text-slate-300">Loading your Chinese Birth Chart...</p>
        </Card>
      </div>
    );
  }

  if (!record || !derived) {
    return (
      <div className="page-shell pt-12">
        <Card>
          <p className="text-base font-semibold text-[#fff7e8]">No chart data found. Please return and enter your birth information.</p>
          <Link href="/en/bazi/form">
            <PrimaryButton className="mt-5" type="button">Enter Birth Information Again</PrimaryButton>
          </Link>
        </Card>
      </div>
    );
  }

  const chart = record.pillars;
  const translatedYears = derived.annualHighlights.map(translateAnnualHighlight);
  const translatedCycles = derived.luckCycles.map(translateLuckCycle);

  return (
    <div className="page-shell pt-8">
      <SoftCard className="mb-4 bg-gold/[0.055]">
        <p className="mb-2 text-sm text-gold">Free Preview</p>
        <h1 className="text-2xl font-semibold leading-8 text-[#fff7e8]">BaZi Destiny Report</h1>
        <p className="mt-3 text-sm leading-7 text-[#efe2c4]">
          This reading is for cultural reflection and personal reference. It does not provide medical, legal, investment, or marriage advice.
        </p>
      </SoftCard>

      <SoftCard className="mb-4">
        <h2 className="mb-3 text-base font-semibold text-[#fff7e8]">Core Life Pattern</h2>
        <p className="text-sm leading-7 text-slate-300">{derived.overview.title}</p>
        <p className="mt-2 text-sm leading-7 text-[#efe2c4]">{derived.overview.pattern}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {derived.overview.keywords.map((keyword) => (
            <span className="rounded-md border border-gold/20 px-3 py-2 text-xs text-gold" key={keyword}>
              {keyword}
            </span>
          ))}
        </div>
      </SoftCard>

      <SoftCard className="mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-[#07111f] p-3">
            <p className="text-xs text-slate-400">Day Master</p>
            <p className="mt-1 text-xl font-semibold text-gold">{translateStem(chart.dayMaster)}</p>
          </div>
          <div className="rounded-md bg-[#07111f] p-3">
            <p className="text-xs text-slate-400">Focus</p>
            <p className="mt-2 text-sm font-semibold text-[#fff7e8]">{baziFocusToEnglish[record.focus]}</p>
          </div>
        </div>
      </SoftCard>

      <SoftCard className="mb-4">
        <h2 className="mb-4 text-base font-semibold text-[#fff7e8]">Chinese Birth Chart / Four Pillars</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pillarRows.map(([label, key]) => (
            <PillarCard isDay={key === "day"} label={label} pillar={chart[key]} key={key} />
          ))}
        </div>
      </SoftCard>

      <SoftCard className="mb-4">
        <div className="mb-3 flex items-center gap-2 text-gold">
          <Heart className="h-4 w-4" />
          <h2 className="text-base font-semibold text-[#fff7e8]">Peach Blossom Score</h2>
        </div>
        <p className="text-3xl font-semibold text-gold">{derived.relationship.peachBlossomScore}</p>
        <p className="mt-2 text-sm leading-7 text-slate-300">{derived.relationshipSummary.peachType}</p>
      </SoftCard>

      <SoftCard className="mb-4">
        <h2 className="mb-4 text-base font-semibold text-[#fff7e8]">3 Key Insights</h2>
        <div className="space-y-3">
          {derived.insights.map((insight) => (
            <p className="rounded-md border border-white/[0.08] bg-[#07111f] p-3 text-sm leading-7 text-slate-300" key={insight}>
              {insight}
            </p>
          ))}
        </div>
      </SoftCard>

      <SoftCard className="mb-4">
        <h2 className="mb-4 text-base font-semibold text-[#fff7e8]">First 3 Key Years Preview</h2>
        <div className="space-y-3">
          {translatedYears.slice(0, 3).map((item) => (
            <div className="rounded-lg border border-white/[0.08] bg-[#07111f]/70 p-4" key={item.year}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-gold">{item.year}</p>
                <span className="rounded-md bg-gold/12 px-3 py-1 text-xs text-gold">{item.tag}</span>
              </div>
              <p className="text-xs leading-6 text-slate-400">{item.pillar}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </SoftCard>

      <SoftCard className="mb-4 border-gold/20 bg-gold/[0.055]">
        <div className="mb-3 flex items-center gap-2 text-gold">
          <Lock className="h-4 w-4" />
          <h2 className="text-xl font-semibold text-[#fff7e8]">Locked Full Report</h2>
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm text-slate-300 sm:grid-cols-2">
          {[
            "Full Key Years",
            "10-Year Luck Cycles",
            "Love & Partner Profile",
            "Best Partner Type",
            "Who You Attract",
            "Professional BaZi Notes",
            "Full Destiny Report"
          ].map((item) => (
            <div className="rounded-md border border-white/[0.08] bg-[#07111f] px-3 py-3" key={item}>
              {item}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-gold/20 bg-[#07111f] p-4">
          <p className="text-xs text-slate-400">Report ID</p>
          <p className="mt-1 text-xl font-semibold text-gold">{record.reportCode}</p>
        </div>
        <PrimaryButton className="mt-5" onClick={() => setShowModal(true)} type="button">
          Unlock Full BaZi Report — $19.99
        </PrimaryButton>
      </SoftCard>

      <div className="hidden">
        {translatedCycles.length}
        {derived.fullReport}
      </div>

      {showModal ? <UnlockModal onClose={() => setShowModal(false)} reportId={record.reportCode || "ENBZ-PENDING"} /> : null}
    </div>
  );
}
