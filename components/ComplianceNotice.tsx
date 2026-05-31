import { aiDisclosureText, complianceDisclaimer, h5TestNotice } from "@/lib/compliance/config";

export function ComplianceNotice({ showAi = false }: { showAi?: boolean }) {
  return (
    <div className="rounded-lg border border-gold/15 bg-gold/[0.055] p-4 text-xs leading-6 text-[#e6d4ad]">
      {showAi ? <p className="mb-2 font-semibold text-gold">{aiDisclosureText}</p> : null}
      <p className="mb-2">{h5TestNotice}</p>
      <p>{complianceDisclaimer}</p>
    </div>
  );
}
