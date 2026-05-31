"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CreditCard, Mail, Sparkles, Stars } from "lucide-react";
import { Card } from "@/components/ui";
import { getEnglishDeliveryConfig } from "@/lib/compliance/config";

const products = [
  {
    title: "One Question Reading",
    price: "$4.99",
    description:
      "Ask one focused question and receive an Eastern divination-style answer. Suitable for love, career, decisions, timing, and uncertainty.",
    highlights: ["Focused answer", "Love, career, timing", "Delivered by email"]
  },
  {
    title: "BaZi Destiny Report",
    price: "Early Access $19.99",
    description:
      "A Chinese birth chart reading based on BaZi, covering life pattern, career, wealth timing, love, key years, and 10-year luck cycles.",
    highlights: ["Birth chart reading", "Key years", "10-year luck cycles"]
  },
  {
    title: "Deep Human-reviewed Report",
    price: "$39.99",
    description:
      "A deeper manually reviewed reading with clearer interpretation, practical notes, and delivery-ready wording for personal reference.",
    highlights: ["Human-reviewed", "Deeper interpretation", "Manual delivery"]
  }
];

function createEnglishReportId() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `ENBZ${date}-${random}`;
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

export function EnglishHomeClient() {
  const [reportId, setReportId] = useState("ENBZ-PENDING");
  const { koFiUrl, gumroadUrl, paypalUrl, contactEmail } = getEnglishDeliveryConfig();
  const mailHref = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(`BaZi Report ${reportId}`)}`
    : "";

  useEffect(() => {
    setReportId(createEnglishReportId());
  }, []);

  return (
    <div className="page-shell pb-10 pt-8">
      <header className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm uppercase tracking-[0.18em] text-gold">Early Access H5 Test</p>
          <Link className="rounded-md border border-gold/20 px-3 py-2 text-xs text-gold" href="/">
            Chinese Site
          </Link>
        </div>
        <h1 className="text-3xl font-semibold leading-tight text-[#fff7e8]">
          Eastern Destiny & Divination Reading
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#efe2c4]">
          This is an early-access test version. Full reports are manually prepared and delivered by email after payment confirmation.
        </p>
      </header>

      <Card className="mb-4 border-gold/30 bg-gold/[0.06]">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-1 h-5 w-5 shrink-0 text-gold" />
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-gold">Report ID</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#fff7e8]">{reportId}</h2>
            <p className="mt-3 text-sm leading-7 text-[#efe2c4]">
              After payment, please include your Report ID and email so we can deliver your report.
              After payment, your report will be delivered by email within 24 hours.
            </p>
          </div>
        </div>
      </Card>

      <section className="grid grid-cols-1 gap-4">
        <Card>
          <p className="mb-3 text-sm text-gold">Pricing</p>
          <div className="space-y-3">
            {products.map((product) => (
              <div className="flex items-start justify-between gap-4 rounded-md border border-white/[0.08] bg-[#07111f] p-4" key={product.title}>
                <div>
                  <h2 className="text-base font-semibold text-[#fff7e8]">{product.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{product.description}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-gold">{product.price}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {products.slice(0, 2).map((product, index) => {
          const Icon = index === 0 ? Sparkles : Stars;
          return (
            <Card className="flex flex-col" key={product.title}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gold">{product.price}</p>
                  <h2 className="mt-2 text-xl font-semibold leading-7 text-[#fff7e8]">{product.title}</h2>
                </div>
                <div className="rounded-md border border-gold/20 bg-gold/[0.08] p-2 text-gold">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="text-sm leading-7 text-slate-300">{product.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {product.highlights.map((item) => (
                  <span className="rounded-md border border-white/[0.08] px-3 py-2 text-xs text-[#e6d4ad]" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}
      </section>

      <Card className="mt-4 border-gold/30 bg-gold/[0.055]">
        <h2 className="text-xl font-semibold text-[#fff7e8]">Unlock Full BaZi Report — $19.99</h2>
        <p className="mt-3 text-sm leading-7 text-[#efe2c4]">
          This is not an in-site payment flow. Please complete payment externally, then send your Report ID and email for manual delivery.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PaymentLink href={koFiUrl} label="Buy on Ko-fi" />
          <PaymentLink href={gumroadUrl} label="Buy on Gumroad" />
          <PaymentLink href={paypalUrl} label="Pay with PayPal" />
        </div>
      </Card>

      <Card className="mt-4">
        <div className="flex items-start gap-3">
          <Mail className="mt-1 h-5 w-5 shrink-0 text-gold" />
          <div>
            <h2 className="text-lg font-semibold text-[#fff7e8]">Email Delivery</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Contact email:{" "}
              {contactEmail ? (
                <a className="font-semibold text-gold" href={mailHref}>
                  {contactEmail}
                </a>
              ) : (
                <span className="font-semibold text-gold">Coming soon</span>
              )}
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              After payment, please include your Report ID and email so we can deliver your report.
            </p>
          </div>
        </div>
        {mailHref ? (
          <a
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 text-sm font-semibold text-[#08101d]"
            href={mailHref}
          >
            Email Report ID
            <ArrowRight className="h-4 w-4" />
          </a>
        ) : null}
      </Card>
    </div>
  );
}
