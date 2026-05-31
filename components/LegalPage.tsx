import Link from "next/link";
import { ComplianceNotice } from "@/components/ComplianceNotice";

export function LegalPage({
  title,
  intro,
  sections
}: {
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
}) {
  return (
    <div className="page-shell pt-8">
      <p className="mb-3 text-sm text-gold">合规说明</p>
      <h1 className="mb-4 text-2xl font-semibold text-[#fff7e8]">{title}</h1>
      <p className="mb-4 text-sm leading-7 text-slate-300">{intro}</p>
      <ComplianceNotice />
      <div className="mt-5 space-y-4">
        {sections.map((section) => (
          <section className="rounded-lg border border-white/[0.08] bg-white/[0.035] p-5" key={section.heading}>
            <h2 className="mb-2 text-base font-semibold text-gold">{section.heading}</h2>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-300">{section.body}</p>
          </section>
        ))}
      </div>
      <Link className="mt-6 inline-block text-sm text-gold" href="/">
        返回首页
      </Link>
    </div>
  );
}

