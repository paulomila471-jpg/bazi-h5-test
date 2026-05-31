import { h5TestNotice } from "@/lib/compliance/config";

export function TestVersionNotice() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-4">
      <div className="rounded-lg border border-gold/15 bg-gold/[0.06] px-4 py-3 text-xs leading-6 text-[#e6d4ad]">
        {h5TestNotice}
      </div>
    </div>
  );
}
