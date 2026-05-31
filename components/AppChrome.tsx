"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { SiteFooter } from "@/components/SiteFooter";
import { TestVersionNotice } from "@/components/TestVersionNotice";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  return (
    <>
      {isEnglish ? null : <TestVersionNotice />}
      <main className="mx-auto max-w-3xl">{children}</main>
      {isEnglish ? null : <SiteFooter />}
      {isEnglish ? null : <BottomNav />}
    </>
  );
}
