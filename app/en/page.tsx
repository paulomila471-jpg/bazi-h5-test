import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Mail, MessageCircle, Sparkles, Stars } from "lucide-react";
import { Card } from "@/components/ui";
import { wechatId } from "@/lib/compliance/config";

export const metadata: Metadata = {
  title: "Eastern Destiny & Divination Reading",
  description: "Early-access Eastern divination and BaZi destiny readings for overseas users."
};

const products = [
  {
    title: "One Question Reading",
    price: "$4.99",
    description:
      "Ask one focused question and receive an Eastern divination-style answer. Suitable for love, career, decisions, timing, and uncertainty.",
    highlights: ["Focused answer", "Decision support", "Manual delivery"]
  },
  {
    title: "BaZi Destiny Report",
    price: "Early Access $19.99",
    description:
      "A Chinese birth chart reading based on BaZi, covering life pattern, career, wealth timing, love, key years, and 10-year luck cycles.",
    highlights: ["Birth chart reading", "Key years", "10-year luck cycles"]
  }
];

const contactLinks = [
  ["Email", "mailto:placeholder@example.com"],
  ["Ko-fi", "#"],
  ["Gumroad", "#"],
  ["PayPal", "#"]
] as const;

export default function EnglishHomePage() {
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
          This is an early-access H5 test version. Full reports are manually prepared and delivered after payment confirmation.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {products.map((product, index) => {
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

              <a
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 text-sm font-semibold text-[#08101d] transition active:scale-[0.99]"
                href={`mailto:placeholder@example.com?subject=${encodeURIComponent(product.title)}`}
              >
                Contact for Manual Delivery
                <ArrowRight className="h-4 w-4" />
              </a>
            </Card>
          );
        })}
      </section>

      <Card className="mt-4">
        <div className="flex items-start gap-3">
          <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-gold" />
          <div>
            <h2 className="text-lg font-semibold text-[#fff7e8]">Manual Contact</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              WeChat: <span className="font-semibold text-gold">{wechatId}</span>
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Full readings are prepared manually. Please contact us with your preferred product and delivery channel.
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="mb-4 flex items-center gap-2 text-gold">
          <Mail className="h-4 w-4" />
          <h2 className="text-base font-semibold text-[#fff7e8]">Future Payment & Delivery Links</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {contactLinks.map(([label, href]) => (
            <a
              className="rounded-md border border-white/[0.08] bg-[#07111f] px-3 py-3 text-center text-sm text-slate-300 hover:border-gold/40 hover:text-gold"
              href={href}
              key={label}
            >
              {label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
