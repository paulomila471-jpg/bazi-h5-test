"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function getTarget(pathname: string) {
  if (pathname.startsWith("/admin")) return null;
  if (pathname === "/") return { href: "/en", label: "English" };
  if (pathname === "/bazi/form") return { href: "/en/bazi/form", label: "English" };
  if (pathname === "/bazi/result") return { href: "/en/bazi/result", label: "English" };
  if (pathname === "/en") return { href: "/", label: "中文" };
  if (pathname === "/en/bazi/form") return { href: "/bazi/form", label: "中文" };
  if (pathname === "/en/bazi/result") return { href: "/bazi/result", label: "中文" };
  if (pathname.startsWith("/en")) return { href: "/", label: "中文" };
  return { href: "/en", label: "English" };
}

export function LanguageSwitch() {
  const pathname = usePathname();
  const target = getTarget(pathname);
  if (!target) return null;

  return (
    <Link
      className="fixed right-4 top-4 z-30 rounded-md border border-gold/25 bg-[#07111f]/90 px-3 py-2 text-xs font-semibold text-gold shadow-aureate backdrop-blur"
      href={target.href}
    >
      {target.label}
    </Link>
  );
}
